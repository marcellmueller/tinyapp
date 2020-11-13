const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const helpers = require('./helpers');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const checkEmail = helpers.checkEmail;
const getUserId = helpers.getUserId;
const urlsForUser = helpers.urlsForUser;
const generateRandomString = helpers.generateRandomString;
const readJSON = helpers.readJSON;
const updateJSON = helpers.updateJSON;
const trackVisits = helpers.trackVisits;
const setIpCookie = helpers.setIpCookie;
const visitorLog = helpers.visitorLog;
const errorHandling = helpers.errorHandling;
const usersPath = './users.JSON';
const urlDatabasePath = './urlDatabase.JSON';
let urlDatabase = readJSON(urlDatabasePath);
let users = readJSON(usersPath);
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
  const shortURL = generateRandomString(res);
  const longURL = req.body.longURL;
  const userId = req.session.user_id;
  //save to database
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
    tracker: { visits: 0, uniqueVisitors: [], visitorLog: [] },
  };
  urlDatabase = updateJSON(urlDatabase, urlDatabasePath);
  res.redirect(`urls/${shortURL}`);
});

//edit URL post route
app.put('/urls/:id', (req, res) => {
  let URL = req.params.id;
  const user = urlDatabase[URL].userID;
  if (user === req.session.user_id) {
    //save to database
    urlDatabase[URL].longURL = req.body.longURL;
    urlDatabase = updateJSON(urlDatabase, urlDatabasePath);
    return res.redirect('/urls');
  } else {
    return errorHandling(
      res,
      req,
      users,
      `404 Error: This shortURL doesn't exist`
    );
  }
});

//delete button POST route
app.delete('/urls/:shortURL/delete', (req, res) => {
  let URL = req.params.shortURL;
  const user = urlDatabase[URL].userID;
  //check if logged in user is the same as URL up for deletion
  if (user === req.session.user_id) {
    //delete URL from database
    delete urlDatabase[URL];
    urlDatabase = updateJSON(urlDatabase, urlDatabasePath);

    return res.redirect('/urls');
  } else {
    errorHandling(
      res,
      req,
      users,
      `You don't have permission to edit this URL`
    );
  }
});

app.post('/urls/:shortURL/edit', (req, res) => {
  let URL = req.params.shortURL;
  res.redirect(`/urls/${URL}`);
});

//login POST route
app.post('/login/', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = getUserId(users, email);
  if (!userId) {
    return errorHandling(
      res,
      req,
      users,
      `Error: Either the email or password entered do not match anything in our database`
    );
  }
  const hashedPassword = users[userId].password;
  const bcryptCheck = bcrypt.compareSync(password, hashedPassword);
  if (checkEmail(users, email) === true && bcryptCheck === true) {
    req.session.user_id = userId;
    return res.redirect('/urls');
  } else {
    return errorHandling(
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
    checkEmail(users, req.body['email']) === false &&
    req.body.password.length > 3
  ) {
    const userId = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword,
    };
    users = updateJSON(users, usersPath);
    const templateVars = {
      urls: urlsForUser(urlDatabase, userId),
      userId: users[userId],
    };
    req.session.user_id = userId;
    return res.render('urls_new', templateVars);
  } else {
    errorHandling(res, req, users, `Error: User is already registered`);
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
    urls: urlsForUser(urlDatabase, req.session.user_id),
    userId: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const URL = req.params.shortURL;
  if (!urlDatabase[req.params.shortURL]) {
    errorHandling(res, req, users, `404 Error: ShortURL Not Found`);
  } else if (!req.session.user_id) {
    return res.redirect('/login');
  } else if (req.session.user_id !== urlDatabase[URL].userID) {
    errorHandling(
      res,
      req,
      users,
      `403 Error: You do not have access to this URL`
    );
  } else if (req.session.user_id === urlDatabase[URL].userID) {
    const templateVars = {
      shortURL: URL,
      longURL: urlDatabase[URL].longURL,
      userId: users[req.session.user_id],
      visits: urlDatabase[URL].tracker.visits,
      unique: urlDatabase[URL].tracker.uniqueVisitors.length,
      visitorLogs: urlDatabase[URL].tracker.visitorLog,
    };
    res.render('urls_show', templateVars);
  }
});

//short /u/shortURL route handler
app.get('/u/:shortURL', (req, res) => {
  const URL = req.params.shortURL;
  if (urlDatabase[URL] !== undefined) {
    req.session.userIP = req.ip;
    //call tracking function helpers
    setIpCookie(urlDatabase, req.ip, urlDatabasePath, URL);
    visitorLog(urlDatabase, URL, req.ip);
    trackVisits(URL, urlDatabase, urlDatabasePath);
    const longURL = urlDatabase[URL].longURL;
    res.redirect(longURL);
  } else {
    errorHandling(res, req, users, `404 Error: ShortURL Not Found`);
  }
});

app.listen(PORT, () => {
  console.log(`TinyURL listening on port ${PORT}!`);
});
