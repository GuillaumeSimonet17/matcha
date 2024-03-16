const express = require('express');
const router = express.Router();

// Add confirmRegister
const { loginUser, signinUser, confirmRegister, resetPassword } = require('./authController');

// Définissez vos routes
router.post('/login', loginUser);
router.post('/signin', signinUser);

router.get('/confirm', confirmRegister)
router.get('/reset_password', resetPassword)

module.exports = router;