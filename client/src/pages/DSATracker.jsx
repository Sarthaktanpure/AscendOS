import React, { useState, useEffect } from 'react';
import {
  Code2,
  CheckCircle2,
  Clock,
  RotateCcw,
  ExternalLink,
  Plus,
  Search,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const DSATracker = () => {
  const [problems, setProblems] = useState([]);
  const [revisionQueue, setRevisionQueue] = useState([]);
  const [topicMastery, setTopicMastery] = useState({});
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Attempt Modal State
  const [attemptModalOpen, setAttemptModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [solveDuration, setSolveDuration] = useState(25);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [confidence, setConfidence] = useState(4);
  const [mistakeType, setMistakeType] = useState('none');
  const [attemptNotes, setAttemptNotes] = useState('');

  // Add Problem Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('LeetCode');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newTopic, setNewTopic] = useState('Arrays and strings');
  const [newDifficulty, setNewDifficulty] = useState('Medium');

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = `/dsa/problems?`;
      if (selectedTopic) query += `topic=${encodeURIComponent(selectedTopic)}&`;
      if (selectedDifficulty) query += `difficulty=${selectedDifficulty}&`;
      if (selectedStatus) query += `status=${selectedStatus}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const [probRes, revRes, mastRes] = await Promise.all([
        api.get(query),
        api.get('/dsa/revision-queue'),
        api.get('/dsa/mastery')
      ]);

      if (probRes.data.success) {
        setProblems(probRes.data.problems);
        setTopics(probRes.data.topics || []);
      }
      if (revRes.data.success) setRevisionQueue(revRes.data.queue);
      if (mastRes.data.success) setTopicMastery(mastRes.data.topicMastery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTopic, selectedDifficulty, selectedStatus, search]);

  const handleOpenAttemptModal = (problem) => {
    setSelectedProblem(problem);
    setSolveDuration(25);
    setHintsUsed(0);
    setConfidence(4);
    setMistakeType('none');
    setAttemptNotes('');
    setAttemptModalOpen(true);
  };

  const handleRecordAttempt = async (outcome) => {
    if (!selectedProblem) return;
    try {
      await api.post(`/dsa/problems/${selectedProblem._id}/attempt`, {
        outcome,
        solveDurationMinutes: Number(solveDuration),
        hintsUsed: Number(hintsUsed),
        confidence: Number(confidence),
        mistakeType,
        notes: attemptNotes
      });
      setAttemptModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewProblem = async (problemId, success) => {
    try {
      await api.post(`/dsa/problems/${problemId}/review`, { success });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/dsa/problems', {
        title: newTitle,
        platform: newPlatform,
        sourceUrl: newSourceUrl,
        topic: newTopic,
        difficulty: newDifficulty
      });
      setAddModalOpen(false);
      setNewTitle('');
      setNewSourceUrl('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-indigo-500" />
            DSA & Problem Practice Tracker (Java)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            16 canonical patterns, spaced repetition revision queue, and mistake classification.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddModalOpen(true)}>
          Add Custom Problem
        </Button>
      </div>

      {/* Spaced Repetition Due Queue Alert */}
      {revisionQueue.length > 0 && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <RotateCcw className="w-4 h-4 animate-spin-slow" />
              Spaced Repetition Queue • {revisionQueue.length} problem{revisionQueue.length > 1 ? 's' : ''} due for review
            </div>
            <span className="text-[11px] text-amber-300">Target: Zero hesitation recall</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {revisionQueue.map((item) => (
              <div
                key={item._id}
                className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-amber-500/20 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{item.topic} • {item.difficulty}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleReviewProblem(item._id, true)}
                    className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold"
                    title="Remembered approach"
                  >
                    ✓ Pass
                  </button>
                  <button
                    onClick={() => handleReviewProblem(item._id, false)}
                    className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-semibold"
                    title="Needed help / Hesitated"
                  >
                    ✗ Retry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Mastery Summary Carousel/Grid */}
      <Card title="Topic Mastery Breakdown (16 Core Patterns)" subtitle="Solved vs Total ratio per topic.">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {Object.entries(topicMastery).map(([topicName, stats]) => (
            <div
              key={topicName}
              onClick={() => setSelectedTopic(selectedTopic === topicName ? '' : topicName)}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                selectedTopic === topicName
                  ? 'border-indigo-500 bg-indigo-950/30'
                  : 'border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] hover:border-slate-300 dark:hover:border-[#2C3E56]'
              }`}
            >
              <span className="text-[10px] text-slate-400 block truncate" title={topicName}>
                {topicName}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
                {stats.solved}/{stats.total}
              </span>
              <div className="mt-1.5 w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${stats.masteryPercent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by name or pattern..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200"
        >
          <option value="">All Statuses</option>
          <option value="solved">Solved</option>
          <option value="needs_revision">Needs Revision</option>
          <option value="attempted">Attempted</option>
          <option value="not_started">Not Started</option>
        </select>
      </div>

      {/* Problems Table / List */}
      <div className="space-y-3">
        {problems.map((p) => (
          <div
            key={p._id}
            className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-[#2E3F57] transition-all"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {p.title}
                </span>
                <Badge
                  variant={p.difficulty === 'Easy' ? 'emerald' : p.difficulty === 'Medium' ? 'amber' : 'rose'}
                  size="xs"
                >
                  {p.difficulty}
                </Badge>
                <Badge
                  variant={
                    p.status === 'solved'
                      ? 'emerald'
                      : p.status === 'needs_revision'
                      ? 'amber'
                      : 'slate'
                  }
                  size="xs"
                >
                  {p.status.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {p.topic} • Complexity: <code className="font-mono text-indigo-400">{p.timeComplexity || 'O(N)'}</code>, <code className="font-mono text-cyan-400">{p.spaceComplexity || 'O(1)'}</code>
              </p>

              {p.approachNotes && (
                <p className="text-[11px] text-slate-400 italic line-clamp-1">
                  Approach: {p.approachNotes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {p.sourceUrl && (
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
                  title="Open official problem"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <Button
                variant={p.status === 'solved' ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleOpenAttemptModal(p)}
              >
                {p.status === 'solved' ? 'Re-attempt' : 'Record Solve'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Record Solve Attempt Modal */}
      {selectedProblem && (
        <Modal
          isOpen={attemptModalOpen}
          onClose={() => setAttemptModalOpen(false)}
          title={`Record Attempt: ${selectedProblem.title}`}
          subtitle={`Classify mistake patterns and update spaced repetition schedule.`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={solveDuration}
                  onChange={(e) => setSolveDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Hints Used</label>
                <input
                  type="number"
                  value={hintsUsed}
                  onChange={(e) => setHintsUsed(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Mistake Classification</label>
              <select
                value={mistakeType}
                onChange={(e) => setMistakeType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                <option value="none">None — Solved Cleanly Without Confusion</option>
                <option value="concept_gap">Concept Gap (Did not know pattern/algorithm)</option>
                <option value="implementation_bug">Implementation Bug (Index out of bounds / syntax error)</option>
                <option value="complexity_issue">Complexity Issue (TLE — Time Limit Exceeded)</option>
                <option value="misread_question">Misread Question (Missed edge case / constraint)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Personal Solution Notes / Approach</label>
              <textarea
                rows={3}
                value={attemptNotes}
                onChange={(e) => setAttemptNotes(e.target.value)}
                placeholder="Key invariant, two-pointer condition, or edge case trick..."
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1E293B]">
              <Button
                variant="danger"
                size="md"
                onClick={() => handleRecordAttempt('failed')}
              >
                Failed / Stuck
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={() => handleRecordAttempt('solved')}
              >
                Solved Successfully
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Custom Problem Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Custom Problem to DSA Tracker"
        subtitle="Track personal practice problems from LeetCode or GeeksforGeeks."
      >
        <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Problem Title</label>
            <input
              required
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Trapping Rain Water"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Pattern / Topic</label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Source URL</label>
            <input
              type="url"
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md">
              Save Problem
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DSATracker;
