import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Award, Flame, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const RANK_CONFIG = [
  { min: 10000, name: 'Legendary', color: 'text-purple-600', bg: 'bg-purple-100', icon: '⭐⭐⭐' },
  { min: 5000,  name: 'Master',    color: 'text-blue-600',   bg: 'bg-blue-100',   icon: '⭐⭐' },
  { min: 1000,  name: 'Expert',    color: 'text-green-600',  bg: 'bg-green-100',  icon: '⭐' },
  { min: 100,   name: 'Apprentice',color: 'text-amber-600',  bg: 'bg-amber-100',  icon: '📖' },
  { min: 0,     name: 'Seeker',    color: 'text-gray-600',   bg: 'bg-gray-100',   icon: '🌱' },
];

function getRank(pts) {
  return RANK_CONFIG.find(r => (pts || 0) >= r.min) || RANK_CONFIG[RANK_CONFIG.length - 1];
}

function nextRankThreshold(pts) {
  const i = RANK_CONFIG.findIndex(r => (pts || 0) >= r.min);
  if (i <= 0) return null;
  return RANK_CONFIG[i - 1].min;
}

export default function GamificationSummaryWidget({ userId }) {
  const { data: userPoints = null } = useQuery({
    queryKey: ['user-points', userId],
    queryFn: async () => {
      try {
        const result = await base44.entities.UserPoints.filter({ user_id: userId }, '-updated_date', 1);
        return result[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
    retry: false,
  });

  const { data: recentBadges = [] } = useQuery({
    queryKey: ['user-badges-recent', userId],
    queryFn: async () => {
      try {
        return await base44.entities.UserBadge.filter({ user_id: userId }, '-updated_date', 3);
      } catch {
        return [];
      }
    },
    enabled: !!userId,
    retry: false,
  });

  const { data: streak = null } = useQuery({
    queryKey: ['user-streak', userId],
    queryFn: async () => {
      try {
        const result = await base44.entities.UserStreak.filter({ user_id: userId }, '-updated_date', 1);
        return result[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
    retry: false,
  });

  const pts = userPoints?.total_points || 0;
  const rank = getRank(pts);
  const nextThreshold = nextRankThreshold(pts);
  const progress = nextThreshold ? Math.round((pts / nextThreshold) * 100) : 100;
  const streakDays = streak?.current_streak || 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Your Progress</span>
          </div>
          <Link to={createPageUrl('GamificationLeaderboard')}>
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 h-7 px-2 gap-1">
              Leaderboard <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Points */}
          <div className="text-center bg-white rounded-xl p-2.5 shadow-sm border border-indigo-100">
            <p className="text-2xl font-bold text-indigo-600">{pts.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Points</p>
          </div>
          {/* Streak */}
          <div className="text-center bg-white rounded-xl p-2.5 shadow-sm border border-orange-100">
            <div className="flex items-center justify-center gap-1">
              <Flame className={`w-4 h-4 ${streakDays > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
              <p className="text-2xl font-bold text-orange-500">{streakDays}</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Day Streak</p>
          </div>
          {/* Badges */}
          <div className="text-center bg-white rounded-xl p-2.5 shadow-sm border border-amber-100">
            <p className="text-2xl font-bold text-amber-600">{recentBadges.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Badges</p>
          </div>
        </div>

        {/* Rank + Progress */}
        <div className="bg-white rounded-xl p-3 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{rank.icon}</span>
              <span className={`text-sm font-bold ${rank.color}`}>{rank.name}</span>
            </div>
            {nextThreshold && (
              <span className="text-xs text-gray-400">{(nextThreshold - pts).toLocaleString()} pts to next rank</span>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs text-gray-600">Recent:</span>
            <div className="flex gap-1 flex-wrap">
              {recentBadges.map(b => (
                <Badge key={b.id} variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                  {b.badge_name || 'Achievement'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}