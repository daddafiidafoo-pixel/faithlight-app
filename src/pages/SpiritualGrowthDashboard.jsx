import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Flame, BookOpen, Heart, Trophy, TrendingUp, Calendar, Target } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

export default function SpiritualGrowthDashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    readingStreak: 0,
    prayerStreak: 0,
    totalReadingDays: 0,
    totalPrayerDays: 0,
    milestonesEarned: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load user stats (reading streak, prayer streak from user profile)
      const readingStreak = currentUser?.reading_streak || 0;
      const prayerStreak = currentUser?.prayer_streak || 0;
      const totalReadingDays = currentUser?.total_reading_days || 0;
      const totalPrayerDays = currentUser?.total_prayer_days || 0;

      setStats({
        readingStreak,
        prayerStreak,
        totalReadingDays,
        totalPrayerDays,
        milestonesEarned: Math.floor((totalReadingDays + totalPrayerDays) / 30),
      });
    } catch (err) {
      console.error('Failed to load growth data:', err);
    } finally {
      setLoading(false);
    }
  };

  const milestones = [
    { days: 7, title: 'Week Warrior', icon: '🔥', earned: stats.totalReadingDays >= 7 },
    { days: 30, title: 'Month Master', icon: '📖', earned: stats.totalReadingDays >= 30 },
    { days: 100, title: 'Century Scholar', icon: '⭐', earned: stats.totalReadingDays >= 100 },
    { days: 365, title: 'Year Champion', icon: '👑', earned: stats.totalReadingDays >= 365 },
  ];

  const progressPercentage = Math.min((stats.readingStreak / 30) * 100, 100);
  const prayerProgressPercentage = Math.min((stats.prayerStreak / 30) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <TrendingUp className="w-10 h-10 text-indigo-600" />
            Spiritual Growth
          </h1>
          <p className="text-gray-600 mt-2">Track your journey of faith and consistent engagement</p>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reading Streak */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-indigo-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Reading Streak</h3>
                  <p className="text-3xl font-bold text-indigo-600">{stats.readingStreak}</p>
                </div>
              </div>
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress to 30 days</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {30 - stats.readingStreak} days until monthly milestone
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Total: {stats.totalReadingDays} days of reading
            </p>
          </div>

          {/* Prayer Streak */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Prayer Streak</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.prayerStreak}</p>
                </div>
              </div>
              <Flame className="w-10 h-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress to 30 days</span>
                <span>{Math.round(prayerProgressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${prayerProgressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {30 - stats.prayerStreak} days until monthly milestone
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Total: {stats.totalPrayerDays} days of prayer
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600" />
            Milestones & Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {milestones.map((milestone, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  milestone.earned
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{milestone.icon}</div>
                <p className="font-semibold text-sm text-gray-900">{milestone.title}</p>
                <p className="text-xs text-gray-600 mt-1">{milestone.days} days</p>
                {milestone.earned && (
                  <p className="text-xs text-amber-700 mt-2 font-medium">✓ Earned</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-xl font-bold mb-4">Growth Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-indigo-100 text-sm">Total Days Active</p>
              <p className="text-3xl font-bold">{stats.totalReadingDays + stats.totalPrayerDays}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Milestones Earned</p>
              <p className="text-3xl font-bold">{stats.milestonesEarned}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Current Momentum</p>
              <p className="text-3xl font-bold">{Math.max(stats.readingStreak, stats.prayerStreak)} 🔥</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <BookOpen className="w-4 h-4" />
            Continue Reading
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Heart className="w-4 h-4" />
            Open Prayer Wall
          </Button>
        </div>
      </div>
    </div>
  );
}