import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Flame, Star, Calendar, BookMarked, Clock, TrendingUp, Award, Heart, ChevronRight } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';

export default function MyFaithJourney() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [savedVerses, setSavedVerses] = useState([]);
  const [activityDates, setActivityDates] = useState([]);
  const [stats, setStats] = useState({ chaptersRead: 0, notesWritten: 0, versesHighlighted: 0, prayersLogged: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        // Load data in parallel
        const [readingSessions, savedVersesData, notes, highlights, prayers] = await Promise.all([
          base44.entities.ReadingSession.filter({ user_id: u.id }, '-created_date', 200).catch(() => []),
          base44.entities.SavedVerse.filter({ user_id: u.id }, '-created_date', 50).catch(() => []),
          base44.entities.VerseNote.filter({ user_id: u.id }, '-created_date', 200).catch(() => []),
          base44.entities.VerseHighlight.filter({ user_id: u.id }, '-created_date', 200).catch(() => []),
          base44.entities.PrayerJournal.filter({ user_id: u.id }, '-created_date', 100).catch(() => []),
        ]);

        setSavedVerses(savedVersesData.slice(0, 12));

        // Build activity map from reading sessions + notes + prayers
        const activityMap = new Map();
        [...readingSessions, ...notes, ...highlights, ...prayers].forEach(item => {
          const date = item.created_date ? startOfDay(parseISO(item.created_date)).toISOString() : null;
          if (date) activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });
        setActivityDates(activityMap);

        // Calculate streak
        let currentStreak = 0;
        let checkDate = startOfDay(new Date());
        for (let i = 0; i < 365; i++) {
          const key = checkDate.toISOString();
          if (activityMap.has(key)) {
            currentStreak++;
            checkDate = startOfDay(subDays(checkDate, 1));
          } else if (i === 0) {
            // today has no activity yet — check yesterday
            checkDate = startOfDay(subDays(checkDate, 1));
          } else {
            break;
          }
        }
        setStreak(currentStreak);

        setStats({
          chaptersRead: new Set(readingSessions.map(s => `${s.book}-${s.chapter}`)).size,
          notesWritten: notes.length,
          versesHighlighted: highlights.length,
          prayersLogged: prayers.length,
        });
      } catch {
        // not logged in
      }
      setLoading(false);
    };
    load();
  }, []);

  // Generate 90-day calendar grid
  const calendarDays = Array.from({ length: 90 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 89 - i));
    const key = date.toISOString();
    const count = activityDates.get ? activityDates.get(key) || 0 : 0;
    return { date, count, isToday: i === 89 };
  });

  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-indigo-200';
    if (count <= 5) return 'bg-indigo-400';
    return 'bg-indigo-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading your journey…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Faith Journey</h1>
          <p className="text-gray-500">Sign in to track your spiritual growth, streaks, and saved verses.</p>
          <button onClick={() => base44.auth.redirectToLogin()} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 pt-10 pb-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-indigo-300 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user.full_name?.split(' ')[0] || 'Believer'} 🙏</h1>
          <p className="text-indigo-200 text-sm mt-1">Your Faith Journey</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 pb-20 space-y-5">

        {/* Streak + Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl p-5 text-white shadow-lg col-span-1">
            <Flame className="w-6 h-6 mb-2 text-orange-100" />
            <p className="text-4xl font-black">{streak}</p>
            <p className="text-orange-100 text-sm font-medium">Day Streak 🔥</p>
            {streak > 0 && <p className="text-xs text-orange-200 mt-1">Keep it going!</p>}
            {streak === 0 && <p className="text-xs text-orange-200 mt-1">Start today!</p>}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 col-span-1">
            {[
              { label: 'Chapters', value: stats.chaptersRead, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Notes', value: stats.notesWritten, icon: BookMarked, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Highlights', value: stats.versesHighlighted, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Prayers', value: stats.prayersLogged, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 flex flex-col items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900">90-Day Activity</h2>
          </div>
          <div className="flex flex-wrap gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm ${getActivityColor(day.count)} ${day.isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                title={`${format(day.date, 'MMM d')}: ${day.count} activities`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-400">Less</span>
            {['bg-gray-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600'].map(c => (
              <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
            ))}
            <span className="text-xs text-gray-400">More</span>
          </div>
        </div>

        {/* Saved Verses */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-gray-900">Saved Verses</h2>
            </div>
            <Link to={createPageUrl('SavedVersesDashboard')} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {savedVerses.length === 0 ? (
            <div className="text-center py-6">
              <BookMarked className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No saved verses yet. Bookmark verses while reading the Bible.</p>
              <Link to={createPageUrl('BibleReader')} className="mt-3 inline-block text-xs text-indigo-600 font-semibold">
                Open Bible Reader →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedVerses.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-800">{v.book} {v.chapter}:{v.verse}</p>
                    {v.verse_text && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 italic">"{v.verse_text}"</p>}
                    {v.note && <p className="text-xs text-gray-400 mt-1">📝 {v.note}</p>}
                  </div>
                  <Link to={createPageUrl(`BibleReader?book=${encodeURIComponent(v.book)}&chapter=${v.chapter}`)}>
                    <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Bible Reader', icon: BookOpen, color: 'from-indigo-500 to-indigo-700', page: 'BibleReader' },
            { label: 'Prayer Journal', icon: Heart, color: 'from-rose-400 to-pink-600', page: 'PrayerJournal' },
            { label: 'Reading Plans', icon: Calendar, color: 'from-green-500 to-emerald-700', page: 'ReadingPlans' },
            { label: 'Church Mode', icon: Award, color: 'from-amber-400 to-orange-600', page: 'ChurchMode' },
          ].map(item => (
            <Link key={item.label} to={createPageUrl(item.page)}>
              <div className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-white flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}>
                <item.icon className="w-5 h-5 opacity-90" />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Motivational verse */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white text-center shadow-lg">
          <p className="text-base italic leading-relaxed font-medium">
            "Your word is a lamp to my feet and a light to my path."
          </p>
          <p className="text-indigo-300 text-sm mt-2">— Psalm 119:105</p>
        </div>
      </div>
    </div>
  );
}