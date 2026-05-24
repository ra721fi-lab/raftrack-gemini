const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Endpoint publik dengan rate limiter keamanan
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Endpoint privat terproteksi token JWT
router.get('/profile', protect, getUserProfile);

module.exports = router;
