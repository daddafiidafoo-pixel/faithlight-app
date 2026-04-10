import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Flame, BookOpen, Clock, TrendingUp, Target, Award } from 'lucide-react';
import { format, subDays, startOfWeek, eachDayOfInterval, subWeeks, getDay } from 'date-fns';

const BIBLE_BOOKS_TOTAL = 66;

// Build last 7 days array
function buildStreakData(logs) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === key);
    return {
      day: format(d, 'EEE'),
      minutes: log?.minutesSpent || 0,
      read: !!(log?.minutesSpent),
    };
  });
}

// Build last 8 weeks
function buildWeeklyData(logs) {
  const today = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(today, 7 - i));
    const weekEnd = subDays(startOfWeek(subWeeks(today, 6 - i)), 1);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const total = days.reduce((sum, d) => {
      const key = format(d, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === key);
      return sum + (log?.minutesSpent || 0);
    }, 0);
    return { week: `W${i + 1}`, minutes: total };
  });
}

// Unique books read this month
function booksThisMonth(logs) {
  const now = new Date();
  const monthStr = format(now, 'yyyy-MM');
  const monthLogs = logs.filter(l => l.date?.startsWith(monthStr));
  const books = new Set(monthLogs.flatMap(l => l.booksRead || []));
  return books.size;
}

// Current streak
function calcStreak(logs) {
  let streak = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let cursor = new Date();
  while (true) {
    const key = format(cursor, 'yyyy-MM-dd');
    if (!logs.find(l => l.date === key && l.minutesSpent > 0)) break;
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function StreakDots({ data }) {
  return (
    <div className="flex gap-2 justify-center">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
            d.read
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {d.read ? <Flame size={16} /> : d.day[0]}
          </div>
          <span className="text-xs text-gray-400">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

const COLORS = ['#6C5CE7', '#A78BFA', '#C4B5FD', '#DDD6FE'];

export default function ReadingDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['readingLogs', user?.email],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 56), 'yyyy-MM-dd');
      const all = await base44.entities.ReadingSessionLog.filter({ userEmail: user.email }, '-date', 60);
      return all.filter(l => l.date >= thirtyDaysAgo);
    },
    enabled: isAuthenticated && !!user?.email,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <TrendingUp size={40} className="text-indigo-400 mx-auto" />
          <p className="text-gray-600">Sign in to view your reading dashboard.</p>
        </div>
      </div>
    );
  }

  const streakData = buildStreakData(logs);
  const weeklyData = buildWeeklyData(logs);
  const currentStreak = calcStreak(logs);
  const booksMonth = booksThisMonth(logs);
  const booksPct = Math.round((booksMonth / BIBLE_BOOKS_TOTAL) * 100);
  const totalMinutes = logs.reduce((s, l) => s + (l.minutesSpent || 0), 0);
  const avgPerDay = logs.length ? Math.round(totalMinutes / Math.max(logs.length, 1)) : 0;

  const pieData = [
    { name: 'Read', value: booksMonth },
    { name: 'Remaining', value: BIBLE_BOOKS_TOTAL - booksMonth },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl px-3 py-2 shadow-lg border text-xs">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-indigo-600">{payload[0].value} min</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b px-5 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={22} className="text-indigo-600" /> Reading Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your Bible reading progress & consistency</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Flame} label="Current Streak" value={`${currentStreak}d`} sub="consecutive days" color="bg-orange-500" />
              <StatCard icon={BookOpen} label="Books This Month" value={`${booksMonth}`} sub={`${booksPct}% of Bible`} color="bg-indigo-500" />
              <StatCard icon={Clock} label="Total Minutes" value={totalMinutes} sub="all time" color="bg-teal-500" />
              <StatCard icon={Target} label="Avg / Session" value={`${avgPerDay}m`} sub="daily average" color="bg-purple-500" />
            </div>

            {/* Daily Streak Visualization */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" /> 7-Day Streak
                </h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${currentStreak > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                  🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                </span>
              </div>
              <StreakDots data={streakData} />
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={streakData} barSize={28}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                      {streakData.map((d, i) => (
                        <Cell key={i} fill={d.read ? '#F97316' : '#F3F4F6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Time Chart */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <Clock size={16} className="text-teal-500" /> Weekly Reading Time
              </h2>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#6C5CE7"
                    strokeWidth={2.5}
                    dot={{ fill: '#6C5CE7', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Books Progress Pie */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-indigo-500" /> Books Read This Month
              </h2>
              <div className="flex items-center gap-6">
                <PieChart width={120} height={120}>
                  <Pie data={pieData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                    <Cell fill="#6C5CE7" />
                    <Cell fill="#EDE9FE" />
                  </Pie>
                </PieChart>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900">{booksPct}%</p>
                  <p className="text-sm text-gray-500">{booksMonth} of {BIBLE_BOOKS_TOTAL} books</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                      <span className="text-gray-600">{booksMonth} books read</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 inline-block" />
                      <span className="text-gray-400">{BIBLE_BOOKS_TOTAL - booksMonth} remaining</span>
                    </div>
                  </div>
                </div>
              </div>
              {booksPct === 0 && (
                <p className="text-xs text-gray-400 mt-3 text-center">Start reading to track your monthly progress!</p>
              )}
            </div>

            {/* Encouragement */}
            {currentStreak >= 3 && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3">
                <Award size={24} className="text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-orange-800">
                    {currentStreak >= 7 ? '🏆 Incredible!' : currentStreak >= 5 ? '⭐ Amazing!' : '🔥 Great streak!'}
                  </p>
                  <p className="text-xs text-orange-600">{currentStreak} days in a row. Keep the momentum going!</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}