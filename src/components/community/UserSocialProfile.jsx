import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, Award, Share2, UserPlus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UserSocialProfile({ userId, isDarkMode, isOwnProfile = false }) {
  const [showAllFavorites, setShowAllFavorites] = useState(false);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch user progress
  const { data: userProgress = {} } = useQuery({
    queryKey: ['userProgress', userId],
    queryFn: async () => {
      if (!userId) return {};
      try {
        const result = await base44.entities.UserProgress.filter({
          user_id: userId
        }, '-created_date', 1);
        return result[0] || {};
      } catch {
        return {};
      }
    },
    enabled: !!userId
  });

  // Fetch favorite verses
  const { data: favoriteVerses = [] } = useQuery({
    queryKey: ['favoriteVerses', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await base44.entities.Bookmark.filter({
          user_id: userId,
          category: 'favorite'
        }, '-created_date', 10);
      } catch {
        return [];
      }
    },
    enabled: !!userId
  });

  // Fetch badges/achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await base44.entities.UserAchievement.filter({
          user_id: userId
        }, '-earned_at', 10);
      } catch {
        return [];
      }
    },
    enabled: !!userId
  });

  const displayedFavorites = showAllFavorites ? favoriteVerses : favoriteVerses.slice(0, 3);

  const handleShareProfile = async () => {
    const profileUrl = `https://faithlight.app/profile/${userId}`;
    await navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied!');
  };

  return (
    <div className="space-y-6">
      {/* Reading Stats */}
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
            <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
            Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {userProgress.chapters_read || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: mutedColor }}>Chapters Read</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {userProgress.books_completed || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: mutedColor }}>Books</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {userProgress.current_streak || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: mutedColor }}>Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card style={{ backgroundColor: cardColor, borderColor }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
              <Award className="w-5 h-5" style={{ color: primaryColor }} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {achievements.map(badge => (
                <div
                  key={badge.id}
                  className="px-3 py-2 rounded-lg text-center border"
                  style={{ backgroundColor: bgColor, borderColor }}
                  title={badge.badge_name}
                >
                  <p className="text-xl mb-1">{badge.badge_name?.includes('Scholar') ? '🎓' : '⭐'}</p>
                  <p className="text-xs" style={{ color: mutedColor }}>
                    {badge.badge_name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorite Verses */}
      {favoriteVerses.length > 0 && (
        <Card style={{ backgroundColor: cardColor, borderColor }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
              ❤️ Favorite Verses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayedFavorites.map(verse => (
              <div
                key={verse.id}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                  {verse.book} {verse.chapter}:{verse.verse}
                </p>
                {verse.title && (
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    "{verse.title}"
                  </p>
                )}
              </div>
            ))}
            {favoriteVerses.length > 3 && !showAllFavorites && (
              <Button
                onClick={() => setShowAllFavorites(true)}
                variant="outline"
                className="w-full text-xs"
                style={{ borderColor, color: primaryColor }}
              >
                View All {favoriteVerses.length} Favorites
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!isOwnProfile && (
        <div className="flex gap-3">
          <Button
            className="flex-1 gap-2"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            style={{ borderColor, color: primaryColor }}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>
        </div>
      )}

      {isOwnProfile && (
        <Button
          onClick={handleShareProfile}
          className="w-full gap-2"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          <Share2 className="w-4 h-4" />
          Share Profile
        </Button>
      )}
    </div>
  );
}