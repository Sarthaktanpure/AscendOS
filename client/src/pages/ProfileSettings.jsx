import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Bell,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export const ProfileSettings = () => {
  const { user, preferences, updateUser, updatePreferences } = useAuth();
  const { pushSupported, pushSubscribed, requestPushPermission, triggerTestPush } = useNotifications();

  // Profile Fields
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [expectedGraduation, setExpectedGraduation] = useState(2028);
  const [reportedCGPA, setReportedCGPA] = useState(9.0);
  const [primaryLanguageDSA, setPrimaryLanguageDSA] = useState('Java');
  const [careerTarget, setCareerTarget] = useState('');
  const [mainObjective, setMainObjective] = useState('');

  // Weekly Availability (hours)
  const [monHours, setMonHours] = useState(6);
  const [tueHours, setTueHours] = useState(6);
  const [wedHours, setWedHours] = useState(6);
  const [thuHours, setThuHours] = useState(6);
  const [friHours, setFriHours] = useState(10);
  const [satHours, setSatHours] = useState(10);
  const [sunHours, setSunHours] = useState(10);

  // Status
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [prefsMsg, setPrefsMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || '');
      setDegree(user.degree || '');
      setExpectedGraduation(user.expectedGraduation || 2028);
      setReportedCGPA(user.reportedCGPA || 9.0);
      setPrimaryLanguageDSA(user.primaryLanguageDSA || 'Java');
      setCareerTarget(user.careerTarget || '');
      setMainObjective(user.mainObjective || '');
    }
    if (preferences?.weeklyAvailabilityHours) {
      const h = preferences.weeklyAvailabilityHours;
      setMonHours(h.monday ?? 6);
      setTueHours(h.tuesday ?? 6);
      setWedHours(h.wednesday ?? 6);
      setThuHours(h.thursday ?? 6);
      setFriHours(h.friday ?? 10);
      setSatHours(h.saturday ?? 10);
      setSunHours(h.sunday ?? 10);
    }
  }, [user, preferences]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        college,
        degree,
        expectedGraduation: Number(expectedGraduation),
        reportedCGPA: Number(reportedCGPA),
        primaryLanguageDSA,
        careerTarget,
        mainObjective
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg('Profile updated successfully.');
        setTimeout(() => setProfileMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await api.put('/auth/preferences', {
        weeklyAvailabilityHours: {
          monday: Number(monHours),
          tuesday: Number(tueHours),
          wednesday: Number(wednesdayHours),
          thursday: Number(thuHours),
          friday: Number(friHours),
          saturday: Number(satHours),
          sunday: Number(sunHours)
        }
      });
      if (res.data.success) {
        updatePreferences(res.data.preferences);
        setPrefsMsg('Weekly availability schedule updated.');
        setTimeout(() => setPrefsMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const wednesdayHours = wedHours; // alias for clarity

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-500" />
          Profile, Availability & Notification Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Everything is editable. Customize your academic stage, graduation timeline, and study capacities.
        </p>
      </div>

      {/* Profile Form */}
      <Card
        title="Student Profile & Academic Credentials"
        subtitle="Used for internship eligibility scoring and mentor context."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs pt-2">
          {profileMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              {profileMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Degree & Branch</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={expectedGraduation}
                  onChange={(e) => setExpectedGraduation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reported CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={reportedCGPA}
                  onChange={(e) => setReportedCGPA(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Primary DSA Language</label>
              <select
                value={primaryLanguageDSA}
                onChange={(e) => setPrimaryLanguageDSA(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              >
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Python">Python</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Primary Career Target</label>
              <input
                type="text"
                value={careerTarget}
                onChange={(e) => setCareerTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Main Objective</label>
            <textarea
              rows={2}
              value={mainObjective}
              onChange={(e) => setMainObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md" icon={Save} isLoading={savingProfile}>
              Save Profile Updates
            </Button>
          </div>
        </form>
      </Card>

      {/* Weekly Availability Budget Form */}
      <Card
        title="Weekly Study Availability Capacity"
        subtitle="Default planned budgets: Mon-Thu 6 hours, Fri-Sun 10 hours. Used by the scheduler engine."
      >
        <form onSubmit={handleSaveAvailability} className="space-y-4 text-xs pt-2">
          {prefsMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              {prefsMsg}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Monday', val: monHours, set: setMonHours },
              { label: 'Tuesday', val: tueHours, set: setTueHours },
              { label: 'Wednesday', val: wedHours, set: setWedHours },
              { label: 'Thursday', val: thuHours, set: setThuHours },
              { label: 'Friday', val: friHours, set: setFriHours },
              { label: 'Saturday', val: satHours, set: setSatHours },
              { label: 'Sunday', val: sunHours, set: setSunHours },
            ].map(day => (
              <div key={day.label} className="p-3 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] text-center">
                <span className="font-semibold text-slate-300 block mb-1">{day.label}</span>
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={day.val}
                  onChange={(e) => day.set(e.target.value)}
                  className="w-16 px-2 py-1 text-center rounded bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2D3C52] text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-1">hours</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <Button type="submit" variant="primary" size="md" icon={Save} isLoading={savingPrefs}>
              Update Availability Budget
            </Button>
          </div>
        </form>
      </Card>

      {/* Web Push Notification Settings */}
      <Card
        title="Live Web Push & Background Notifications"
        subtitle="Browser push service worker using VAPID keys for study reminders and revision alerts."
      >
        <div className="space-y-4 text-xs pt-1">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A]">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Browser Push Status
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pushSubscribed ? 'Subscribed and active.' : 'Requires browser permission in secure context.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!pushSubscribed ? (
                <Button variant="primary" size="sm" onClick={requestPushPermission}>
                  Enable Browser Push
                </Button>
              ) : (
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              )}

              <Button variant="secondary" size="sm" icon={Send} onClick={triggerTestPush}>
                Send Test Push
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
