import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Calendar, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STREAK_KEY = 'fl_reading_streak';
const BADGES = [
  { days: 3,   label: '3-Day Spark',      emoji: '✨', color: 'from-yellow-400 to-orange-400' },
  { days: 7,   label: 'Week Warrior',     emoji: '🔥', color: 'from-orange-400 to-red-500' },
  { days: 14,  label: '2-Week Champion',  emoji: '🏆', color: 'from-amber-400 to-yellow-500' },
  { days: 30,  label: 'Month of Faith',   emoji: '🌟', color: 'from-violet-500 to-purple-600' },
  { days: 60,  label: 'Faithful Servant', emoji: '👑', color: 'from-indigo-500 to-blue-600' },
  { days: 100, label: 'Century of Grace', emoji: '💎', color: 'from-teal-500 to-cyan-600' },
];

function getStreakData() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || 'null'); } catch { return null; }
}

function saveStreakData(d) { localStorage.setItem(STREAK_KEY, JSON.stringify(d)); }

function todayStr() { return new Date().toISOString().split('T')[0]; }

function initStreak() {
  const existing = getStreakData();
  if (existing) return existing;
  // Seed with some sample history
  const today = new Date();
  const days = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days[d.toISOString().split('T')[0]] = true;
  }
  const data = { days, currentStreak: 5, longestStreak: 5, lastRead: todayStr() };
  saveStreakData(data);
  return data;
}

function computeStreak(days) {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (days[key]) streak++;
    else break;
  }
  return streak;
}

// Generate last 35 days grid (5 weeks)
function getLast35Days(days) {
  const result = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({ key, date: d, read: !!days[key], isToday: i === 0 });
  }
  return result;
}

function BadgeModal({ badge, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-6xl mb-3">{badge.emoji}</div>
        <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${badge.color} text-white text-sm font-bold mb-3`}>
          {badge.days}-Day Badge
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{badge.label}</h3>
        <p className="text-slate-500 text-sm mb-5">You've read the Bible for {badge.days} consecutive days. Keep going!</p>
        <button onClick={onClose} className="w-full py-3 rounded-2xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors">
          Amazing! 🙏
        </button>
      </div>
    </div>
  );
}

export default function ReadingStreakWidget() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    setStreak(initStreak());
  }, []);

  if (!streak) return null;

  const currentStreak = computeStreak(streak.days);
  const earnedBadges = BADGES.filter(b => currentStreak >= b.days);
  const nextBadge = BADGES.find(b => currentStreak < b.days);
  const gridDays = getLast35Days(streak.days);

  const logReadingToday = () => {
    const today = todayStr();
    const updated = { ...streak, days: { ...streak.days, [today]: true }, lastRead: today };
    const newStreak = computeStreak(updated.days);
    updated.currentStreak = newStreak;
    updated.longestStreak = Math.max(streak.longestStreak || 0, newStreak);
    saveStreakData(updated);
    setStreak(updated);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };

  const alreadyReadToday = !!streak.days[todayStr()];

  return (
    <>
      {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-100 uppercase tracking-wide">Reading Streak</p>
                <p className="text-2xl font-black">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
              aria-label={showCalendar ? 'Hide reading calendar' : 'Show reading calendar'}
            >
              <Calendar className="w-4 h-4" />
              <ChevronRight className={`w-3 h-3 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {nextBadge && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-orange-100 mb-1">
                <span>Next: {nextBadge.emoji} {nextBadge.label}</span>
                <span>{currentStreak}/{nextBadge.days} days</span>
              </div>
              <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentStreak / nextBadge.days) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Calendar grid */}
        {showCalendar && (
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Last 35 Days</p>
            <div className="grid grid-cols-7 gap-1">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-xs text-slate-400 font-semibold pb-1">{d}</div>
              ))}
              {gridDays.map(({ key, read, isToday }) => (
                <div
                  key={key}
                  title={key}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all
                    ${isToday ? 'ring-2 ring-orange-400' : ''}
                    ${read ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-300'}`}
                >
                  {read ? '✓' : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges row */}
        {earnedBadges.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-50">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Earned Badges
            </p>
            <div className="flex gap-2 flex-wrap">
              {earnedBadges.map(badge => (
                <button
                  key={badge.days}
                  onClick={() => setSelectedBadge(badge)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity min-h-[44px]`}
                >
                  {badge.emoji} {badge.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="px-4 pb-4 pt-2 flex gap-2">
          {!alreadyReadToday ? (
            <button
              onClick={logReadingToday}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors min-h-[44px]"
            >
              {justLogged ? '🎉 Logged!' : '📖 Log Today\'s Reading'}
            </button>
          ) : (
            <div className="flex-1 py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold text-sm text-center border border-green-200 min-h-[44px] flex items-center justify-center">
              ✅ Read Today!
            </div>
          )}
          <button
            onClick={() => navigate('/BibleReaderPage')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            Read Bible
          </button>
        </div>
      </div>
    </>
  );
}