const express = require('express');
const {
  googleLogin,
  register,
  verifyOTP,
  login,
} = require('../controllers/authController');

const router = express.Router();

router.post('/google', googleLogin);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

module.exports = router;