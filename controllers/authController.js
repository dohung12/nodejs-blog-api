const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register_post = [
  body('username', 'Please input your user name')
    .notEmpty()
    .custom((value) => {
      return User.findOne({ username: value }).then((user) => {
        if (user) {
          return Promise.reject('Username already in use');
        }
      });
    }),
  body('password').isLength({ min: 8 }),
  body('confirmedPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  async (req, res, next) => {
    // get errors from a request
    const errors = validationResult(req);

    const { username, password } = req.body;
    try {
      const genSalt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, genSalt);

      const user = new User({ username, password: hashPassword });

      // if errors exist, re-render form with trimmed/ sanitized data
      if (!errors.isEmpty()) {
        res.render('signup_form', {
          user: { username },
          errors: errors.array(),
        });
      } else {
        await user.save();
        // create jwt token
        const token = jwt.sign(
          { userId: user._id, name: user.username },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: process.env.JWT_LIFETIME,
          }
        );
        res.json({ user: { username: user.username }, token });
      }
    } catch (error) {
      next(error);
    }
  },
];

const login_get = (req, res, next) => {
  res.send('POST login user');
};

const login_post = [
  body('username', 'Username must not be empty').isLength({ min: 1 }),

  body('password', 'Password must not be empty').isLength({ min: 1 }),
  async (req, res, next) => {
    // get validation errors from a request
    const errors = validationResult(req);
    const { username, password } = req.body;

    // if input errors exists. Notify
    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    }

    try {
      const user = await User.findOne({ username });
      // check if user exists
      if (user === null) {
        const err = new Error('Username is incorrect');
        err.status = 404;
        return next(err);
      }
      // check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const err = new Error('Password is incorrect');
        err.status = 404;
        return next(err);
      }
      // password is correct, send back token
      const token = jwt.sign(
        { userId: user._id, name: user.username },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_LIFETIME,
        }
      );
      res.json({ user: { username: user.username }, token });
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { register_post, login_post, login_get };
