import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Local date string YYYY-MM-DD using device clock (avoids UTC timezone bug)
function localDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const LS_KEY = 'fl_streak_v2';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; }
}
function saveLocal(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}

function computeLocalStreak(saved) {
  const today = localDateStr();
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  if (!saved) return { currentStreak: 0, completedToday: false, todaySteps: [] };

  if (saved.lastDate === today) {
    return { currentStreak: saved.currentStreak, completedToday: true, todaySteps: saved.todaySteps || [] };
  }
  if (saved.lastDate === yesterday) {
    return { currentStreak: saved.currentStreak, completedToday: false, todaySteps: [] };
  }
  // Missed day(s) — streak gone
  return { currentStreak: 0, completedToday: false, todaySteps: [] };
}

export function useStreakTracker(user) {
  const saved = loadLocal();
  const initial = computeLocalStreak(saved);

  const [currentStreak, setCurrentStreak] = useState(initial.currentStreak);
  const [longestStreak, setLongestStreak] = useState(saved?.longestStreak || 0);
  const [completedToday, setCompletedToday] = useState(initial.completedToday);
  const [todaySteps, setTodaySteps] = useState(initial.todaySteps);
  const [synced, setSynced] = useState(false);
  const pendingSync = useRef(null);

  // On mount: fetch server state and reconcile (server wins for streak count)
  useEffect(() => {
    if (!user?.email) return;
    const today = localDateStr();
    base44.functions.invoke('streakManager', { localDate: today }, { method: 'GET' })
      .then(res => {
        const d = res?.data?.data;
        if (!d) return;
        setCurrentStreak(prev => Math.max(prev, d.currentStreak || 0));
        setLongestStreak(d.longestStreak || 0);
        if (d.completedToday) {
          setCompletedToday(true);
        }
        setSynced(true);
      })
      .catch(() => setSynced(true));
  }, [user?.email]);

  const markStep = useCallback((step, activityType) => {
    if (!step) return;
    setTodaySteps(prev => {
      if (prev.includes(step)) return prev;
      const next = [...prev, step];

      const today = localDateStr();
      const isFirst = !completedToday && next.length === 1;

      setCurrentStreak(prevStreak => {
        const newStreak = isFirst ? prevStreak + 1 : prevStreak;
        setLongestStreak(pl => Math.max(pl, newStreak));

        const localState = {
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastDate: today,
          todaySteps: next,
        };
        saveLocal(localState);

        // Sync to backend (debounce: only first action per day triggers real call)
        if (user?.email && isFirst) {
          const type = activityType || step;
          base44.functions.invoke('streakManager', { activityType: type, localDate: today })
            .then(res => {
              const d = res?.data?.data;
              if (d) {
                setCurrentStreak(d.currentStreak);
                setLongestStreak(d.longestStreak);
              }
            })
            .catch(() => {});
        }

        return newStreak;
      });

      if (isFirst) setCompletedToday(true);
      return next;
    });
  }, [completedToday, longestStreak, user?.email]);

  const isStepDone = useCallback((step) => todaySteps.includes(step), [todaySteps]);

  // Derived state: 'none' | 'active' | 'done' | 'restarted'
  const streakState = completedToday ? 'done'
    : currentStreak > 0 ? 'active'
    : (loadLocal()?.currentStreak > 0 ? 'restarted' : 'none');

  return { currentStreak, longestStreak, completedToday, todaySteps, markStep, isStepDone, streakState };
}