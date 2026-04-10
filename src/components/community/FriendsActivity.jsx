import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FriendsActivity({ user, isDarkMode }) {
  const [showAllFriends, setShowAllFriends] = useState(false);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await base44.entities.Friend.filter({
          user_id: user.id,
          status: 'accepted'
        }, '-created_date', 50);
      } catch {
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch friends' activity
  const { data: friendsActivities = [], isLoading: activityLoading } = useQuery({
    queryKey: ['friendsActivity', user?.id],
    queryFn: async () => {
      if (!user || friends.length === 0) return [];
      try {
        const friendIds = friends.map(f => f.friend_id);
        return await base44.entities.UserActivity.filter({
          user_id: { $in: friendIds }
        }, '-created_date', 20);
      } catch {
        return [];
      }
    },
    enabled: !!user && friends.length > 0
  });

  const displayedActivities = showAllFriends ? friendsActivities : friendsActivities.slice(0, 5);

  return (
    <Card style={{ backgroundColor: cardColor, borderColor }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <Users className="w-5 h-5" style={{ color: primaryColor }} />
          What Friends Are Reading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {friendsLoading || activityLoading ? (
          <p style={{ color: mutedColor, fontSize: '14px' }}>Loading activity...</p>
        ) : displayedActivities.length === 0 ? (
          <div className="text-center py-6">
            <UserPlus className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.5 }} />
            <p style={{ color: mutedColor, fontSize: '14px' }}>
              No activity yet. Add friends to see what they're reading!
            </p>
          </div>
        ) : (
          <>
            {displayedActivities.map(activity => (
              <div
                key={activity.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 mt-1" style={{ color: primaryColor }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: textColor }}>
                      {activity.user_name}
                    </p>
                    <p className="text-sm mt-1" style={{ color: textColor }}>
                      {activity.activity_type === 'reading' && `Reading ${activity.content}`}
                      {activity.activity_type === 'completed' && `Completed ${activity.content}`}
                      {activity.activity_type === 'bookmarked' && `Bookmarked ${activity.content}`}
                    </p>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      {activity.created_date ? new Date(activity.created_date).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {friendsActivities.length > 5 && !showAllFriends && (
              <Button
                onClick={() => setShowAllFriends(true)}
                variant="outline"
                className="w-full"
                style={{ borderColor, color: primaryColor }}
              >
                View More Activity
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}