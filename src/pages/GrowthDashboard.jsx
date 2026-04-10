import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { Flame, Trophy, Star, BookOpen, Zap, CheckCircle2, Lock, Target, Award, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

// Badge definitions with unlock conditions
const BADGE_DEFS = [
  { type: 'streak_7',     icon: '🔥', name: '7-Day Streak',     points: 50,  desc: 'Read 7 days in a row',        check: (s) => s.current_streak >= 7 },
  { type: 'streak_30',    icon: '🌟', name: '30-Day Streak',    points: 200, desc: 'Read 30 days in a row',       check: (s) => s.current_streak >= 30 },
  { type: 'streak_100',   icon: '👑', name: '100-Day Legend',   points: 500, desc: 'Read 100 days in a row',      check: (s) => s.current_streak >= 100 },
  { type: 'chapters_5',   icon: '📖', name: 'First 5 Chapters', points: 25,  desc: 'Read 5 chapters total',       check: (s) => s.total_chapters_read >= 5 },
  { type: 'chapters_25',  icon: '📚', name: '25 Chapters',      points: 75,  desc: 'Read 25 chapters total',      check: (s) => s.total_chapters_read >= 25 },
  { type: 'chapters_100', icon: '🎓', name: '100 Chapters',     points: 300, desc: 'Read 100 chapters total',     check: (s) => s.total_chapters_read >= 100 },
  { type: 'quiz_1',       icon: '❓', name: 'Quiz Starter',     points: 20,  desc: 'Complete your first quiz',    check: (_, q) => q >= 1 },
  { type: 'quiz_10',      icon: '🧠', name: 'Quiz Scholar',     points: 100, desc: 'Complete 10 quizzes',         check: (_, q) => q >= 10 },
  { type: 'dedication',   icon: '🙏', name: 'Dedicated Reader', points: 150, desc: 'Read on 14 different days',   check: (s) => s.longest_streak >= 14 },
];

// Last 7 days reading activity (from localStorage + streak data)
function getWeekActivity(streak) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toDateString();
    const active = streak?.last_read_date
      ? i === 0
        ? new Date(streak.last_read_date).toDateString() === today.toDateString()
        : false
      : false;
    days.push({ label: ['S','M','T','W','T','F','S'][d.getDay()], active, isToday: i === 0, date: key });
  }
  // If streak >= 7, mark all as active
  if (streak?.current_streak >= 7) return days.map(d => ({ ...d, active: true }));
  // If streak is N, mark last N days active
  if (streak?.current_streak > 0) {
    return days.map((d, idx) => ({ ...d, active: idx >= 7 - streak.current_streak }));
  }
  return days;
}

