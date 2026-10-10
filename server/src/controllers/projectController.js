const Project = require('../models/Project');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, message: 'Project removed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.updateQualityAudit = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.qualityAudit = {
      ...project.qualityAudit,
      ...req.body
    };
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.addTestCoverageEvidence = async (req, res, next) => {
  try {
    const { coveragePercentage, reportTool, notes } = req.body;
    if (coveragePercentage === undefined || !reportTool) {
      return res.status(400).json({ success: false, message: 'Coverage percentage and reporting tool are required.' });
    }

    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.testCoverageEvidence.push({
      coveragePercentage: Number(coveragePercentage),
      reportTool,
      notes,
      recordedDate: new Date()
    });
    // If test coverage recorded, set quality audit flag
    if (project.qualityAudit) {
      project.qualityAudit.automatedTesting = true;
    }
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.addPerformanceEvidence = async (req, res, next) => {
  try {
    const { metricName, value, methodology } = req.body;
    if (!metricName || !value || !methodology) {
      return res.status(400).json({ success: false, message: 'Metric name, value, and measurement methodology are required.' });
    }

    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.performanceEvidence.push({
      metricName,
      value,
      methodology,
      recordedDate: new Date()
    });
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.addEngineeringDecision = async (req, res, next) => {
  try {
    const { decision, rationale } = req.body;
    if (!decision || !rationale) {
      return res.status(400).json({ success: false, message: 'Decision and rationale are required.' });
    }

    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.engineeringDecisions.push({
      decision,
      rationale,
      date: new Date()
    });
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};
