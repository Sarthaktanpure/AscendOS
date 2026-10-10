const mongoose = require('mongoose');

const dsaAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSAProblem',
    required: true,
    index: true
  },
  outcome: {
    type: String,
    enum: ['solved', 'failed', 'needs_help', 'timed_out'],
    required: true
  },
  solveDurationMinutes: {
    type: Number,
    default: 25
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  mistakeType: {
    type: String,
    enum: ['none', 'concept_gap', 'implementation_bug', 'complexity_issue', 'misread_question'],
    default: 'none'
  },
  notes: {
    type: String,
    trim: true
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DSAAttempt', dsaAttemptSchema);
