import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getStreakData, BADGE_DEFINITIONS, MILESTONES } from '@/components/lib/bibleEngineServices/readingStreakService';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const DISPLAY_MILESTONES = [7, 30, 100];

export default function ReadingStreakCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const streakData = await getStreakData(user.id);
        setData(streakData);
      } catch {
        // Not authenticated or no data — hide card silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="mb-5 rounded-2xl bg-white border border-gray-100 p-4 animate-pulse h-28" />
  );

  if (!data) return null;

  const { currentStreak, longestStreak, nextMilestone, daysToNextMilestone, badges } = data;
  const earnedSet = new Set(badges.map(b => b.milestone));
  const progress = nextMilestone > 0 ? Math.min(100, Math.round((currentStreak / nextMilestone) * 100)) : 100;

  const badgeDef = (m) => BADGE_DEFINITIONS[m] || { icon: '🏅', name: `${m} Days` };

  return (
    <div
      className="mb-5 rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B2B1E 0%, #243028 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-0.5">Reading Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{currentStreak}</span>
              <span className="text-green-300 font-semibold text-sm">
                {currentStreak === 1 ? 'day' : 'days'} 🔥
              </span>
            </div>
            {longestStreak > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">Best: {longestStreak} days</p>
            )}
          </div>
          <Link
            to={createPageUrl('ReadingStreakDashboard')}
            className="text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
          >
            View all →
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{currentStreak} / {nextMilestone} days</span>
            <span>{daysToNextMilestone > 0 ? `${daysToNextMilestone} days to go` : '🎉 Milestone reached!'}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #4ADE80 0%, #86EFAC 100%)',
              }}
            />
          </div>
        </div>

        {/* Milestone badges */}
        <div className="flex gap-3 mt-4">
          {DISPLAY_MILESTONES.map(m => {
            const earned = earnedSet.has(m);
            const def = badgeDef(m);
            return (
              <div
                key={m}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                style={{
                  background: earned ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${earned ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: earned ? 1 : 0.45,
                }}
              >
                <span className="text-xl">{def.icon}</span>
                <span className="text-xs font-bold" style={{ color: earned ? '#86EFAC' : '#9CA3AF' }}>
                  {m}d
                </span>
                <span className="text-[10px] text-center leading-tight" style={{ color: earned ? '#6EE7B7' : '#6B7280' }}>
                  {def.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Zero-state prompt */}
        {currentStreak === 0 && (
          <Link to={createPageUrl('BibleReader')}>
            <div className="mt-4 text-center py-2 rounded-xl text-sm font-semibold text-green-300 bg-green-900/30 border border-green-700/30 hover:bg-green-900/50 transition-colors">
              📖 Read today to start your streak
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}