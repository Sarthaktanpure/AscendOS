const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
  externalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  source: {
    type: String,
    enum: ['Greenhouse', 'GitHub_EarlyCareer', 'CompanyCareerPage', 'VerifiedOpenFeed'],
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  roleType: {
    type: String,
    enum: ['Software Engineering', 'Backend Engineering', 'Full-Stack Engineering', 'AI / ML Engineering', 'DevOps / Cloud', 'Other'],
    default: 'Software Engineering'
  },
  location: {
    type: String,
    required: true,
    default: 'Remote / India'
  },
  workMode: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'remote'
  },
  descriptionSummary: {
    type: String,
    required: true
  },
  applicationUrl: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String
  }],
  targetGraduationYears: [{
    type: Number
  }],
  isPaid: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Undisclosed'],
    default: 'Paid'
  },
  deadline: {
    type: Date
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

jobListingSchema.index({ company: 1, title: 1 });
jobListingSchema.index({ fetchedAt: -1 });

module.exports = mongoose.model('JobListing', jobListingSchema);
