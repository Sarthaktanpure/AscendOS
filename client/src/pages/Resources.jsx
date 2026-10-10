import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Sparkles,
  BookOpen
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      let query = `/resources?`;
      if (category) query += `category=${encodeURIComponent(category)}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(query);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, search]);

  const handleToggleComplete = async (resourceId) => {
    try {
      const res = await api.patch(`/resources/${resourceId}/toggle-completed`);
      if (res.data.success) {
        setResources(prev => prev.map(r => r._id === resourceId ? { ...r, isCompletedByUser: res.data.isCompletedByUser } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    'DSA Practice',
    'CS Fundamentals',
    'Full-Stack Development',
    'Testing & Backend',
    'Cloud & DevOps',
    'Official Internship Portals'
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-indigo-500" />
          Curated Engineering Resource Library
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-yield official documentation, computer science texts, and student recruitment channels.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827]">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learning materials..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-800 dark:text-slate-200"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((res) => (
          <div
            key={res._id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              res.isCompletedByUser
                ? 'border-emerald-500/30 bg-emerald-950/5 opacity-80'
                : 'border-slate-200 dark:border-[#233044] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-[#2C3E56]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {res.category}
                </span>
                <Badge variant={res.isFree ? 'emerald' : 'slate'} size="xs">
                  {res.costDescription}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {res.description}
              </p>

              <div className="pt-1 text-[11px] text-slate-400 font-medium">
                Source: {res.authorOrSource}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggleComplete(res._id)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {res.isCompletedByUser ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-400 font-medium">Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Mark Read</span>
                  </>
                )}
              </button>

              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                Open Resource <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
