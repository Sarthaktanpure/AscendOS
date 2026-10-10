import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import Dashboard from './pages/Dashboard';
import RoadmapMentor from './pages/RoadmapMentor';
import Scheduler from './pages/Scheduler';
import DSATracker from './pages/DSATracker';
import CoreCSLab from './pages/CoreCSLab';
import ProjectLab from './pages/ProjectLab';
import InternshipRadar from './pages/InternshipRadar';
import TaskManager from './pages/TaskManager';
import Accountability from './pages/Accountability';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import ProfileSettings from './pages/ProfileSettings';
import Login from './pages/Login';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-slate-400 text-xs font-mono">
        Authenticating AscendOS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="roadmap" element={<RoadmapMentor />} />
                <Route path="scheduler" element={<Scheduler />} />
                <Route path="dsa" element={<DSATracker />} />
                <Route path="topics" element={<CoreCSLab />} />
                <Route path="projects" element={<ProjectLab />} />
                <Route path="radar" element={<InternshipRadar />} />
                <Route path="tasks" element={<TaskManager />} />
                <Route path="accountability" element={<Accountability />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="resources" element={<Resources />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
