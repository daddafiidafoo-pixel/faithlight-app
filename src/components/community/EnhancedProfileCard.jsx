import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Share2, Award, TrendingUp, MessageCircle } from 'lucide-react';

/**
 * Enhanced user profile with spiritual progress sharing
 * Shows levels, badges, streaks, and sharing options
 */
export default function EnhancedProfileCard({ userId, showActions = true }) {
  const [showShareModal, setShowShareModal] = useState(false);

  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: userId });
      return users[0];
    },
  });

  // Get user progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      const progressData = await base44.entities.UserProgress.filter({ user_id: userId });
      return progressData[0];
    },
  });

  // Get spiritual level info
  const { data: levels = [] } = useQuery({
    queryKey: ['spiritual-levels'],
    queryFn: async () => {
      return await base44.entities.SpiritualGrowthLevel.filter({});
    },
  });

  if (userLoading || progressLoading) {
    return <div className="text-center py-4">Loading profile...</div>;
  }

  const currentLevel = levels.find(l => l.level_number === progress?.current_level);

  const handleShare = () => {
    const shareText = `Check out my progress on FaithLight! 🌱 I'm at Level ${progress?.current_level} with ${progress?.learning_streak_current || 0} day streak!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My FaithLight Progress',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with avatar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{user?.full_name}</h2>
            <p className="text-blue-100 text-sm">{user?.country_code || 'Global'}</p>
          </div>
          {user?.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-16 h-16 rounded-full border-4 border-white"
            />
          )}
        </div>

        {/* Current Level Badge */}
        {currentLevel && (
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg w-fit">
            <span className="text-2xl">{currentLevel.icon}</span>
            <div>
              <p className="text-xs text-blue-100">Current Level</p>
              <p className="font-bold">{currentLevel.title}</p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{progress?.learning_streak_current || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Day Streak 🔥</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{progress?.completed_lesson_count || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Lessons</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{progress?.badges_earned?.length || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Badges</p>
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">Level Progress</p>
              <p className="text-sm font-bold text-indigo-600">{progress.current_level_progress_percent}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full transition-all"
                style={{ width: `${progress.current_level_progress_percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Badges */}
        {progress?.badges_earned && progress.badges_earned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <p className="font-semibold text-gray-900">Achievements</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {progress.badges_earned.slice(0, 5).map((badge) => (
                <Badge key={badge} className="bg-yellow-100 text-yellow-800">
                  {badge}
                </Badge>
              ))}
              {progress.badges_earned.length > 5 && (
                <Badge variant="outline">+{progress.badges_earned.length - 5}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Leader Status */}
        {progress?.leader_approved && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-purple-900">👑 Leadership Approved</p>
            <p className="text-xs text-purple-700 mt-1">Admin verified Level 4 leader</p>
          </div>
        )}

        {/* Subscription Info */}
        {user?.subscription_status && (
          <div>
            <Badge
              className={
                user.subscription_status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : user.subscription_status === 'trialing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {user.subscription_status === 'active'
                ? '✨ Premium'
                : user.subscription_status === 'trialing'
                ? '🎯 On Trial'
                : 'Free'}
            </Badge>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share Progress
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}