const checkEmail = (users, formEmail) => {
  for (const each in users) {
    if (formEmail === users[each].email) {
      return true;
    }
  }
  return false;
};

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

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'CgFjj4' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'CgFjj4' },
  b6UTxC: { longURL: 'https://www.tsn.ca', userID: 'user2RandomID' },
  i3BoG9: { longURL: 'https://www.google.ca', userID: 'userRandomID' },
};

const urlsForUser = (urlDatabase, userId) => {
  const userURLs = {};
  for (const each in urlDatabase) {
    if (urlDatabase[each].userID === userId) {
      userURLs[each] = urlDatabase[each];
    }
  }
  return userURLs;
};

console.log(urlsForUser(urlDatabase, 'CgFjj4'));
module.exports = { getUserId, checkEmail, urlsForUser };
