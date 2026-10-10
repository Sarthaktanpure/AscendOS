const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  degree: {
    type: String,
    default: 'B.E. Information Technology'
  },
  college: {
    type: String,
    default: 'Pravara Rural Engineering College, Loni'
  },
  expectedGraduation: {
    type: Number,
    default: 2028
  },
  academicStage: {
    type: String,
    default: 'Third year'
  },
  reportedCGPA: {
    type: Number,
    default: 9.0
  },
  careerTarget: {
    type: String,
    default: 'Software Development Engineer internships, full-stack engineering, and eventually top product companies'
  },
  primaryLanguageDSA: {
    type: String,
    default: 'Java'
  },
  technicalInterests: {
    type: [String],
    default: [
      'Java', 'DSA', 'React', 'Node.js', 'Express', 'MongoDB', 
      'Python', 'FastAPI', 'PyTorch', 'AI-assisted applications', 
      'backend engineering', 'testing', 'deployment'
    ]
  },
  currentLimitation: {
    type: String,
    default: 'No conventional software engineering internship experience yet'
  },
  mainObjective: {
    type: String,
    default: 'Build real skills, demonstrate engineering ability, secure interviews, and obtain an internship'
  },
  isOnboarded: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  themePreference: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
