const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['study_reminder', 'task_due', 'dsa_revision', 'application_deadline', 'daily_briefing', 'system_alert'],
    default: 'system_alert'
  },
  link: {
    type: String,
    default: '/dashboard'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  channel: {
    type: String,
    enum: ['in_app', 'push', 'both'],
    default: 'in_app'
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
