import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StreakStats from '@/components/streak/StreakStats';
import StreakCalendar from '@/components/streak/StreakCalendar';
import { LogOut } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';
import { t } from '@/components/i18n/translations';

export default function ReadingStreakDashboard() {
  const uiLanguage = useLanguageStore((s) => s.uiLanguage);
  const [user, setUser] = useState(null);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0, total: 0 });
  const [readingDates, setReadingDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setUser(currentUser);

      // Fetch reading activity
      const readings = await base44.entities.ReadingStreak.filter({
        userEmail: currentUser.email,
      });

      if (readings && readings.length > 0) {
        const dates = readings.map((r) => r.date);
        setReadingDates(dates);

        // Calculate streaks
        const sorted = dates.sort();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
          const curr = new Date(sorted[i]);
          const prev = new Date(sorted[i - 1]);
          const diff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

          if (diff === 1) {
            tempStreak++;
          } else if (diff > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Check if yesterday or today was read for current streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (dates.includes(today) || dates.includes(yesterday)) {
          currentStreak = tempStreak;
        }

        setStreaks({
          current: currentStreak,
          longest: longestStreak,
          total: dates.length,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t(uiLanguage, 'loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reading Consistency</h1>
            <p className="text-gray-600 mt-1">Track your daily Bible reading habits</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-600">{user.full_name}</p>
            </div>
          )}
        </div>

        <StreakStats
          currentStreak={streaks.current}
          longestStreak={streaks.longest}
          totalDays={streaks.total}
        />

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Calendar</h2>
          <StreakCalendar readingDates={readingDates} />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips to Build Your Streak</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">1.</span>
              <span>Set a daily reading time and stick to it</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">2.</span>
              <span>Even 5-10 minutes counts—consistency is key</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">3.</span>
              <span>Use the offline mode to read anytime, anywhere</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">4.</span>
              <span>Bookmark verses and write them in your prayer journal</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}