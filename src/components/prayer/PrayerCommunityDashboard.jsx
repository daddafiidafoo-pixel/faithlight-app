import React, { useMemo } from 'react';
import { Heart, TrendingUp, CheckCircle, Users, BarChart2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
  health: '#ef4444',
  family: '#f59e0b',
  faith: '#6c5ce7',
  work: '#3b82f6',
  relationships: '#ec4899',
  gratitude: '#22c55e',
  other: '#9ca3af',
};

export default function PrayerCommunityDashboard({ posts, onClose }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    const postsThisMonth = posts.filter(p => p.created_date?.startsWith(thisMonth));
    const totalPrayers = posts.reduce((sum, p) => sum + (p.prayedCount || 0), 0);
    const prayersThisMonth = postsThisMonth.reduce((sum, p) => sum + (p.prayedCount || 0), 0);
    const answered = posts.filter(p => p.status === 'answered').length;
    const answeredThisMonth = postsThisMonth.filter(p => p.status === 'answered').length;

    // Category breakdown
    const catMap = {};
    posts.forEach(p => {
      if (!p.category || p.category === 'all') return;
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const categoryData = Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Daily prayers this month (last 7 days)
    const daily = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      daily[key] = { label, count: 0 };
    }
    posts.forEach(p => {
      const day = p.created_date?.slice(0, 10);
      if (day && daily[day]) daily[day].count++;
    });
    const dailyData = Object.values(daily);

    return {
      totalPosts: posts.length,
      postsThisMonth: postsThisMonth.length,
      totalPrayers,
      prayersThisMonth,
      answered,
      answeredThisMonth,
      categoryData,
      dailyData,
      topCategory: categoryData[0]?.name || '—',
    };
  }, [posts]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BarChart2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Community Dashboard</h2>
              <p className="text-xs text-gray-400">Prayer trends & insights</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Heart size={16} className="text-rose-500" fill="currentColor" />}
              label="Prayers This Month"
              value={stats.prayersThisMonth}
              sub={`${stats.totalPrayers} total`}
              color="rose"
            />
            <StatCard
              icon={<CheckCircle size={16} className="text-green-500" />}
              label="Answered This Month"
              value={stats.answeredThisMonth}
              sub={`${stats.answered} total`}
              color="green"
            />
            <StatCard
              icon={<Users size={16} className="text-indigo-500" />}
              label="Requests This Month"
              value={stats.postsThisMonth}
              sub={`${stats.totalPosts} total`}
              color="indigo"
            />
            <StatCard
              icon={<TrendingUp size={16} className="text-amber-500" />}
              label="Top Category"
              value={stats.topCategory}
              sub="most requested"
              color="amber"
              isText
            />
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Prayer Requests — Last 7 Days</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={stats.dailyData} barSize={20}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Requests">
                  {stats.dailyData.map((_, i) => (
                    <Cell key={i} fill="#6c5ce7" opacity={0.7 + (i / stats.dailyData.length) * 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          {stats.categoryData.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">By Category</p>
              <div className="space-y-2">
                {stats.categoryData.map(({ name, count }) => {
                  const pct = Math.round((count / stats.totalPosts) * 100);
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-20 capitalize flex-shrink-0">{name}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[name] || '#9ca3af' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Answer Rate */}
          {stats.totalPosts > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-green-600">
                  {Math.round((stats.answered / stats.totalPosts) * 100)}%
                </span>
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Answer Rate</p>
                <p className="text-xs text-green-600">{stats.answered} of {stats.totalPosts} prayers answered</p>
                <p className="text-xs text-gray-400 mt-0.5">Keep praying together 🙏</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, isText }) {
  const bgMap = { rose: 'bg-rose-50', green: 'bg-green-50', indigo: 'bg-indigo-50', amber: 'bg-amber-50' };
  return (
    <div className={`${bgMap[color]} rounded-2xl p-3`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className={`font-bold text-gray-900 ${isText ? 'text-base capitalize' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}