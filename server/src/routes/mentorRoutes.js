const express = require('express');
const router = express.Router();
const {
  getDailyAdvice,
  getReadiness,
  getConversation,
  sendMessage
} = require('../controllers/mentorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/advice', getDailyAdvice);
router.get('/readiness', getReadiness);
router.get('/conversation', getConversation);
router.post('/chat', sendMessage);

module.exports = router;
