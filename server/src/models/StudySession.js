const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  sessionType: {
    type: String,
    enum: ['deep_work', 'revision', 'mock_interview', 'project_building', 'quick_catchup'],
    default: 'deep_work'
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  plannedMinutes: {
    type: Number,
    required: true
  },
  actualMinutes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'paused', 'completed', 'skipped', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  pauseDurationMinutes: {
    type: Number,
    default: 0
  },
  distractionCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

studySessionSchema.index({ user: 1, scheduledStartTime: 1, status: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
