const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true,
    index: true
  },
  totalPlannedHours: {
    type: Number,
    required: true
  },
  totalActualHours: {
    type: Number,
    required: true
  },
  consistencyScorePercentage: {
    type: Number,
    default: 0
  },
  dsaSolvedCount: {
    type: Number,
    default: 0
  },
  csTopicsCompletedCount: {
    type: Number,
    default: 0
  },
  applicationsSubmittedCount: {
    type: Number,
    default: 0
  },
  keyBottlenecksIdentified: [String],
  nextWeekStrategicGoals: [String],
  mentorSummaryAssessment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

weeklyReviewSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReview', weeklyReviewSchema);
