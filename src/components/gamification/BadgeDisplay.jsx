import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';

/**
 * Display user's earned badges
 */
export default function BadgeDisplay({ userId, maxDisplay = 8 }) {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      return await base44.entities.UserBadge.filter(
        { user_id: userId },
        '-created_at'
      );
    },
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading badges...</div>;
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No badges earned yet. Complete activities to earn badges!</p>
        </CardContent>
      </Card>
    );
  }

  const displayedBadges = badges.slice(0, maxDisplay);
  const hasMore = badges.length > maxDisplay;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-gray-900">Achievements ({badges.length})</h3>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {displayedBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center group"
            title={badge.badge_name}
          >
            <div className="text-4xl p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
              {badge.badge_emoji}
            </div>
            <p className="text-xs text-gray-700 text-center mt-1 truncate max-w-full">
              {badge.badge_name.split(' ')[0]}
            </p>
          </div>
        ))}

        {hasMore && (
          <div className="flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-400 p-2 rounded-lg bg-gray-100">
              +{badges.length - maxDisplay}
            </div>
            <p className="text-xs text-gray-600 text-center mt-1">More</p>
          </div>
        )}
      </div>
    </div>
  );
}