import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Play, Pause, CheckCircle2, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/client';

export const FocusTimerModal = ({ isOpen, onClose, session, onSessionUpdate }) => {
  const defaultMinutes = session?.plannedMinutes || 45;
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (session) {
      setTimeLeft((session.plannedMinutes || 45) * 60);
      setIsActive(session.status === 'active');
      setDistractions(session.distractionCount || 0);
    }
  }, [session]);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Completed!
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);

  const handleStart = async () => {
    setIsActive(true);
    setIsPaused(false);
    if (session?._id) {
      try {
        await api.patch(`/scheduler/sessions/${session._id}/start`);
        if (onSessionUpdate) onSessionUpdate();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
    if (session?._id) {
      try {
        await api.patch(`/scheduler/sessions/${session._id}/pause`, { pauseMinutes: 5 });
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleComplete = async () => {
    setIsActive(false);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    const elapsedMinutes = Math.max(1, Math.round(((session?.plannedMinutes || 45) * 60 - timeLeft) / 60));
    if (session?._id) {
      try {
        await api.patch(`/scheduler/sessions/${session._id}/complete`, {
          actualMinutes: elapsedMinutes,
          distractionCount: distractions,
          notes
        });
        if (onSessionUpdate) onSessionUpdate();
      } catch (e) {
        console.warn(e);
      }
    }
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((((session?.plannedMinutes || 45) * 60 - timeLeft) / ((session?.plannedMinutes || 45) * 60)) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={session?.title || 'Deep-Work Focus Block'}
      subtitle={session?.notes || 'Eliminate distractions and maintain focused deliberate practice.'}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Circular Countdown Ring */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="text-slate-200 dark:text-[#1E293B]"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="84"
              className="text-indigo-600 transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isActive ? (
            <Button variant="primary" size="lg" icon={Play} onClick={handleStart}>
              Start Session
            </Button>
          ) : isPaused ? (
            <Button variant="primary" size="lg" icon={Play} onClick={handleResume}>
              Resume
            </Button>
          ) : (
            <Button variant="secondary" size="lg" icon={Pause} onClick={handlePause}>
              Pause
            </Button>
          )}

          <Button
            variant="success"
            size="lg"
            icon={CheckCircle2}
            onClick={handleComplete}
          >
            Complete
          </Button>
        </div>

        {/* Distraction Logger */}
        <div className="w-full pt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Distractions Logged: <strong className="text-slate-800 dark:text-slate-200">{distractions}</strong></span>
          </div>
          <button
            onClick={() => setDistractions(prev => prev + 1)}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#28374E] text-slate-700 dark:text-slate-300 transition-colors"
          >
            +1 Distraction
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FocusTimerModal;
