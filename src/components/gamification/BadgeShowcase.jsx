import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';

// All badge definitions with categories
export const ALL_BADGES = [
  // Reading Consistency
  { id: 'first_read',      category: 'reading',    emoji: '📖', name: 'First Steps',       desc: 'Read your first Bible chapter',          points: 10 },
  { id: 'streak_3',        category: 'reading',    emoji: '🔥', name: 'On Fire',            desc: '3-day reading streak',                   points: 25 },
  { id: 'streak_7',        category: 'reading',    emoji: '⚡', name: 'Week Warrior',       desc: '7-day reading streak',                   points: 75 },
  { id: 'streak_30',       category: 'reading',    emoji: '🏆', name: 'Month Master',       desc: '30-day reading streak',                  points: 300 },
  { id: 'streak_100',      category: 'reading',    emoji: '💎', name: 'Century Faithful',   desc: '100-day reading streak',                 points: 1000 },
  { id: 'nt_complete',     category: 'reading',    emoji: '✝️',  name: 'New Testament Done', desc: 'Read all 27 NT books',                   points: 500 },
  { id: 'ot_complete',     category: 'reading',    emoji: '📜', name: 'Ancient Paths',      desc: 'Read all 39 OT books',                   points: 750 },
  { id: 'bible_complete',  category: 'reading',    emoji: '👑', name: 'Bible Complete',     desc: 'Read the entire Bible',                  points: 2000 },
  // Knowledge Retention
  { id: 'quiz_first',      category: 'knowledge',  emoji: '🧠', name: 'Quiz Taker',         desc: 'Complete your first quiz',               points: 20 },
  { id: 'quiz_perfect',    category: 'knowledge',  emoji: '💯', name: 'Perfect Score',      desc: 'Score 100% on a Bible quiz',             points: 100 },
  { id: 'quiz_10',         category: 'knowledge',  emoji: '🎓', name: 'Knowledge Seeker',   desc: 'Complete 10 quizzes',                    points: 150 },
  { id: 'quiz_50',         category: 'knowledge',  emoji: '🏅', name: 'Scholar',            desc: 'Complete 50 quizzes',                    points: 500 },
  { id: 'memorize_10',     category: 'knowledge',  emoji: '✍️', name: 'Verse Keeper',        desc: 'Memorize 10 Bible verses',               points: 100 },
  { id: 'memorize_50',     category: 'knowledge',  emoji: '📝', name: 'Scripture Treasury', desc: 'Memorize 50 Bible verses',               points: 400 },
  { id: 'study_plan_done', category: 'knowledge',  emoji: '🗺️', name: 'Plan Finisher',      desc: 'Complete a full study plan',             points: 200 },
  // Community Participation
  { id: 'first_post',      category: 'community',  emoji: '💬', name: 'First Voice',        desc: 'Post in the community forum',            points: 15 },
  { id: 'first_prayer',    category: 'community',  emoji: '🙏', name: 'Prayer Warrior',     desc: 'Submit a prayer request',                points: 20 },
  { id: 'prayer_10',       category: 'community',  emoji: '🕊️', name: 'Intercessor',        desc: 'Pray for 10 others\' requests',          points: 100 },
  { id: 'group_join',      category: 'community',  emoji: '🤝', name: 'Community Member',   desc: 'Join your first group',                  points: 25 },
  { id: 'group_lead',      category: 'community',  emoji: '🌟', name: 'Community Leader',   desc: 'Create and lead a group',                points: 150 },
  { id: 'helper_5',        category: 'community',  emoji: '❤️', name: 'Encourager',         desc: 'Reply to 5 forum threads',               points: 75 },
  { id: 'helpful_10',      category: 'community',  emoji: '🌍', name: 'Pillar',             desc: 'Receive 10 upvotes on your replies',     points: 200 },
  // Milestones
  { id: 'points_100',      category: 'milestone',  emoji: '🌱', name: 'Apprentice',         desc: 'Earn 100 total points',                  points: 0 },
  { id: 'points_1000',     category: 'milestone',  emoji: '⭐', name: 'Expert',             desc: 'Earn 1,000 total points',                points: 0 },
  { id: 'points_5000',     category: 'milestone',  emoji: '🌙', name: 'Master',             desc: 'Earn 5,000 total points',                points: 0 },
  { id: 'points_10000',    category: 'milestone',  emoji: '✨', name: 'Legendary',          desc: 'Earn 10,000 total points',               points: 0 },
];

const CATEGORY_CONFIG = {
  reading:   { label: 'Reading Consistency', color: 'text-blue-700 bg-blue-50 border-blue-200',     icon: '📖' },
  knowledge: { label: 'Knowledge & Retention', color: 'text-green-700 bg-green-50 border-green-200', icon: '🧠' },
  community: { label: 'Community Participation', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: '🤝' },
  milestone: { label: 'Milestones',            color: 'text-amber-700 bg-amber-50 border-amber-200',  icon: '🏆' },
};

function BadgeCard({ badge, earned }) {
  return (
    <div className={`relative rounded-xl border p-3 text-center transition-all ${
      earned
        ? 'bg-white border-indigo-200 shadow-sm hover:shadow-md'
        : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      {!earned && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="text-3xl mb-1">{badge.emoji}</div>
      <p className="text-xs font-bold text-gray-900 leading-tight">{badge.name}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{badge.desc}</p>
      {badge.points > 0 && earned && (
        <span className="mt-1 inline-block text-xs text-indigo-600 font-semibold">+{badge.points}pts</span>
      )}
    </div>
  );
}

export default function BadgeShowcase({ userId }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ['user-badges-all', userId],
    queryFn: async () => {
      try { return await base44.entities.UserBadge.filter({ user_id: userId }, '-earned_at', 200); }
      catch { return []; }
    },
    enabled: !!userId,
    retry: false,
  });

  const earnedIds = new Set((earnedBadges || []).map(b => b.badge_id));
  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)];

  const filtered = activeCategory === 'all'
    ? ALL_BADGES
    : ALL_BADGES.filter(b => b.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-gray-900">Achievement Badges</span>
        </div>
        <Badge variant="outline" className="text-indigo-600 border-indigo-200">
          {earnedIds.size} / {ALL_BADGES.length} earned
        </Badge>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {cat === 'all' ? '🏅 All' : `${CATEGORY_CONFIG[cat].icon} ${CATEGORY_CONFIG[cat].label.split(' ')[0]}`}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(badge => (
          <BadgeCard key={badge.id} badge={badge} earned={earnedIds.has(badge.id)} />
        ))}
      </div>
    </div>
  );
}