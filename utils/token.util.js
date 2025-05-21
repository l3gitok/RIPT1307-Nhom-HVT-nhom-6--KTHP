const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '3d'
  });
};

module.exports = generateToken;
// Compare this snippet from gamehub-backend/controllers/auth.controller.js: