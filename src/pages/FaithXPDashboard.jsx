import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Star, Trophy, BookOpen, Heart, Zap, Award, ChevronRight, Target, Calendar } from 'lucide-react';

// ── XP Config ────────────────────────────────────────────────────────────────
const XP_ACTIONS = [
  { id: 'read', label: 'Read a chapter', xp: 10, icon: '📖' },
  { id: 'prayer', label: 'Logged a prayer', xp: 15, icon: '🙏' },
  { id: 'quiz', label: 'Completed a quiz', xp: 20, icon: '🧠' },
  { id: 'study', label: 'Finished a study day', xp: 25, icon: '📚' },
  { id: 'share', label: 'Shared a verse', xp: 5, icon: '💬' },
  { id: 'streak', label: '7-day streak bonus', xp: 50, icon: '🔥' },
];

const BADGES = [
  { id: 'first_read', name: 'First Steps', icon: '👣', desc: 'Read your first chapter', xpRequired: 10, color: 'bg-blue-100 text-blue-700' },
  { id: 'prayer_warrior', name: 'Prayer Warrior', icon: '🙏', desc: 'Log 10 prayers', xpRequired: 150, color: 'bg-purple-100 text-purple-700' },
  { id: 'streak_7', name: 'Week Streak', icon: '🔥', desc: '7-day reading streak', xpRequired: 200, color: 'bg-orange-100 text-orange-700' },
  { id: 'scholar', name: 'Bible Scholar', icon: '📚', desc: 'Complete 3 study plans', xpRequired: 500, color: 'bg-green-100 text-green-700' },
  { id: 'community', name: 'Community Builder', icon: '🌍', desc: 'Share 20 verses', xpRequired: 300, color: 'bg-teal-100 text-teal-700' },
  { id: 'champion', name: 'Faith Champion', icon: '🏆', desc: 'Reach 1000 XP', xpRequired: 1000, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'consistent', name: 'Consistent Heart', icon: '💜', desc: '30-day streak', xpRequired: 750, color: 'bg-pink-100 text-pink-700' },
  { id: 'devoted', name: 'Devoted Soul', icon: '✝️', desc: 'Reach 2000 XP', xpRequired: 2000, color: 'bg-indigo-100 text-indigo-700' },
];

const LEVELS = [
  { level: 1, title: 'Seeker', minXP: 0, maxXP: 100, color: '#94a3b8' },
  { level: 2, title: 'Disciple', minXP: 100, maxXP: 300, color: '#60a5fa' },
  { level: 3, title: 'Faithful', minXP: 300, maxXP: 600, color: '#34d399' },
  { level: 4, title: 'Devoted', minXP: 600, maxXP: 1000, color: '#a78bfa' },
  { level: 5, title: 'Scholar', minXP: 1000, maxXP: 1500, color: '#f59e0b' },
  { level: 6, title: 'Apostle', minXP: 1500, maxXP: 2500, color: '#f97316' },
  { level: 7, title: 'Champion', minXP: 2500, maxXP: 999999, color: '#ec4899' },
];

// Mock leaderboard — in production pull from UserStats entity
const MOCK_LEADERBOARD = [
  { name: 'Samuel A.', xp: 1840, streak: 22, avatar: '🙏' },
  { name: 'Grace M.', xp: 1620, streak: 18, avatar: '✝️' },
  { name: 'Daniel K.', xp: 1440, streak: 15, avatar: '📖' },
  { name: 'Miriam T.', xp: 1200, streak: 12, avatar: '🌟' },
  { name: 'Joshua W.', xp: 980, streak: 9, avatar: '🔥' },
];

const XP_KEY = 'fl_xp_data';

function getXPData() {
  try { return JSON.parse(localStorage.getItem(XP_KEY) || 'null') || { totalXP: 0, log: [], streak: 0, lastDate: null, completedPlans: 0 }; } catch { return { totalXP: 0, log: [], streak: 0, lastDate: null, completedPlans: 0 }; }
}

function saveXPData(d) { localStorage.setItem(XP_KEY, JSON.stringify(d)); }

function getLevel(xp) {
  return LEVELS.slice().reverse().find(l => xp >= l.minXP) || LEVELS[0];
}

