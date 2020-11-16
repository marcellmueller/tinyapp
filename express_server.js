const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const helpers = require('./helpers');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const usersPath = './users.JSON';
const urlDatabasePath = './urlDatabase.JSON';
let urlDatabase = helpers.readJson(urlDatabasePath);
let users = helpers.readJson(usersPath);
const app = express();
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    overwrite: true,
  })
);

const PORT = process.env.PORT || 8080;

//handle POST request for our new URL form
app.post('/urls', (req, res) => {
  const shortUrl = helpers.generateRandomString(res);
  const longUrl = req.body.longUrl;
  const userId = req.session.user_id;
  //save to database
  urlDatabase[shortUrl] = {
    longUrl: longUrl,
    userId: userId,
    tracker: { visits: 0, uniqueVisitors: [], visitorLog: [] },
  };
  urlDatabase = helpers.updateJson(urlDatabase, urlDatabasePath);
  res.redirect(`urls/${shortUrl}`);
});

//edit URL post route
app.put('/urls/:id', (req, res) => {
  let url = req.params.id;
  const user = urlDatabase[url].userId;
  if (user === req.session.user_id) {
    //save to database
    urlDatabase[url].longUrl = req.body.longUrl;
    urlDatabase = helpers.updateJson(urlDatabase, urlDatabasePath);
    return res.redirect('/urls');
  } else {
    return helpers.errorHandling(
      res,
      req,
      users,
      `404 Error: This shortURL doesn't exist`
    );
  }
});

//delete button POST route
app.delete('/urls/:shortUrl/delete', (req, res) => {
  let url = req.params.shortUrl;
  const user = urlDatabase[url].userId;
  //check if logged in user is the same as URL up for deletion
  if (user === req.session.user_id) {
    //delete URL from database
    delete urlDatabase[url];
    urlDatabase = helpers.updateJson(urlDatabase, urlDatabasePath);

    return res.redirect('/urls');
  } else {
    helpers.errorHandling(
      res,
      req,
      users,
      `You don't have permission to edit this URL`
    );
  }
});

app.post('/urls/:shortUrl/edit', (req, res) => {
  let url = req.params.shortUrl;
  res.redirect(`/urls/${url}`);
});

//login POST route
app.post('/login/', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = helpers.getUserId(users, email);
  if (!userId) {
    return helpers.errorHandling(
      res,
      req,
      users,
      `Error: Either the email or password entered do not match anything in our database`
    );
  }
  const hashedPassword = users[userId].password;
  const bcryptCheck = bcrypt.compareSync(password, hashedPassword);
  if (helpers.checkEmail(users, email) === true && bcryptCheck === true) {
    req.session.user_id = userId;
    return res.redirect('/urls');
  } else {
    return helpers.errorHandling(
      res,
      req,
      users,
      `Error: Either the email or password entered do not match anything in our database`
    );
  }
});

//logout DELETE route
app.delete('/logout/', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//POST route to register new user
app.put('/register/', (req, res) => {
  if (
    helpers.checkEmail(users, req.body['email']) === false &&
    req.body.password.length > 3
  ) {
    const userId = helpers.generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword,
    };
    users = helpers.updateJson(users, usersPath);
    const templateVars = {
      urls: helpers.urlsForUser(urlDatabase, userId),
      userId: users[userId],
    };
    req.session.user_id = userId;
    return res.render('urls_new', templateVars);
  } else {
    helpers.errorHandling(res, req, users, `Error: User is already registered`);
  }
});

//POST route to render urls_register.ejs template
app.get('/register/', (req, res) => {
  const templateVars = {
    userId: users[req.session.user_id],
  };
  res.render('urls_register', templateVars);
});

//POST route to render urls_login.ejs template
app.get('/login/', (req, res) => {
  const templateVars = {
    userId: users[req.session.user_id],
  };
  res.render('urls_login', templateVars);
});

//GET route to render urls_new.ejs template
app.get('/urls/new', (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect('/login');
  }
  const templateVars = {
    userId: users[req.session.user_id],
  };

  res.render('urls_new', templateVars);
});

//redirect to index if user goes to base directory
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  //check if user is logged in and if not
  //redirect to login page
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: helpers.urlsForUser(urlDatabase, req.session.user_id),
    userId: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortUrl', (req, res) => {
  const url = req.params.shortUrl;
  if (!urlDatabase[req.params.shortUrl]) {
    helpers.errorHandling(res, req, users, `404 Error: ShortURL Not Found`);
  } else if (!req.session.user_id) {
    return res.redirect('/login');
  } else if (req.session.user_id !== urlDatabase[url].userId) {
    helpers.errorHandling(
      res,
      req,
      users,
      `403 Error: You do not have access to this URL`
    );
  } else if (req.session.user_id === urlDatabase[url].userId) {
    const templateVars = {
      shortUrl: url,
      longUrl: urlDatabase[url].longUrl,
      userId: users[req.session.user_id],
      visits: urlDatabase[url].tracker.visits,
      unique: urlDatabase[url].tracker.uniqueVisitors.length,
      visitorLogs: urlDatabase[url].tracker.visitorLog,
    };
    res.render('urls_show', templateVars);
  }
});

//short /u/shortURL route handler
app.get('/u/:shortUrl', (req, res) => {
  const url = req.params.shortUrl;
  if (urlDatabase[url] !== undefined) {
    req.session.userIP = req.ip;
    //call tracking function helpers
    helpers.setIpCookie(urlDatabase, req.ip, urlDatabasePath, url);
    helpers.visitorLog(urlDatabase, url, req.ip);
    helpers.trackVisits(url, urlDatabase, urlDatabasePath);
    const longUrl = urlDatabase[url].longUrl;
    res.redirect(longUrl);
  } else {
    helpers.errorHandling(res, req, users, `404 Error: ShortURL Not Found`);
  }
});

app.listen(PORT, () => {
  console.log(`TinyURL listening on port ${PORT}!`);
});
