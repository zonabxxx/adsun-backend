const jwt = require('jsonwebtoken');
const config = require('./config');

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id,
      username: user.username,
      roleName: user.roleName,
      permissions: user.permissions || {}
    }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.expiry }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id }, 
    config.refreshToken.secret, 
    { expiresIn: config.refreshToken.expiry }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.refreshToken.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
}; 