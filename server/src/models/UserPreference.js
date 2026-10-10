const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weeklyAvailabilityHours: {
    monday: { type: Number, default: 6 },
    tuesday: { type: Number, default: 6 },
    wednesday: { type: Number, default: 6 },
    thursday: { type: Number, default: 6 },
    friday: { type: Number, default: 10 },
    saturday: { type: Number, default: 10 },
    sunday: { type: Number, default: 10 }
  },
  quietHours: {
    enabled: { type: Boolean, default: true },
    start: { type: String, default: '23:00' },
    end: { type: String, default: '07:00' }
  },
  notifications: {
    browserPush: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    dsaReminders: { type: Boolean, default: true },
    deadlineAlerts: { type: Boolean, default: true },
    dailyBriefing: { type: Boolean, default: true }
  },
  deepWorkSessionDurationMinutes: {
    type: Number,
    default: 60
  },
  breakDurationMinutes: {
    type: Number,
    default: 10
  },
  preferredStudyTopics: {
    type: [String],
    default: ['Dynamic Programming', 'Graph Algorithms', 'System Architecture', 'Backend Engineering']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
