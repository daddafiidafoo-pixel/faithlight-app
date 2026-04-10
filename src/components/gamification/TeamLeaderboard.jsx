import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Users, BookOpen, Flame, Zap, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { key: 'total_points',   label: 'Total Points',       icon: Zap,      color: 'text-indigo-600' },
  { key: 'chapters_read',  label: 'Chapters This Month',icon: BookOpen, color: 'text-blue-600' },
  { key: 'avg_streak',     label: 'Avg Active Streak',  icon: Flame,    color: 'text-orange-500' },
];

const GROUP_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-green-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
];

function TeamRow({ group, rank, metrics, category }) {
  const score = metrics[category.key] || 0;
  const gradient = GROUP_COLORS[(group.name?.charCodeAt(0) || 0) % GROUP_COLORS.length];
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      medal ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' : 'bg-white border-gray-100 hover:border-gray-200'
    }`}>
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        {medal ? <span className="text-2xl">{medal}</span> : <span className="text-sm font-bold text-gray-400">#{rank}</span>}
      </div>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
        {(group.name || 'G').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{group.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400"><Users className="w-2.5 h-2.5 inline mr-0.5" />{group.member_count || 0} members</span>
          {group.focus_topic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">{group.focus_topic}</span>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`flex items-center gap-1 font-bold text-lg ${category.color}`}>
          <category.icon className="w-4 h-4" />
          {typeof score === 'number' ? score.toLocaleString() : score}
        </div>
        <p className="text-xs text-gray-400">{category.label}</p>
      </div>
    </div>
  );
}

function AISuggestion({ groups }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSuggestion = async () => {
    if (groups.length < 2) return;
    setLoading(true);
    try {
      const g1 = groups[0]; const g2 = groups[1];
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a community engagement AI for a Bible study app. Suggest a fun, faith-building team competition matchup between two study groups.
Group A: "${g1?.name}" (${g1?.member_count || 0} members, focus: ${g1?.focus_topic || 'General Bible Study'})
Group B: "${g2?.name}" (${g2?.member_count || 0} members, focus: ${g2?.focus_topic || 'General Bible Study'})
Suggest a specific week-long challenge these two groups could do together. Keep it encouraging and faith-focused. 2 sentences max.`,
      });
      setSuggestion(res);
    } catch { setSuggestion('These two groups would make a great match! Challenge each other to read 5 chapters this week.'); }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-purple-800">AI Matchup Suggester</span>
        </div>
        {suggestion ? (
          <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
        ) : (
          <p className="text-xs text-gray-500 mb-3">Let AI suggest the perfect team competition based on group engagement levels.</p>
        )}
        <Button
          size="sm"
          onClick={getSuggestion}
          disabled={loading || groups.length < 2}
          className="mt-2 bg-purple-600 hover:bg-purple-700 text-xs h-7"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
          {suggestion ? 'New Suggestion' : 'Suggest Matchup'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TeamLeaderboard() {
  const [activeCategory, setActiveCategory] = useState('total_points');
  const cat = CATEGORIES.find(c => c.key === activeCategory);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['team-leaderboard'],
    queryFn: async () => {
      try {
        const allGroups = await base44.entities.Group.filter({ privacy: 'public' }, '-member_count', 20);
        if (!allGroups?.length) return [];

        // Fetch member points for each group (aggregated)
        const withMetrics = await Promise.all(
          allGroups.slice(0, 15).map(async (g) => {
            try {
              const members = await base44.entities.GroupMember.filter({ group_id: g.id }, '-created_date', 50);
              const memberIds = members.map(m => m.user_id);
              if (!memberIds.length) return { group: g, metrics: { total_points: 0, chapters_read: 0, avg_streak: 0 } };

              const pointsData = await Promise.all(
                memberIds.slice(0, 10).map(uid =>
                  base44.entities.UserPoints.filter({ user_id: uid }, null, 1).then(r => r?.[0]).catch(() => null)
                )
              );
              const valid = pointsData.filter(Boolean);
              const totalPts = valid.reduce((s, p) => s + (p.total_points || 0), 0);
              const totalChapters = valid.reduce((s, p) => s + (p.chapters_read || 0), 0);

              const streakData = await Promise.all(
                memberIds.slice(0, 10).map(uid =>
                  base44.entities.UserStreak.filter({ user_id: uid }, null, 1).then(r => r?.[0]).catch(() => null)
                )
              );
              const validStreaks = streakData.filter(Boolean);
              const avgStreak = validStreaks.length
                ? Math.round(validStreaks.reduce((s, st) => s + (st.current_streak || 0), 0) / validStreaks.length)
                : 0;

              return {
                group: g,
                metrics: { total_points: totalPts, chapters_read: totalChapters, avg_streak: avgStreak },
              };
            } catch { return { group: g, metrics: { total_points: 0, chapters_read: 0, avg_streak: 0 } }; }
          })
        );
        return withMetrics;
      } catch { return []; }
    },
    retry: false,
    staleTime: 120000,
  });

  const sorted = [...groups].sort((a, b) => (b.metrics[activeCategory] || 0) - (a.metrics[activeCategory] || 0));

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-teal-600 shadow-lg mb-3">
          <Users className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Team Leaderboard</h2>
        <p className="text-gray-500 text-sm mt-1">Study groups compete for community glory</p>
      </div>

      {/* Category switcher */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeCategory === c.key
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No groups yet. Create one to compete!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.slice(0, 15).map((item, i) => (
            <TeamRow key={item.group.id} group={item.group} rank={i + 1} metrics={item.metrics} category={cat} />
          ))}
        </div>
      )}

      <AISuggestion groups={sorted.slice(0, 3).map(s => s.group)} />
    </div>
  );
}