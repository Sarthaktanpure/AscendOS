import React, { useState, useEffect } from 'react';
import {
  Radar,
  RefreshCw,
  ExternalLink,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Briefcase,
  Building,
  MapPin,
  Calendar
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const InternshipRadar = () => {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' or 'pipeline'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [funnel, setFunnel] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [roleType, setRoleType] = useState('');

  // Application Modal
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('');
  const [appStatus, setAppStatus] = useState('Applied');
  const [appDeadline, setAppDeadline] = useState('');
  const [appReferral, setAppReferral] = useState('');
  const [appNotes, setAppNotes] = useState('');
  const [linkedJobId, setLinkedJobId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = `/jobs?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (workMode) query += `workMode=${workMode}&`;
      if (roleType) query += `roleType=${roleType}&`;

      const [jobRes, appRes, funRes] = await Promise.all([
        api.get(query),
        api.get('/applications'),
        api.get('/applications/funnel')
      ]);

      if (jobRes.data.success) {
        setJobs(jobRes.data.jobs);
        setLastSync(jobRes.data.lastSync);
      }
      if (appRes.data.success) setApplications(appRes.data.applications);
      if (funRes.data.success) setFunnel(funRes.data.funnel || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, workMode, roleType]);

  const handleSyncJobs = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/jobs/sync');
      if (res.data.success) {
        setJobs(res.data.jobs);
        setLastSync(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenTrackModal = (job) => {
    setLinkedJobId(job?._id || null);
    setAppCompany(job?.company || '');
    setAppRole(job?.title || '');
    setAppStatus('Applied');
    setAppDeadline(job?.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '');
    setAppReferral('');
    setAppNotes('');
    setAppModalOpen(true);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    try {
      await api.post('/applications', {
        jobListing: linkedJobId,
        company: appCompany,
        roleTitle: appRole,
        status: appStatus,
        deadline: appDeadline ? new Date(appDeadline) : undefined,
        appliedDate: new Date(),
        referralContact: appReferral,
        notes: appNotes
      });
      setAppModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const pipelineStages = ['Saved', 'Planned', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radar className="w-6 h-6 text-indigo-500" />
            Live Internship Radar & Application Pipeline
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real public student opportunities evaluated against your 2028 graduation profile, with full Kanban tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={syncing}
            onClick={handleSyncJobs}
          >
            Refresh Radar Feeds
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => handleOpenTrackModal(null)}
          >
            Track New Application
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#233044] pb-2">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'radar'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Verified Opportunities ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Application Pipeline ({applications.length})
        </button>
      </div>

      {/* VIEW 1: VERIFIED OPPORTUNITIES RADAR */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company, role, or keywords..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200"
            >
              <option value="">All Work Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>

            <select
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200"
            >
              <option value="">All Role Types</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Backend Engineering">Backend Engineering</option>
              <option value="Full-Stack Engineering">Full-Stack Engineering</option>
            </select>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const el = job.eligibility || {};
              return (
                <div
                  key={job._id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827] flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#2F425C] transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {job.company}
                      </span>
                      <Badge
                        variant={el.verdict === 'Likely match' ? 'emerald' : el.verdict === 'Needs review' ? 'amber' : 'rose'}
                        size="xs"
                      >
                        {el.verdict || 'Match'}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                      </span>
                      <span className="capitalize font-medium text-indigo-400">
                        {job.workMode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {job.descriptionSummary}
                    </p>

                    {/* Eligibility Reason */}
                    {el.reason && (
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151D2A] text-[11px] text-slate-400">
                        <strong className="text-slate-300 font-semibold block">Eligibility Assessment:</strong>
                        {el.reason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between gap-2">
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 font-medium hover:underline flex items-center gap-1"
                    >
                      Official Page <ExternalLink className="w-3 h-3" />
                    </a>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenTrackModal(job)}
                    >
                      Track in Pipeline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: APPLICATION KANBAN PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Funnel Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {pipelineStages.slice(0, 6).map(st => (
              <div key={st} className="p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827] text-center">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">{st}</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">{funnel[st] || 0}</span>
              </div>
            ))}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {pipelineStages.slice(0, 6).map((stage) => {
              const stageApps = applications.filter(a => a.status === stage);
              return (
                <div key={stage} className="p-3 rounded-2xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#111827]/40 flex flex-col space-y-3 min-w-[200px]">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-[#1E293B]">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                    <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageApps.map(app => (
                      <div
                        key={app._id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#162030] text-xs space-y-2 shadow-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block truncate">{app.company}</span>
                          <span className="text-slate-400 text-[11px] block truncate">{app.roleTitle}</span>
                        </div>

                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                          className="w-full text-[10px] py-1 px-1.5 rounded bg-slate-100 dark:bg-[#1A2538] border border-slate-200 dark:border-[#2A3B52] text-slate-300"
                        >
                          {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Track Application Modal */}
      <Modal
        isOpen={appModalOpen}
        onClose={() => setAppModalOpen(false)}
        title="Track Internship Application"
        subtitle="Manage progress through your recruitment funnel."
      >
        <form onSubmit={handleSaveApplication} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Company Name</label>
              <input
                required
                type="text"
                value={appCompany}
                onChange={(e) => setAppCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Role Title</label>
              <input
                required
                type="text"
                value={appRole}
                onChange={(e) => setAppRole(e.target.value)}
                placeholder="e.g. SWE Intern"
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Initial Status</label>
              <select
                value={appStatus}
                onChange={(e) => setAppStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Application Deadline</label>
              <input
                type="date"
                value={appDeadline}
                onChange={(e) => setAppDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Referral / Recruiter Contact</label>
            <input
              type="text"
              value={appReferral}
              onChange={(e) => setAppReferral(e.target.value)}
              placeholder="e.g. Alumni Senior SDE via LinkedIn"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Notes / Follow-up Tasks</label>
            <textarea
              rows={2}
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              placeholder="Resume version submitted, online assessment expectations..."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md">
              Save to Pipeline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InternshipRadar;
