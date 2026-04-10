import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FriendRequests() {
  const [user, setUser] = useState(null);

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

  const { data: incomingRequests = [], isLoading: incomingLoading, refetch: refetchIncoming } = useQuery({
    queryKey: ['incomingRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const requests = await base44.entities.Friend.filter(
        { receiver_id: user.id, status: 'pending' },
        '-created_date',
        1000
      );

      // Get requester details
      const requesters = await Promise.all(
        requests.map(req =>
          base44.entities.User.filter({ id: req.requester_id }, '-created_date', 1)
        )
      );

      return requests.map((req, idx) => ({
        ...req,
        requester: requesters[idx]?.[0] || null
      }));
    },
    enabled: !!user
  });

  const { data: outgoingRequests = [], isLoading: outgoingLoading, refetch: refetchOutgoing } = useQuery({
    queryKey: ['outgoingRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const requests = await base44.entities.Friend.filter(
        { requester_id: user.id, status: 'pending' },
        '-created_date',
        1000
      );

      // Get receiver details
      const receivers = await Promise.all(
        requests.map(req =>
          base44.entities.User.filter({ id: req.receiver_id }, '-created_date', 1)
        )
      );

      return requests.map((req, idx) => ({
        ...req,
        receiver: receivers[idx]?.[0] || null
      }));
    },
    enabled: !!user
  });

  const handleAccept = async (friendshipId) => {
    try {
      await base44.entities.Friend.update(friendshipId, {
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });
      toast.success('Friend request accepted!');
      refetchIncoming();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (friendshipId) => {
    try {
      await base44.entities.Friend.delete(friendshipId);
      toast.success('Request declined');
      refetchIncoming();
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    }
  };

  const handleCancel = async (friendshipId) => {
    try {
      await base44.entities.Friend.delete(friendshipId);
      toast.success('Request cancelled');
      refetchOutgoing();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  const isLoading = incomingLoading || outgoingLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Incoming Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Incoming Requests</h2>
        {incomingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">No incoming requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incomingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {request.requester?.photo_url && (
                      <img
                        src={request.requester.photo_url}
                        alt={request.requester.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {request.requester?.display_name}
                      </p>
                      <p className="text-sm text-gray-600">@{request.requester?.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.id)}
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(request.id)}
                        className="text-red-600 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Outgoing Requests</h2>
        {outgoingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">No outgoing requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {outgoingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {request.receiver?.photo_url && (
                      <img
                        src={request.receiver.photo_url}
                        alt={request.receiver.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {request.receiver?.display_name}
                      </p>
                      <p className="text-sm text-gray-600">@{request.receiver?.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(request.id)}
                      className="text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}