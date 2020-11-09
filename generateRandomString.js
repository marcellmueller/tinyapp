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

console.log(generateRandomString());
module.exports = generateRandomString();
