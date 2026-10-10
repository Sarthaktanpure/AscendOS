const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, updatePreferences, completeOnboarding } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.post('/onboarding', protect, completeOnboarding);

module.exports = router;
