const Application = require('../models/Application');

exports.getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('jobListing')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const app = await Application.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.status(200).json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.status(200).json({ success: true, message: 'Application removed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getFunnelMetrics = async (req, res, next) => {
  try {
    const apps = await Application.find({ user: req.user.id });
    const stages = ['Saved', 'Planned', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
    const funnel = {};

    stages.forEach(st => { funnel[st] = 0; });
    apps.forEach(a => {
      if (funnel[a.status] !== undefined) funnel[a.status]++;
    });

    const activePipelineCount = funnel.Applied + funnel.Assessment + funnel.Interview;

    res.status(200).json({
      success: true,
      totalTracked: apps.length,
      activePipelineCount,
      funnel
    });
  } catch (err) {
    next(err);
  }
};
