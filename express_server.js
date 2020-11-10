const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const generateRandomString = require('./generateRandomString');
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8080;

app.set('view engine', 'ejs');

//database object, we will convert to true database later
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

//handle POST request for our new URL form
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(res);
  //save to database
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  //redirect to our shortURL page
  res.redirect(`urls/${shortURL}`);
});

//edit URL post route
app.post('/urls/:id', (req, res) => {
  let URL = req.params.id;
  urlDatabase[URL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});

//delete button POST route
app.post('/urls/:shortURL/delete', (req, res) => {
  let URL = req.params.shortURL;
  console.log(URL);
  delete urlDatabase[URL];
  console.log(urlDatabase);
  // res.render(`/urls`);
  res.redirect('/urls');
});

//login POST route
app.post('/login/', (req, res) => {
  const username = req.body.username[1];
  res.cookie(username, urlDatabase);
  console.log(username);
  res.redirect('/urls');
});

//GET route to render urls_new.ejs template
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
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
  console.log('Cookies: ', req.cookies);

  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  if (urlDatabase[req.params.shortURL]) {
    res.render('urls_show', templateVars);
  } else {
    res.render('not_found');
  }
});

//404 error handler
app.use(function (req, res) {
  res.render('not_found', { url: req.url });
});

app.listen(PORT, () => {
  console.log(`TinyURL listening on port ${PORT}!`);
});
