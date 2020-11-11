const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const login = require('./login');
const checkEmail = login.checkEmail;
const getUserId = login.getUserId;
const checkPassword = login.checkPassword;
const urlsForUser = login.urlsForUser;
const app = express();
const generateRandomString = require('./generateRandomString');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = 8080;

app.set('view engine', 'ejs');

//database object, we will convert to true database later
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'CgFjj4' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'CgFjj4' },
  b6UTxC: { longURL: 'https://www.tsn.ca', userID: 'user2RandomID' },
  i3BoG9: { longURL: 'https://www.google.ca', userID: 'userRandomID' },
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
  CgFjj4: {
    id: 'CgFjj4',
    email: 'mail.marcelm@gmail.com',
    password: 'afasfasfa',
  },
};

//handle POST request for our new URL form
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(res);
  const longURL = req.body.longURL;
  const userId = req.cookies['user_id'];
  //save to database
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };

  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`);
});

//edit URL post route
app.post('/urls/:id', (req, res) => {
  let URL = req.params.id;
  const user = urlDatabase[URL].userID;
  if (user === req.cookies['user_id']) {
    urlDatabase[URL].longURL = req.body.longURL;
    return res.redirect('/urls');
  } else {
    return res.status(404).send(`You don't have permission to edit this URL`);
  }
});

//delete button POST route
app.post('/urls/:shortURL/delete', (req, res) => {
  let URL = req.params.shortURL;
  const user = urlDatabase[URL].userID;
  if (user === req.cookies['user_id']) {
    delete urlDatabase[URL];
    return res.redirect('/urls');
  } else {
    return res.status(404).send(`You don't have permission to edit this URL`);
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
  if (checkEmail(users, email) === true && checkPassword(users, password)) {
    res.cookie('user_id', userId);
    return res.redirect('/urls');
  } else {
    return res
      .status(403)
      .send('Either the email or password entered was not in our database.');
  }
});

//logout POST route
app.post('/logout/', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//POST route to register new user
app.post('/register/', (req, res) => {
  if (checkEmail(users, req.body['email']) === false) {
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password,
    };

    const templateVars = { urls: urlDatabase, userId: users[userID] };
    res.cookie('user_id', userID);
    return res.render('urls_index', templateVars);
  } else {
    return res
      .status(403)
      .send('A user with that email already exists in our database');
  }
});

//POST route to render urls_register.ejs template
app.get('/register/', (req, res) => {
  const templateVars = {
    userId: users[req.cookies['user_id']],
  };
  res.render('urls_register', templateVars);
});

//POST route to render urls_login.ejs template
app.get('/login/', (req, res) => {
  const templateVars = {
    userId: users[req.cookies['user_id']],
  };
  res.render('urls_login', templateVars);
});

//GET route to render urls_new.ejs template
app.get('/urls/new', (req, res) => {
  if (!users[req.cookies['user_id']]) {
    return res.redirect('/login');
  }
  const templateVars = {
    userId: users[req.cookies['user_id']],
  };

  res.render('urls_new', templateVars);
});

//short /u/shortURL route handler
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.render('not_found');
  }
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
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlsForUser(urlDatabase, req.cookies['user_id']),
    userId: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: users[req.cookies['user_id']],
  };
  if (urlDatabase[req.params.shortURL]) {
    res.render('urls_show', templateVars);
  } else {
    res.render('not_found');
  }
});

//404 error handler

app.use(function (req, res, next) {
  res.status(404).render('not_found');
});
app.listen(PORT, () => {
  console.log(`TinyURL listening on port ${PORT}!`);
});
