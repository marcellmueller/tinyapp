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
const trackVisits = (url, urlDatabase, urlDatabasePath) => {
  urlDatabase[url].tracker.visits++;
  urlDatabase = updateJson(urlDatabase, urlDatabasePath);
};

//see if user IP exists in list
const searchIp = (data, url, ip) => {
  const ipList = data[url].tracker.uniqueVisitors;
  for (const ips in ipList) {
    if (ip === ipList[ips]) {
      return true;
    }
  }
  return false;
};

const visitorLog = (data, url, ip) => {
  let now = new Date();
  const visitorLog = data[url].tracker.visitorLog;
  visitorLog.push({ date: now, ip: ip });
};

const setIpCookie = (data, ip, path, url) => {
  if (searchIp(data, url, ip) === false) {
    data[url].tracker.uniqueVisitors.push(ip);
    updateJson(data, path);
  }
};

//get users URLs and return object for display
const urlsForUser = (urlDatabase, userId) => {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

const saveJson = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.log('Error writing to JSON');
  }
};

const readJson = (path) => {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log('Could not read from JSON');
    return false;
  }
};

//used to save JSON and update the object in express_server
const updateJson = (data, path) => {
  saveJson(data, path);
  return readJson(path);
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
  return chars[Math.floor(Math.random() * chars.length)];
};

module.exports = {
  getUserId,
  checkEmail,
  urlsForUser,
  generateRandomString,
  saveJson,
  readJson,
  updateJson,
  trackVisits,
  searchIp,
  setIpCookie,
  visitorLog,
  errorHandling,
};
