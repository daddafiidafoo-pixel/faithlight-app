import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy, Users, CheckCircle, Star, Medal, Target, Calendar, Zap, ChevronRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Config ─────────────────────────────────────────────────────────────────
const MARATHONS = [
  {
    id: 'm7', days: 7, title: '7-Day Sprint', subtitle: 'Genesis Overview', emoji: '🌱',
    color: '#10b981', gradient: 'from-emerald-500 to-teal-500',
    description: 'A focused week through the foundational stories of Genesis 1–7.',
    readings: ['Genesis 1', 'Genesis 2', 'Genesis 3', 'Genesis 4-5', 'Genesis 6', 'Genesis 7', 'Reflection Day'],
    badge: { id: 'marathon_7', name: '7-Day Finisher', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
    xp: 150,
  },
  {
    id: 'm21', days: 21, title: '21-Day Journey', subtitle: 'Psalms & Proverbs', emoji: '📖',
    color: '#6c5ce7', gradient: 'from-indigo-500 to-purple-600',
    description: '21 carefully selected Psalms and Proverbs to build a wisdom-centered life.',
    readings: Array.from({ length: 21 }, (_, i) => `Day ${i + 1} Reading`),
    badge: { id: 'marathon_21', name: '21-Day Seeker', icon: '📖', color: 'bg-indigo-100 text-indigo-700' },
    xp: 400,
  },
  {
    id: 'm40', days: 40, title: '40-Day Deep Dive', subtitle: 'Gospels of Mark & John', emoji: '✝️',
    color: '#f59e0b', gradient: 'from-amber-500 to-orange-500',
    description: 'Follow Jesus through Mark\'s action-packed gospel and John\'s theological depth.',
    readings: Array.from({ length: 40 }, (_, i) => `Day ${i + 1} Reading`),
    badge: { id: 'marathon_40', name: '40-Day Champion', icon: '✝️', color: 'bg-amber-100 text-amber-700' },
    xp: 900,
  },
];

const STORAGE_BASE = 'fl_marathon_';
const XP_KEY = 'fl_xp_data';
const FAMILY_KEY = 'fl_family_group';

function getMarathonData(id) {
  try { return JSON.parse(localStorage.getItem(STORAGE_BASE + id) || 'null'); } catch { return null; }
}
function saveMarathonData(id, d) { localStorage.setItem(STORAGE_BASE + id, JSON.stringify(d)); }

function addXP(amount, label) {
  const d = JSON.parse(localStorage.getItem(XP_KEY) || '{}');
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(XP_KEY, JSON.stringify({
    ...d, totalXP: (d.totalXP || 0) + amount,
    log: [{ action: 'marathon', xp: amount, label, at: today }, ...(d.log || [])].slice(0, 30),
  }));
}

function unlockBadge(badge) {
  const key = 'fl_xp_data';
  const d = JSON.parse(localStorage.getItem(key) || '{}');
  const badges = d.badges || [];
  if (!badges.find(b => b.id === badge.id)) {
    localStorage.setItem(key, JSON.stringify({ ...d, badges: [...badges, { ...badge, unlockedAt: new Date().toISOString() }] }));
  }
}

// Ring progress visualization
function RingProgress({ pct, color, size = 80, stroke = 8, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// Day grid visualization
function DayGrid({ days, completed, color }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {Array.from({ length: days }, (_, i) => (
        <div key={i} className="w-5 h-5 rounded-md flex items-center justify-center text-xs transition-all"
          style={{
            backgroundColor: i < completed ? color : '#f3f4f6',
            color: i < completed ? 'white' : '#d1d5db',
          }}>
          {i < completed ? '✓' : ''}
        </div>
      ))}
    </div>
  );
}

// Leaderboard mock (family + community)
function buildLeaderboard(marathonId, myName, myDays) {
  const mock = [
    { name: 'Samuel A.', days: Math.floor(Math.random() * 10) + 5, avatar: '🙏', isFamily: true },
    { name: 'Grace M.', days: Math.floor(Math.random() * 8) + 3, avatar: '✝️', isFamily: false },
    { name: 'James K.', days: Math.floor(Math.random() * 6) + 2, avatar: '📖', isFamily: true },
    { name: 'Emma R.', days: Math.floor(Math.random() * 5) + 1, avatar: '🌟', isFamily: false },
  ];
  const family = JSON.parse(localStorage.getItem(FAMILY_KEY) || 'null');
  const me = { name: myName || 'You', days: myDays, avatar: '⭐', isMe: true, isFamily: !!family };
  return [...mock, me].sort((a, b) => b.days - a.days).slice(0, 6);
}

export default function BibleMarathon() {
  const [user, setUser] = useState(null);
  const [selectedMarathon, setSelectedMarathon] = useState(null);
  const [marathonStates, setMarathonStates] = useState({});
  const [tab, setTab] = useState('challenges'); // challenges | active | badges
  const [toast, setToast] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    const states = {};
    MARATHONS.forEach(m => { const d = getMarathonData(m.id); if (d) states[m.id] = d; });
    setMarathonStates(states);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const joinMarathon = (marathon) => {
    const data = { id: marathon.id, startedAt: new Date().toISOString(), completedDays: 0, lastCheckIn: null, completed: false };
    saveMarathonData(marathon.id, data);
    setMarathonStates(s => ({ ...s, [marathon.id]: data }));
    addXP(20, `Joined ${marathon.title}`);
    showToast(`🎉 Joined ${marathon.title}! +20 XP`);
    setTab('active');
  };

  const checkIn = async (marathon) => {
    const state = marathonStates[marathon.id];
    if (!state) return;
    const today = new Date().toISOString().split('T')[0];
    if (state.lastCheckIn === today) { showToast('Already checked in today! Come back tomorrow 🌅'); return; }
    setCheckingIn(marathon.id);
    await new Promise(r => setTimeout(r, 600));
    const newDays = (state.completedDays || 0) + 1;
    const completed = newDays >= marathon.days;
    const updated = { ...state, completedDays: newDays, lastCheckIn: today, completed };
    saveMarathonData(marathon.id, updated);
    setMarathonStates(s => ({ ...s, [marathon.id]: updated }));
    const xpEarned = completed ? marathon.xp : Math.round(marathon.xp / marathon.days);
    addXP(xpEarned, `Day ${newDays} — ${marathon.title}`);
    if (completed) { unlockBadge(marathon.badge); showToast(`🏆 COMPLETED! ${marathon.badge.name} badge unlocked! +${marathon.xp} XP`); }
    else showToast(`✅ Day ${newDays}/${marathon.days} complete! +${xpEarned} XP`);
    setCheckingIn(null);
  };

  const activeMarathons = MARATHONS.filter(m => marathonStates[m.id] && !marathonStates[m.id]?.completed);
  const completedMarathons = MARATHONS.filter(m => marathonStates[m.id]?.completed);
  const allBadges = JSON.parse(localStorage.getItem(XP_KEY) || '{}').badges || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-700 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm text-center max-w-xs">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 pt-6 pb-8 text-white">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Flame size={22} /> Bible Reading Marathons</h1>
          <p className="text-indigo-200 text-sm mt-1">7, 21 & 40-day reading challenges with badges and leaderboards</p>
          <div className="flex gap-3 mt-4">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{activeMarathons.length}</p>
              <p className="text-xs text-indigo-200">Active</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{completedMarathons.length}</p>
              <p className="text-xs text-indigo-200">Completed</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allBadges.filter(b => b.id?.startsWith('marathon')).length}</p>
              <p className="text-xs text-indigo-200">Badges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-3">
        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-5 gap-1 shadow-sm">
          {[['challenges', '🏁 Challenges'], ['active', `🔥 My Progress${activeMarathons.length ? ` (${activeMarathons.length})` : ''}`], ['badges', '🏅 Badges']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>

        {/* Challenges tab */}
        {tab === 'challenges' && (
          <div className="space-y-4">
            {MARATHONS.map(m => {
              const state = marathonStates[m.id];
              const isJoined = !!state;
              const pct = state ? Math.round((state.completedDays / m.days) * 100) : 0;
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${m.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <RingProgress pct={isJoined ? pct : 0} color={m.color} size={72} stroke={7}>
                        <span className="text-2xl">{m.emoji}</span>
                      </RingProgress>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-900">{m.title}</p>
                            <p className="text-xs text-gray-500">{m.subtitle} · {m.days} days</p>
                          </div>
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold flex-shrink-0">+{m.xp} XP</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{m.description}</p>
                        {isJoined && <DayGrid days={Math.min(m.days, 35)} completed={state.completedDays} color={m.color} />}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {isJoined ? (
                        <>
                          <button onClick={() => checkIn(m)} disabled={checkingIn === m.id || state.completed}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                            style={{ backgroundColor: state.completed ? '#10b981' : m.color }}>
                            {checkingIn === m.id ? '…' : state.completed ? '✅ Completed!' : `Check In Day ${(state.completedDays || 0) + 1}`}
                          </button>
                          <button onClick={() => { setSelectedMarathon(m); setLeaderboard(buildLeaderboard(m.id, user?.full_name, state.completedDays)); }}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold">
                            <Trophy size={15} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => joinMarathon(m)}
                          className="w-full py-2.5 rounded-xl text-white font-bold text-sm"
                          style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)` }}>
                          Join Marathon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Active progress tab */}
        {tab === 'active' && (
          <div className="space-y-5">
            {activeMarathons.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Target size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active marathons. Join one above!</p>
                <button onClick={() => setTab('challenges')} className="mt-3 text-indigo-600 text-sm font-semibold">Browse Challenges →</button>
              </div>
            )}
            {[...activeMarathons, ...completedMarathons].map(m => {
              const state = marathonStates[m.id];
              const pct = Math.round((state.completedDays / m.days) * 100);
              const lb = buildLeaderboard(m.id, user?.full_name, state.completedDays);
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{m.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-400">{state.completedDays}/{m.days} days · {pct}% complete</p>
                    </div>
                    {state.completed && <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">✅ Done</span>}
                  </div>
                  {/* Progress bar */}
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                  </div>
                  {/* Day grid */}
                  <DayGrid days={Math.min(m.days, 40)} completed={state.completedDays} color={m.color} />
                  {/* Mini leaderboard */}
                  <div className="mt-4 border-t border-gray-50 pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Trophy size={11} /> Leaderboard</p>
                    <div className="space-y-1.5">
                      {lb.slice(0, 4).map((entry, i) => (
                        <div key={i} className={`flex items-center gap-2 py-1.5 px-2 rounded-xl ${entry.isMe ? 'bg-indigo-50' : ''}`}>
                          <span className="text-sm w-5 text-center font-bold text-gray-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                          <span className="text-base">{entry.avatar}</span>
                          <span className={`text-xs flex-1 font-medium ${entry.isMe ? 'text-indigo-700' : 'text-gray-700'}`}>{entry.name} {entry.isFamily && <span className="text-indigo-400">👨‍👩‍👧</span>}</span>
                          <span className="text-xs font-bold" style={{ color: m.color }}>{entry.days}d</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Badges tab */}
        {tab === 'badges' && (
          <div>
            <p className="text-xs text-gray-500 mb-4">Badges earned from marathons appear on your Mentorship profile</p>
            <div className="grid grid-cols-3 gap-3">
              {MARATHONS.map(m => {
                const earned = allBadges.find(b => b.id === m.badge.id);
                return (
                  <div key={m.id} className={`rounded-2xl p-4 flex flex-col items-center gap-2 border text-center transition-all ${earned ? m.badge.color + ' border-transparent shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                    <span className={`text-3xl ${!earned ? 'grayscale' : ''}`}>{m.badge.icon}</span>
                    <p className="text-xs font-bold leading-tight">{m.badge.name}</p>
                    {earned ? (
                      <p className="text-xs opacity-70">{new Date(earned.unlockedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Complete {m.title}</p>
                    )}
                  </div>
                );
              })}
              {/* Also show any other marathon badges from XP store */}
              {allBadges.filter(b => !MARATHONS.find(m => m.badge.id === b.id)).map(b => (
                <div key={b.id} className="rounded-2xl p-4 flex flex-col items-center gap-2 bg-purple-50 border border-purple-100 text-center">
                  <span className="text-3xl">{b.icon}</span>
                  <p className="text-xs font-bold leading-tight">{b.name}</p>
                  <p className="text-xs text-purple-500">Earned</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}