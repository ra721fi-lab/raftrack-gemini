const express = require('express');
const router = express.Router();
const { getAnalyticsStats, handleAIChatbot } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute analisis dilindungi JWT Authentication
router.use(protect);

router.get('/stats', getAnalyticsStats);
router.post('/chatbot', handleAIChatbot);

module.exports = router;
