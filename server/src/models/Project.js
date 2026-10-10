const mongoose = require('mongoose');

const qualityAuditSchema = new mongoose.Schema({
  authenticationAndAuth: { type: Boolean, default: false },
  inputValidation: { type: Boolean, default: false },
  centralizedErrorHandling: { type: Boolean, default: false },
  apiDocumentation: { type: Boolean, default: false },
  databaseIndexes: { type: Boolean, default: false },
  loggingAndMonitoring: { type: Boolean, default: false },
  accessibilityAndResponsive: { type: Boolean, default: false },
  automatedTesting: { type: Boolean, default: false },
  deploymentReliability: { type: Boolean, default: false }
}, { _id: false });

const projectFeatureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['planned', 'in_progress', 'completed'], default: 'planned' },
  notes: String
}, { _id: true });

const performanceEvidenceSchema = new mongoose.Schema({
  metricName: { type: String, required: true },
  value: { type: String, required: true },
  methodology: { type: String, required: true },
  recordedDate: { type: Date, default: Date.now }
}, { _id: true });

const testCoverageEvidenceSchema = new mongoose.Schema({
  coveragePercentage: { type: Number, required: true },
  reportTool: { type: String, required: true },
  recordedDate: { type: Date, default: Date.now },
  notes: String
}, { _id: true });

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  repoUrl: {
    type: String,
    trim: true
  },
  liveUrl: {
    type: String,
    trim: true
  },
  demoUrl: {
    type: String,
    trim: true
  },
  techStack: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['Full-Stack Web', 'AI / ML Engineering', 'Backend / Distributed', 'Systems / Security', 'Mobile / Cross-Platform'],
    default: 'Full-Stack Web'
  },
  status: {
    type: String,
    enum: ['concept', 'in_development', 'mvp_complete', 'production_deployed', 'archived'],
    default: 'in_development'
  },
  features: [projectFeatureSchema],
  bugsAndTechDebt: [{
    title: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    isResolved: { type: Boolean, default: false }
  }],
  qualityAudit: {
    type: qualityAuditSchema,
    default: () => ({})
  },
  testCoverageEvidence: [testCoverageEvidenceSchema],
  performanceEvidence: [performanceEvidenceSchema],
  engineeringDecisions: [{
    decision: { type: String, required: true },
    rationale: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  architectureNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

projectSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Project', projectSchema);
