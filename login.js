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

const checkPassword = (users, password) => {
  for (const each in users) {
    if (users[each].password === password) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserId, checkEmail, checkPassword };
