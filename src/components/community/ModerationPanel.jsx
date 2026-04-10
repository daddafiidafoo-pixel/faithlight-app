import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Volume2, VolumeX, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ModerationPanel({ roomId, participants = [] }) {
  const queryClient = useQueryClient();
  const [selectedReason, setSelectedReason] = useState('');

  const { data: pendingMessages = [] } = useQuery({
    queryKey: ['pending-messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      return base44.entities.LiveChatMessage.filter(
        { room_id: roomId, status: 'pending' },
        '-created_date',
        50
      );
    },
    enabled: !!roomId,
    refetchInterval: 3000,
  });

  const approveMutation = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.LiveChatMessage.update(messageId, {
        status: 'approved',
        moderated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Message approved');
      queryClient.invalidateQueries(['pending-messages']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.LiveChatMessage.update(messageId, {
        status: 'rejected',
        moderated_at: new Date().toISOString(),
        rejection_reason: selectedReason || 'Violates community guidelines',
      });
    },
    onSuccess: () => {
      toast.success('Message rejected');
      queryClient.invalidateQueries(['pending-messages']);
      setSelectedReason('');
    },
  });

  const muteMutation = useMutation({
    mutationFn: async (participantId) => {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) throw new Error('Participant not found');
      return base44.entities.LiveRoomParticipant.update(participantId, {
        muted: !participant.muted,
      });
    },
    onSuccess: (_, participantId) => {
      const participant = participants.find(p => p.id === participantId);
      toast.success(participant?.muted ? 'Unmuted participant' : 'Muted participant');
      queryClient.invalidateQueries(['live-participants']);
    },
  });

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Moderation Controls
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
              {pendingMessages.length > 0 && (
                <Badge className="ml-2 bg-red-600">{pendingMessages.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            {pendingMessages.length === 0 ? (
              <div className="py-8 text-center text-gray-600">
                <p>No messages awaiting moderation</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-3 bg-white rounded-lg border border-amber-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-semibold">
                          {message.sender_id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{message.content}</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => approveMutation.mutate(message.id)}
                        disabled={approveMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectMutation.mutate(message.id)}
                        disabled={rejectMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="participants" className="space-y-3">
            {participants.length === 0 ? (
              <p className="text-sm text-gray-600">No active participants</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {participant.role}
                      </p>
                      <p className="text-xs text-gray-600">
                        {participant.user_id.slice(0, 8)}...
                      </p>
                    </div>

                    <Button
                      onClick={() => muteMutation.mutate(participant.id)}
                      disabled={muteMutation.isPending || participant.role === 'host'}
                      size="sm"
                      variant={participant.muted ? 'destructive' : 'outline'}
                      className="gap-2"
                    >
                      {participant.muted ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Muted
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Mute
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}