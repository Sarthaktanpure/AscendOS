import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCw,
  Sparkles,
  Briefcase,
  Code2,
  BookOpen,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Skeleton } from '../components/common/EmptyState';

export const Dashboard = () => {
  const { onStartFocusTimer } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleMIT = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: 'completed' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const {
    nextAction,
    todaySchedule,
    mits,
    dsaStats,
    projectsSummary,
    upcomingDeadlines,
    jobRadar,
    weeklyHeatmap,
    metrics,
    mentorAdvice,
    readiness
  } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. "WHAT SHOULD I DO NEXT?" COMMAND DIRECTIVE */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-indigo-950/30 to-[#111827] border border-indigo-500/30 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Command Center • What to do next
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {nextAction?.title || 'Review today’s focus plan'}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {mentorAdvice?.recommendation || 'Protect your planned deep work sessions today and clear overdue DSA revisions.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {nextAction?.session ? (
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={() => onStartFocusTimer(nextAction.session)}
                className="shadow-lg shadow-indigo-600/30 font-semibold"
              >
                Launch Focus Session
              </Button>
            ) : nextAction?.task ? (
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={() => onStartFocusTimer({ title: nextAction.task.title, plannedMinutes: nextAction.task.estimatedMinutes || 45 })}
              >
                Start MIT Sprint
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={() => onStartFocusTimer({ title: 'DSA Deep Work', plannedMinutes: 45 })}
              >
                Start Focus Timer
              </Button>
            )}
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Planned vs Completed Hours */}
        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Study</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {todaySchedule.completedHours}h
            </span>
            <span className="text-xs text-slate-400">/ {todaySchedule.plannedHours}h planned</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${todaySchedule.plannedHours > 0 ? Math.min(100, Math.round((todaySchedule.completedHours / todaySchedule.plannedHours) * 100)) : 0}%`
              }}
            />
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {metrics.currentStreakDays}
            </span>
            <span className="text-xs text-amber-500 font-medium">days active</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 truncate">
            {metrics.weeklyConsistencyPercentage}% consistency this week
          </p>
        </Card>

        {/* DSA Progress */}
        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">DSA Solved</span>
            <Code2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {dsaStats.solved}
            </span>
            <span className="text-xs text-slate-400">/ {dsaStats.total} tracked</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {dsaStats.overdueRevision > 0 ? (
              <Badge variant="rose" size="xs">
                {dsaStats.overdueRevision} revision overdue
              </Badge>
            ) : (
              <Badge variant="emerald" size="xs">
                Spaced queue clear
              </Badge>
            )}
          </div>
        </Card>

        {/* Career Readiness Index */}
        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Readiness Score</span>
            <Target className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {readiness?.overallReadinessIndex || 65}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 truncate">
            Targeting Top Product Companies
          </p>
        </Card>
      </div>

      {/* 3. TWO-COLUMN WORKSPACE: TOP MITs & TODAY'S TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top 3 MITs & Weekly Heatmap (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top 3 Priorities (MITs) */}
          <Card
            title="Today's Most Important Tasks (MITs)"
            subtitle="The 3 highest-leverage actions that will drive maximum progress today."
            action={
              <Link to="/tasks" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                View all tasks <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            <div className="space-y-3">
              {mits.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No pending MITs for today. Excellent work!</p>
              ) : (
                mits.map((task, idx) => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] hover:border-slate-300 dark:hover:border-[#2F405A] transition-all"
                  >
                    <button
                      onClick={() => handleToggleMIT(task._id)}
                      className="mt-0.5 w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-emerald-500 transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-transparent hover:text-emerald-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {task.title}
                        </span>
                        <Badge variant={task.priority === 'P1_CRITICAL' ? 'rose' : 'amber'} size="xs">
                          {task.priority === 'P1_CRITICAL' ? 'P1' : 'P2'}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span>Est: {task.estimatedMinutes}m</span>
                        <span className="capitalize">Category: {task.category}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Weekly Activity Heatmap */}
          <Card
            title="Weekly Consistency Heatmap"
            subtitle="Study hours recorded across the last 7 days."
          >
            <div className="grid grid-cols-7 gap-2 pt-2">
              {weeklyHeatmap.map((day) => {
                const hours = day.hours;
                let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500';
                if (hours >= 8) bgClass = 'bg-emerald-600 text-white font-semibold';
                else if (hours >= 5) bgClass = 'bg-emerald-500/70 text-white font-medium';
                else if (hours >= 2) bgClass = 'bg-emerald-500/40 text-slate-200';
                else if (hours > 0) bgClass = 'bg-emerald-500/20 text-slate-300';

                return (
                  <div key={day.date} className="flex flex-col items-center">
                    <div className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-center transition-all ${bgClass}`}>
                      <span className="text-xs font-mono">{hours}h</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">{day.dayName}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Today's Timeline & Mentor Advice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Mentor Directive */}
          <Card
            className="border-indigo-500/30 bg-indigo-950/10"
            title="Daily Mentor Recommendation"
            subtitle="Evidence-based guidance derived from your recorded performance."
            action={<Sparkles className="w-4 h-4 text-indigo-400" />}
          >
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D2A] border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  {mentorAdvice?.headline || 'Clear Overdue Revisions'}
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {mentorAdvice?.recommendation}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#233044] text-[11px] text-slate-400 italic">
                  <strong>Why this matters:</strong> {mentorAdvice?.rationale}
                </div>
              </div>

              <Link to="/roadmap" className="block text-center text-xs text-indigo-400 hover:underline pt-1">
                Open Full Mentor Dialogue & Roadmap →
              </Link>
            </div>
          </Card>

          {/* Today's Study Sessions Timeline */}
          <Card
            title="Today's Scheduled Sessions"
            subtitle="Deep work, revision blocks, and breaks."
            action={
              <Link to="/scheduler" className="text-xs text-indigo-400 hover:underline">
                Manage Schedule
              </Link>
            }
          >
            <div className="space-y-2.5">
              {todaySchedule.sessions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">No sessions scheduled for today yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={async () => {
                      await api.post('/scheduler/generate');
                      fetchDashboard();
                    }}
                  >
                    Generate Schedule
                  </Button>
                </div>
              ) : (
                todaySchedule.sessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-[#233044] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                          {session.title}
                        </span>
                        <Badge
                          variant={
                            session.status === 'completed'
                              ? 'emerald'
                              : session.status === 'active'
                              ? 'indigo'
                              : 'slate'
                          }
                          size="xs"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(session.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.plannedMinutes} mins
                      </p>
                    </div>

                    {session.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Play}
                        onClick={() => onStartFocusTimer(session)}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. VERIFIED INTERNSHIP RADAR SNIPPET */}
      <Card
        title="Live Verified Internship Matches"
        subtitle="Current student opportunities evaluated against your 2028 graduation profile."
        action={
          <Link to="/radar" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            Explore Radar <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobRadar.map((job) => (
            <div
              key={job._id}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#131A26] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{job.company}</span>
                  <Badge variant={job.eligibility?.verdict === 'Likely match' ? 'emerald' : 'amber'} size="xs">
                    {job.eligibility?.verdict || 'Match'}
                  </Badge>
                </div>
                <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">{job.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{job.descriptionSummary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1F293D] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{job.location}</span>
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Apply Link ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
