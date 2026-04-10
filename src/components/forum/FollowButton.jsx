import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export default function FollowButton({ 
  currentUser, 
  followingType, 
  followingId, 
  followingName,
  variant = 'default',
  size = 'sm'
}) {
  const queryClient = useQueryClient();

  const { data: existingFollow } = useQuery({
    queryKey: ['user-follow', currentUser?.id, followingType, followingId],
    queryFn: async () => {
      const follows = await base44.entities.UserFollow.filter({
        follower_id: currentUser.id,
        following_type: followingType,
        following_id: followingId
      });
      return follows[0] || null;
    },
    enabled: !!currentUser && !!followingId
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (existingFollow) {
        await base44.entities.UserFollow.delete(existingFollow.id);
        return 'unfollowed';
      } else {
        await base44.entities.UserFollow.create({
          follower_id: currentUser.id,
          follower_name: currentUser.full_name || currentUser.email,
          following_type: followingType,
          following_id: followingId,
          following_name: followingName,
          notification_enabled: true
        });
        return 'followed';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries(['user-follow']);
      queryClient.invalidateQueries(['user-follows']);
      toast.success(action === 'followed' ? `Following ${followingName}` : `Unfollowed ${followingName}`);
    }
  });

  const toggleNotificationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.UserFollow.update(existingFollow.id, {
        notification_enabled: !existingFollow.notification_enabled
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-follow']);
      toast.success('Notification preference updated');
    }
  });

  if (!currentUser) return null;

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => followMutation.mutate()}
        disabled={followMutation.isPending}
        variant={existingFollow ? 'default' : variant}
        size={size}
        className="gap-2"
      >
        {existingFollow ? (
          <>
            <UserCheck className="w-4 h-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Follow
          </>
        )}
      </Button>
      {existingFollow && (
        <Button
          onClick={() => toggleNotificationMutation.mutate()}
          disabled={toggleNotificationMutation.isPending}
          variant="outline"
          size={size}
          title={existingFollow.notification_enabled ? 'Disable notifications' : 'Enable notifications'}
        >
          {existingFollow.notification_enabled ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
}