import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Star, Clock, TrendingUp } from 'lucide-react';

const CATEGORY_COLORS = {
  health: '#EF4444',
  family: '#F59E0B',
  faith: '#6366F1',
  work: '#3B82F6',
  relationships: '#EC4899',
  gratitude: '#22C55E',
  finances: '#8B5CF6',
  other: '#9CA3AF',
};

const CATEGORY_EMOJIS = {
  health: '🏥', family: '👨‍👩‍👧', faith: '✝️', work: '💼',
  relationships: '❤️', gratitude: '🙏', finances: '💰', other: '📝',
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months >= 1) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function PrayerAnalyticsDashboard({ prayers = [] }) {
  const stats = useMemo(() => {
    const total = prayers.length;
    const answered = prayers.filter(p => p.status === 'answered').length;
    const active = prayers.filter(p => p.status === 'active').length;

    // Category breakdown
    const catCount = {};
    prayers.forEach(p => {
      const cat = p.category || 'other';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const categoryData = Object.entries(catCount)
      .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#9CA3AF' }))
      .sort((a, b) => b.value - a.value);

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = prayers.filter(p => {
        const pd = new Date(p.created_date);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).length;
      return { month: label, prayers: count };
    });

    // Memory lane: answered prayers older than 30 days
    const memoryLane = prayers
      .filter(p => p.status === 'answered' && p.answerDate)
      .filter(p => Date.now() - new Date(p.answerDate).getTime() > 30 * 86400000)
      .sort((a, b) => new Date(a.answerDate) - new Date(b.answerDate))
      .slice(0, 5);

    return { total, answered, active, categoryData, monthlyData, memoryLane };
  }, [prayers]);

  if (prayers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="font-semibold text-gray-500">No prayer data yet</p>
        <p className="text-sm text-gray-400 mt-1">Add prayers to see your analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-indigo-600">{stats.total}</p>
          <p className="text-xs text-indigo-500 font-semibold mt-0.5">Total Prayers</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-600">{stats.answered}</p>
          <p className="text-xs text-green-500 font-semibold mt-0.5">Answered</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-amber-600">{stats.active}</p>
          <p className="text-xs text-amber-500 font-semibold mt-0.5">Active</p>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> Prayer Activity (6 months)
        </h3>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={stats.monthlyData} barSize={22}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              cursor={{ fill: '#EEF2FF' }}
            />
            <Bar dataKey="prayers" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      {stats.categoryData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Most Prayed Categories
          </h3>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={stats.categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} strokeWidth={0}>
                  {stats.categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.categoryData.slice(0, 5).map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-sm">{CATEGORY_EMOJIS[cat.name] || '📝'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-semibold text-gray-700 capitalize">{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(cat.value / stats.total) * 100}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Memory Lane */}
      {stats.memoryLane.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Memory Lane ✨
          </h3>
          <p className="text-xs text-amber-700 mb-4">Prayers God answered in the past</p>
          <div className="space-y-3">
            {stats.memoryLane.map(p => (
              <div key={p.id} className="bg-white/80 rounded-xl p-3 border border-amber-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">✅ {p.title}</p>
                    {p.answerNotes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.answerNotes}</p>}
                  </div>
                  <span className="text-xs text-amber-600 font-semibold flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{timeAgo(p.answerDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}