export default function GrowthDashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [quizCount, setQuizCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notAuthed, setNotAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setNotAuthed(true); setLoading(false); return; }

      const me = await base44.auth.me();
      setUser(me);

      const [streaks, badges, quizResults] = await Promise.all([
        base44.entities.UserStreak.filter({ user_id: me.id }, '-updated_date', 1).catch(() => []),
        base44.entities.UserBadge.filter({ user_id: me.id }, '-unlocked_date', 100).catch(() => []),
        base44.entities.DailyQuizResult.filter({ user_id: me.id }, '-quiz_date', 100).catch(() => []),
      ]);

      const streakData = streaks[0] || null;
      setStreak(streakData);
      setEarnedBadges(badges);
      setQuizCount(quizResults.length);

      // Award new badges automatically
      if (streakData) {
        const earnedTypes = new Set(badges.map(b => b.badge_type));
        for (const bd of BADGE_DEFS) {
          if (!earnedTypes.has(bd.type) && bd.check(streakData, quizResults.length)) {
            base44.entities.UserBadge.create({
              user_id: me.id,
              badge_type: bd.type,
              badge_name: bd.name,
              badge_icon: bd.icon,
              unlocked_date: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }

      // Compute total points
      const pts = badges.reduce((sum, b) => {
        const def = BADGE_DEFS.find(d => d.type === b.badge_type);
        return sum + (def?.points || 10);
      }, 0);
      setTotalPoints(pts + (quizResults.reduce((s, q) => s + Math.round((q.score_percentage || 0) / 10), 0)));
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #e8eef8 0%, #f0f4fc 100%)' }}>
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notAuthed) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'linear-gradient(160deg, #e8eef8 0%, #f0f4fc 100%)' }}>
      <div className="text-5xl">🙏</div>
      <h2 className="text-xl font-bold text-gray-800">Sign in to view your growth</h2>
      <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: 'linear-gradient(90deg,#4f6ef7,#6d8aff)' }}>Sign In</button>
    </div>
  );

  const weekActivity = getWeekActivity(streak);
  const earnedTypes = new Set(earnedBadges.map(b => b.badge_type));
  const streakPct7 = Math.min(((streak?.current_streak || 0) / 7) * 100, 100);
  const streakPct30 = Math.min(((streak?.current_streak || 0) / 30) * 100, 100);
  const chapterPct = Math.min(((streak?.total_chapters_read || 0) / 25) * 100, 100);
  const quizPct = Math.min((quizCount / 10) * 100, 100);

  const encouragement = (streak?.current_streak || 0) >= 30
    ? '👑 You are a legend! Keep going!'
    : (streak?.current_streak || 0) >= 7
      ? '🌟 Amazing streak! You are on fire!'
      : (streak?.current_streak || 0) >= 1
        ? '✨ Great start! Keep reading daily.'
        : '📖 Start reading to begin your streak!';

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #e8eef8 0%, #f0f4fc 100%)' }}>
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('growth.yourGrowth', 'My Growth')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{encouragement}</p>
        </div>

        {/* Points + Streak Hero */}
        <div className="rounded-3xl p-5 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #3b5bdb 0%, #4f6ef7 100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wide">Total Points</p>
              <p className="text-4xl font-black">{totalPoints}<span className="text-2xl ml-1">✨</span></p>
            </div>
            <div className="text-center">
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wide mb-1">Streak</p>
              <div className="w-16 h-16 rounded-full bg-white/20 flex flex-col items-center justify-center">
                <Flame className="w-5 h-5 text-orange-300 mb-0.5" />
                <p className="text-xl font-black leading-none">{streak?.current_streak || 0}</p>
                <p className="text-blue-200 text-[10px]">days</p>
              </div>
            </div>
          </div>

          {/* 7-day activity dots */}
          <div className="flex justify-between mt-2">
            {weekActivity.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  d.active
                    ? 'bg-white text-blue-700 shadow'
                    : d.isToday
                      ? 'bg-white/30 text-white border-2 border-white/60'
                      : 'bg-white/15 text-blue-200'
                }`}>
                  {d.active ? '✓' : d.label}
                </div>
                <span className="text-[9px] text-blue-200">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: BookOpen, color: '#4F6EF7', bg: '#EEF2FF', val: streak?.total_chapters_read || 0, label: 'Chapters Read' },
            { icon: Trophy,   color: '#F59E0B', bg: '#FFFBEB', val: streak?.longest_streak || 0,       label: 'Best Streak' },
            { icon: Zap,      color: '#10B981', bg: '#ECFDF5', val: quizCount,                          label: 'Quizzes Done' },
            { icon: Star,     color: '#8B5CF6', bg: '#F5F3FF', val: earnedBadges.length,                label: 'Badges Earned' },
          ].map(({ icon: Icon, color, bg, val, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Next Milestones */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Next Milestones</h3>
          </div>
          <div className="space-y-3">
            {[
              { emoji: '🔥', label: '7-Day Streak',   current: streak?.current_streak || 0,       target: 7,  pts: 50 },
              { emoji: '🌟', label: '30-Day Streak',  current: streak?.current_streak || 0,       target: 30, pts: 200 },
              { emoji: '📚', label: '25 Chapters',    current: streak?.total_chapters_read || 0,  target: 25, pts: 75 },
              { emoji: '🧠', label: '10 Quizzes',     current: quizCount,                          target: 10, pts: 100 },
            ].map(({ emoji, label, current, target, pts }) => {
              const pct = Math.min((current / target) * 100, 100);
              const done = pct >= 100;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{emoji}</span>
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">{current}/{target}</span>
                      <span className="text-xs font-bold text-amber-600">+{pts}pts</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: done ? '#10B981' : 'linear-gradient(90deg,#4f6ef7,#6d8aff)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earned Badges */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-gray-900 text-sm">Achievement Badges</h3>
            </div>
            <span className="text-xs text-gray-400">{earnedBadges.length}/{BADGE_DEFS.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {BADGE_DEFS.map(bd => {
              const unlocked = earnedTypes.has(bd.type);
              return (
                <div
                  key={bd.type}
                  className={`rounded-2xl p-3 flex flex-col items-center gap-1 border transition-all ${
                    unlocked ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50'
                  }`}
                >
                  <span className={`text-2xl ${!unlocked ? 'grayscale' : ''}`}>{unlocked ? bd.icon : '🔒'}</span>
                  <p className="text-[10px] font-bold text-center text-gray-700 leading-tight">{bd.name}</p>
                  <p className="text-[9px] text-amber-600 font-bold">+{bd.points}pts</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl('BibleReader')} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Read Bible</p>
              <p className="text-xs text-gray-400">Build your streak</p>
            </div>
          </Link>
          <Link to={createPageUrl('DailyBibleQuiz')} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Take Quiz</p>
              <p className="text-xs text-gray-400">Earn points</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}