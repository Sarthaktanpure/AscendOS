const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getVapidPublicKey,
  saveSubscription,
  sendTestNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe', saveSubscription);
router.post('/test-push', sendTestNotification);

module.exports = router;
