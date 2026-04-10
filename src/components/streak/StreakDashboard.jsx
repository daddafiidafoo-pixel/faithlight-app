import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Award, Target, Zap, Trophy } from 'lucide-react';
import { useI18n } from '../I18nProvider';

const MILESTONE_KEYS = [
  { days: 7,   labelKey: 'streak.milestone7',   labelFallback: '7-Day Starter',   icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  { days: 14,  labelKey: 'streak.milestone14',  labelFallback: '2-Week Warrior',   icon: '⚔️', color: 'bg-blue-100 text-blue-700' },
  { days: 30,  labelKey: 'streak.milestone30',  labelFallback: '30-Day Devotee',   icon: '📖', color: 'bg-purple-100 text-purple-700' },
  { days: 90,  labelKey: 'streak.milestone90',  labelFallback: '90-Day Champion',  icon: '👑', color: 'bg-yellow-100 text-yellow-700' },
  { days: 365, labelKey: 'streak.milestone365', labelFallback: '1-Year Legend',    icon: '🏆', color: 'bg-green-100 text-green-700' },
];

const OM_STREAK = {
  'streak.currentStreak': 'Guyyaa itti fufinsaa',
  'streak.nextMilestone': "Milkaa'ina itti aanu",
  'streak.daysToGo': 'guyyaa hafe',
  'streak.achievementsUnlocked': "Milkaa'ina Banameera",
  'streak.keepReading': "Dubbisuu itti fufi! Mallattoo jalqabaa guyyaa 7 booda ni argatta",
  'streak.milestone7': 'Jalqabaa Guyyaa 7',
  'streak.milestone14': 'Lola Torban 2',
  'streak.milestone30': 'Amantaa Guyyaa 30',
  'streak.milestone90': "Moo'aa Guyyaa 90",
  'streak.milestone365': 'Goota Waggaa 1',
  'study.days': 'guyyoota',
};

export default function StreakDashboard({ user }) {
  const { t, lang } = useI18n();
  const tr = (key, fallback) => lang === 'om' && OM_STREAK[key] ? OM_STREAK[key] : t(key, fallback);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStreakData = async () => {
      try {
        const userStats = await base44.entities.UserStats.filter({ user_id: user.id }).catch(() => []);
        if (userStats.length > 0) {
          setStreakData(userStats[0]);
        }
      } catch {
        // Fallback: no streak data
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [user?.id]);

  if (!user || loading) return null;

  const currentStreak = streakData?.current_streak || 0;
  const MILESTONES = MILESTONE_KEYS.map(m => ({ ...m, label: tr(m.labelKey, m.labelFallback) }));
  const unlockedMilestones = MILESTONES.filter(m => currentStreak >= m.days);
  const nextMilestone = MILESTONES.find(m => currentStreak < m.days);

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 shadow-sm">
      {/* Current Streak */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-600 font-medium">{tr('streak.currentStreak', 'Current Streak')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-indigo-700">{currentStreak}</span>
            <span className="text-gray-600 text-lg">{tr('study.days', 'days')}</span>
          </div>
        </div>
        <Flame className="w-12 h-12 text-orange-500" />
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-100">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-2">{tr('streak.nextMilestone', 'Next Milestone')}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">{nextMilestone.label}</span>
            <span className="text-2xl">{nextMilestone.icon}</span>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((currentStreak / nextMilestone.days) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">{nextMilestone.days - currentStreak} {tr('streak.daysToGo', 'days to go')}</p>
        </div>
      )}

      {/* Unlocked Badges */}
      {unlockedMilestones.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-3">{tr('streak.achievementsUnlocked', 'Achievements Unlocked')}</p>
          <div className="grid grid-cols-2 gap-2">
            {unlockedMilestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`${milestone.color} rounded-lg p-3 text-center border-2 border-current`}
              >
                <div className="text-2xl mb-1">{milestone.icon}</div>
                <p className="text-xs font-bold">{milestone.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!unlockedMilestones.length && (
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{tr('streak.keepReading', 'Keep reading! Unlock your first badge at 7 days.')}</p>
        </div>
      )}
    </div>
  );
}