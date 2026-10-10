const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'DSA Practice',
      'CS Fundamentals',
      'Full-Stack Development',
      'Testing & Backend',
      'Cloud & DevOps',
      'Interview Preparation',
      'Official Internship Portals'
    ],
    required: true,
    index: true
  },
  authorOrSource: {
    type: String,
    required: true
  },
  isFree: {
    type: Boolean,
    default: true
  },
  costDescription: {
    type: String,
    default: 'Free & Open Source'
  },
  description: {
    type: String,
    required: true
  },
  tags: [String],
  usersCompleted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
