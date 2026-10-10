import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Star,
  Calendar,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  Circle,
  Tag
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('today'); // 'inbox', 'today', 'upcoming', 'backlog', 'completed'
  const [loading, setLoading] = useState(true);

  // Quick Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('dsa');
  const [priority, setPriority] = useState('P2_HIGH');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [isMIT, setIsMIT] = useState(false);
  const [deadline, setDeadline] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?status=${activeTab}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const handleToggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'completed' ? 'today' : 'completed';
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMIT = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/mit`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to remove this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description,
        category,
        priority,
        estimatedMinutes: Number(estimatedMinutes),
        isMIT,
        status: activeTab === 'completed' ? 'today' : activeTab,
        deadline: deadline ? new Date(deadline) : undefined
      });
      setAddModalOpen(false);
      setTitle('');
      setDescription('');
      setIsMIT(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'inbox', label: 'Inbox' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Task Management & MIT Priorities
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prioritize daily Most Important Tasks (MITs) connected directly to your career roadmap.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddModalOpen(true)}>
          New Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#233044] pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#233044] bg-slate-50/50 dark:bg-[#111827]/40">
            <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No tasks in {activeTab}</h4>
            <p className="text-xs text-slate-400 mt-1">Click "New Task" to capture a commitment.</p>
          </div>
        ) : (
          tasks.map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task._id}
                className={`p-4 rounded-xl border transition-all duration-150 flex items-start justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-200 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#0E1420]/40 opacity-70'
                    : task.isMIT
                    ? 'border-indigo-500/40 bg-indigo-950/10 shadow-xs'
                    : 'border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </span>

                      {task.isMIT && (
                        <Badge variant="indigo" size="xs">
                          MIT
                        </Badge>
                      )}

                      <Badge
                        variant={task.priority === 'P1_CRITICAL' ? 'rose' : task.priority === 'P2_HIGH' ? 'amber' : 'slate'}
                        size="xs"
                      >
                        {task.priority.replace('_', ' ')}
                      </Badge>

                      <Badge variant="slate" size="xs">
                        {task.category}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.estimatedMinutes}m est.
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Calendar className="w-3 h-3" /> Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggleMIT(task._id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      task.isMIT ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-amber-400'
                    }`}
                    title="Toggle MIT (Most Important Task)"
                  >
                    <Star className={`w-4 h-4 ${task.isMIT ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create New Career Task"
        subtitle="Capture action items for DSA, projects, or applications."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Task Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Course Schedule II in Java"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Prerequisites, approach notes..."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                <option value="dsa">DSA Practice</option>
                <option value="cs_fundamentals">CS Fundamentals</option>
                <option value="project">Project Lab</option>
                <option value="application">Job Application</option>
                <option value="personal">Personal Commitment</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                <option value="P1_CRITICAL">P1 - Critical</option>
                <option value="P2_HIGH">P2 - High</option>
                <option value="P3_MEDIUM">P3 - Medium</option>
                <option value="P4_LOW">P4 - Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Estimated Minutes</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Deadline (Optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isMITCheckbox"
              checked={isMIT}
              onChange={(e) => setIsMIT(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isMITCheckbox" className="text-slate-300 font-medium cursor-pointer">
              Mark as Top 3 Priority (MIT) for today
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManager;
