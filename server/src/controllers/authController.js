const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserPreference = require('../models/UserPreference');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret_fallback',
    { expiresIn: '30d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        college: user.college,
        expectedGraduation: user.expectedGraduation,
        academicStage: user.academicStage,
        reportedCGPA: user.reportedCGPA,
        careerTarget: user.careerTarget,
        primaryLanguageDSA: user.primaryLanguageDSA,
        technicalInterests: user.technicalInterests,
        currentLimitation: user.currentLimitation,
        mainObjective: user.mainObjective,
        isOnboarded: user.isOnboarded,
        timezone: user.timezone,
        themePreference: user.themePreference
      }
    });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create(req.body);
    await UserPreference.create({ user: user._id });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Successfully logged out.' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let preferences = await UserPreference.findOne({ user: req.user.id });
    if (!preferences) {
      preferences = await UserPreference.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      user,
      preferences
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'degree', 'college', 'expectedGraduation', 'academicStage',
      'reportedCGPA', 'careerTarget', 'primaryLanguageDSA', 'technicalInterests',
      'currentLimitation', 'mainObjective', 'timezone', 'themePreference'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const preferences = await UserPreference.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, preferences });
  } catch (err) {
    next(err);
  }
};

exports.completeOnboarding = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { isOnboarded: true }, { new: true });
    if (req.body.preferences) {
      await UserPreference.findOneAndUpdate(
        { user: req.user.id },
        req.body.preferences,
        { new: true, upsert: true }
      );
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
