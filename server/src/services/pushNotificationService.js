const webpush = require('web-push');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const UserPreference = require('../models/UserPreference');

// Initialize VAPID credentials if configured
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:sarthaktanpure256@gmail.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn('[WebPush] VAPID initialization warning:', err.message);
  }
}

class PushNotificationService {
  static async sendNotification({ userId, title, body, type, link, idempotencyKey }) {
    // 1. Check idempotency to prevent duplicate reminders
    if (idempotencyKey) {
      const existing = await Notification.findOne({ user: userId, idempotencyKey });
      if (existing) {
        return existing; // Already dispatched
      }
    }

    // 2. Check user preferences & quiet hours
    const pref = await UserPreference.findOne({ user: userId });
    let canSendPush = true;
    if (pref && pref.quietHours && pref.quietHours.enabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const [startH] = (pref.quietHours.start || '23:00').split(':').map(Number);
      const [endH] = (pref.quietHours.end || '07:00').split(':').map(Number);
      
      // If quiet hours span midnight (e.g. 23 to 07)
      if (startH > endH) {
        if (currentHour >= startH || currentHour < endH) {
          canSendPush = false; // Suppress audible push during quiet hours
        }
      }
    }

    // 3. Persist in-app notification in MongoDB
    const notification = await Notification.create({
      user: userId,
      title,
      body,
      type: type || 'system_alert',
      link: link || '/dashboard',
      channel: canSendPush ? 'both' : 'in_app',
      idempotencyKey
    });

    // 4. Dispatch browser push notification if active subscriptions exist
    if (canSendPush && process.env.VAPID_PUBLIC_KEY) {
      const subscriptions = await PushSubscription.find({ user: userId });
      const payload = JSON.stringify({
        title,
        body,
        icon: '/favicon.ico',
        url: link || '/dashboard'
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload);
        } catch (err) {
          // If subscription is expired or invalid (410 Gone / 404), remove it
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.warn('[WebPush] Dispatch note:', err.message);
          }
        }
      }
    }

    return notification;
  }
}

module.exports = PushNotificationService;
