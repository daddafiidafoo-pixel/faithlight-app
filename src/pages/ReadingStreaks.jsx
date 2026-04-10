import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Award, BookOpen, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, isSameDay, parseISO } from 'date-fns';

const BADGES = [
  { days: 3,   emoji: '🌱', label: 'First Steps',    desc: '3-day streak',    color: 'from-green-400 to-emerald-500' },
  { days: 7,   emoji: '🔥', label: 'Week Warrior',   desc: '7-day streak',    color: 'from-orange-400 to-red-500' },
  { days: 14,  emoji: '⚡', label: 'Fortnight Faith', desc: '14-day streak',   color: 'from-yellow-400 to-orange-500' },
  { days: 30,  emoji: '🏆', label: 'Monthly Devotee', desc: '30-day streak',   color: 'from-blue-400 to-indigo-500' },
  { days: 60,  emoji: '🌟', label: 'Faithful Servant','desc': '60-day streak', color: 'from-purple-400 to-pink-500' },
  { days: 100, emoji: '👑', label: 'Scripture Master', desc: '100-day streak', color: 'from-amber-400 to-yellow-500' },
];

function getHeatmapColor(count) {
  if (!count) return 'bg-gray-100';
  if (count >= 3) return 'bg-indigo-600';
  if (count >= 2) return 'bg-indigo-400';
  return 'bg-indigo-200';
}

