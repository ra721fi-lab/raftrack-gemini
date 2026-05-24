const express = require('express');
const router = express.Router();
const { exportCSV, getPrintData } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute ekspor data dilindungi JWT Authentication
router.use(protect);

router.get('/csv', exportCSV);
router.get('/print', getPrintData);

module.exports = router;
