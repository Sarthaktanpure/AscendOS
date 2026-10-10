const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const UserPreference = require('../models/UserPreference');
const { DSAProblem } = require('../models/DSAProblem');

class SchedulerEngine {
  // Get planned study budget in minutes for a specific day of week
  static async getDailyBudgetMinutes(userId, date) {
    const pref = await UserPreference.findOne({ user: userId });
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    
    // Default fallback: Mon-Thu 6h (360m), Fri-Sun 10h (600m)
    let hours = (dayOfWeek === 'friday' || dayOfWeek === 'saturday' || dayOfWeek === 'sunday') ? 10 : 6;
    if (pref && pref.weeklyAvailabilityHours && pref.weeklyAvailabilityHours[dayOfWeek] !== undefined) {
      hours = pref.weeklyAvailabilityHours[dayOfWeek];
    }
    return hours * 60;
  }

  // Generate study sessions for a given date based on priorities
  static async generateSchedule(userId, targetDate) {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Remove any unstarted scheduled sessions for that date to avoid duplication
    await StudySession.deleteMany({
      user: userId,
      status: 'scheduled',
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalBudgetMinutes = await this.getDailyBudgetMinutes(userId, targetDate);
    let remainingMinutes = totalBudgetMinutes;

    // 2. Query prioritized tasks
    // Priority 1: Overdue or due DSA revisions
    const dueDSA = await DSAProblem.find({
      user: userId,
      status: 'needs_revision',
      nextRevisionDate: { $lte: endOfDay }
    }).limit(3);

    // Priority 2: Tasks marked as Today or MIT
    const todayTasks = await Task.find({
      user: userId,
      status: { $in: ['today', 'in_progress'] }
    }).sort({ isMIT: -1, priority: 1, deadline: 1 });

    const newSessions = [];
    let currentSlotTime = new Date(targetDate);
    currentSlotTime.setHours(9, 0, 0, 0); // Start day default at 9:00 AM

    // A. Schedule DSA Revision block if due
    if (dueDSA.length > 0 && remainingMinutes >= 45) {
      const revisionDuration = 45;
      const endSlot = new Date(currentSlotTime.getTime() + revisionDuration * 60000);
      newSessions.push({
        user: userId,
        title: `DSA Spaced Revision (${dueDSA.length} problem${dueDSA.length > 1 ? 's' : ''} due)`,
        sessionType: 'revision',
        scheduledStartTime: new Date(currentSlotTime),
        scheduledEndTime: endSlot,
        plannedMinutes: revisionDuration,
        status: 'scheduled',
        notes: `Focus on: ${dueDSA.map(p => p.title).join(', ')}`
      });
      remainingMinutes -= revisionDuration;
      currentSlotTime = new Date(endSlot.getTime() + 15 * 60000); // 15m buffer break
    }

    // B. Schedule High-Impact Today Tasks
    for (const task of todayTasks) {
      if (remainingMinutes < 30) break;
      const taskDuration = Math.min(task.estimatedMinutes || 60, remainingMinutes, 90);
      const endSlot = new Date(currentSlotTime.getTime() + taskDuration * 60000);

      newSessions.push({
        user: userId,
        title: task.title,
        task: task._id,
        sessionType: task.category === 'project' ? 'project_building' : (task.category === 'dsa' ? 'deep_work' : 'deep_work'),
        scheduledStartTime: new Date(currentSlotTime),
        scheduledEndTime: endSlot,
        plannedMinutes: taskDuration,
        status: 'scheduled',
        notes: task.description || `Priority: ${task.priority}`
      });

      remainingMinutes -= taskDuration;
      currentSlotTime = new Date(endSlot.getTime() + 15 * 60000); // 15m buffer break
    }

    // If still have remaining budget and no more tasks, add general deep work block
    if (remainingMinutes >= 60 && newSessions.length < 2) {
      const dur = Math.min(remainingMinutes, 60);
      const endSlot = new Date(currentSlotTime.getTime() + dur * 60000);
      newSessions.push({
        user: userId,
        title: 'Core CS / Project Engineering Deep Work',
        sessionType: 'deep_work',
        scheduledStartTime: new Date(currentSlotTime),
        scheduledEndTime: endSlot,
        plannedMinutes: dur,
        status: 'scheduled',
        notes: 'Dedicated engineering progress block'
      });
    }

    if (newSessions.length > 0) {
      await StudySession.insertMany(newSessions);
    }

    return await StudySession.find({
      user: userId,
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ scheduledStartTime: 1 });
  }

  // Emergency: "I have only 2 hours today"
  static async compactToTwoHours(userId, targetDate) {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Cancel existing scheduled sessions
    await StudySession.deleteMany({
      user: userId,
      status: 'scheduled',
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Pick top 2 MITs
    const mits = await Task.find({
      user: userId,
      status: { $in: ['today', 'in_progress'] }
    }).sort({ isMIT: -1, priority: 1 }).limit(2);

    const compactedSessions = [];
    let currentSlot = new Date(targetDate);
    currentSlot.setHours(18, 0, 0, 0); // Default to 6:00 PM for evening sprint

    for (const mit of mits) {
      const duration = 50; // 50m block
      const endSlot = new Date(currentSlot.getTime() + duration * 60000);
      compactedSessions.push({
        user: userId,
        title: `[Compacted Focus] ${mit.title}`,
        task: mit._id,
        sessionType: 'quick_catchup',
        scheduledStartTime: new Date(currentSlot),
        scheduledEndTime: endSlot,
        plannedMinutes: duration,
        status: 'scheduled',
        notes: 'Emergency 2-hour mode: High-impact priority focus.'
      });
      currentSlot = new Date(endSlot.getTime() + 10 * 60000); // 10m break
    }

    if (compactedSessions.length === 0) {
      // Fallback 2-hour sprint
      const duration = 100;
      const endSlot = new Date(currentSlot.getTime() + duration * 60000);
      compactedSessions.push({
        user: userId,
        title: '[Emergency 2h Sprint] High-Leverage DSA & Revision',
        sessionType: 'quick_catchup',
        scheduledStartTime: new Date(currentSlot),
        scheduledEndTime: endSlot,
        plannedMinutes: duration,
        status: 'scheduled',
        notes: 'Emergency 2-hour condensed study block'
      });
    }

    await StudySession.insertMany(compactedSessions);
    return compactedSessions;
  }

  // "Today is a low-energy day"
  static async adjustForLowEnergy(userId, targetDate) {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Cancel existing scheduled heavy sessions
    await StudySession.deleteMany({
      user: userId,
      status: 'scheduled',
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay }
    });

    const lowEnergySessions = [
      {
        user: userId,
        title: '[Low Energy] CS Fundamentals Concept Review & Flashcards',
        sessionType: 'revision',
        scheduledStartTime: new Date(startOfDay.getTime() + 10 * 3600000), // 10:00 AM
        scheduledEndTime: new Date(startOfDay.getTime() + 10 * 3600000 + 40 * 60000),
        plannedMinutes: 40,
        status: 'scheduled',
        notes: 'Low cognitive load: Review OOP/DBMS notes without coding pressure.'
      },
      {
        user: userId,
        title: '[Low Energy] Light DSA Code Reading & Edge Case Walkthrough',
        sessionType: 'revision',
        scheduledStartTime: new Date(startOfDay.getTime() + 15 * 3600000), // 3:00 PM
        scheduledEndTime: new Date(startOfDay.getTime() + 15 * 3600000 + 40 * 60000),
        plannedMinutes: 40,
        status: 'scheduled',
        notes: 'Read pre-solved optimal approaches for previously solved problems.'
      }
    ];

    await StudySession.insertMany(lowEnergySessions);
    return lowEnergySessions;
  }

  // Emergency Schedule Rebuilding after missed sessions
  static async emergencyRebuild(userId) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Find all scheduled sessions that are in past but never started
    const missedSessions = await StudySession.find({
      user: userId,
      status: 'scheduled',
      scheduledEndTime: { $lt: now }
    });

    // Mark missed sessions as skipped
    for (const session of missedSessions) {
      session.status = 'skipped';
      session.notes = (session.notes || '') + ' [Marked skipped during schedule rebuild]';
      await session.save();
    }

    // 2. Generate a fresh schedule starting from now
    const regenerated = await this.generateSchedule(userId, now);
    return {
      missedCount: missedSessions.length,
      regeneratedCount: regenerated.length,
      sessions: regenerated
    };
  }
}

module.exports = SchedulerEngine;