export default function ReadingStreaks() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [logging, setLogging] = useState(false);
  const [loggedToday, setLoggedToday] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadData(u);
    }).catch(() => setLoading(false));
  }, []);

  const loadData = async (u) => {
    if (!u) { setLoading(false); return; }
    const data = await base44.entities.ReadingSession.filter({ user_id: u.id }, '-created_date', 200);
    setSessions(data);
    computeStreak(data);
    const today = startOfDay(new Date()).toISOString();
    setLoggedToday(data.some(s => isSameDay(parseISO(s.created_date), new Date())));
    setLoading(false);
  };

  const computeStreak = (data) => {
    const uniqueDays = [...new Set(data.map(s => format(parseISO(s.created_date), 'yyyy-MM-dd')))].sort().reverse();
    let current = 0;
    let longest = 0;
    let temp = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Current streak
    let checkDate = uniqueDays[0] === today || uniqueDays[0] === yesterday ? uniqueDays[0] : null;
    if (checkDate) {
      for (let i = 0; i < uniqueDays.length; i++) {
        const expected = format(subDays(new Date(checkDate), i === 0 ? 0 : 1), 'yyyy-MM-dd');
        if (uniqueDays[i] === expected || (i === 0)) {
          if (i === 0) { current = 1; checkDate = uniqueDays[0]; continue; }
          const prev = format(subDays(parseISO(uniqueDays[i - 1]), 1), 'yyyy-MM-dd');
          if (uniqueDays[i] === prev) { current++; } else break;
        } else break;
      }
    }

    // Longest streak
    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) { temp = 1; continue; }
      const prev = format(subDays(parseISO(uniqueDays[i - 1]), 1), 'yyyy-MM-dd');
      if (uniqueDays[i] === prev) { temp++; if (temp > longest) longest = temp; }
      else { if (temp > longest) longest = temp; temp = 1; }
    }
    if (temp > longest) longest = temp;

    setStreak({ current, longest });
  };

  const logSession = async () => {
    if (!user || loggedToday) return;
    setLogging(true);
    await base44.entities.ReadingSession.create({ user_id: user.id, chapter_id: 'daily', book: 'Daily Reading', duration_seconds: 300 });
    await loadData(user);
    setLogging(false);
  };

  // Build heatmap: last 91 days
  const heatmapDays = Array.from({ length: 91 }, (_, i) => {
    const date = subDays(new Date(), 90 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = sessions.filter(s => format(parseISO(s.created_date), 'yyyy-MM-dd') === dateStr).length;
    return { date, dateStr, count };
  });

  // Group by week
  const startPad = heatmapDays[0].date.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...heatmapDays];

  const earnedBadges = BADGES.filter(b => streak.longest >= b.days);
  const nextBadge = BADGES.find(b => b.days > streak.current);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Flame className="w-12 h-12 text-orange-500" />
      <h2 className="text-xl font-bold text-gray-800">Reading Streaks</h2>
      <p className="text-gray-500 text-sm">Sign in to track your reading streak and earn badges.</p>
      <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700 text-white">Sign In</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-2">
            <Flame className="w-4 h-4" /> Reading Streaks
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Your Daily Reading Habit</h1>
        </div>

        {/* Streak stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 text-center">
            <Flame className={`w-7 h-7 mx-auto mb-1 ${streak.current > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
            <div className={`text-4xl font-extrabold ${streak.current > 0 ? 'text-orange-500' : 'text-gray-300'}`}>{streak.current}</div>
            <div className="text-xs text-gray-500 font-semibold mt-1">Current Streak</div>
            <div className="text-xs text-gray-400">{streak.current === 1 ? 'day' : 'days'}</div>
          </div>
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 text-center">
            <TrendingUp className="w-7 h-7 mx-auto mb-1 text-indigo-500" />
            <div className="text-4xl font-extrabold text-indigo-500">{streak.longest}</div>
            <div className="text-xs text-gray-500 font-semibold mt-1">Longest Streak</div>
            <div className="text-xs text-gray-400">{streak.longest === 1 ? 'day' : 'days'} ever</div>
          </div>
        </div>

        {/* Log today */}
        <button
          onClick={logSession}
          disabled={loggedToday || logging}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm mb-5 transition-all ${
            loggedToday
              ? 'bg-green-50 border-2 border-green-200 text-green-600 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
          }`}>
          {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : loggedToday ? <><BookOpen className="w-4 h-4" /> ✓ Reading logged today!</> : <><BookOpen className="w-4 h-4" /> Log Today's Reading</>}
        </button>

        {/* Next badge goal */}
        {nextBadge && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-sm">
            <div className="text-2xl">{nextBadge.emoji}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Next badge: {nextBadge.label}</p>
              <p className="text-xs text-gray-400">{nextBadge.days - streak.current} more days to go</p>
              <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${Math.min(100, (streak.current / nextBadge.days) * 100)}%` }} />
              </div>
            </div>
            <span className="text-xs font-bold text-gray-400">{nextBadge.days}d</span>
          </div>
        )}

        {/* Heatmap */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-700">Last 13 Weeks</h3>
          </div>
          <div className="flex gap-1 flex-wrap">
            {['S','M','T','W','T','F','S'].map((d,i) => (
              <div key={i} className="w-7 text-center text-xs text-gray-300 font-semibold">{d}</div>
            ))}
          </div>
          <div className="grid gap-1 mt-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {paddedDays.map((day, i) => (
              <div key={i}
                title={day ? `${day.dateStr}: ${day.count} session${day.count !== 1 ? 's' : ''}` : ''}
                className={`w-7 h-7 rounded-md transition-colors ${day ? getHeatmapColor(day.count) : ''} ${isSameDay(day?.date, new Date()) ? 'ring-2 ring-orange-400' : ''}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-gray-400">Less</span>
            {['bg-gray-100','bg-indigo-200','bg-indigo-400','bg-indigo-600'].map(c => <div key={c} className={`w-3.5 h-3.5 rounded-sm ${c}`} />)}
            <span className="text-xs text-gray-400">More</span>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-700">Achievement Badges</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(badge => {
              const earned = streak.longest >= badge.days;
              return (
                <div key={badge.days} className={`rounded-xl p-3 text-center transition-all ${earned ? `bg-gradient-to-br ${badge.color} text-white shadow-sm` : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className={`text-xs font-bold ${earned ? 'text-white' : 'text-gray-500'}`}>{badge.label}</div>
                  <div className={`text-xs mt-0.5 ${earned ? 'text-white/80' : 'text-gray-400'}`}>{badge.days} days</div>
                  {!earned && <div className="text-xs text-gray-300 mt-0.5">{badge.days - streak.current > 0 ? `${badge.days - streak.current} to go` : 'Almost!'}</div>}
                  {earned && <div className="text-xs text-white/90 mt-0.5 font-bold">Earned! ✓</div>}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}