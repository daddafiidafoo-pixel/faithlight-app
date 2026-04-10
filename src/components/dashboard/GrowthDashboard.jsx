import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Flame, Trophy, BookOpen, Headphones, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function GrowthDashboard() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await base44.functions.invoke('getUserStats', {});
        setStats(response.data.stats);
        
        // Generate mock weekly data for now (will be calculated from sessions later)
        const weeks = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
          weeks.push({
            day: dayName,
            reading: Math.floor(Math.random() * 30) + 5,
            listening: Math.floor(Math.random() * 30) + 5,
          });
        }
        setWeeklyData(weeks);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500 text-center">No stats data. Start reading to build your growth!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Your Spiritual Growth</h1>
          <p className="text-gray-500">Track your journey through Scripture</p>
        </div>

        {/* Streak & Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4">

          {/* Streak Card */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <Badge className="bg-orange-200 text-orange-700 hover:bg-orange-200">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-orange-700 mb-1">{stats.currentStreak}</div>
              <p className="text-sm text-orange-600">Current Streak</p>
              <p className="text-xs text-orange-500 mt-1">🏆 Longest: {stats.longestStreak} days</p>
            </CardContent>
          </Card>

          {/* Reading Minutes */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">{Math.floor(stats.totalReadingMinutes / 60)}</div>
              <p className="text-sm text-gray-500">Total Hours Reading</p>
              <p className="text-xs text-blue-600 mt-1">This week: {stats.weeklyReadingMinutes}m</p>
            </CardContent>
          </Card>

          {/* Listening Minutes */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-700 mb-1">{Math.floor(stats.totalListeningMinutes / 60)}</div>
              <p className="text-sm text-gray-500">Total Hours Listening</p>
              <p className="text-xs text-green-600 mt-1">This week: {stats.weeklyListeningMinutes}m</p>
            </CardContent>
          </Card>

          {/* Chapters Completed */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-1">{stats.chaptersCompletedCount}</div>
              <p className="text-sm text-gray-500">Chapters Completed</p>
              <p className="text-xs text-purple-600 mt-1">{Math.floor((stats.chaptersCompletedCount / 1189) * 100)}% of Bible</p>
            </CardContent>
          </Card>

        </div>

        {/* Weekly Activity Chart */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Weekly Activity</h2>
              <p className="text-sm text-gray-500">Reading and listening minutes last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reading" stackId="a" fill="#3B82F6" name="Reading" />
                <Bar dataKey="listening" stackId="a" fill="#10B981" name="Listening" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4">

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Days Active</h3>
              </div>
              <div className="text-2xl font-bold text-indigo-600 ml-9">{stats.daysCompletedCount}</div>
              <p className="text-xs text-gray-500 ml-9 mt-1">Total engagement days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Plans Completed</h3>
              </div>
              <div className="text-2xl font-bold text-green-600 ml-9">{stats.plansCompletedCount}</div>
              <p className="text-xs text-gray-500 ml-9 mt-1">Study plans finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Weekly Avg</h3>
              </div>
              <div className="text-2xl font-bold text-amber-600 ml-9">{Math.floor((stats.weeklyReadingMinutes + stats.weeklyListeningMinutes) / 7)}</div>
              <p className="text-xs text-gray-500 ml-9 mt-1">Minutes per day (this week)</p>
            </CardContent>
          </Card>

        </div>

        {/* Milestones / Tips */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <CardContent className="pt-6">
            <h3 className="font-bold text-indigo-900 mb-3">Growth Tips</h3>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li>✨ Maintain a {Math.max(7, stats.longestStreak + 1)}-day streak for a milestone badge</li>
              <li>📖 Read daily to keep your streak alive</li>
              <li>🎧 Mix reading and listening for deeper engagement</li>
              <li>📚 Complete a study plan to unlock insights</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}