import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MicOff, Trash2, UserX, Lock, Unlock } from 'lucide-react';
import FlaggedContentQueue from './FlaggedContentQueue';
import TimedMutePanel from './TimedMutePanel';
import TimedChatLockPanel from './TimedChatLockPanel';

export default function ModerationPanel({ roomId, room, participants, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleMuteAll = async () => {
    try {
      setLoading(true);
      const audienceMembers = participants.filter(
        (p) => p.role === 'audience'
      );
      for (const member of audienceMembers) {
        await base44.entities.ServiceRoomParticipant.update(member.id, {
          is_muted: true,
        });
      }
      onUpdate?.();
    } catch (e) {
      console.error('Failed to mute all:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMuteUser = async (userId, userName) => {
    try {
      const participant = participants.find((p) => p.user_id === userId);
      if (participant) {
        await base44.entities.ServiceRoomParticipant.update(participant.id, {
          is_muted: !participant.is_muted,
        });
        onUpdate?.();
      }
    } catch (e) {
      console.error('Failed to mute user:', e);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      const participant = participants.find((p) => p.user_id === userId);
      if (participant) {
        await base44.entities.ServiceRoomParticipant.update(participant.id, {
          left_at: new Date().toISOString(),
        });
        onUpdate?.();
      }
    } catch (e) {
      console.error('Failed to remove user:', e);
    }
  };

  const handleToggleChatLock = async () => {
    try {
      await base44.entities.ServiceRoom.update(room.id, {
        chat_enabled: !room.chat_enabled,
      });
      onUpdate?.();
    } catch (e) {
      console.error('Failed to toggle chat:', e);
    }
  };

  const nonHostParticipants = participants.filter((p) => p.role !== 'host');

  return (
    <div className="space-y-4">
      {/* AI Flagged Content */}
      {roomId && <FlaggedContentQueue roomId={roomId} />}

      {/* Timed Mute */}
      {roomId && <TimedMutePanel roomId={roomId} participants={participants} />}

      {/* Timed Chat Lock */}
      {roomId && room && (
        <TimedChatLockPanel roomId={roomId} room={room} />
      )}

      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-red-900">Quick Moderation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
        {/* Bulk Actions */}
        <div className="space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="w-full text-xs gap-2"
              >
                <MicOff className="w-3 h-3" />
                Mute All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Mute all participants?</AlertDialogTitle>
              <AlertDialogDescription>
                Everyone except you will be muted.
              </AlertDialogDescription>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleMuteAll}
                  className="bg-red-600"
                >
                  Mute All
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs gap-2"
            onClick={handleToggleChatLock}
          >
            {room.chat_enabled ? (
              <>
                <Lock className="w-3 h-3" />
                Lock Chat
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3" />
                Unlock Chat
              </>
            )}
          </Button>
        </div>

        {/* User Actions */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-900 mb-2">Quick Actions</p>
          <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
            {nonHostParticipants.length === 0 ? (
              <p className="text-gray-500">No other participants</p>
            ) : (
              nonHostParticipants.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 p-1 bg-white rounded hover:bg-gray-50"
                >
                  <span className="truncate font-medium text-gray-900">
                    {p.user_name}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() =>
                        handleMuteUser(p.user_id, p.user_name)
                      }
                      title={p.is_muted ? 'Unmute' : 'Mute'}
                    >
                      <MicOff className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-600"
                        >
                          <UserX className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Remove {p.user_name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          They will be kicked from the service.
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveUser(p.user_id)}
                            className="bg-red-600"
                          >
                            Remove
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}