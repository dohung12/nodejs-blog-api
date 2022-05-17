const jwt = require('jsonwebtoken');
const User = require('../models/user');

const isAuth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    const err = new Error('Authentication invalid');
    err.status = 404;
    return next(err);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // attach the user the routes
    const { userId, username } = payload;
    req.user = { userId, username };
    next();
  } catch (error) {
    const err = new Error('Authentication invalid');
    err.status = 404;
    return next(err);
  }
};

module.exports = isAuth;
