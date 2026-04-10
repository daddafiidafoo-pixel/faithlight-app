import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { canUserJoinRoom } from '../functions/safetyGuards';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tv2, Users, Hand, MessageCircle, LogOut, AlertCircle, Loader2 } from 'lucide-react';

import HostControls from '@/components/live/HostControls';
import ParticipantList from '@/components/live/ParticipantList';
import RoomChat from '@/components/live/RoomChat';
import RaiseHandQueue from '@/components/live/RaiseHandQueue';

export default function JoinLiveRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get('roomId');

  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userParticipant, setUserParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnVideo, setIsOnVideo] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        navigate('/');
      }
    };
    getUser();
  }, [navigate]);

  // Load room data
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setError('Invalid room ID');
        return;
      }

      try {
        setLoading(true);
        const roomData = await base44.entities.LiveRoom.filter(
          { id: roomId },
          '-created_date',
          1
        );

        if (!roomData || roomData.length === 0) {
          setError('Room not found');
          return;
        }

        setRoom(roomData[0]);
      } catch (e) {
        console.error('Failed to load room:', e);
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);

  // Load participants
  useEffect(() => {
    if (!roomId) return;

    const loadParticipants = async () => {
      try {
        const parts = await base44.entities.LiveRoomParticipant.filter(
          { room_id: roomId, left_at: null },
          '-created_date',
          500
        );
        setParticipants(parts);

        // Find current user's participant record
        const myRecord = parts.find((p) => p.user_id === user?.id);
        setUserParticipant(myRecord);
        setIsSpeaking(myRecord?.is_speaking || false);
        setIsOnVideo(myRecord?.is_on_video || false);
      } catch (e) {
        console.error('Failed to load participants:', e);
      }
    };

    loadParticipants();
  }, [roomId, user?.id]);

  // Subscribe to real-time participant updates
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = base44.entities.LiveRoomParticipant.subscribe((event) => {
      if (event.data.room_id === roomId) {
        if (event.type === 'create' || event.type === 'update') {
          setParticipants((prev) => {
            const existing = prev.findIndex((p) => p.id === event.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = event.data;
              return updated;
            }
            return [...prev, event.data];
          });

          if (event.data.user_id === user?.id) {
            setUserParticipant(event.data);
          }
        }
      }
    });

    return unsubscribe;
  }, [roomId, user?.id]);

  // Join room on load (if not already joined)
  useEffect(() => {
    const joinRoom = async () => {
      if (!room || !user || userParticipant) return;

      try {
        // Check safety guards before joining
        const safetyCheck = await canUserJoinRoom(user.id, roomId, {
          hostUserId: room.host_id,
        });

        if (!safetyCheck.ok) {
          setError(safetyCheck.message);
          return;
        }

        await base44.entities.LiveRoomParticipant.create({
          room_id: roomId,
          user_id: user.id,
          user_name: user.full_name,
          user_avatar: user.avatar_url,
          role: user.id === room.host_id ? 'host' : 'audience',
          joined_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to join room:', e);
        setError('Failed to join room');
      }
    };

    joinRoom();
  }, [room, user, userParticipant, roomId]);

  const isHost = user?.id === room?.host_id;
  const canSpeak = isHost || userParticipant?.role === 'speaker';

  const handleToggleMic = async () => {
    if (!userParticipant) return;

    try {
      await base44.entities.LiveRoomParticipant.update(userParticipant.id, {
        is_speaking: !isSpeaking,
      });
    } catch (e) {
      console.error('Failed to toggle mic:', e);
    }
  };

  const handleToggleVideo = async () => {
    if (!userParticipant || participants.filter((p) => p.is_on_video).length >= 8) {
      return;
    }

    try {
      await base44.entities.LiveRoomParticipant.update(userParticipant.id, {
        is_on_video: !isOnVideo,
      });
    } catch (e) {
      console.error('Failed to toggle video:', e);
    }
  };

  const handleRaiseHand = async () => {
    if (!user || hasRaisedHand) return;

    try {
      await base44.entities.LiveRoomRaiseHand.create({
        room_id: roomId,
        user_id: user.id,
        user_name: user.full_name,
        reason: 'speak',
        raised_at: new Date().toISOString(),
      });
      setHasRaisedHand(true);
    } catch (e) {
      console.error('Failed to raise hand:', e);
    }
  };

  const handleLeaveRoom = async () => {
    if (!userParticipant) return;

    try {
      await base44.entities.LiveRoomParticipant.update(userParticipant.id, {
        left_at: new Date().toISOString(),
      });
      navigate('/');
    } catch (e) {
      console.error('Failed to leave room:', e);
    }
  };

  const handleEndRoom = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">{error || 'Room not found'}</h3>
                <Button onClick={() => navigate('/')} className="mt-4 w-full">
                  Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-green-100 text-green-800">🔴 LIVE</Badge>
                {room.room_type === 'broadcast_service' && (
                  <Badge variant="outline" className="gap-1">
                    <Tv2 className="w-3 h-3" /> Broadcast
                  </Badge>
                )}
                {room.room_type === 'bible_study' && (
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" /> Bible Study
                  </Badge>
                )}
                {room.room_type === 'prayer_room' && (
                  <Badge variant="outline" className="gap-1">
                    🙏 Prayer
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-2">
                <Users className="w-4 h-4" />
                {participants.length}
              </p>
              <p className="text-xs text-gray-500">participants</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <Card className="mb-6 bg-white border-gray-200">
          <CardContent className="pt-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-600">Participants</p>
                <p className="text-lg font-bold text-gray-900">{participants.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Speaking</p>
                <p className="text-lg font-bold text-gray-900">
                  {participants.filter((p) => p.is_speaking).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">On Video</p>
                <p className="text-lg font-bold text-gray-900">
                  {participants.filter((p) => p.is_on_video).length}/8
                </p>
              </div>
            </div>

            {/* User Controls */}
            <div className="flex gap-2">
              <Button
                onClick={handleToggleMic}
                disabled={!canSpeak}
                variant={isSpeaking ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                📢 {isSpeaking ? 'Mute' : 'Speak'}
              </Button>

              <Button
                onClick={handleToggleVideo}
                disabled={
                  !canSpeak || (isOnVideo ? false : participants.filter((p) => p.is_on_video).length >= 8)
                }
                variant={isOnVideo ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                📹 {isOnVideo ? 'Camera Off' : 'Camera On'}
              </Button>

              {!canSpeak && (
                <Button
                  onClick={handleRaiseHand}
                  disabled={hasRaisedHand}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                >
                  <Hand className="w-4 h-4" />
                  {hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Leave
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Leave Room?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be removed from the live room.
                  </AlertDialogDescription>
                  <div className="flex gap-3">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveRoom}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Leave
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Stage Placeholder */}
            <Card className="bg-black aspect-video rounded-lg flex items-center justify-center border-2 border-gray-800">
              <div className="text-center">
                <Tv2 className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  {participants.filter((p) => p.is_on_video).length > 0
                    ? `${participants.filter((p) => p.is_on_video).length} on stage`
                    : 'Video stage'}
                </p>
              </div>
            </Card>

            {/* Chat */}
            {room.allow_chat && (
              <RoomChat roomId={roomId} user={user} isHost={isHost} allowChat={room.allow_chat} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Controls */}
            {isHost && (
              <HostControls
                room={room}
                participants={participants}
                isHost={isHost}
                onEndRoom={handleEndRoom}
              />
            )}

            {/* Hand Raise Queue */}
            {isHost && <RaiseHandQueue roomId={roomId} isHost={isHost} />}

            {/* Participant List */}
            <ParticipantList
              participants={participants}
              isHost={isHost}
              onMuteUser={(id) => {
                // TODO: Implement mute
              }}
              onRemoveUser={(id) => {
                // TODO: Implement remove
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}