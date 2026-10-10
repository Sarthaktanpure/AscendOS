const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobListing'
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  roleTitle: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Saved', 'Planned', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Saved',
    index: true
  },
  eligibilityVerdict: {
    type: String,
    enum: ['Likely match', 'Needs review', 'Does not match stated requirements'],
    default: 'Likely match'
  },
  eligibilityNotes: {
    type: String
  },
  appliedDate: {
    type: Date
  },
  assessmentDate: {
    type: Date
  },
  interviewDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  followUpDate: {
    type: Date
  },
  sourceUrl: {
    type: String
  },
  referralContact: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  },
  resumeVersionUsed: {
    type: String,
    default: 'Sarthak_Resume_v2026.pdf'
  }
}, {
  timestamps: true
});

applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, deadline: 1 });

module.exports = mongoose.model('Application', applicationSchema);
