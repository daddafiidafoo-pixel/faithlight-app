import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Hand, Users, LogOut, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LiveChatPanel from './LiveChatPanel';

export default function LiveSessionParticipant({ sessionId, userId, userName }) {
  const queryClient = useQueryClient();
  const [myRole, setMyRole] = useState('listener');
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.LiveSession.filter({ id: sessionId });
      return sessions[0];
    },
  });

  const { data: myParticipant } = useQuery({
    queryKey: ['my-participant', sessionId, userId],
    queryFn: async () => {
      const participants = await base44.entities.SessionParticipant.filter({
        session_id: sessionId,
        user_id: userId,
      });
      return participants[0];
    },
    refetchInterval: 1000,
  });

  const { data: otherParticipants = [] } = useQuery({
    queryKey: ['other-participants', sessionId],
    queryFn: async () => {
      const participants = await base44.entities.SessionParticipant.filter({
        session_id: sessionId,
      });
      return participants.filter(p => p.user_id !== userId);
    },
    refetchInterval: 2000,
  });

  const toggleHandMutation = useMutation({
    mutationFn: async (raised) => {
      if (!myParticipant) return;
      return await base44.entities.SessionParticipant.update(myParticipant.id, {
        voice_state: raised ? 'requesting' : 'listener',
        hand_raised_at: raised ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-participant']);
    },
  });

  const toggleMuteMutation = useMutation({
    mutationFn: async (newMutedState) => {
      if (!myParticipant) return;
      // If request to speak is required and user is not speaker, prevent unmute
      if (!newMutedState && session?.request_to_speak_enabled && myRole !== 'speaker') {
        toast.error('Raise your hand to request to speak');
        return;
      }
      return await base44.entities.SessionParticipant.update(myParticipant.id, {
        is_muted: newMutedState,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-participant']);
      setIsMuted(!isMuted);
    },
  });

  useEffect(() => {
    if (myParticipant) {
      setMyRole(myParticipant.live_role);
      setIsMuted(myParticipant.is_muted);
      setHandRaised(myParticipant.voice_state === 'requesting');
    }
  }, [myParticipant]);

  const canUnmute = myRole === 'speaker' || session?.allow_unmute;
  const speakerCount = otherParticipants.filter(p => p.voice_state === 'speaker').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{session?.session_title}</h1>
          <Badge className="mt-4 bg-green-100 text-green-800">LIVE</Badge>
        </div>

        {/* Main Audio Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mute Toggle */}
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-lg">Microphone</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isMuted ? 'You are muted' : 'You are live'}
                  </p>
                </div>
                <Button
                  onClick={() => toggleMuteMutation.mutate(!isMuted)}
                  disabled={!canUnmute && !isMuted}
                  className={isMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}
                  size="lg"
                >
                  {isMuted ? (
                    <><MicOff className="w-5 h-5 mr-2" /> Muted</>
                  ) : (
                    <><Mic className="w-5 h-5 mr-2" /> Live</>
                  )}
                </Button>
              </div>

              {/* Raise Hand */}
              {session?.request_to_speak_enabled && myRole === 'listener' && (
                <div className="flex items-center justify-between p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-semibold text-lg">Request to Speak</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {handRaised ? 'Your hand is raised' : 'Raise your hand to request speaking'}
                    </p>
                  </div>
                  <Button
                    onClick={() => toggleHandMutation.mutate(!handRaised)}
                    className={handRaised ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}
                    size="lg"
                  >
                    {handRaised ? (
                      <><Hand className="w-5 h-5 mr-2" /> Hand Raised</>
                    ) : (
                      <><Hand className="w-5 h-5 mr-2" /> Raise Hand</>
                    )}
                  </Button>
                </div>
              )}

              {/* Status */}
              <div className="pt-4 border-t">
                <Badge className={
                  myRole === 'speaker' ? 'bg-green-100 text-green-800' :
                  myRole === 'co_host' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {myRole === 'speaker' ? '🎤 Speaker' : myRole === 'co_host' ? '🎛️ Co-Host' : '👂 Listener'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Session Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <LiveChatPanel
              sessionId={sessionId}
              userId={userId}
              userName={userName}
              isHost={false}
              isCoHost={false}
              maxHeight="h-80"
            />
          </CardContent>
        </Card>

        {/* Speakers */}
        {speakerCount > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-green-600" />
                Current Speakers ({speakerCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {otherParticipants
                  .filter(p => p.voice_state === 'speaker')
                  .map(speaker => (
                    <div key={speaker.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                      <span className="font-semibold">{speaker.user_name}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Participants ({otherParticipants.length + 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <Badge className="bg-indigo-600">You</Badge>
                <span className="font-semibold flex-1">You</span>
                {isMuted ? <MicOff className="w-4 h-4 text-gray-400" /> : <Mic className="w-4 h-4 text-green-600" />}
              </div>

              {otherParticipants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg">
                  <span className="font-semibold flex-1">{participant.user_name}</span>
                  {participant.is_muted ? (
                    <MicOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Mic className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}