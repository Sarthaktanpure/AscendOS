import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Github,
  CheckCircle2,
  Circle,
  Plus,
  ShieldCheck,
  Cpu,
  BarChart2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const ProjectLab = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Evidence Modals
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [coveragePercentage, setCoveragePercentage] = useState(78);
  const [reportTool, setReportTool] = useState('Vitest / Supertest');
  const [testNotes, setTestNotes] = useState('Coverage for auth and clinical scheduling endpoints.');

  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects);
        if (!activeProject && res.data.projects.length > 0) {
          setActiveProject(res.data.projects[0]);
        } else if (activeProject) {
          const updated = res.data.projects.find(p => p._id === activeProject._id);
          if (updated) setActiveProject(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleAudit = async (key) => {
    if (!activeProject) return;
    try {
      const currentVal = activeProject.qualityAudit?.[key] || false;
      const res = await api.patch(`/projects/${activeProject._id}/audit`, {
        [key]: !currentVal
      });
      if (res.data.success) {
        setActiveProject(res.data.project);
        setProjects(prev => prev.map(p => p._id === res.data.project._id ? res.data.project : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTestEvidence = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    try {
      const res = await api.post(`/projects/${activeProject._id}/evidence/tests`, {
        coveragePercentage: Number(coveragePercentage),
        reportTool,
        notes: testNotes
      });
      if (res.data.success) {
        setActiveProject(res.data.project);
        setTestModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDecision = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    try {
      const res = await api.post(`/projects/${activeProject._id}/decisions`, {
        decision: decisionTitle,
        rationale: decisionRationale
      });
      if (res.data.success) {
        setActiveProject(res.data.project);
        setDecisionModalOpen(false);
        setDecisionTitle('');
        setDecisionRationale('');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const auditChecklistItems = [
    { key: 'authenticationAndAuth', label: 'Authentication & Role-Based Authorization' },
    { key: 'inputValidation', label: 'Strict Schema & Input Validation (Zod / Joi)' },
    { key: 'centralizedErrorHandling', label: 'Centralized Error Handling Middleware' },
    { key: 'apiDocumentation', label: 'API Documentation & Endpoint Contracts' },
    { key: 'databaseIndexes', label: 'Optimized Database Compound Indexes' },
    { key: 'loggingAndMonitoring', label: 'Structured Logging & Audit Trails' },
    { key: 'accessibilityAndResponsive', label: 'Responsive Design & Accessible Semantics' },
    { key: 'automatedTesting', label: 'Automated Unit / Integration Test Coverage' },
    { key: 'deploymentReliability', label: 'Production CI/CD & Reliable Hosting' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <FolderGit2 className="w-6 h-6 text-indigo-500" />
          Project Engineering Lab
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Demonstrate production engineering quality, audit checklists, and evidence-based test coverage across portfolio projects.
        </p>
      </div>

      {/* Project Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {projects.map((proj) => {
          const isSelected = activeProject?._id === proj._id;
          const audit = proj.qualityAudit || {};
          const auditScore = Math.round((Object.values(audit).filter(Boolean).length / 9) * 100);

          return (
            <div
              key={proj._id}
              onClick={() => setActiveProject(proj)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-[#2C3E56]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {proj.name}
                </span>
                <Badge variant={proj.status === 'mvp_complete' ? 'emerald' : 'slate'} size="xs">
                  {proj.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{proj.tagline}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                <span>Quality Audit: {auditScore}%</span>
                <span className="text-indigo-400">{proj.techStack?.length || 0} tech tags</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Project Workspace */}
      {activeProject && (
        <div className="space-y-6">
          {/* Main Info Header */}
          <Card className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#1E293B] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeProject.name}
                  </h2>
                  <Badge variant="indigo" size="sm">{activeProject.category}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {activeProject.description}
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {activeProject.repoUrl && (
                  <a
                    href={activeProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#233044] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162032] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> Repository ↗
                  </a>
                )}
                {activeProject.liveUrl && (
                  <a
                    href={activeProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo ↗
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400 mr-2 font-medium">Tech Stack:</span>
              {(activeProject.techStack || []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#233044]"
                >
                  {t}
                </span>
              ))}
            </div>
          </Card>

          {/* Two-Column Grid: 9-Point Audit Checklist (6 cols) & Evidence / ADRs (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 9-Point Quality Audit Checklist */}
            <div className="lg:col-span-6 space-y-6">
              <Card
                title="9-Point Engineering Quality Checklist"
                subtitle="Industry standards required by product companies to ensure code reliability."
              >
                <div className="space-y-2.5 pt-1">
                  {auditChecklistItems.map((item) => {
                    const isChecked = activeProject.qualityAudit?.[item.key] || false;
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleToggleAudit(item.key)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors text-xs ${
                          isChecked
                            ? 'border-emerald-500/30 bg-emerald-950/10 text-slate-200'
                            : 'border-slate-200 dark:border-[#233044] hover:bg-slate-50 dark:hover:bg-[#162032] text-slate-400'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isChecked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right: Test Coverage Evidence & Architecture Decision Records */}
            <div className="lg:col-span-6 space-y-6">
              {/* Test Coverage Evidence */}
              <Card
                title="Verified Automated Test Coverage"
                subtitle="Attach evidence-based test run percentages."
                action={
                  <Button variant="outline" size="sm" icon={Plus} onClick={() => setTestModalOpen(true)}>
                    Log Coverage
                  </Button>
                }
              >
                <div className="space-y-3 pt-1">
                  {(activeProject.testCoverageEvidence || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No automated test coverage logged yet. Click "Log Coverage" to attach Vitest/Jest results.
                    </p>
                  ) : (
                    activeProject.testCoverageEvidence.map((ev) => (
                      <div key={ev._id} className="p-3.5 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 text-sm">
                            {ev.coveragePercentage}% Test Coverage
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ev.recordedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium">{ev.reportTool}</p>
                        {ev.notes && <p className="text-slate-400 text-[11px] italic">{ev.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Engineering Decisions (ADRs) */}
              <Card
                title="Architecture Decision Records (ADRs)"
                subtitle="Rationale behind database, concurrency, and security choices."
                action={
                  <Button variant="outline" size="sm" icon={Plus} onClick={() => setDecisionModalOpen(true)}>
                    Add Decision
                  </Button>
                }
              >
                <div className="space-y-3 pt-1">
                  {(activeProject.engineeringDecisions || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No decisions documented yet.
                    </p>
                  ) : (
                    activeProject.engineeringDecisions.map((dec) => (
                      <div key={dec._id} className="p-3.5 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] text-xs space-y-1">
                        <span className="font-bold text-indigo-400 block">{dec.decision}</span>
                        <p className="text-slate-300 leading-relaxed">{dec.rationale}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Log Test Coverage Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Log Automated Test Coverage Evidence"
        subtitle="Record test report measurements with date and testing framework."
      >
        <form onSubmit={handleAddTestEvidence} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Coverage Percentage (%)</label>
            <input
              required
              type="number"
              min="0"
              max="100"
              value={coveragePercentage}
              onChange={(e) => setCoveragePercentage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Testing Tool / Runner</label>
            <input
              required
              type="text"
              value={reportTool}
              onChange={(e) => setReportTool(e.target.value)}
              placeholder="e.g. Vitest + Supertest"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Notes / Tested Endpoints</label>
            <textarea
              rows={2}
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              placeholder="Endpoint tests, edge cases covered..."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md">
              Save Test Evidence
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Architecture Decision Modal */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title="Add Architecture Decision Record"
        subtitle="Document technical choices to defend in interviews."
      >
        <form onSubmit={handleAddDecision} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Decision Title</label>
            <input
              required
              type="text"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              placeholder="e.g. Switched to Redis cache for doctor availability"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Technical Rationale & Tradeoffs</label>
            <textarea
              required
              rows={3}
              value={decisionRationale}
              onChange={(e) => setDecisionRationale(e.target.value)}
              placeholder="Why was this chosen over the alternatives? What was the measured performance benefit?"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md">
              Save Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectLab;
