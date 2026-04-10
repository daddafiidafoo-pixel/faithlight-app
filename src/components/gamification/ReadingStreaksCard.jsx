import React from 'react';
import { Flame, Trophy, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ReadingStreaksCard({ streak, level, badges, totalDaysRead }) {
  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'week':
        return '🔥 Week Warrior';
      case 'month':
        return '📅 Month Master';
      case 'year':
        return '⭐ Yearly Scholar';
      default:
        return '';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-amber-200">
      <div className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">{streak} days</p>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-gray-800">Level {level}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((totalDaysRead % 10) / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{totalDaysRead} total days read</p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" /> Achievements
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge} className="bg-yellow-500 text-white">
                  {getBadgeIcon(badge)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}