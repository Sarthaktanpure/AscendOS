import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Compass,
  Calendar,
  Code2,
  BookOpen,
  FolderGit2,
  Radar,
  CheckSquare,
  ShieldCheck,
  BarChart3,
  Bookmark,
  Zap,
  Timer
} from 'lucide-react';
import api from '../../api/client';

export const CommandPalette = ({ isOpen, onClose, onStartTimer }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationCommands = [
    { title: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Go to Career Roadmap & Mentor', icon: Compass, path: '/roadmap' },
    { title: 'Go to Study Scheduler', icon: Calendar, path: '/scheduler' },
    { title: 'Go to DSA Practice Tracker', icon: Code2, path: '/dsa' },
    { title: 'Go to Core CS Fundamentals', icon: BookOpen, path: '/topics' },
    { title: 'Go to Project Engineering Lab', icon: FolderGit2, path: '/projects' },
    { title: 'Go to Internship Radar', icon: Radar, path: '/radar' },
    { title: 'Go to Tasks & MITs', icon: CheckSquare, path: '/tasks' },
    { title: 'Go to Daily Accountability', icon: ShieldCheck, path: '/accountability' },
    { title: 'Go to Analytics & Rubric', icon: BarChart3, path: '/analytics' },
    { title: 'Go to Learning Resource Library', icon: Bookmark, path: '/resources' },
  ];

  const quickActions = [
    {
      title: 'Start 45m Deep-Work Focus Session',
      icon: Timer,
      action: () => {
        onClose();
        if (onStartTimer) onStartTimer({ title: 'Deep-Work Focus Block', plannedMinutes: 45 });
      }
    },
    {
      title: 'Emergency: "I have only 2 hours today"',
      icon: Zap,
      action: async () => {
        onClose();
        await api.post('/scheduler/compact-2h');
        navigate('/scheduler');
      }
    },
    {
      title: 'Adaptive: "Today is a low-energy day"',
      icon: Zap,
      action: async () => {
        onClose();
        await api.post('/scheduler/low-energy');
        navigate('/scheduler');
      }
    }
  ];

  const filteredNav = navigationCommands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredActions = quickActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#233044] rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-[#1E293B] flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or quick action..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] bg-slate-100 dark:bg-[#1E293B] text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#28374D]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {filteredActions.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Quick Actions
              </p>
              <div className="mt-1 space-y-0.5">
                {filteredActions.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-indigo-500" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Navigation
              </p>
              <div className="mt-1 space-y-0.5">
                {filteredNav.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        onClose();
                        navigate(item.path);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162032] transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400">
              No matching commands or pages found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
