const mongoose = require('mongoose');

const dsaTopics = [
  'Time and space complexity',
  'Arrays and strings',
  'Hashing',
  'Two pointers',
  'Sliding window',
  'Prefix sums',
  'Binary search',
  'Linked lists',
  'Stacks and queues',
  'Recursion and backtracking',
  'Trees and binary search trees',
  'Heaps and priority queues',
  'Greedy algorithms',
  'Graphs',
  'Dynamic programming',
  'Tries and bit manipulation'
];

const dsaProblemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  platform: {
    type: String,
    enum: ['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'InterviewBit', 'Custom'],
    default: 'LeetCode'
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  tags: [String],
  status: {
    type: String,
    enum: ['not_started', 'attempted', 'solved', 'needs_revision'],
    default: 'not_started',
    index: true
  },
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  approachNotes: {
    type: String,
    trim: true
  },
  timeComplexity: {
    type: String,
    default: 'O(N)'
  },
  spaceComplexity: {
    type: String,
    default: 'O(1)'
  },
  solutionCode: {
    type: String
  },
  codeLanguage: {
    type: String,
    default: 'Java'
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  lastSolvedAt: {
    type: Date
  },
  nextRevisionDate: {
    type: Date,
    index: true
  },
  revisionIntervalDays: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

dsaProblemSchema.index({ user: 1, topic: 1, status: 1 });
dsaProblemSchema.index({ user: 1, nextRevisionDate: 1 });

module.exports = {
  DSAProblem: mongoose.model('DSAProblem', dsaProblemSchema),
  dsaTopics
};
