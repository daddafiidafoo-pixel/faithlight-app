import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, UserX, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FriendsList({ userId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', userId],
    queryFn: () =>
      base44.entities.Friend.filter({ user_id: userId, status: 'accepted' })
  });

  const { data: pending = [] } = useQuery({
    queryKey: ['pendingFriends', userId],
    queryFn: () =>
      base44.entities.Friend.filter({ user_id: userId, status: 'pending' })
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friendRequests', userId],
    queryFn: () =>
      base44.asServiceRole.entities.Friend.filter({ friend_id: userId, status: 'pending' })
  });

  const acceptMutation = useMutation({
    mutationFn: (friendRequestId) =>
      base44.functions.invoke('acceptFriendship', { friendRequestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });

  const filteredFriends = friends.filter((f) =>
    f.friend_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl space-y-4">
      <Input
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        {/* Friends */}
        <TabsContent value="friends" className="space-y-2">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No friends yet</div>
          ) : (
            filteredFriends.map((friend) => (
              <Card key={friend.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300" />
                  <span className="font-medium">{friend.friend_name}</span>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Requests Sent */}
        <TabsContent value="pending" className="space-y-2">
          {pending.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending requests</div>
          ) : (
            pending.map((friend) => (
              <Card key={friend.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300" />
                  <span className="font-medium">{friend.friend_name}</span>
                </div>
                <span className="text-xs text-gray-500">Pending...</span>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Incoming Requests */}
        <TabsContent value="requests" className="space-y-2">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending requests</div>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300" />
                  <span className="font-medium">{request.created_by}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}