const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const { DSAProblem } = require('../models/DSAProblem');
const Project = require('../models/Project');
const Application = require('../models/Application');
const JobListing = require('../models/JobListing');
const UserPreference = require('../models/UserPreference');
const MentorEngine = require('../services/mentorEngine');
const JobRadarService = require('../services/jobRadarService');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Fetch Today's Study Sessions
    const todaySessions = await StudySession.find({
      user: userId,
      scheduledStartTime: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ scheduledStartTime: 1 });

    const plannedMinutes = todaySessions.reduce((acc, s) => acc + (s.plannedMinutes || 0), 0);
    const completedMinutes = todaySessions
      .filter(s => s.status === 'completed')
      .reduce((acc, s) => acc + (s.actualMinutes || s.plannedMinutes || 0), 0);
    const remainingMinutes = Math.max(0, plannedMinutes - completedMinutes);

    // 2. Currently Active Session (if any)
    const activeSession = todaySessions.find(s => s.status === 'active') || null;

    // 3. Top 3 Priorities (MITs)
    let mits = await Task.find({
      user: userId,
      isMIT: true,
      status: { $ne: 'completed' }
    }).limit(3);

    // If fewer than 3 explicit MITs, supplement with high-priority today tasks
    if (mits.length < 3) {
      const extraTasks = await Task.find({
        user: userId,
        _id: { $nin: mits.map(m => m._id) },
        status: { $in: ['today', 'in_progress'] }
      }).sort({ priority: 1, deadline: 1 }).limit(3 - mits.length);
      mits = [...mits, ...extraTasks];
    }

    // 4. "What Should I Do Next?" Directive
    let nextAction = null;
    if (activeSession) {
      nextAction = {
        type: 'ACTIVE_SESSION',
        title: `Continue active focus session: ${activeSession.title}`,
        session: activeSession
      };
    } else {
      const upcomingSession = todaySessions.find(s => s.status === 'scheduled');
      if (upcomingSession) {
        nextAction = {
          type: 'START_SESSION',
          title: `Start scheduled session: ${upcomingSession.title}`,
          session: upcomingSession
        };
      } else if (mits.length > 0) {
        nextAction = {
          type: 'START_MIT',
          title: `Execute Priority MIT: ${mits[0].title}`,
          task: mits[0]
        };
      } else {
        nextAction = {
          type: 'PLAN_OR_REVISE',
          title: 'Review daily plan or execute 45-minute DSA problem set',
          link: '/scheduler'
        };
      }
    }

    // 5. DSA Statistics
    const dsaProblems = await DSAProblem.find({ user: userId });
    const dsaStats = {
      solved: dsaProblems.filter(p => p.status === 'solved').length,
      attempted: dsaProblems.filter(p => p.status === 'attempted').length,
      needsRevision: dsaProblems.filter(p => p.status === 'needs_revision').length,
      overdueRevision: dsaProblems.filter(p => p.status === 'needs_revision' && p.nextRevisionDate && p.nextRevisionDate <= now).length,
      total: dsaProblems.length
    };

    // 6. Project & Application Milestones
    const projects = await Project.find({ user: userId }).select('name status qualityAudit liveUrl testCoverageEvidence');
    const upcomingDeadlines = await Application.find({
      user: userId,
      deadline: { $gte: now },
      status: { $in: ['Saved', 'Planned', 'Applied', 'Assessment', 'Interview'] }
    }).sort({ deadline: 1 }).limit(4);

    // 7. Recent Verified Internships
    const rawJobs = await JobListing.find({ isActive: true }).sort({ fetchedAt: -1 }).limit(4);
    const jobsWithEligibility = rawJobs.map(job => {
      const verdict = JobRadarService.evaluateEligibility(job, req.user);
      return {
        ...job.toObject(),
        eligibility: verdict
      };
    });

    // 8. Weekly Heatmap (last 7 days completed minutes)
    const heatmap = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStart = new Date(d); dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);

      const daySessions = await StudySession.find({
        user: userId,
        status: 'completed',
        scheduledStartTime: { $gte: dStart, $lte: dEnd }
      });

      const dayMinutes = daySessions.reduce((acc, s) => acc + (s.actualMinutes || s.plannedMinutes || 0), 0);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      heatmap.push({
        date: d.toISOString().split('T')[0],
        dayName,
        minutes: dayMinutes,
        hours: Number((dayMinutes / 60).toFixed(1))
      });
    }

    // 9. Streak & Consistency
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStart = new Date(d); dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);

      const count = await StudySession.countDocuments({
        user: userId,
        status: 'completed',
        scheduledStartTime: { $gte: dStart, $lte: dEnd }
      });
      if (count > 0) {
        currentStreak++;
      } else if (i > 0) {
        // If today has 0 completed yet, don't break streak if yesterday was completed
        break;
      }
    }

    // 10. Mentor Daily Recommendation & Readiness Rubric
    const mentorAdvice = await MentorEngine.getDailyAdvice(userId);
    const readiness = await MentorEngine.evaluateReadiness(userId);

    // 11. Consistency Percentage (Completed vs Planned this week)
    const totalWeeklyPlanned = heatmap.reduce((acc, h) => acc + 6, 0); // ~6h/day baseline
    const totalWeeklyActual = heatmap.reduce((acc, h) => acc + h.hours, 0);
    const weeklyConsistencyPercentage = Math.min(100, Math.round((totalWeeklyActual / totalWeeklyPlanned) * 100));

    res.status(200).json({
      success: true,
      data: {
        nextAction,
        todaySchedule: {
          sessions: todaySessions,
          plannedMinutes,
          completedMinutes,
          remainingMinutes,
          plannedHours: Number((plannedMinutes / 60).toFixed(1)),
          completedHours: Number((completedMinutes / 60).toFixed(1)),
          activeSession
        },
        mits,
        dsaStats,
        projectsSummary: projects,
        upcomingDeadlines,
        jobRadar: jobsWithEligibility,
        weeklyHeatmap: heatmap,
        metrics: {
          currentStreakDays: currentStreak,
          weeklyConsistencyPercentage,
          totalWeeklyActualHours: Number(totalWeeklyActual.toFixed(1))
        },
        mentorAdvice,
        readiness
      }
    });
  } catch (err) {
    next(err);
  }
};
