const express = require('express');
const router = express.Router();
const { getJobs, syncJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getJobs);
router.post('/sync', syncJobs);

module.exports = router;
