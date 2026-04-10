/**
 * Growth Metrics Dashboard — Admin Only
 * ──────────────────────────────────────
 * Shows DAU, Day-1/7/30 retention, and viral sharing rate
 * derived from the AnalyticsEvent entity populated by logEvent().
 */
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Share2, Activity, RefreshCw, Lock } from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────
function dateKey(d) { return d.toISOString().slice(0, 10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

function buildDAUSeries(events, days = 14) {
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const k = dateKey(daysAgo(i));
    buckets[k] = new Set();
  }
  events.forEach(e => {
    const k = (e.created_date || '').slice(0, 10);
    if (buckets[k]) buckets[k].add(e.properties?.userId || e.created_by || 'anon');
  });
  return Object.entries(buckets).map(([date, set]) => ({
    date: date.slice(5), // MM-DD
    dau: set.size,
  }));
}

function buildRetention(events) {
  // Group install (APP_OPENED) sessions by user and date
  const userFirstSeen = {};
  const userActivity   = {};
  events.forEach(e => {
    const userId = e.properties?.userId || e.created_by || null;
    if (!userId) return;
    const day = (e.created_date || '').slice(0, 10);
    if (!userFirstSeen[userId] || day < userFirstSeen[userId]) userFirstSeen[userId] = day;
    if (!userActivity[userId]) userActivity[userId] = new Set();
    userActivity[userId].add(day);
  });

  const cohorts = Object.entries(userFirstSeen);
  const total   = cohorts.length;
  if (!total) return { d1: 0, d7: 0, d30: 0 };

  let d1 = 0, d7 = 0, d30 = 0;
  cohorts.forEach(([userId, firstDay]) => {
    const activity = userActivity[userId];
    const addDays = (n) => { const d = new Date(firstDay); d.setDate(d.getDate() + n); return dateKey(d); };
    if (activity.has(addDays(1))) d1++;
    if ([...Array(7)].some((_, i) => activity.has(addDays(i + 2)))) d7++;
    if ([...Array(30)].some((_, i) => activity.has(addDays(i + 2)))) d30++;
  });

  return {
    d1:  Math.round((d1  / total) * 100),
    d7:  Math.round((d7  / total) * 100),
    d30: Math.round((d30 / total) * 100),
  };
}

function buildShareSeries(events, days = 14) {
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    buckets[dateKey(daysAgo(i))] = 0;
  }
  events.forEach(e => {
    const k = (e.created_date || '').slice(0, 10);
    if (buckets[k] !== undefined) buckets[k]++;
  });
  return Object.entries(buckets).map(([date, shares]) => ({ date: date.slice(5), shares }));
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green:  'bg-green-50  text-green-700',
    amber:  'bg-amber-50  text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-[#E0E4E9] p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[#6B7280] text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#1F2937]">{value}</p>
      {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function GrowthMetricsDashboard() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents]   = useState([]);
  const [shareEvents, setShareEvents] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const load = async () => {
    setLoading(true);
    const since = daysAgo(30).toISOString();
    const [all, shares] = await Promise.all([
      base44.entities.AnalyticsEvent.filter({ created_date: { $gte: since } }, '-created_date', 5000).catch(() => []),
      base44.entities.AnalyticsEvent.filter({ eventName: 'verse_shared' }, '-created_date', 2000).catch(() => []),
    ]);
    setAllEvents(all || []);
    setShareEvents(shares || []);
    setLastRefresh(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  if (!user) return <div className="p-8 text-center text-[#6B7280]">Loading…</div>;

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[#1F2937] font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  const dauSeries     = buildDAUSeries(allEvents);
  const retention     = buildRetention(allEvents);
  const shareSeries   = buildShareSeries(shareEvents);
  const todayDAU      = dauSeries[dauSeries.length - 1]?.dau ?? 0;
  const totalUsers    = new Set(allEvents.map(e => e.created_by || e.properties?.userId).filter(Boolean)).size;
  const totalShares   = shareEvents.length;
  const sharesPerUser = totalUsers ? (totalShares / totalUsers).toFixed(2) : '0';

  const retentionData = [
    { label: 'Day 1', value: retention.d1, target: 40 },
    { label: 'Day 7', value: retention.d7, target: 25 },
    { label: 'Day 30', value: retention.d30, target: 12 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Growth Metrics</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">DAU · Retention · Viral Sharing — last 30 days</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E0E4E9] text-sm text-[#6B7280] hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {lastRefresh ? `Updated ${lastRefresh}` : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280]">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading analytics…
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Activity}   label="Today's DAU"       value={todayDAU}            sub="unique users today"        color="indigo" />
              <StatCard icon={Users}      label="Total Users (30d)" value={totalUsers}           sub="unique tracked users"      color="purple" />
              <StatCard icon={TrendingUp} label="Day-7 Retention"   value={`${retention.d7}%`}  sub={`Target: 25% · Day1: ${retention.d1}%`} color="green"  />
              <StatCard icon={Share2}     label="Shares / User"     value={sharesPerUser}        sub={`${totalShares} total shares`}            color="amber"  />
            </div>

            {/* DAU chart */}
            <div className="bg-white rounded-2xl border border-[#E0E4E9] p-5 shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-[#1F2937] mb-4">Daily Active Users — last 14 days</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dauSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="dau" name="DAU" fill="#6C5CE7" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Retention + Shares side by side */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* Retention */}
              <div className="bg-white rounded-2xl border border-[#E0E4E9] p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[#1F2937] mb-1">Retention</h2>
                <p className="text-xs text-[#9CA3AF] mb-4">% of users who returned after first session</p>
                <div className="space-y-4">
                  {retentionData.map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#6B7280]">{row.label}</span>
                        <span className="font-semibold text-[#1F2937]">{row.value}% <span className="text-[#9CA3AF] font-normal">/ target {row.target}%</span></span>
                      </div>
                      <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(row.value, 100)}%`,
                            background: row.value >= row.target ? '#22C55E' : '#F59E0B',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shares */}
              <div className="bg-white rounded-2xl border border-[#E0E4E9] p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[#1F2937] mb-4">Daily Verse Shares — last 14 days</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={shareSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="shares" name="Shares" stroke="#F4B400" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth formula reminder */}
            <div className="bg-[#EEEAFE] rounded-2xl p-5 text-sm text-[#5B4BD6]">
              <p className="font-semibold mb-1">🚀 Growth Formula</p>
              <p className="text-xs leading-relaxed opacity-80">
                DAU ≥ 20–30% of total users · Day-7 retention ≥ 25% · Shares / user ≥ 0.4 → sustainable organic growth loop.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}