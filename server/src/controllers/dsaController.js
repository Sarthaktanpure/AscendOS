const { DSAProblem, dsaTopics } = require('../models/DSAProblem');
const DSAAttempt = require('../models/DSAAttempt');
const RevisionItem = require('../models/RevisionItem');

exports.getProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, status, search, page = 1, limit = 50 } = req.query;
    const query = { user: req.user.id };

    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await DSAProblem.countDocuments(query);
    const problems = await DSAProblem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      topics: dsaTopics,
      problems
    });
  } catch (err) {
    next(err);
  }
};

exports.createProblem = async (req, res, next) => {
  try {
    const problem = await DSAProblem.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json({ success: true, problem });
  } catch (err) {
    next(err);
  }
};

exports.updateProblem = async (req, res, next) => {
  try {
    const problem = await DSAProblem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }
    res.status(200).json({ success: true, problem });
  } catch (err) {
    next(err);
  }
};

exports.deleteProblem = async (req, res, next) => {
  try {
    const problem = await DSAProblem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }
    await DSAAttempt.deleteMany({ problem: req.params.id });
    await RevisionItem.deleteMany({ referenceId: req.params.id });
    res.status(200).json({ success: true, message: 'Problem removed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.recordAttempt = async (req, res, next) => {
  try {
    const { outcome, solveDurationMinutes, hintsUsed, confidence, mistakeType, notes } = req.body;
    const problem = await DSAProblem.findOne({ _id: req.params.id, user: req.user.id });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    const attempt = await DSAAttempt.create({
      user: req.user.id,
      problem: problem._id,
      outcome,
      solveDurationMinutes: solveDurationMinutes || 25,
      hintsUsed: hintsUsed || 0,
      confidence: confidence || 3,
      mistakeType: mistakeType || 'none',
      notes
    });

    problem.totalAttempts = (problem.totalAttempts || 0) + 1;
    if (outcome === 'solved') {
      problem.status = 'solved';
      problem.lastSolvedAt = new Date();
      // Set next revision in 3 days
      problem.revisionIntervalDays = 3;
      problem.nextRevisionDate = new Date(Date.now() + 3 * 86400000);
      problem.confidence = confidence || problem.confidence;

      // Upsert into RevisionItem
      await RevisionItem.findOneAndUpdate(
        { user: req.user.id, referenceId: problem._id },
        {
          user: req.user.id,
          itemType: 'dsa_problem',
          referenceId: problem._id,
          title: problem.title,
          topic: problem.topic,
          intervalStep: 3,
          nextReviewDate: problem.nextRevisionDate,
          lastReviewedAt: new Date(),
          $inc: { repetitionCount: 1, successCount: 1 }
        },
        { upsert: true }
      );
    } else {
      problem.status = 'needs_revision';
      problem.revisionIntervalDays = 1;
      problem.nextRevisionDate = new Date(Date.now() + 1 * 86400000); // Revise tomorrow
    }

    await problem.save();
    res.status(201).json({ success: true, attempt, problem });
  } catch (err) {
    next(err);
  }
};

exports.getRevisionQueue = async (req, res, next) => {
  try {
    const now = new Date();
    const queue = await DSAProblem.find({
      user: req.user.id,
      status: { $in: ['needs_revision', 'solved'] },
      nextRevisionDate: { $lte: now }
    }).sort({ nextRevisionDate: 1 });

    res.status(200).json({ success: true, count: queue.length, queue });
  } catch (err) {
    next(err);
  }
};

exports.reviewProblem = async (req, res, next) => {
  try {
    const { success, confidence, notes } = req.body;
    const problem = await DSAProblem.findOne({ _id: req.params.id, user: req.user.id });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    // Intervals: 1 -> 3 -> 7 -> 14 -> 30 days
    const intervalMap = { 1: 3, 3: 7, 7: 14, 14: 30, 30: 30 };
    if (success) {
      problem.status = 'solved';
      const currentInterval = problem.revisionIntervalDays || 1;
      const nextInterval = intervalMap[currentInterval] || 30;
      problem.revisionIntervalDays = nextInterval;
      problem.nextRevisionDate = new Date(Date.now() + nextInterval * 86400000);
      problem.lastSolvedAt = new Date();
      if (confidence) problem.confidence = confidence;
    } else {
      // Reset back to 1 day if failed
      problem.status = 'needs_revision';
      problem.revisionIntervalDays = 1;
      problem.nextRevisionDate = new Date(Date.now() + 1 * 86400000);
    }

    await problem.save();

    res.status(200).json({
      success: true,
      problem,
      message: success 
        ? `Revision recorded! Next interval: ${problem.revisionIntervalDays} days.` 
        : 'Recorded difficulty. Problem re-queued for tomorrow.'
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopicMastery = async (req, res, next) => {
  try {
    const problems = await DSAProblem.find({ user: req.user.id });
    const stats = {};

    dsaTopics.forEach(t => {
      stats[t] = { total: 0, solved: 0, attempted: 0, needsRevision: 0, masteryPercent: 0 };
    });

    problems.forEach(p => {
      if (!stats[p.topic]) {
        stats[p.topic] = { total: 0, solved: 0, attempted: 0, needsRevision: 0, masteryPercent: 0 };
      }
      stats[p.topic].total++;
      if (p.status === 'solved') stats[p.topic].solved++;
      else if (p.status === 'attempted') stats[p.topic].attempted++;
      else if (p.status === 'needs_revision') stats[p.topic].needsRevision++;
    });

    Object.keys(stats).forEach(topic => {
      const s = stats[topic];
      s.masteryPercent = s.total > 0 ? Math.round((s.solved / s.total) * 100) : 0;
    });

    res.status(200).json({ success: true, topicMastery: stats });
  } catch (err) {
    next(err);
  }
};
