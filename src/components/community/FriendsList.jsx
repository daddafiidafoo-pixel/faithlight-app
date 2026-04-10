import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, UserX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import AddFriendModal from './AddFriendModal';

export default function FriendsList() {
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  const { data: friends = [], isLoading, refetch } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const friendships = await base44.entities.Friend.filter(
        { status: 'accepted' },
        '-created_date',
        1000
      );

      const myFriends = friendships.filter(
        f => f.requester_id === user.id || f.receiver_id === user.id
      );

      // Get friend details
      const friendIds = myFriends.map(f =>
        f.requester_id === user.id ? f.receiver_id : f.requester_id
      );

      const friendUsers = await Promise.all(
        friendIds.map(id => base44.entities.User.filter({ id }, '-created_date', 1))
      );

      return friendUsers
        .filter(arr => arr.length > 0)
        .map(arr => arr[0])
        .filter(f => f.username.includes(searchQuery.toLowerCase()));
    },
    enabled: !!user
  });

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;

    try {
      const pairKey = [user.id, friendId].sort().join(':');
      const friendships = await base44.entities.Friend.filter(
        { pair_key: pairKey },
        '-created_date',
        1
      );

      if (friendships.length > 0) {
        await base44.entities.Friend.delete(friendships[0].id);
        toast.success('Friend removed');
        refetch();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search friends by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Friend
        </Button>
      </div>

      {friends.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-600">
              No friends yet. Find someone to connect with!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {friends.map((friend) => (
            <Card key={friend.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {friend.photo_url && (
                    <img
                      src={friend.photo_url}
                      alt={friend.display_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{friend.display_name}</p>
                    <p className="text-sm text-gray-600">@{friend.username}</p>
                    {friend.bio && (
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{friend.bio}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddFriendModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onFriendAdded={refetch}
        currentUserId={user?.id}
      />
    </div>
  );
}