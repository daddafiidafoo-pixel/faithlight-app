import React, { useEffect } from 'react';
import { useReadingStreak } from '@/hooks/useReadingStreak';
import ReadingStreaksCard from '@/components/gamification/ReadingStreaksCard';
import MyHighlightsSection from '@/components/verse/MyHighlightsSection';
import { Button } from '@/components/ui/button';
import { notificationService } from '@/lib/notificationService';

export default function ReadingStreaksDashboard() {
  const { streak, level, badges, totalDaysRead, recordReading } = useReadingStreak();

  useEffect(() => {
    // Request notification permission
    notificationService.requestPermission();

    // Schedule daily notification at 8 AM
    notificationService.scheduleDaily('Reading Reminder', 8, 0);
  }, []);

  const handleStartReading = () => {
    recordReading();
    notificationService.sendNotification('Reading Recorded', {
      body: 'Great job! Keep up your streak! 🔥',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reading Streaks</h1>
          <p className="text-gray-600">Stay consistent and build your reading habit</p>
        </div>

        {/* Main Streak Card */}
        <ReadingStreaksCard
          streak={streak}
          level={level}
          badges={badges}
          totalDaysRead={totalDaysRead}
        />

        {/* Record Reading Button */}
        <div className="text-center">
          <Button onClick={handleStartReading} size="lg" className="bg-green-600 hover:bg-green-700">
            ✅ Record Reading Today
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Mark today as read to maintain your streak
          </p>
        </div>

        {/* Highlights Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <MyHighlightsSection />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{streak}</p>
            <p className="text-sm text-gray-600">Current Streak</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-purple-600">L{level}</p>
            <p className="text-sm text-gray-600">Current Level</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-orange-600">{totalDaysRead}</p>
            <p className="text-sm text-gray-600">Total Days Read</p>
          </div>
        </div>
      </div>
    </div>
  );
}