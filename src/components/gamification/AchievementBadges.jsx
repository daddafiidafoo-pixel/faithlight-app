import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

export default function AchievementBadges({ userId, limit = 6 }) {
  const { data: userBadges = [], isLoading } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      const badges = await base44.entities.UserBadge.filter(
        { user_id: userId },
        '-earned_at',
        limit * 2
      );
      return badges || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return null;
  }

  const displayBadges = userBadges.slice(0, limit);
  const remainingCount = userBadges.length - limit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Achievements ({userBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userBadges.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">
            Complete courses and lessons to earn badges!
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {displayBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="group relative"
                  title={badge.badge_description}
                >
                  <div className="text-4xl cursor-help transform group-hover:scale-110 transition-transform">
                    {badge.badge_icon}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <p className="font-semibold">{badge.badge_name}</p>
                    <p className="text-gray-300">{new Date(badge.earned_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {remainingCount > 0 && (
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm">
                  +{remainingCount}
                </div>
              )}
            </div>

            {userBadges.length > limit && (
              <p className="text-xs text-gray-600 text-center">
                View all {userBadges.length} badges in profile
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}