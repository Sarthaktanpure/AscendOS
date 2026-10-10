import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Timer,
  LogOut,
  User,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

export const Header = ({ onOpenCommandPalette, onOpenFocusTimer, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`h-16 fixed top-0 right-0 z-20 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#1F293D] flex items-center justify-between px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Search & Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-400 hover:text-slate-200 hover:border-slate-300 dark:hover:border-[#2D3F59] text-xs transition-all w-64 text-left group"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
        <span className="flex-1 truncate">Type a command or search...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 rounded border border-slate-300 dark:border-[#2B3B52] font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Focus Timer Button */}
        <button
          onClick={onOpenFocusTimer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-medium transition-all"
          title="Open Focus Session Timer"
        >
          <Timer className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
          <span className="hidden md:inline">Focus Session</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151D2A] transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 relative rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151D2A] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-[#0B0F17]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#233044] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-indigo-500 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E293B]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#162032] transition-colors ${
                        !n.isRead ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">{n.body}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#151D2A] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-medium text-xs flex items-center justify-center">
              {user ? user.name[0] : 'S'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#233044] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-[#1E293B]">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162032]"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Profile & Availability
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
