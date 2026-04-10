import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Lock, CheckCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

const ACHIEVEMENTS = [
  // Reading
  { id: 'first_chapter', icon: '📖', name: 'First Step', desc: 'Read your first chapter', color: 'from-blue-400 to-indigo-500', metric: 'chapters_read', target: 1 },
  { id: 'ten_chapters', icon: '📚', name: 'Devoted Reader', desc: 'Read 10 chapters', color: 'from-blue-500 to-purple-500', metric: 'chapters_read', target: 10 },
  { id: 'fifty_chapters', icon: '🔥', name: 'Scripture Seeker', desc: 'Read 50 chapters', color: 'from-orange-500 to-red-500', metric: 'chapters_read', target: 50 },
  { id: 'hundred_chapters', icon: '⚡', name: 'Word Warrior', desc: 'Read 100 chapters', color: 'from-yellow-500 to-orange-500', metric: 'chapters_read', target: 100 },
  // Streaks
  { id: 'streak_7', icon: '🌟', name: 'Faithful One', desc: '7-day streak', color: 'from-amber-400 to-yellow-500', metric: 'current_streak', target: 7 },
  { id: 'streak_30', icon: '👑', name: 'Unstoppable', desc: '30-day streak', color: 'from-purple-500 to-pink-500', metric: 'current_streak', target: 30 },
  // Points
  { id: 'points_100', icon: '🏅', name: 'Rising Star', desc: 'Earn 100 pts', color: 'from-green-400 to-emerald-500', metric: 'total_points', target: 100 },
  { id: 'points_500', icon: '🏆', name: 'Champion', desc: 'Earn 500 pts', color: 'from-green-500 to-teal-600', metric: 'total_points', target: 500 },
  { id: 'points_1000', icon: '💎', name: 'Legend', desc: 'Earn 1,000 pts', color: 'from-indigo-500 to-purple-600', metric: 'total_points', target: 1000 },
  // Study Plans
  { id: 'plan_complete_1', icon: '📋', name: 'Planner', desc: 'Complete a study plan', color: 'from-pink-400 to-rose-500', metric: 'study_plans_completed', target: 1 },
  { id: 'plan_complete_3', icon: '📕', name: 'Plan Master', desc: 'Complete 3 study plans', color: 'from-rose-500 to-pink-600', metric: 'study_plans_completed', target: 3 },
  // Groups
  { id: 'group_join_1', icon: '👥', name: 'Community Member', desc: 'Join your first group', color: 'from-cyan-500 to-blue-500', metric: 'groups_joined', target: 1 },
  { id: 'group_join_5', icon: '🤝', name: 'Community Builder', desc: 'Join 5 groups', color: 'from-blue-600 to-indigo-600', metric: 'groups_joined', target: 5 },
  // Discussions
  { id: 'discussion_1', icon: '💬', name: 'Conversationalist', desc: 'Post in 1 discussion', color: 'from-violet-500 to-purple-600', metric: 'discussions_posted', target: 1 },
  { id: 'discussion_10', icon: '🗣️', name: 'Voice of Faith', desc: 'Post in 10 discussions', color: 'from-purple-600 to-pink-600', metric: 'discussions_posted', target: 10 },
  // Challenges
  { id: 'challenge_1', icon: '🎯', name: 'Challenger', desc: 'Complete a challenge', color: 'from-amber-500 to-orange-600', metric: 'challenges_completed', target: 1 },
];

function BadgeCard({ badge, progress, userId, onClaim }) {
  const earned = progress >= badge.target;
  const pct = badge.target > 0 ? Math.min(Math.round((progress / badge.target) * 100), 100) : 0;
  const claimedKey = `ach_claimed_${userId}_${badge.id}`;
  const claimed = !!localStorage.getItem(claimedKey);

  return (
    <div className={`relative rounded-2xl border p-3 text-center transition-all ${earned ? 'border-amber-200 bg-amber-50 shadow-sm' : 'border-gray-200 bg-gray-50 opacity-65'}`}>
      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl ${earned ? `bg-gradient-to-br ${badge.color} shadow` : 'bg-gray-200'}`}>
        {earned ? badge.icon : <Lock className="w-5 h-5 text-gray-400" />}
      </div>
      <p className="font-bold text-xs text-gray-900 leading-tight">{badge.name}</p>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{badge.desc}</p>
      {!earned && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${badge.color}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{progress}/{badge.target}</p>
        </div>
      )}
      {earned && !claimed && (
        <button onClick={() => onClaim(badge, claimedKey)}
          className={`mt-2 w-full text-[10px] font-bold py-1 rounded-lg bg-gradient-to-r ${badge.color} text-white`}>
          Claim!
        </button>
      )}
      {earned && claimed && (
        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-green-700 font-semibold">
          <CheckCircle className="w-3 h-3" /> Earned
        </div>
      )}
    </div>
  );
}

export default function AchievementBadgesPanel({ userId }) {
  const queryClient = useQueryClient();

  const { data: points } = useQuery({
    queryKey: ['ach-points', userId],
    queryFn: () => base44.entities.UserPoints.filter({ user_id: userId }, '-updated_date', 1).then(r => r[0] || null).catch(() => null),
    enabled: !!userId, retry: false,
  });
  const { data: streak } = useQuery({
    queryKey: ['ach-streak', userId],
    queryFn: () => base44.entities.UserStreak.filter({ user_id: userId }, '-updated_date', 1).then(r => r[0] || null).catch(() => null),
    enabled: !!userId, retry: false,
  });
  const { data: groupCount } = useQuery({
    queryKey: ['ach-groups', userId],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: userId }, '-updated_date', 50).then(r => r.length || 0).catch(() => 0),
    enabled: !!userId, retry: false,
  });

  const getProgress = (metric) => {
    if (metric === 'current_streak') return streak?.current_streak || 0;
    if (metric === 'groups_joined') return groupCount || 0;
    return points?.[metric] || 0;
  };

  const handleClaim = async (badge, claimedKey) => {
    localStorage.setItem(claimedKey, '1');
    await base44.entities.UserBadge.create({ user_id: userId, badge_id: badge.id, badge_name: badge.name, icon: badge.icon, earned_at: new Date().toISOString() }).catch(() => {});
    if (points?.id) {
      await base44.entities.UserPoints.update(points.id, { total_points: (points.total_points || 0) + 25, badges_earned: (points.badges_earned || 0) + 1 }).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ['ach-points', userId] });
    toast.success(`🏆 ${badge.name} earned! +25 bonus pts`);
  };

  const earned = ACHIEVEMENTS.filter(b => getProgress(b.metric) >= b.target).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-gray-900">Achievements</h3>
        <span className="text-xs text-gray-400 ml-auto">{earned}/{ACHIEVEMENTS.length} earned</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {ACHIEVEMENTS.map(badge => (
          <BadgeCard key={badge.id} badge={badge} progress={getProgress(badge.metric)} userId={userId} onClaim={handleClaim} />
        ))}
      </div>
    </div>
  );
}