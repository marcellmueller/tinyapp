const fs = require('fs');

const checkEmail = (users, formEmail) => {
  for (const each in users) {
    if (formEmail === users[each].email) {
      return true;
    }
  }
  return false;
};

//get user id by searching their email in the database
const getUserId = (users, email) => {
  let userId = '';
  for (const each in users) {
    if (users[each].email === email) {
      userId = users[each].id;
      return userId;
    }
  }
  return false;
};

//depreciated since storing passwords in plain text is bad
// const checkPassword = (users, password) => {
//   for (const each in users) {
//     if (users[each].password === password) {
//       return true;
//     }
//   }
//   return false;
// };

//get users URLs and return object for display
const urlsForUser = (urlDatabase, userId) => {
  const userURLs = {};
  for (const each in urlDatabase) {
    if (urlDatabase[each].userID === userId) {
      userURLs[each] = urlDatabase[each];
    }
  }
  return userURLs;
};

const saveJSON = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.log('Error writing to JSON');
  }
};

const readJSON = (path) => {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log('Could not read from JSON');
    return false;
  }
};

const updateJSON = (data, path) => {
  saveJSON(data, path);
  return readJSON(path);
};
///generateRandomString and helper functions below

//loop 6 times to call generateRandomChar
//and create our random string
const generateRandomString = () => {
  let string = '';
  for (let i = 0; i < 6; i++) {
    string += generateRandomChar();
  }
  return string;
};

//call random on the length of the string of chars
//and return random char
const generateRandomChar = () => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return chars[random(chars.length)];
};

const random = (max) => {
  return Math.floor(Math.random() * max);
};

module.exports = {
  getUserId,
  checkEmail,
  urlsForUser,
  generateRandomString,
  saveJSON,
  readJSON,
  updateJSON,
};
