const mongoose = require('mongoose');

const dailyReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reviewDate: {
    type: Date,
    required: true,
    index: true
  },
  completedTasksCount: {
    type: Number,
    default: 0
  },
  missedTasksCount: {
    type: Number,
    default: 0
  },
  plannedStudyHours: {
    type: Number,
    default: 6
  },
  actualStudyHours: {
    type: Number,
    default: 0
  },
  missedTasksReason: {
    type: String,
    enum: ['unrealistic_plan', 'fatigue_low_energy', 'academic_exams', 'unexpected_interruptions', 'procrastination', 'other'],
    default: 'unexpected_interruptions'
  },
  userReflection: {
    type: String,
    trim: true
  },
  mentorTomorrowRecommendation: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

dailyReviewSchema.index({ user: 1, reviewDate: 1 }, { unique: true });

module.exports = mongoose.model('DailyReview', dailyReviewSchema);