function XPBar({ xp }) {
  const lvl = getLevel(xp);
  const next = LEVELS.find(l => l.minXP > xp) || lvl;
  const pct = lvl.maxXP === 999999 ? 100 : Math.min(100, ((xp - lvl.minXP) / (lvl.maxXP - lvl.minXP)) * 100);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{lvl.title} · Lv.{lvl.level}</span>
        <span>{xp} / {lvl.maxXP === 999999 ? '∞' : lvl.maxXP} XP</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: lvl.color }} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`flex-1 min-w-0 rounded-2xl p-4 flex flex-col items-center gap-1 ${color}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-600 text-center">{label}</span>
    </div>
  );
}

export default function FaithXPDashboard() {
  const [xpData, setXPData] = useState(getXPData);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview');
  const [earned, setEarned] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const data = getXPData();
    if (data.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = data.lastDate === yesterday ? (data.streak || 0) + 1 : 1;
      const updated = { ...data, streak: newStreak, lastDate: today };
      if (newStreak % 7 === 0) {
        updated.totalXP = (updated.totalXP || 0) + 50;
        updated.log = [{ action: 'streak', xp: 50, at: today }, ...(updated.log || [])].slice(0, 20);
      }
      saveXPData(updated);
      setXPData(updated);
    }
  }, []);

  const earnXP = (action) => {
    const data = getXPData();
    const today = new Date().toISOString().split('T')[0];
    // Allow each action once per day
    const alreadyToday = (data.log || []).some(l => l.action === action.id && l.at === today);
    if (alreadyToday) { setEarned({ msg: 'Already earned today!', xp: 0 }); setTimeout(() => setEarned(null), 2000); return; }
    const updated = {
      ...data,
      totalXP: (data.totalXP || 0) + action.xp,
      log: [{ action: action.id, xp: action.xp, at: today }, ...(data.log || [])].slice(0, 30),
    };
    saveXPData(updated);
    setXPData(updated);
    setEarned({ msg: `+${action.xp} XP — ${action.label}!`, xp: action.xp });
    setTimeout(() => setEarned(null), 2500);
  };

  const level = getLevel(xpData.totalXP || 0);
  const unlockedBadges = BADGES.filter(b => (xpData.totalXP || 0) >= b.xpRequired);
  const lockedBadges = BADGES.filter(b => (xpData.totalXP || 0) < b.xpRequired);

  // Insert user into leaderboard for display
  const myEntry = { name: user?.full_name || 'You', xp: xpData.totalXP || 0, streak: xpData.streak || 0, avatar: '⭐', isMe: true };
  const leaderboard = [...MOCK_LEADERBOARD, myEntry].sort((a, b) => b.xp - a.xp).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* XP Toast */}
      {earned && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg font-bold text-sm animate-bounce">
          {earned.msg}
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900">Faith XP</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">Earn points for daily spiritual habits</p>

        {/* Level Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-5 mb-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Current Level</p>
              <p className="text-3xl font-bold">{level.title}</p>
            </div>
            <div className="text-5xl">🏅</div>
          </div>
          <XPBar xp={xpData.totalXP || 0} />
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mb-5">
          <StatCard icon="🔥" label="Day Streak" value={xpData.streak || 0} color="bg-orange-50" />
          <StatCard icon="⭐" label="Total XP" value={(xpData.totalXP || 0).toLocaleString()} color="bg-yellow-50" />
          <StatCard icon="🏆" label="Badges" value={unlockedBadges.length} color="bg-purple-50" />
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-5 gap-1">
          {[['overview', 'Earn XP'], ['badges', 'Badges'], ['leaderboard', 'Leaderboard']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
            >{label}</button>
          ))}
        </div>

        {/* Earn XP Tab */}
        {tab === 'overview' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 mb-2">Tap an action to log it and earn XP (once per day each)</p>
            {XP_ACTIONS.map(action => {
              const today = new Date().toISOString().split('T')[0];
              const done = (xpData.log || []).some(l => l.action === action.id && l.at === today);
              return (
                <button key={action.id} onClick={() => earnXP(action)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${done ? 'bg-green-50 border-green-200 opacity-80' : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'}`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                    {done && <p className="text-xs text-green-600 font-medium">✓ Earned today</p>}
                  </div>
                  <span className={`font-bold text-sm ${done ? 'text-green-600' : 'text-indigo-600'}`}>+{action.xp} XP</span>
                </button>
              );
            })}

            {/* Recent log */}
            {xpData.log?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-2">
                <p className="text-xs font-semibold text-gray-700 mb-3">Recent Activity</p>
                <div className="space-y-2">
                  {xpData.log.slice(0, 5).map((l, i) => {
                    const action = XP_ACTIONS.find(a => a.id === l.action);
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{action?.icon} {action?.label || l.action}</span>
                        <span className="text-indigo-600 font-semibold">+{l.xp} XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {tab === 'badges' && (
          <div>
            {unlockedBadges.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-700 mb-3">🏅 Unlocked ({unlockedBadges.length})</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {unlockedBadges.map(b => (
                    <div key={b.id} className={`${b.color} rounded-2xl p-4 flex flex-col items-center gap-2 border border-white`}>
                      <span className="text-3xl">{b.icon}</span>
                      <p className="font-bold text-sm text-center">{b.name}</p>
                      <p className="text-xs text-center opacity-80">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {lockedBadges.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-500 mb-3">🔒 Locked ({lockedBadges.length})</p>
                <div className="grid grid-cols-2 gap-3">
                  {lockedBadges.map(b => (
                    <div key={b.id} className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-60">
                      <span className="text-3xl grayscale">{b.icon}</span>
                      <p className="font-bold text-sm text-gray-700 text-center">{b.name}</p>
                      <p className="text-xs text-gray-500 text-center">{b.xpRequired} XP needed</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === 'leaderboard' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">Community Faith XP rankings this month</p>
            {leaderboard.map((entry, i) => (
              <div key={i}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${entry.isMe ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-100'}`}
              >
                <span className="text-lg font-bold text-gray-400 w-6 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <span className="text-2xl">{entry.avatar}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${entry.isMe ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {entry.name} {entry.isMe && <span className="text-xs">(you)</span>}
                  </p>
                  <p className="text-xs text-gray-500">🔥 {entry.streak}-day streak</p>
                </div>
                <span className="font-bold text-indigo-600">{entry.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}