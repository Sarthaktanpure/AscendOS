const express = require('express');
const router = express.Router();
const { getFullAnalytics, exportCsv } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getFullAnalytics);
router.get('/export-csv', exportCsv);

module.exports = router;
