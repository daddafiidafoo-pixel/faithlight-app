import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function FindFriends() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  // Fetch all users
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    enabled: !!user
  });

  // Fetch friend relationships and requests
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return base44.entities.Friend.filter(
        { user_id_a: user.id } || { user_id_b: user.id }
      );
    },
    enabled: !!user?.id
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return base44.entities.FriendRequest.filter({
        from_user_id: user.id,
        status: 'pending'
      });
    },
    enabled: !!user?.id
  });

  // Send friend request
  const sendRequestMutation = useMutation({
    mutationFn: async (otherUser) => {
      const request = await base44.entities.FriendRequest.create({
        from_user_id: user.id,
        from_user_name: user.full_name,
        to_user_id: otherUser.id,
        to_user_name: otherUser.full_name,
        status: 'pending'
      });

      // Create notification
      await base44.functions.invoke('createFriendRequestNotification', {
        toUserId: otherUser.id,
        toUserName: otherUser.full_name
      });

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-requests']);
      setSearchQuery('');
    }
  });

  const filteredUsers = allUsers.filter(u => {
    if (u.id === user?.id) return false; // Exclude self
    
    const alreadyFriend = friendships.some(
      f => (f.user_id_a === u.id && f.user_id_b === user?.id) ||
           (f.user_id_a === user?.id && f.user_id_b === u.id)
    );
    if (alreadyFriend) return false;

    const alreadyRequested = friendRequests.some(r => r.to_user_id === u.id);
    if (alreadyRequested) return false;

    return u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Friends</h1>
          <p className="text-gray-600">Discover and connect with other believers</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card className="bg-white p-12 text-center">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No users found matching your search' : 'Start searching to find friends'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-500">Try searching by name</p>
              )}
            </Card>
          ) : (
            filteredUsers.map(otherUser => (
              <Card key={otherUser.id} className="bg-white">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{otherUser.full_name}</h3>
                    <p className="text-xs text-gray-600">{otherUser.email}</p>
                    {otherUser.user_role && (
                      <p className="text-xs text-indigo-600 capitalize mt-1">{otherUser.user_role}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => sendRequestMutation.mutate(otherUser)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                    disabled={sendRequestMutation.isPending}
                  >
                    {sendRequestMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Add Friend
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl('Friends')}>
            <Button variant="outline">← Back to Friends</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}