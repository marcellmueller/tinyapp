const { assert } = require('chai');

const helpers = require('../helpers.js');
const getUserId = helpers.getUserId;
const checkEmail = helpers.checkEmail;
const urlsForUser = helpers.urlsForUser;

const testUsers = {
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
};

const testUrlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'CgFjj4' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'CgFjj4' },
  b6UTxC: { longURL: 'https://www.tsn.ca', userID: 'user2RandomID' },
  i3BoG9: { longURL: 'https://www.google.ca', userID: 'userRandomID' },
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserId(testUsers, 'user@example.com');
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user, expectedOutput);
  });
  it('Should return false for non existant user', function () {
    const user = getUserId(testUsers, 'nonExistantUser@example.com');
    assert.strictEqual(user, false);
  });
});

describe('checkEmail', function () {
  it('should true if emails match', function () {
    const checkEmailTest = checkEmail(testUsers, 'user@example.com');
    assert.strictEqual(checkEmailTest, true);
  });
  it('Should return false if emails do not match', function () {
    const checkEmailTest = checkEmail(testUsers, 'wrong@notMatchingEmail.com');
    assert.strictEqual(checkEmailTest, false);
  });
});

describe('urlsForUser', function () {
  it('Should return only URLs that have user id match', function () {
    const urlsForUserTest = urlsForUser(testUrlDatabase, 'CgFjj4');
    console.log(urlsForUserTest);
    const expectedOutput = {
      b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'CgFjj4' },
      i3BoGr: { longURL: 'https://www.google.ca', userID: 'CgFjj4' },
    };

    assert.deepEqual(urlsForUserTest, expectedOutput);
  });
  it('Should return empty object for non existant user', function () {
    const urlsForUserTest = urlsForUser(testUrlDatabase, 'XXXXXX');
    console.log(urlsForUserTest);
    const expectedOutput = {};
    assert.deepEqual(urlsForUserTest, expectedOutput);
  });
});
