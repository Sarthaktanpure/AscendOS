import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  PieChart as PieIcon,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [anRes, dashRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/dashboard/summary')
      ]);

      if (anRes.data.success) setData(anRes.data.data);
      if (dashRes.data.success) setDashboardData(dashRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCsv = () => {
    window.open('http://localhost:5000/api/analytics/export-csv', '_blank');
  };

  if (loading || !data || !dashboardData) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading analytics and readiness rubric...</div>;
  }

  const { totalStudyHours, sessionsCount, revisionSuccessRate, csCompletionPercentage, funnel, readiness } = data;
  const heatmap = dashboardData.weeklyHeatmap || [];

  const funnelData = [
    { name: 'Saved', count: funnel.Saved || 0, fill: '#64748B' },
    { name: 'Planned', count: funnel.Planned || 0, fill: '#818CF8' },
    { name: 'Applied', count: funnel.Applied || 0, fill: '#6366F1' },
    { name: 'Assessment', count: funnel.Assessment || 0, fill: '#F59E0B' },
    { name: 'Interview', count: funnel.Interview || 0, fill: '#10B981' },
    { name: 'Offer', count: funnel.Offer || 0, fill: '#06B6D4' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Analytics & Career Readiness Rubric
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-backed metrics on study output, revision retention, and recruitment funnel progression.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv}>
          Export Progress CSV Report
        </Button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <span className="text-xs text-slate-400 font-medium">30-Day Study Volume</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudyHours}h</span>
            <span className="text-xs text-slate-400">({sessionsCount} sessions)</span>
          </div>
        </Card>

        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <span className="text-xs text-slate-400 font-medium">Spaced Revision Success</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{revisionSuccessRate}%</span>
            <span className="text-xs text-slate-400">pass rate</span>
          </div>
        </Card>

        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <span className="text-xs text-slate-400 font-medium">Core CS Syllabus</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">{csCompletionPercentage}%</span>
            <span className="text-xs text-slate-400">completed</span>
          </div>
        </Card>

        <Card className="!p-4 bg-white dark:bg-[#111827]">
          <span className="text-xs text-slate-400 font-medium">Composite Readiness Index</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{readiness?.overallReadinessIndex || 65}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Study Hours Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Weekly Study Hours Output"
            subtitle="Actual hours logged across the past 7 days."
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmap}>
                  <XAxis dataKey="dayName" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#233044',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Application Funnel Chart (5 cols) */}
        <div className="lg:col-span-5">
          <Card
            title="Internship Application Funnel"
            subtitle="Candidate pipeline stage distribution."
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#233044',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Transparent Readiness Rubric Breakdown */}
      {readiness && (
        <Card
          title="Transparent 5-Pillar Readiness Rubric"
          subtitle="Strict evidence checklist showing exactly where to focus next."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">1. DSA & Problem Solving</span>
                <span className="text-xs font-bold text-indigo-400">{readiness.dsaScore}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evidence: {readiness.metrics?.totalDsaSolved} problems solved ({readiness.metrics?.dsaMediumSolved} Mediums). Revision debt: {readiness.metrics?.revisionDebt} overdue.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">2. Engineering Projects</span>
                <span className="text-xs font-bold text-cyan-400">{readiness.projectScore}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evidence: {readiness.metrics?.projectsCount} projects tracked ({readiness.metrics?.deployedProjectsCount} deployed, {readiness.metrics?.projectsWithTestEvidence} verified test suites).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">3. Pipeline Velocity</span>
                <span className="text-xs font-bold text-rose-400">{readiness.applicationScore}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evidence: {readiness.metrics?.applicationsActive} active applications in pipeline. Recommended target for 3rd year: 15+ verified applications.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
