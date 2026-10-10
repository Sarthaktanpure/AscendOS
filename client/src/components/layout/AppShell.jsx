import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import FocusTimerModal from '../focus/FocusTimerModal';

export const AppShell = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const handleOpenFocusTimer = (sessionData) => {
    setActiveSession(sessionData || { title: 'Deep Work Focus Block', plannedMinutes: 45 });
    setIsFocusTimerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Header */}
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenFocusTimer={() => handleOpenFocusTimer()}
        />

        {/* Page View */}
        <main className="flex-1 mt-16 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onStartFocusTimer: handleOpenFocusTimer }} />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onStartTimer={handleOpenFocusTimer}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        session={activeSession}
        onSessionUpdate={() => {
          // Trigger any background refetches if needed
        }}
      />
    </div>
  );
};

export default AppShell;
