import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Zap, TrendingUp } from 'lucide-react';

/**
 * Display user's current points and level
 */
export default function PointsDisplay({ userId }) {
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userId],
    queryFn: async () => {
      const records = await base44.entities.UserPoints.filter({ user_id: userId });
      return records[0];
    },
  });

  const getRankBadge = (points) => {
    if (points >= 10000) return { name: 'Legendary', color: 'bg-purple-100 text-purple-800', icon: '⭐⭐⭐' };
    if (points >= 5000) return { name: 'Master', color: 'bg-blue-100 text-blue-800', icon: '⭐⭐' };
    if (points >= 1000) return { name: 'Expert', color: 'bg-green-100 text-green-800', icon: '⭐' };
    if (points >= 100) return { name: 'Apprentice', color: 'bg-gray-100 text-gray-800', icon: '✓' };
    return { name: 'Novice', color: 'bg-yellow-100 text-yellow-800', icon: '●' };
  };

  if (!userPoints) return null;

  const rank = getRankBadge(userPoints.total_points);

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-xs text-gray-600">Total Points</p>
              <p className="text-3xl font-bold text-amber-900">
                {userPoints.total_points.toLocaleString()}
              </p>
            </div>
          </div>
          <Badge className={rank.color}>
            {rank.icon} {rank.name}
          </Badge>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded p-2">
            <p className="text-gray-600">This Week</p>
            <p className="font-semibold text-gray-900">{userPoints.points_this_week}</p>
          </div>
          <div className="bg-white rounded p-2">
            <p className="text-gray-600">This Month</p>
            <p className="font-semibold text-gray-900">{userPoints.points_this_month}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}