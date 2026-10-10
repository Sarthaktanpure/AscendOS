import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Award,
  ChevronRight,
  Target,
  BarChart2
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const RoadmapMentor = () => {
  const [readiness, setReadiness] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const roadmapPhases = [
    {
      phase: 1,
      title: 'Programming Fundamentals & Java DSA Mastery',
      period: 'Semester 5 (Current)',
      status: 'in_progress',
      description: 'Master core Java syntax, OOP, time/space complexity, and canonical patterns (Two Pointers, Sliding Window, Trees, Graphs, DP).',
      milestones: [
        { name: 'Solve 75+ canonical Blind/Striver problems in Java', completed: false },
        { name: 'Achieve <25 min solve time for Medium problems', completed: false },
        { name: 'Maintain daily spaced-repetition revision queue', completed: true }
      ]
    },
    {
      phase: 2,
      title: 'Core Computer Science Foundations',
      period: 'Semester 5 - 6',
      status: 'in_progress',
      description: 'Systematic understanding of OOP, DBMS internals (ACID, B+ Trees), OS concurrency & paging, Computer Networks (TCP/IP), and SQL.',
      milestones: [
        { name: 'Complete DBMS indexing & normalization notes', completed: true },
        { name: 'Master OS process vs thread context switching', completed: true },
        { name: 'Pass all 7 subject practice quizzes with >80%', completed: false }
      ]
    },
    {
      phase: 3,
      title: 'Backend & Full-Stack Production Engineering',
      period: 'Semester 6',
      status: 'in_progress',
      description: 'Architect scalable web services, RESTful APIs, HTTP-only JWT auth, rate limiting, and database indexing.',
      milestones: [
        { name: 'Implement compound indexes and data validation in HospitalOS', completed: true },
        { name: 'Build background task queues and Web Push architecture', completed: true }
      ]
    },
    {
      phase: 4,
      title: 'Automated Testing, Security & Quality Audits',
      period: 'Semester 6',
      status: 'planned',
      description: 'Write unit & integration tests with Vitest/Supertest, establish CI/CD pipelines with GitHub Actions, and run security scans.',
      milestones: [
        { name: 'Attain >70% test coverage in HospitalOS or AgriConnect', completed: false },
        { name: 'Configure GitHub Actions CI workflow for pull requests', completed: false }
      ]
    },
    {
      phase: 5,
      title: 'High-Impact Portfolio Projects Defense',
      period: 'Summer 2027',
      status: 'planned',
      description: 'Production deployment with custom domains, architecture diagrams, performance measurements, and live demos.',
      milestones: [
        { name: 'Deploy HospitalOS and MedGuard AI with verifiable metrics', completed: false },
        { name: 'Write comprehensive engineering decision records (ADRs)', completed: false }
      ]
    },
    {
      phase: 6,
      title: 'Resume, GitHub & Cold Outreach Readiness',
      period: 'Pre-Internship Season (Late Summer 2027)',
      status: 'planned',
      description: 'Format single-column ATS resume, polish GitHub repositories with detailed READMEs, and prepare STAR behavioral responses.',
      milestones: [
        { name: 'Finalize ATS resume highlighting 9.0 CGPA and top 2 projects', completed: false },
        { name: 'Reach out to 25+ alumni & senior engineers for referrals', completed: false }
      ]
    },
    {
      phase: 7,
      title: 'Internship Applications & Online Assessments (OAs)',
      period: 'Fall 2027 / Early 2028',
      status: 'planned',
      description: 'Targeted application sprints for Google, Microsoft, Amazon, Atlassian, and leading product companies.',
      milestones: [
        { name: 'Submit 30+ tailored applications through official portals & referrals', completed: false },
        { name: 'Clear HackerRank / Codility OAs with zero syntax errors', completed: false }
      ]
    },
    {
      phase: 8,
      title: 'Mock Technical Interviews & 2028 Graduation Conversion',
      period: 'Semester 7 - 8 (Graduation 2028)',
      status: 'planned',
      description: 'Simulated 45-minute live coding rounds, system design discussions, and converting summer internship to full-time PPO.',
      milestones: [
        { name: 'Conduct 15+ peer & mentor mock interviews', completed: false },
        { name: 'Secure full-time Software Development Engineer offer', completed: false }
      ]
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [readRes, convRes] = await Promise.all([
          api.get('/mentor/readiness'),
          api.get('/mentor/conversation')
        ]);
        if (readRes.data.success) setReadiness(readRes.data.readiness);
        if (convRes.data.success) setMessages(convRes.data.messages);
      } catch (err) {
        console.error('Error loading roadmap/mentor:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userText, timestamp: new Date() }]);
    setSending(true);

    try {
      const res = await api.post('/mentor/chat', { message: userText });
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-indigo-500" />
          Career Roadmap & Engineering Mentor
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Strategic progression timeline from third-year IT engineering to 2028 top-tier product company hiring.
        </p>
      </div>

      {/* Career Readiness Rubric */}
      {readiness && (
        <Card
          title="Evidence-Based Career Readiness Rubric"
          subtitle="Objective scoring across 5 key pillars based on actual recorded database evidence."
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            {[
              { label: 'DSA & Patterns', score: readiness.dsaScore, color: 'bg-indigo-500' },
              { label: 'Core CS Foundations', score: readiness.csScore, color: 'bg-emerald-500' },
              { label: 'Project Lab Rigor', score: readiness.projectScore, color: 'bg-cyan-500' },
              { label: 'Testing & Code Quality', score: readiness.qualityScore, color: 'bg-amber-500' },
              { label: 'Application Pipeline', score: readiness.applicationScore, color: 'bg-rose-500' },
            ].map((p, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A]">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                  {p.label}
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                  {p.score}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className={`${p.color} h-1.5 rounded-full`} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Grid: Roadmap Timeline (8 cols) & Persistent Mentor Chat (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 8-Phase Roadmap Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            8-Phase Milestone Progression
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-[#233044]">
            {roadmapPhases.map((phase) => (
              <div key={phase.phase} className="relative">
                {/* Node icon */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white dark:bg-[#0B0F17] ${
                  phase.status === 'in_progress'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-slate-400 dark:border-slate-600 text-slate-400'
                }`}>
                  {phase.status === 'in_progress' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  ) : (
                    <Circle className="w-2 h-2" />
                  )}
                </div>

                {/* Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Phase {phase.phase} • {phase.period}
                    </span>
                    <Badge variant={phase.status === 'in_progress' ? 'indigo' : 'slate'} size="xs">
                      {phase.status === 'in_progress' ? 'Current Focus' : 'Upcoming'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {phase.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Milestones checklist */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1E293B] space-y-1.5">
                    {phase.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${
                          m.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                        }`} />
                        <span className={m.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}>
                          {m.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Persistent Rule-Based Mentor Chat */}
        <div className="lg:col-span-5">
          <Card
            className="flex flex-col h-[650px] !p-0 overflow-hidden sticky top-24"
            title="AscendOS Career Mentor"
            subtitle="Rule-based strict guidance based on your actual data."
            action={<Bot className="w-4 h-4 text-indigo-400" />}
          >
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-[#0E1420]/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 text-xs ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#162030] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#233044] rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                    <span className="block text-[10px] opacity-60 text-right mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#111827] flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about DSA roadmap, resume strategy, or projects..."
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                isLoading={sending}
              />
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoadmapMentor;
