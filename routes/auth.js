const express = require('express');
const router = express.Router();
const {
  register_post,
  login_post,
  register_get,
  login_get,
} = require('../controllers/authController');

router.route('/register').post(register_post);
router.route('/login').get(login_get).post(login_post);

module.exports = router;
