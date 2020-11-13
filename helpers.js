const fs = require('fs');

const errorHandling = (res, req, users, message) => {
  const templateVars = {
    userId: users[req.session.user_id],
    ErrorMessage: message,
  };
  return res.render('not_found', templateVars);
};

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

//tracks page visits
const trackVisits = (URL, urlDatabase, urlDatabasePath) => {
  urlDatabase[URL].tracker.visits++;
  urlDatabase = updateJSON(urlDatabase, urlDatabasePath);
};

//see if user IP exists in list
const searchIP = (data, URL, IP) => {
  const ipList = data[URL].tracker.uniqueVisitors;
  for (const each in ipList) {
    if (IP === ipList[each]) {
      return true;
    }
  }
  return false;
};

const visitorLog = (data, URL, IP) => {
  let now = new Date();
  const visitorLog = data[URL].tracker.visitorLog;
  visitorLog.push({ Date: now, IP: IP });
};

const setIpCookie = (data, IP, path, URL) => {
  if (searchIP(data, URL, IP) === false) {
    data[URL].tracker.uniqueVisitors.push(IP);
    updateJSON(data, path);
  }
};

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

//used to save JSON and update the object in express_server
const updateJSON = (data, path) => {
  saveJSON(data, path);
  return readJSON(path);
};

///generateRandomString and helper functions below

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
  trackVisits,
  searchIP,
  setIpCookie,
  visitorLog,
  errorHandling,
};
