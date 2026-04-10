import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck, Users, Loader2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

/* ── Follow/Unfollow Button ── */
export function FollowButton({ currentUserId, targetUserId, targetName, size = 'sm' }) {
  const queryClient = useQueryClient();

  const { data: followRecord } = useQuery({
    queryKey: ['follow-status', currentUserId, targetUserId],
    queryFn: () => base44.entities.UserFollow.filter({ user_id: currentUserId, following_id: targetUserId }, '-created_date', 1)
      .then(r => r[0] || null).catch(() => null),
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
  });

  const followMutation = useMutation({
    mutationFn: () => base44.entities.UserFollow.create({ user_id: currentUserId, following_id: targetUserId, following_name: targetName }),
    onSuccess: () => { queryClient.invalidateQueries(['follow-status', currentUserId, targetUserId]); queryClient.invalidateQueries(['follower-count', targetUserId]); toast.success(`Following ${targetName}`); },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => base44.entities.UserFollow.delete(followRecord.id),
    onSuccess: () => { queryClient.invalidateQueries(['follow-status', currentUserId, targetUserId]); queryClient.invalidateQueries(['follower-count', targetUserId]); toast.success(`Unfollowed ${targetName}`); },
  });

  if (!currentUserId || currentUserId === targetUserId) return null;

  const isPending = followMutation.isPending || unfollowMutation.isPending;
  const isFollowing = !!followRecord;

  return (
    <Button
      size={size}
      variant={isFollowing ? 'outline' : 'default'}
      disabled={isPending}
      onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
      className={`gap-1.5 ${isFollowing ? 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : isFollowing ? <><UserCheck className="w-3.5 h-3.5" /> Following</>
        : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
    </Button>
  );
}

/* ── Follower / Following counts ── */
export function FollowStats({ userId }) {
  const { data: followers = [] } = useQuery({
    queryKey: ['follower-count', userId],
    queryFn: () => base44.entities.UserFollow.filter({ following_id: userId }, '-created_date', 100).catch(() => []),
    enabled: !!userId,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following-count', userId],
    queryFn: () => base44.entities.UserFollow.filter({ user_id: userId }, '-created_date', 100).catch(() => []),
    enabled: !!userId,
  });

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="text-center">
        <p className="font-bold text-gray-900">{followers.length}</p>
        <p className="text-xs text-gray-500">Followers</p>
      </div>
      <div className="w-px h-8 bg-gray-200" />
      <div className="text-center">
        <p className="font-bold text-gray-900">{following.length}</p>
        <p className="text-xs text-gray-500">Following</p>
      </div>
    </div>
  );
}

/* ── Following Feed Card ── */
export function FollowingSection({ userId }) {
  const queryClient = useQueryClient();

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ['following-list', userId],
    queryFn: () => base44.entities.UserFollow.filter({ user_id: userId }, '-created_date', 50).catch(() => []),
    enabled: !!userId,
  });

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ['followers-list', userId],
    queryFn: () => base44.entities.UserFollow.filter({ following_id: userId }, '-created_date', 50).catch(() => []),
    enabled: !!userId,
  });

  const unfollowMutation = useMutation({
    mutationFn: (id) => base44.entities.UserFollow.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['following-list', userId]),
  });

  const [tab, setTab] = React.useState('following');
  const list = tab === 'following' ? following : followers;
  const isLoading = tab === 'following' ? loadingFollowing : loadingFollowers;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" /> Connections
        </CardTitle>
        <div className="flex gap-1 mt-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setTab('following')}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${tab === 'following' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
            Following ({following.length})
          </button>
          <button onClick={() => setTab('followers')}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${tab === 'followers' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
            Followers ({followers.length})
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {tab === 'following' ? "You're not following anyone yet." : "No followers yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(f => {
              const name = tab === 'following' ? (f.following_name || 'User') : (f.user_name || 'User');
              return (
                <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                  </div>
                  {tab === 'following' && (
                    <button onClick={() => unfollowMutation.mutate(f.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-red-500 flex items-center gap-0.5">
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}