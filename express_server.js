const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const login = require('./login');
const checkEmail = login.checkEmail;
const getUserId = login.getUserId;
const checkPassword = login.checkPassword;
const app = express();
const generateRandomString = require('./generateRandomString');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = 8080;

app.set('view engine', 'ejs');

//database object, we will convert to true database later
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
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
  //save to database
  urlDatabase[shortURL] = req.body.longURL;
  //redirect to our shortURL page
  res.redirect(`urls/${shortURL}`);
});

//edit URL post route
app.post('/urls/:id', (req, res) => {
  let URL = req.params.id;
  urlDatabase[URL] = req.body.longURL;
  res.redirect('/urls');
});

//delete button POST route
app.post('/urls/:shortURL/delete', (req, res) => {
  let URL = req.params.shortURL;
  delete urlDatabase[URL];
  // res.render(`/urls`);
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  let URL = req.params.shortURL;
  res.redirect(`/urls/${URL}`);
});

//login POST route
app.post('/login/', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(getUserId(users, email));
  if (checkEmail(users, email) === true && checkPassword(users, password)) {
    console.log('login successful!');
  }
  // if (checkEmail(users, username)) res.cookie('username', users[username]);

  res.redirect('/urls');
});

//logout POST route
app.post('/logout/', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//POST route to render urls_register.ejs template
app.get('/register/', (req, res) => {
  const templateVars = {
    username: users[req.cookies['user_id']],
  };
  res.render('urls_register', templateVars);
});

//POST route to render urls_login.ejs template
app.get('/login/', (req, res) => {
  const templateVars = {
    username: users[req.cookies['user_id']],
  };
  res.render('urls_login', templateVars);
});
//POST route to render urls_register.ejs template
app.post('/register/', (req, res) => {
  if (checkEmail(users, req.body['email']) === false) {
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password,
    };

    const templateVars = { urls: urlDatabase, username: users[userID] };
    res.cookie('user_id', userID);
    res.render('urls_index', templateVars);
  } else {
    console.log('404 erroeewrwjkrhak');
    res.status(404);
  }
});

//GET route to render urls_new.ejs template
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: users[req.cookies['user_id']],
  };

  res.render('urls_new', templateVars);
});

//short /u/shortURL route handler
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
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
  const templateVars = {
    urls: urlDatabase,
    username: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.cookies['user_id']],
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
