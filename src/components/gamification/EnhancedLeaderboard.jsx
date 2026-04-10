import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Trophy, Flame, BookOpen, Star, Users, Zap, Award } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';

const RANK_CONFIG = [
  { min: 10000, name: 'Legendary', color: 'text-purple-600', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', badge: '👑' },
  { min: 5000,  name: 'Master',    color: 'text-blue-700',   bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', badge: '⭐' },
  { min: 1000,  name: 'Scholar',   color: 'text-green-700',  bg: 'from-green-50 to-emerald-50', border: 'border-green-200', badge: '📖' },
  { min: 500,   name: 'Faithful',  color: 'text-amber-700',  bg: 'from-amber-50 to-yellow-50',  border: 'border-amber-200', badge: '🌟' },
  { min: 100,   name: 'Growing',   color: 'text-orange-600', bg: 'from-orange-50 to-amber-50',  border: 'border-orange-200', badge: '🌱' },
  { min: 0,     name: 'Seeker',    color: 'text-gray-600',   bg: 'from-gray-50 to-slate-50',    border: 'border-gray-200', badge: '🔍' },
];

function getRank(pts) {
  return RANK_CONFIG.find(r => (pts || 0) >= r.min) || RANK_CONFIG[RANK_CONFIG.length - 1];
}

function getMedal(rank) {
  if (rank === 1) return { emoji: '🥇', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
  if (rank === 2) return { emoji: '🥈', color: 'text-gray-500 bg-gray-50 border-gray-200' };
  if (rank === 3) return { emoji: '🥉', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  return null;
}

function LeaderRow({ entry, rank, currentUserId, field, label, icon: Icon, color }) {
  const medal = getMedal(rank);
  const rankInfo = getRank(entry.total_points || 0);
  const isMe = entry.user_id === currentUserId;
  const value = entry[field] || 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      isMe
        ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
        : medal
          ? `bg-gradient-to-r ${rankInfo.bg} ${rankInfo.border} border`
          : 'bg-white border-gray-100 hover:border-gray-200'
    }`}>
      {/* Rank */}
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        {medal ? (
          <span className="text-2xl">{medal.emoji}</span>
        ) : (
          <span className="text-sm font-bold text-gray-400">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {(entry.user?.full_name || 'U').charAt(0).toUpperCase()}
      </div>

      {/* Name & Rank */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {entry.user?.full_name || 'Faithful Reader'}
            {isMe && <span className="ml-1 text-indigo-600 font-normal">(you)</span>}
          </p>
          <span className={`text-xs font-medium ${rankInfo.color}`}>{rankInfo.badge} {rankInfo.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
          <span>{entry.total_points?.toLocaleString() || 0} pts</span>
          {entry.current_streak > 0 && <span>🔥 {entry.current_streak}d streak</span>}
        </div>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <div className={`flex items-center gap-1 font-bold text-lg ${color}`}>
          <Icon className="w-4 h-4" />
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function LeaderTab({ timeframe, currentUserId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard-v2', timeframe],
    queryFn: async () => {
      try {
        const allPoints = await base44.entities.UserPoints.filter({}, '-total_points', 50);
        if (!allPoints?.length) return [];

        // For streaks leaderboard
        const allStreaks = await base44.entities.UserStreak.filter({}, '-current_streak', 50).catch(() => []);
        const streakMap = Object.fromEntries((allStreaks || []).map(s => [s.user_id, s]));

        const userDetails = await Promise.all(
          allPoints.slice(0, 30).map(p =>
            base44.entities.User.filter({ id: p.user_id }, null, 1)
              .then(u => u?.[0])
              .catch(() => null)
          )
        );

        return allPoints.slice(0, 30).map((p, i) => ({
          ...p,
          user: userDetails[i],
          current_streak: streakMap[p.user_id]?.current_streak || 0,
        }));
      } catch { return []; }
    },
    retry: false,
    staleTime: 60000,
  });

  const CATEGORIES = [
    { key: 'total_points',       label: 'Points',     icon: Zap,      color: 'text-indigo-600' },
    { key: 'chapters_read',      label: 'Chapters',   icon: BookOpen, color: 'text-blue-600' },
    { key: 'current_streak',     label: 'Day Streak', icon: Flame,    color: 'text-orange-500' },
    { key: 'badges_earned',      label: 'Badges',     icon: Award,    color: 'text-amber-600' },
  ];

  const [activeCategory, setActiveCategory] = useState('total_points');
  const cat = CATEGORIES.find(c => c.key === activeCategory);

  const sorted = [...(data || [])].sort((a, b) => (b[activeCategory] || 0) - (a[activeCategory] || 0));

  return (
    <div className="space-y-4">
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
          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No data yet. Start your journey!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.slice(0, 20).map((entry, i) => (
            <LeaderRow
              key={entry.user_id || i}
              entry={entry}
              rank={i + 1}
              currentUserId={currentUserId}
              field={activeCategory}
              label={cat.label}
              icon={cat.icon}
              color={cat.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EnhancedLeaderboard({ currentUserId }) {
  const totalCommunity = 0; // placeholder

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Community Leaderboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Celebrate progress in reading, learning & community</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow">All Time</TabsTrigger>
          <TabsTrigger value="week" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow">This Week</TabsTrigger>
          <TabsTrigger value="day" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow">Today</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <LeaderTab timeframe="all" currentUserId={currentUserId} />
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          <LeaderTab timeframe="week" currentUserId={currentUserId} />
        </TabsContent>
        <TabsContent value="day" className="mt-4">
          <LeaderTab timeframe="day" currentUserId={currentUserId} />
        </TabsContent>
      </Tabs>

      {/* Badge Legend */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Rank Levels</p>
          <div className="flex flex-wrap gap-2">
            {RANK_CONFIG.map(r => (
              <span key={r.name} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white ${r.color} ${r.border}`}>
                {r.badge} {r.name}
                <span className="text-gray-400 font-normal ml-1">{r.min >= 1000 ? `${r.min/1000}k` : r.min}+</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}