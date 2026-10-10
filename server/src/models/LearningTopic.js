const mongoose = require('mongoose');

const csSubjects = [
  'Object-Oriented Programming',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'SQL',
  'Software Engineering & Testing',
  'System Design'
];

const subtopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
}, { _id: true });

const keyQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isMastered: { type: Boolean, default: false }
}, { _id: true });

const learningTopicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    enum: csSubjects,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtopics: [subtopicSchema],
  learningResources: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: 'Documentation' }
  }],
  notes: {
    type: String,
    default: ''
  },
  keyQuestions: [keyQuestionSchema],
  confidenceRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 2
  },
  nextRevisionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

learningTopicSchema.index({ user: 1, subject: 1 });

module.exports = {
  LearningTopic: mongoose.model('LearningTopic', learningTopicSchema),
  csSubjects
};
