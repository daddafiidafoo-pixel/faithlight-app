import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Lock, CheckCircle, Zap, Flame, BookOpen, Star, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const MILESTONE_BADGES = [
  { id: 'first_chapter', icon: '📖', name: 'First Step', desc: 'Read your first chapter', color: 'from-blue-400 to-indigo-500', req: { metric: 'chapters_read', value: 1 } },
  { id: 'ten_chapters', icon: '📚', name: 'Devoted Reader', desc: 'Read 10 chapters', color: 'from-blue-500 to-purple-500', req: { metric: 'chapters_read', value: 10 } },
  { id: 'fifty_chapters', icon: '🔥', name: 'Scripture Seeker', desc: 'Read 50 chapters', color: 'from-orange-500 to-red-500', req: { metric: 'chapters_read', value: 50 } },
  { id: 'hundred_chapters', icon: '⚡', name: 'Word of God', desc: 'Read 100 chapters', color: 'from-yellow-500 to-orange-500', req: { metric: 'chapters_read', value: 100 } },
  { id: 'streak_7', icon: '🌟', name: 'Faithful One', desc: '7-day reading streak', color: 'from-amber-400 to-yellow-500', req: { metric: 'current_streak', value: 7 } },
  { id: 'streak_30', icon: '👑', name: 'Unstoppable', desc: '30-day reading streak', color: 'from-purple-500 to-pink-500', req: { metric: 'current_streak', value: 30 } },
  { id: 'points_100', icon: '🏅', name: 'Rising Star', desc: 'Earn 100 points', color: 'from-green-400 to-emerald-500', req: { metric: 'total_points', value: 100 } },
  { id: 'points_500', icon: '🏆', name: 'Champion', desc: 'Earn 500 points', color: 'from-green-500 to-teal-600', req: { metric: 'total_points', value: 500 } },
  { id: 'points_1000', icon: '💎', name: 'Legend', desc: 'Earn 1,000 points', color: 'from-indigo-500 to-purple-600', req: { metric: 'total_points', value: 1000 } },
  { id: 'study_plan', icon: '📋', name: 'Planner', desc: 'Complete a study plan', color: 'from-pink-400 to-rose-500', req: { metric: 'study_plans_completed', value: 1 } },
];

function BadgeCard({ badge, earned, progress, total, userId, onClaim }) {
  const pct = total > 0 ? Math.min(Math.round((progress / total) * 100), 100) : 0;
  const claimedKey = `badge_claimed_${userId}_${badge.id}`;
  const alreadyClaimed = !!localStorage.getItem(claimedKey);

  return (
    <div className={`relative rounded-2xl border p-3 text-center transition-all ${earned ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl ${earned ? `bg-gradient-to-br ${badge.color} shadow-md` : 'bg-gray-200'}`}>
        {earned ? badge.icon : <Lock className="w-5 h-5 text-gray-400" />}
      </div>
      <p className="font-bold text-xs text-gray-900 leading-tight">{badge.name}</p>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{badge.desc}</p>

      {!earned && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${badge.color}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{progress}/{total}</p>
        </div>
      )}

      {earned && !alreadyClaimed && (
        <button
          onClick={() => onClaim(badge, claimedKey)}
          className={`mt-2 w-full text-[10px] font-bold py-1 rounded-lg bg-gradient-to-r ${badge.color} text-white`}
        >
          Claim!
        </button>
      )}
      {earned && alreadyClaimed && (
        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-green-700 font-semibold">
          <CheckCircle className="w-3 h-3" /> Earned
        </div>
      )}
    </div>
  );
}

export default function MilestoneBadges({ userId }) {
  const queryClient = useQueryClient();

  const { data: userPoints = null } = useQuery({
    queryKey: ['user-points-badges', userId],
    queryFn: async () => {
      const res = await base44.entities.UserPoints.filter({ user_id: userId }, '-updated_date', 1).catch(() => []);
      return res[0] || null;
    },
    enabled: !!userId,
    retry: false,
  });

  const { data: userStreak = null } = useQuery({
    queryKey: ['user-streak-badges', userId],
    queryFn: async () => {
      const res = await base44.entities.UserStreak.filter({ user_id: userId }, '-updated_date', 1).catch(() => []);
      return res[0] || null;
    },
    enabled: !!userId,
    retry: false,
  });

  const getMetricValue = (metric) => {
    if (metric === 'current_streak') return userStreak?.current_streak || 0;
    return userPoints?.[metric] || 0;
  };

  const handleClaim = async (badge, claimedKey) => {
    localStorage.setItem(claimedKey, '1');
    // Create badge record
    await base44.entities.UserBadge.create({
      user_id: userId,
      badge_id: badge.id,
      badge_name: badge.name,
    }).catch(() => {});
    // Add bonus points
    if (userPoints) {
      await base44.entities.UserPoints.update(userPoints.id, {
        total_points: (userPoints.total_points || 0) + 25,
        badges_earned: (userPoints.badges_earned || 0) + 1,
      }).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ['user-points-badges'] });
    queryClient.invalidateQueries({ queryKey: ['user-badges-recent'] });
    toast.success(`🏆 Badge earned: ${badge.name}! +25 bonus pts`);
  };

  return (
    <Card className="border-amber-100">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Award className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Milestone Badges</span>
          <span className="text-xs text-gray-400 ml-auto">{MILESTONE_BADGES.filter(b => getMetricValue(b.req.metric) >= b.req.value).length}/{MILESTONE_BADGES.length} earned</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {MILESTONE_BADGES.map(badge => {
            const currentValue = getMetricValue(badge.req.metric);
            const earned = currentValue >= badge.req.value;
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earned}
                progress={currentValue}
                total={badge.req.value}
                userId={userId}
                onClaim={handleClaim}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}