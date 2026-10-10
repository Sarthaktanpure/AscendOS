const cron = require('node-cron');
const User = require('../models/User');
const { DSAProblem } = require('../models/DSAProblem');
const PushNotificationService = require('./pushNotificationService');

const initCronJobs = () => {
  console.log('[Cron] Initializing background task schedulers...');

  // 1. Daily morning briefing at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      const users = await User.find();
      for (const user of users) {
        const todayStr = new Date().toISOString().split('T')[0];
        await PushNotificationService.sendNotification({
          userId: user._id,
          title: 'AscendOS Morning Briefing',
          body: 'Your study plan is ready. Review today’s Top 3 MITs and start your first focus session.',
          type: 'daily_briefing',
          link: '/dashboard',
          idempotencyKey: `morning-briefing-${user._id}-${todayStr}`
        });
      }
    } catch (err) {
      console.error('[Cron] Morning briefing error:', err.message);
    }
  });

  // 2. Periodic Spaced Revision Check (runs every 6 hours)
  cron.schedule('0 */6 * * *', async () => {
    try {
      const now = new Date();
      const users = await User.find();
      for (const user of users) {
        const dueProblems = await DSAProblem.find({
          user: user._id,
          status: 'needs_revision',
          nextRevisionDate: { $lte: now }
        });

        if (dueProblems.length > 0) {
          const dateStr = now.toISOString().split('T')[0];
          await PushNotificationService.sendNotification({
            userId: user._id,
            title: 'DSA Spaced Revision Due',
            body: `You have ${dueProblems.length} problem${dueProblems.length > 1 ? 's' : ''} waiting in your spaced repetition queue.`,
            type: 'dsa_revision',
            link: '/dsa',
            idempotencyKey: `dsa-revision-due-${user._id}-${dateStr}`
          });
        }
      }
    } catch (err) {
      console.error('[Cron] Spaced revision check error:', err.message);
    }
  });

  // 3. Evening Shutdown Reminder at 21:30 (9:30 PM)
  cron.schedule('30 21 * * *', async () => {
    try {
      const users = await User.find();
      const todayStr = new Date().toISOString().split('T')[0];
      for (const user of users) {
        await PushNotificationService.sendNotification({
          userId: user._id,
          title: 'AscendOS Daily Shutdown',
          body: 'Time to record today’s study hours, reflect on completed MITs, and set up tomorrow.',
          type: 'system_alert',
          link: '/accountability',
          idempotencyKey: `evening-shutdown-${user._id}-${todayStr}`
        });
      }
    } catch (err) {
      console.error('[Cron] Evening shutdown error:', err.message);
    }
  });

  console.log('[Cron] Background schedulers registered successfully.');
};

module.exports = { initCronJobs };
