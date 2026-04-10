import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Flame, Trophy, Star, CheckCircle2, Lock, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOTAL_BIBLE_BOOKS = 66;
const TOTAL_BIBLE_VERSES = 31102;

const MILESTONES = [
  { id: 'first_chapter', label: 'First Chapter', icon: '📖', requirement: 1, type: 'chapters' },
  { id: 'ten_chapters', label: '10 Chapters Read', icon: '📚', requirement: 10, type: 'chapters' },
  { id: 'fifty_chapters', label: '50 Chapters Read', icon: '🌟', requirement: 50, type: 'chapters' },
  { id: 'first_book', label: 'First Book Complete', icon: '✅', requirement: 1, type: 'books' },
  { id: 'five_books', label: '5 Books Complete', icon: '🏆', requirement: 5, type: 'books' },
  { id: 'streak_7', label: '7-Day Streak', icon: '🔥', requirement: 7, type: 'streak' },
  { id: 'streak_30', label: '30-Day Streak', icon: '💎', requirement: 30, type: 'streak' },
  { id: 'verses_100', label: '100 Verses Read', icon: '⭐', requirement: 100, type: 'verses' },
  { id: 'verses_1000', label: '1,000 Verses Read', icon: '👑', requirement: 1000, type: 'verses' },
];

function MilestoneCard({ milestone, unlocked, current }) {
  const progress = Math.min(100, Math.round((current / milestone.requirement) * 100));
  return (
    <div className={`rounded-2xl p-4 border transition-all ${unlocked ? 'bg-white border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{milestone.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>{milestone.label}</p>
          <p className="text-xs text-gray-400">{current}/{milestone.requirement}</p>
        </div>
        {unlocked
          ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          : <Lock className="w-4 h-4 text-gray-300 shrink-0" />
        }
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${unlocked ? 'bg-green-500' : 'bg-indigo-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) { // eslint-disable-line
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function BibleProgressDashboard() {
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        if (!user) { setLoading(false); return; }

        const [sessions, streakData, badges] = await Promise.all([
          base44.entities.ReadingSession.filter({ userEmail: user.email }, '-created_date', 100),
          base44.entities.UserStreak.filter({ userEmail: user.email }),
          base44.entities.UserBadge.filter({ userEmail: user.email }),
        ]);

        // Aggregate stats from reading sessions
        const booksRead = new Set();
        let totalChapters = 0;
        let totalVerses = 0;

        (sessions || []).forEach(s => {
          totalChapters += (s.chaptersRead || 0);
          totalVerses += (s.versesRead || 0);
          (s.booksRead || []).forEach(b => booksRead.add(b));
        });

        setStats({
          booksCompleted: booksRead.size,
          chaptersRead: totalChapters,
          versesRead: totalVerses,
          badgesEarned: (badges || []).length,
        });

        setStreak((streakData?.[0]?.currentStreak) || 0);
        setRecentActivity((sessions || []).slice(0, 5));
      } catch (e) {
        console.error('Progress load error:', e);
        setStats({ booksCompleted: 0, chaptersRead: 0, versesRead: 0, badgesEarned: 0 });
      }
      setLoading(false);
    };
    load();
  }, []);

  const getProgress = (type) => {
    if (!stats) return 0;
    if (type === 'chapters') return stats.chaptersRead;
    if (type === 'books') return stats.booksCompleted;
    if (type === 'streak') return streak;
    if (type === 'verses') return stats.versesRead;
    return 0;
  };

  const bibleCompletionPct = stats
    ? Math.min(100, Math.round((stats.versesRead / TOTAL_BIBLE_VERSES) * 100))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <BookOpen className="w-12 h-12 text-indigo-300" />
        <h2 className="text-xl font-bold text-gray-800">Sign in to track progress</h2>
        <p className="text-gray-500 text-sm">Your Bible reading journey will be tracked here.</p>
        <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">📊 Reading Progress</h1>
        <p className="text-gray-500 text-sm mb-6">Your Bible journey at a glance</p>

        {/* Overall completion ring */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#6C5CE7" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - bibleCompletionPct / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-700">{bibleCompletionPct}%</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Bible Completion</p>
            <p className="text-gray-500 text-sm">{stats.versesRead.toLocaleString()} of {TOTAL_BIBLE_VERSES.toLocaleString()} verses</p>
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{streak}-day streak</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={BookOpen} label="Books Read" value={`${stats.booksCompleted}/${TOTAL_BIBLE_BOOKS}`} color="bg-indigo-500" />
          <StatCard icon={TrendingUp} label="Chapters" value={stats.chaptersRead} color="bg-purple-500" />
          <StatCard icon={Star} label="Verses Read" value={stats.versesRead.toLocaleString()} color="bg-amber-500" />
          <StatCard icon={Trophy} label="Badges Earned" value={stats.badgesEarned} color="bg-green-500" />
        </div>

        {/* Milestones */}
        <h2 className="text-base font-bold text-gray-800 mb-3">🏅 Milestones</h2>
        <div className="grid grid-cols-1 gap-3 mb-6">
          {MILESTONES.map(m => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              current={getProgress(m.type)}
              unlocked={getProgress(m.type) >= m.requirement}
            />
          ))}
        </div>

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <>
            <h2 className="text-base font-bold text-gray-800 mb-3">📅 Recent Sessions</h2>
            <div className="space-y-2">
              {recentActivity.map((s, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{s.date || new Date(s.created_date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs text-gray-500">{s.chaptersRead || 0} chapters · {s.minutesSpent || 0} min</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}