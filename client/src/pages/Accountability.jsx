import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Calendar
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const Accountability = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Daily Shutdown Form
  const [actualHours, setActualHours] = useState(6);
  const [missedReason, setMissedReason] = useState('unexpected_interruptions');
  const [reflection, setReflection] = useState('');
  const [shutdownSubmitted, setShutdownSubmitted] = useState(false);
  const [tomorrowDirective, setTomorrowDirective] = useState('');

  const fetchAccountability = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setStats(res.data.data);
        setActualHours(res.data.data.todaySchedule.completedHours || 4);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountability();
  }, []);

  const handleCompleteShutdown = (e) => {
    e.preventDefault();
    setShutdownSubmitted(true);
    setTomorrowDirective(
      'Tomorrow: Lock in your first 90-minute block for the hardest Java DSA problem before opening social media or chat. Momentum early creates daily victory.'
    );
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading accountability records...</div>;
  }

  const { todaySchedule, mits, weeklyHeatmap, metrics } = stats;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-indigo-500" />
          Daily & Weekly Accountability System
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Strict fact-based retrospectives without shame or hollow praise. Measure planned vs actual output.
        </p>
      </div>

      {/* Grid: Daily Shutdown Form (7 cols) & Weekly Consistency Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: End-of-Day Shutdown Routine */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            title="Evening Shutdown Routine"
            subtitle="Conclude today deliberately, log actual study hours, and eliminate carryover stress."
          >
            {!shutdownSubmitted ? (
              <form onSubmit={handleCompleteShutdown} className="space-y-4 text-xs pt-1">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] space-y-2">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Today's Output Summary:
                  </span>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Planned: <strong className="text-slate-200">{todaySchedule.plannedHours} hrs</strong></span>
                    <span>Completed MITs: <strong className="text-emerald-400">{mits.filter(m => m.status === 'completed').length} / {mits.length}</strong></span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Recorded Actual Focused Study Hours Today
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Primary Reason for Any Missed or Delayed Work
                  </label>
                  <select
                    value={missedReason}
                    onChange={(e) => setMissedReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                  >
                    <option value="unexpected_interruptions">Unexpected college / personal interruptions</option>
                    <option value="unrealistic_plan">Over-ambitious plan (exceeded realistic budget)</option>
                    <option value="fatigue_low_energy">Fatigue / Low mental energy</option>
                    <option value="academic_exams">College exams / practical submissions</option>
                    <option value="procrastination">Hesitation / Task avoidance</option>
                    <option value="none">Zero missed tasks (Fully completed!)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Personal Reflection (What went well? What caused friction?)
                  </label>
                  <textarea
                    rows={3}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="e.g. Graph BFS felt intuitive, but lost 40 mins debugging a linked list pointer null error..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
                  <Button type="submit" variant="primary" size="md">
                    Complete Daily Shutdown
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Daily Shutdown Complete</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Actual hours logged: <strong>{actualHours}h</strong>. Your workstation is clear. Step away and rest.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-left text-xs space-y-1 mt-4">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block">
                    Mentor Directive For Tomorrow:
                  </span>
                  <p className="text-slate-200 leading-relaxed">{tomorrowDirective}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Weekly Consistency Audit */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Weekly Consistency Analysis"
            subtitle="7-day comparison between planned commitment and actual output."
          >
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] text-xs">
                <span className="text-slate-400">Total Actual Hours</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {metrics.totalWeeklyActualHours} hrs
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] text-xs">
                <span className="text-slate-400">Weekly Consistency Index</span>
                <span className="text-base font-bold text-indigo-400">
                  {metrics.weeklyConsistencyPercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] text-xs">
                <span className="text-slate-400">Active Unbroken Streak</span>
                <span className="text-base font-bold text-amber-400">
                  {metrics.currentStreakDays} days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#151D2A] text-xs leading-relaxed text-slate-400 border border-slate-200 dark:border-[#233044]">
                <strong className="text-slate-200 block mb-1">Accountability Rule:</strong>
                "Never let a single bad day become two bad days. If yesterday was disrupted by college exams, today's goal is not to double your study time—today's goal is simply to show up for your planned 45-minute block."
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Accountability;
