import React from 'react';
import { NavLink } from 'react-router-dom';
import {
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
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Roadmap & Mentor', path: '/roadmap', icon: Compass },
  { name: 'Study Scheduler', path: '/scheduler', icon: Calendar },
  { name: 'DSA Tracker', path: '/dsa', icon: Code2 },
  { name: 'Core CS Lab', path: '/topics', icon: BookOpen },
  { name: 'Project Lab', path: '/projects', icon: FolderGit2 },
  { name: 'Internship Radar', path: '/radar', icon: Radar },
  { name: 'Tasks & MITs', path: '/tasks', icon: CheckSquare },
  { name: 'Daily Accountability', path: '/accountability', icon: ShieldCheck },
  { name: 'Analytics & Rubric', path: '/analytics', icon: BarChart3 },
  { name: 'Resource Library', path: '/resources', icon: Bookmark },
  { name: 'Profile & Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#0E1420] border-r border-[#1F293D] flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1F293D]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              ▲
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                AscendOS
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.2 rounded border border-indigo-500/30">v1.0</span>
              </span>
              <p className="text-[11px] text-slate-400 truncate">Career Operating System</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            ▲
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#162032]'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Micro-Card */}
      <div className="p-3 border-t border-[#1F293D] bg-[#0A0F18]/60">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-semibold text-xs flex-shrink-0">
              {user ? user.name.split(' ').map(n => n[0]).join('') : 'ST'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user ? user.name : 'Sarthak Tanpure'}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <GraduationCap className="w-3 h-3 text-emerald-400" />
                <span className="truncate">CGPA {user?.reportedCGPA || 9.0} • '28</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-semibold text-xs">
            {user ? user.name[0] : 'S'}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
