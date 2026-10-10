import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const Scheduler = () => {
  const { onStartFocusTimer } = useOutletContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSessions = async (date) => {
    try {
      setLoading(true);
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const res = await api.get(`/scheduler/sessions?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(selectedDate);
  }, [selectedDate]);

  const handleGenerate = async () => {
    try {
      const res = await api.post('/scheduler/generate', { date: selectedDate });
      if (res.data.success) {
        setSessions(res.data.sessions);
        setActionMessage('Generated fresh schedule tailored to available budget.');
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompact2h = async () => {
    try {
      const res = await api.post('/scheduler/compact-2h', { date: selectedDate });
      if (res.data.success) {
        setSessions(res.data.sessions);
        setActionMessage('Emergency 2-hour mode activated: Protected top MITs.');
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLowEnergy = async () => {
    try {
      const res = await api.post('/scheduler/low-energy', { date: selectedDate });
      if (res.data.success) {
        setSessions(res.data.sessions);
        setActionMessage('Low-energy mode activated: Converted to light revision.');
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRebuild = async () => {
    try {
      const res = await api.post('/scheduler/rebuild');
      if (res.data.success) {
        setActionMessage(res.data.message);
        fetchSessions(selectedDate);
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = async (sessionId) => {
    const reason = prompt('Why is this session being skipped? (Recorded for accountability)', 'fatigue');
    if (reason !== null) {
      await api.patch(`/scheduler/sessions/${sessionId}/skip`, { reason });
      fetchSessions(selectedDate);
    }
  };

  const totalPlannedMin = sessions.reduce((a, s) => a + (s.plannedMinutes || 0), 0);
  const totalCompletedMin = sessions.filter(s => s.status === 'completed').reduce((a, s) => a + (s.actualMinutes || s.plannedMinutes || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-indigo-500" />
            Flexible Study Scheduler
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Planned budget: Mon-Thu 6h/day • Fri-Sun 10h/day. Adaptive scheduling with zero silent drops.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200"
          />
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            Generate Schedule
          </Button>
        </div>
      </div>

      {/* Adaptive Quick Control Pills */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Adaptive Overrides:
        </span>

        <button
          onClick={handleCompact2h}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
        >
          ⚡ "I have only 2 hours today"
        </button>

        <button
          onClick={handleLowEnergy}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          🌙 "Today is a low-energy day"
        </button>

        <button
          onClick={handleRebuild}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          🔄 Emergency Rebuild After Missed Sessions
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* Capacity Progress Bar */}
      <Card className="!p-4 bg-white dark:bg-[#111827]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Day Load: {(totalPlannedMin / 60).toFixed(1)} hrs planned
          </span>
          <span className="text-slate-400">
            Completed: {(totalCompletedMin / 60).toFixed(1)} hrs
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalPlannedMin > 0 ? Math.min(100, (totalCompletedMin / totalPlannedMin) * 100) : 0}%` }}
          />
        </div>
      </Card>

      {/* Sessions Timeline */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#233044] bg-slate-50/50 dark:bg-[#111827]/40">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Sessions Allocated</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click "Generate Schedule" to compute prioritized focus blocks for this date.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={handleGenerate}>
              Generate Daily Schedule
            </Button>
          </div>
        ) : (
          sessions.map((session, index) => {
            const isCompleted = session.status === 'completed';
            const isActive = session.status === 'active';
            const isSkipped = session.status === 'skipped';

            return (
              <div
                key={session._id}
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/5 opacity-80'
                    : isSkipped
                    ? 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 opacity-60'
                    : 'border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {new Date(session.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge
                        variant={
                          isCompleted
                            ? 'emerald'
                            : isActive
                            ? 'indigo'
                            : isSkipped
                            ? 'rose'
                            : 'slate'
                        }
                        size="xs"
                      >
                        {session.sessionType.replace('_', ' ')}
                      </Badge>
                      <Badge variant={isCompleted ? 'emerald' : 'slate'} size="xs">
                        {session.status}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {session.title}
                    </h3>

                    {session.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isCompleted && !isSkipped && (
                      <Button
                        variant={isActive ? 'success' : 'primary'}
                        size="sm"
                        icon={Play}
                        onClick={() => onStartFocusTimer(session)}
                      >
                        {isActive ? 'Resume Timer' : 'Start Focus'}
                      </Button>
                    )}

                    {!isCompleted && !isSkipped && (
                      <button
                        onClick={() => handleSkip(session._id)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Skip session"
                      >
                        Skip
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Finished ({session.actualMinutes}m)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Scheduler;
