const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

router.post('/register', limiter, registerValidation, register);
router.post('/login', limiter, loginValidation, login);
router.get('/profile', auth, getProfile);

module.exports = router;