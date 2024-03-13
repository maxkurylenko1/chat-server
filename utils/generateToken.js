const jwt = require("jsonwebtoken");

const generateToken = (user, key, expiresIn) => {
  return jwt.sign(user, key, {
    expiresIn,
  });
};

module.exports = generateToken;
