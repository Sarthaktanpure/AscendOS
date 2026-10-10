const mongoose = require('mongoose');

const revisionItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemType: {
    type: String,
    enum: ['dsa_problem', 'cs_topic'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String
  },
  intervalStep: {
    type: Number,
    default: 1 // 1, 3, 7, 14, 30
  },
  nextReviewDate: {
    type: Date,
    required: true,
    index: true
  },
  lastReviewedAt: {
    type: Date
  },
  repetitionCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

revisionItemSchema.index({ user: 1, nextReviewDate: 1 });

module.exports = mongoose.model('RevisionItem', revisionItemSchema);
