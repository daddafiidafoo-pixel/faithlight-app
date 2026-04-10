import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle2, Flame, ChevronRight, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function ProgressBar({ pct, color = '#6366F1' }) {
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? '#22c55e' : color }}
      />
    </div>
  );
}

const today = () => new Date().toISOString().split('T')[0];

function getProgress(goal) {
  const isDaily = goal.goal_type?.includes('daily');
  const key = isDaily
    ? `goal_progress_${goal.id}_${today()}`
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay());
        return `goal_week_${goal.id}_${d.toISOString().split('T')[0]}`;
      })();
  try { return JSON.parse(localStorage.getItem(key) || '{"count":0}').count; } catch { return 0; }
}

export default function InlineReadingGoal({ user, bookChapterJustRead, isDarkMode = false }) {
  const [goals, setGoals] = useState([]);
  const [celebrating, setCelebrating] = useState(null);
  const [visible, setVisible] = useState(true);
  const [alreadyRecorded, setAlreadyRecorded] = useState(false);

  const bg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const border = isDarkMode ? '#2A2F2C' : '#E5E7EB';
  const text = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const muted = isDarkMode ? '#A0A0A0' : '#6B7280';

  useEffect(() => {
    if (!user) return;
    base44.entities.ReadingGoal.filter({ user_id: user.id, is_active: true }, '-created_date', 5)
      .then(setGoals)
      .catch(() => setGoals([]));
  }, [user?.id]);

  // When a new chapter is read, increment chapter goals
  useEffect(() => {
    if (!bookChapterJustRead || alreadyRecorded || !goals.length) return;
    const key = `read_session_${bookChapterJustRead}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    setAlreadyRecorded(true);

    goals.forEach(goal => {
      if (!goal.goal_type?.includes('chapter')) return;
      const isDaily = goal.goal_type.includes('daily');
      const storageKey = isDaily
        ? `goal_progress_${goal.id}_${today()}`
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - d.getDay());
            return `goal_week_${goal.id}_${d.toISOString().split('T')[0]}`;
          })();
      const prev = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || '{"count":0}').count; } catch { return 0; } })();
      const next = prev + 1;
      localStorage.setItem(storageKey, JSON.stringify({ count: next }));

      // Also update entity progress
      base44.entities.ReadingGoal.update(goal.id, { progress: Math.min(next, goal.target) }).catch(() => {});

      if (next >= goal.target && prev < goal.target) {
        setCelebrating(goal);
        setTimeout(() => setCelebrating(null), 5000);
      }
      setGoals(g => [...g]); // trigger re-render
    });
  }, [bookChapterJustRead, goals.length]);

  if (!user || !goals.length || !visible) return null;

  return (
    <>
      {/* Celebration Banner */}
      {celebrating && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl">
            <PartyPopper className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">Goal Complete! 🎉</p>
              <p className="text-xs opacity-90">"{celebrating.title}" — Great work!</p>
            </div>
          </div>
        </div>
      )}

      {/* Compact goal strip */}
      <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold" style={{ color: text }}>Reading Goals</span>
          </div>
          <div className="flex items-center gap-1">
            <Link to={createPageUrl('ReadingGoals')}>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-0.5 px-1.5" style={{ color: muted }}>
                Manage <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVisible(false)}>
              <span className="text-xs" style={{ color: muted }}>×</span>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {goals.slice(0, 2).map(goal => {
            const progress = getProgress(goal);
            const pct = goal.target > 0 ? Math.round((progress / goal.target) * 100) : 0;
            const met = pct >= 100;
            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: muted }}>{goal.title || goal.goal_type?.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-1">
                    {met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-xs font-bold" style={{ color: met ? '#22c55e' : text }}>
                      {progress}/{goal.target}
                    </span>
                  </div>
                </div>
                <ProgressBar pct={pct} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}