const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['dsa', 'cs_fundamentals', 'project', 'application', 'personal', 'general'],
    default: 'general',
    index: true
  },
  priority: {
    type: String,
    enum: ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'],
    default: 'P2_HIGH',
    index: true
  },
  status: {
    type: String,
    enum: ['inbox', 'today', 'in_progress', 'completed', 'backlog'],
    default: 'today',
    index: true
  },
  estimatedMinutes: {
    type: Number,
    default: 45
  },
  actualMinutes: {
    type: Number,
    default: 0
  },
  isMIT: {
    type: Boolean,
    default: false,
    index: true
  },
  deadline: {
    type: Date
  },
  scheduledDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date
  },
  subtasks: [subtaskSchema],
  tags: [String],
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['dsa_problem', 'project', 'learning_topic', 'job_application', 'none'],
      default: 'none'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, {
  timestamps: true
});

taskSchema.index({ user: 1, status: 1, scheduledDate: 1 });
taskSchema.index({ user: 1, isMIT: 1 });

module.exports = mongoose.model('Task', taskSchema);
