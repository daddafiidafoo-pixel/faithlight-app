import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Heart, Zap, Users, MessageCircle, LogOut } from 'lucide-react';

import VideoStage from '@/components/service/VideoStage';
import ServiceChatPanel from '@/components/service/ServiceChatPanel';
import PrayerRequestPanel from '@/components/service/PrayerRequestPanel';
import ServiceHostControls from '@/components/service/ServiceHostControls';
import RaiseHandButton from '@/components/service/RaiseHandButton';
import QAQueuePanel from '@/components/service/QAQueuePanel';
import ModerationPanel from '@/components/service/ModerationPanel';
import NowSpeakingBanner from '@/components/service/NowSpeakingBanner';
import RoomStatsBar from '@/components/service/RoomStatsBar';

export default function ServiceRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');

  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userParticipant, setUserParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactionsBuffer, setReactionsBuffer] = useState([]);

  // Get user
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        navigate('/');
      }
    };
    getUser();
  }, [navigate]);

  // Load room
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setError('Invalid room');
        return;
      }

      try {
        setLoading(true);
        const roomData = await base44.entities.ServiceRoom.filter(
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
        const parts = await base44.entities.ServiceRoomParticipant.filter(
          { room_id: roomId, left_at: null },
          '-created_date',
          500
        );
        setParticipants(parts);

        const myRecord = parts.find((p) => p.user_id === user?.id);
        setUserParticipant(myRecord);
      } catch (e) {
        console.error('Failed to load participants:', e);
      }
    };

    if (user) loadParticipants();
  }, [roomId, user?.id]);

  // Subscribe to participant updates
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = base44.entities.ServiceRoomParticipant.subscribe((event) => {
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

  // Join room on first load
  useEffect(() => {
    const joinRoom = async () => {
      if (!room || !user || userParticipant) return;

      try {
        await base44.entities.ServiceRoomParticipant.create({
          room_id: roomId,
          user_id: user.id,
          user_name: user.full_name,
          user_avatar: user.avatar_url,
          role: user.id === room.host_id ? 'host' : 'audience',
          is_muted: user.id !== room.host_id,
          joined_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to join:', e);
      }
    };

    joinRoom();
  }, [room, user, userParticipant, roomId]);

  const handleReaction = async (type) => {
    if (!user) return;

    try {
      await base44.entities.ServiceReaction.create({
        room_id: roomId,
        user_id: user.id,
        reaction_type: type,
      });

      setReactionsBuffer((prev) => [...prev, { type, id: Math.random() }]);
      setTimeout(
        () =>
          setReactionsBuffer((prev) => prev.filter((r) => r.id !== prev[0]?.id)),
        1500
      );
    } catch (e) {
      console.error('Failed to send reaction:', e);
    }
  };

  const handleLeaveService = async () => {
    if (!userParticipant) return;

    try {
      await base44.entities.ServiceRoomParticipant.update(userParticipant.id, {
        left_at: new Date().toISOString(),
      });
      navigate('/');
    } catch (e) {
      console.error('Failed to leave:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-8 h-8 text-indigo-600 animate-pulse mx-auto mb-2" />
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="border-red-200 bg-red-50 w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-900 font-semibold mb-4">{error || 'Service not found'}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = user?.id === room?.host_id;
  const speakers = participants.filter((p) => p.is_on_stage);
  const userRole = userParticipant?.role || 'audience';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className="bg-green-100 text-green-800">🔴 LIVE</Badge>
              <Badge variant="outline">👥 {participants.length}</Badge>
              <Badge variant="outline">🎥 {speakers.length}/6</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Reactions */}
            {room.reactions_enabled && (
              <div className="flex gap-1 bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction('amen')}
                  className="text-sm gap-1"
                >
                  🙏 Amen
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction('heart')}
                  className="text-sm gap-1"
                >
                  ❤️ Heart
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction('praise')}
                  className="text-sm gap-1"
                >
                  🙌 Praise
                </Button>
              </div>
            )}

            {/* Raise Hand */}
            {userRole === 'audience' && (
              <RaiseHandButton roomId={roomId} userId={user?.id} userRole={userRole} />
            )}

            {/* Leave */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Leave
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Leave Service?</AlertDialogTitle>
                <AlertDialogDescription>You will be removed from the service.</AlertDialogDescription>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeaveService} className="bg-red-600">
                    Leave
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Room Stats */}
        <RoomStatsBar participants={participants} videoLimit={room?.video_limit || 6} />

        {/* Now Speaking Banner */}
        <NowSpeakingBanner roomId={roomId} />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Stage */}
            <VideoStage speakers={speakers} />

            {/* Chat & Prayer Tabs */}
            {(room.chat_enabled || room.prayer_requests_enabled) && (
              <Card>
                <Tabs defaultValue="chat" className="w-full">
                  <TabsList className="w-full rounded-none border-b">
                    {room.chat_enabled && (
                      <TabsTrigger value="chat" className="flex-1 gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Chat</span>
                      </TabsTrigger>
                    )}
                    {room.prayer_requests_enabled && (
                      <TabsTrigger value="prayer" className="flex-1 gap-2">
                        <span className="text-lg">🙏</span>
                        <span className="hidden sm:inline">Prayers</span>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {room.chat_enabled && (
                    <TabsContent value="chat" className="p-4 min-h-64">
                      <ServiceChatPanel roomId={roomId} user={user} isHost={isHost} />
                    </TabsContent>
                  )}

                  {room.prayer_requests_enabled && (
                    <TabsContent value="prayer" className="p-4 min-h-64">
                      <PrayerRequestPanel roomId={roomId} user={user} isHost={isHost} />
                    </TabsContent>
                  )}
                </Tabs>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Controls */}
            {isHost && (
              <ServiceHostControls room={room} participants={participants} onEndService={() => navigate('/')} />
            )}

            {/* Moderation Panel */}
            {isHost && (
              <ModerationPanel
                roomId={roomId}
                room={room}
                participants={participants}
                onUpdate={() => {}}
              />
            )}

            {/* Q&A Queue */}
            {isHost && (
              <QAQueuePanel
                roomId={roomId}
                isHost={isHost}
                participants={participants}
                room={room}
                onApprove={() => {}}
              />
            )}

            {/* Participant List */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Participants ({participants.length})
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {participants.length === 0 ? (
                    <p className="text-xs text-gray-500">No participants</p>
                  ) : (
                    participants.slice(0, 20).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <img
                          src={p.user_avatar || 'https://via.placeholder.com/32'}
                          alt={p.user_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{p.user_name}</p>
                          <p className="text-xs text-gray-500">
                            {p.role === 'host' && '🎤 Host'}
                            {p.role === 'speaker' && '🎙️ Speaker'}
                            {p.role === 'audience' && p.is_on_stage && '📹 On Stage'}
                            {p.role === 'audience' && !p.is_on_stage && '👂 Listening'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {participants.length > 20 && (
                    <p className="text-xs text-gray-500 py-2 text-center">
                      +{participants.length - 20} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Reactions */}
        <div className="fixed bottom-6 left-6 space-y-2 pointer-events-none">
          {reactionsBuffer.map((reaction) => (
            <div key={reaction.id} className="text-3xl animate-bounce">
              {reaction.type === 'amen' && '🙏'}
              {reaction.type === 'heart' && '❤️'}
              {reaction.type === 'praise' && '🙌'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}