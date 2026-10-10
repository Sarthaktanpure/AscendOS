const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const PushNotificationService = require('../services/pushNotificationService');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

exports.getVapidPublicKey = (req, res) => {
  res.status(200).json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY || ''
  });
};

exports.saveSubscription = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ success: false, message: 'Valid push subscription object required.' });
    }

    const sub = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        user: req.user.id,
        endpoint,
        keys,
        userAgent: req.headers['user-agent']
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, subscription: sub });
  } catch (err) {
    next(err);
  }
};

exports.sendTestNotification = async (req, res, next) => {
  try {
    const notification = await PushNotificationService.sendNotification({
      userId: req.user.id,
      title: 'AscendOS Web Push Active',
      body: 'Real-time background reminders and study sessions are connected.',
      type: 'system_alert',
      link: '/dashboard'
    });

    res.status(200).json({
      success: true,
      message: 'Test notification triggered successfully.',
      notification
    });
  } catch (err) {
    next(err);
  }
};
