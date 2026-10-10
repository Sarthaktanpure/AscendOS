const StudySession = require('../models/StudySession');
const Task = require('../models/Task');
const { DSAProblem } = require('../models/DSAProblem');
const RevisionItem = require('../models/RevisionItem');
const { LearningTopic } = require('../models/LearningTopic');
const Project = require('../models/Project');
const Application = require('../models/Application');
const MentorEngine = require('../services/mentorEngine');

exports.getFullAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 1. 30-day Study History
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const completedSessions = await StudySession.find({
      user: userId,
      status: 'completed',
      scheduledStartTime: { $gte: thirtyDaysAgo }
    }).sort({ scheduledStartTime: 1 });

    const totalStudyMinutes = completedSessions.reduce((acc, s) => acc + (s.actualMinutes || s.plannedMinutes || 0), 0);

    // 2. Revision Success Metrics
    const revisionItems = await RevisionItem.find({ user: userId });
    const totalReps = revisionItems.reduce((acc, r) => acc + (r.repetitionCount || 0), 0);
    const successReps = revisionItems.reduce((acc, r) => acc + (r.successCount || 0), 0);
    const revisionSuccessRate = totalReps > 0 ? Math.round((successReps / totalReps) * 100) : 100;

    // 3. CS Topics Completion
    const csTopics = await LearningTopic.find({ user: userId });
    let totalSubtopics = 0;
    let completedSubtopics = 0;
    csTopics.forEach(t => {
      (t.subtopics || []).forEach(st => {
        totalSubtopics++;
        if (st.isCompleted) completedSubtopics++;
      });
    });
    const csCompletionPercentage = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

    // 4. Application Funnel
    const apps = await Application.find({ user: userId });
    const funnel = {
      Saved: apps.filter(a => a.status === 'Saved').length,
      Planned: apps.filter(a => a.status === 'Planned').length,
      Applied: apps.filter(a => a.status === 'Applied').length,
      Assessment: apps.filter(a => a.status === 'Assessment').length,
      Interview: apps.filter(a => a.status === 'Interview').length,
      Offer: apps.filter(a => a.status === 'Offer').length,
      Rejected: apps.filter(a => a.status === 'Rejected').length
    };

    // 5. Readiness Rubric
    const readiness = await MentorEngine.evaluateReadiness(userId);

    res.status(200).json({
      success: true,
      data: {
        totalStudyHours: Number((totalStudyMinutes / 60).toFixed(1)),
        sessionsCount: completedSessions.length,
        revisionSuccessRate,
        csCompletionPercentage,
        funnel,
        readiness
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    const sessions = await StudySession.find({ user: userId }).sort({ scheduledStartTime: -1 });

    let csv = 'Type,Title,Category_or_SessionType,Status,PlannedOrEstMin,ActualMin,Date\n';

    tasks.forEach(t => {
      const dateStr = t.scheduledDate ? t.scheduledDate.toISOString().split('T')[0] : '';
      csv += `"Task","${t.title.replace(/"/g, '""')}","${t.category}","${t.status}",${t.estimatedMinutes || 0},${t.actualMinutes || 0},"${dateStr}"\n`;
    });

    sessions.forEach(s => {
      const dateStr = s.scheduledStartTime ? s.scheduledStartTime.toISOString().split('T')[0] : '';
      csv += `"StudySession","${s.title.replace(/"/g, '""')}","${s.sessionType}","${s.status}",${s.plannedMinutes || 0},${s.actualMinutes || 0},"${dateStr}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ascendos_progress_report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};
