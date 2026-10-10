const StudySession = require('../models/StudySession');
const SchedulerEngine = require('../services/schedulerEngine');

exports.getSessions = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.scheduledStartTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.scheduledStartTime = { $gte: start, $lte: end };
    }

    const sessions = await StudySession.find(query).sort({ scheduledStartTime: 1 });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    next(err);
  }
};

exports.generateSchedule = async (req, res, next) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const sessions = await SchedulerEngine.generateSchedule(req.user.id, date);
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    next(err);
  }
};

exports.startSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = 'active';
    session.actualStartTime = session.actualStartTime || new Date();
    await session.save();

    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.pauseSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = 'paused';
    session.pauseDurationMinutes = (session.pauseDurationMinutes || 0) + (req.body.pauseMinutes || 5);
    await session.save();

    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.completeSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = 'completed';
    session.actualEndTime = new Date();
    if (req.body.actualMinutes !== undefined) {
      session.actualMinutes = req.body.actualMinutes;
    } else if (session.actualStartTime) {
      const diffMin = Math.round((session.actualEndTime - session.actualStartTime) / 60000);
      session.actualMinutes = Math.max(5, diffMin - (session.pauseDurationMinutes || 0));
    } else {
      session.actualMinutes = session.plannedMinutes;
    }

    if (req.body.distractionCount !== undefined) {
      session.distractionCount = req.body.distractionCount;
    }
    if (req.body.notes) {
      session.notes = req.body.notes;
    }

    await session.save();
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.skipSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = 'skipped';
    if (req.body.reason) {
      session.notes = (session.notes ? session.notes + ' | ' : '') + `Skipped reason: ${req.body.reason}`;
    }
    await session.save();

    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.rescheduleSession = async (req, res, next) => {
  try {
    const { newStartTime, newEndTime } = req.body;
    const session = await StudySession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.scheduledStartTime = new Date(newStartTime);
    session.scheduledEndTime = new Date(newEndTime);
    session.status = 'rescheduled';
    await session.save();

    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.emergencyTwoHours = async (req, res, next) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const compacted = await SchedulerEngine.compactToTwoHours(req.user.id, date);
    res.status(200).json({
      success: true,
      message: 'Emergency 2-hour schedule activated. Non-critical tasks deferred safely to backlog.',
      sessions: compacted
    });
  } catch (err) {
    next(err);
  }
};

exports.lowEnergyDay = async (req, res, next) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const sessions = await SchedulerEngine.adjustForLowEnergy(req.user.id, date);
    res.status(200).json({
      success: true,
      message: 'Low-energy schedule activated with gentle revision and reading blocks.',
      sessions
    });
  } catch (err) {
    next(err);
  }
};

exports.rebuildSchedule = async (req, res, next) => {
  try {
    const result = await SchedulerEngine.emergencyRebuild(req.user.id);
    res.status(200).json({
      success: true,
      message: `Schedule rebuilt: ${result.missedCount} missed sessions handled, ${result.regeneratedCount} new sessions allocated.`,
      result
    });
  } catch (err) {
    next(err);
  }
};
