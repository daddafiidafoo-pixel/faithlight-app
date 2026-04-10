import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Target } from 'lucide-react';

/**
 * Show progress toward earning badges
 */
export default function AchievementTracker({ userId }) {
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      const records = await base44.entities.UserProgress.filter({ user_id: userId });
      return records[0];
    },
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      return await base44.entities.UserBadge.filter({ user_id: userId });
    },
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      return await base44.entities.BadgeDefinition.filter({
        is_active: true,
      }, '-criteria_value');
    },
  });

  if (!userProgress || badges.length === 0) return null;

  const userBadgeIds = new Set(userBadges.map(b => b.badge_id));
  const upcomingBadges = badges
    .filter(b => !userBadgeIds.has(b.id))
    .slice(0, 3);

  const getProgressValue = (badge) => {
    if (badge.criteria_type === 'lesson_count') {
      return Math.min(100, Math.floor((userProgress.completed_lesson_count / (badge.criteria_value || 1)) * 100));
    }
    if (badge.criteria_type === 'streak_days') {
      return Math.min(100, Math.floor(((userProgress.learning_streak_current || 0) / (badge.criteria_value || 1)) * 100));
    }
    if (badge.criteria_type === 'level_completion') {
      return userProgress.completed_levels?.includes(badge.criteria_value) ? 100 : 0;
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-indigo-600" />
          Next Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingBadges.length === 0 ? (
          <p className="text-sm text-gray-600">You're doing amazing! Keep up the activity!</p>
        ) : (
          upcomingBadges.map((badge) => {
            const progress = getProgressValue(badge);
            return (
              <div key={badge.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{badge.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      badge.rarity === 'legendary'
                        ? 'bg-purple-100 text-purple-800'
                        : badge.rarity === 'epic'
                        ? 'bg-blue-100 text-blue-800'
                        : badge.rarity === 'rare'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {badge.rarity}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                    {progress}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}