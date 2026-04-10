import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Mic, MicOff, Video, VideoOff, LogOut, Settings, Hand, Volume2, Lock, Unlock, Clock } from 'lucide-react';
import { toast } from 'sonner';
import LiveChatPanel from './LiveChatPanel';
import ModerationPanel from '@/components/moderation/ModerationPanel';
import MuteUserDialog from '@/components/moderation/MuteUserDialog';
import { generateSessionSummary } from '@/functions/generateSessionSummary';

export default function LiveSessionHost({ sessionId, hostUserId }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [sessionSettings, setSessionSettings] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [selectedUserToMute, setSelectedUserToMute] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: session } = useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.LiveSession.filter({ id: sessionId });
      return sessions[0];
    },
  });

  const { data: sessionParticipants = [] } = useQuery({
    queryKey: ['session-participants', sessionId],
    queryFn: () => base44.entities.SessionParticipant.filter({ session_id: sessionId }),
    refetchInterval: 2000,
  });

  const muteParticipantMutation = useMutation({
    mutationFn: async ({ participantId, isMuted }) => {
      return await base44.entities.SessionParticipant.update(participantId, {
        is_muted: isMuted,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-participants', sessionId]);
    },
  });

  const promoteToSpeakerMutation = useMutation({
    mutationFn: async (participantId) => {
      return await base44.entities.SessionParticipant.update(participantId, {
        voice_state: 'speaker',
        is_muted: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-participants', sessionId]);
      toast.success('Promoted to speaker');
    },
  });

  const demoteToListenerMutation = useMutation({
    mutationFn: async (participantId) => {
      return await base44.entities.SessionParticipant.update(participantId, {
        voice_state: 'listener',
        is_muted: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-participants', sessionId]);
      toast.success('Demoted to listener');
    },
  });

  const updateSessionSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      return await base44.entities.LiveSession.update(sessionId, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session', sessionId]);
      toast.success('Settings updated');
    },
  });

  const muteAllMutation = useMutation({
    mutationFn: async () => {
      // Update all participants in the session
      const updates = sessionParticipants.map(p =>
        base44.entities.SessionParticipant.update(p.id, { is_muted: true })
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-participants', sessionId]);
      toast.success('All muted');
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const updatedSession = await base44.entities.LiveSession.update(sessionId, {
        status: 'ended',
        end_time: new Date().toISOString(),
      });
      
      // Generate AI summary asynchronously
      try {
        setTimeout(() => generateSessionSummary(sessionId), 500);
      } catch (error) {
        console.error('Summary generation started:', error);
      }
      
      return updatedSession;
    },
    onSuccess: () => {
      toast.success('Session ended. Summary is being generated...');
      setTimeout(() => {
        window.location.href = '/Home';
      }, 2000);
    },
    onError: () => {
      toast.error('Failed to end session');
    },
  });

  const requestCount = sessionParticipants.filter(p => p.voice_state === 'requesting').length;
  const speakerCount = sessionParticipants.filter(p => p.voice_state === 'speaker').length;
  const listenerCount = sessionParticipants.filter(p => p.voice_state === 'listener').length;

  if (!user || !session) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{session.session_title}</h1>
          <p className="text-gray-600 mt-2">{session.session_type} • Hosted by {session.host_name}</p>
          <Badge className="mt-4 bg-green-100 text-green-800">LIVE</Badge>
        </div>

        {/* Control Panel */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Controls */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Host Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                    onClick={() => endSessionMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                    disabled={endSessionMutation.isPending}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    End Session
                  </Button>

                  <Button 
                    onClick={() => muteAllMutation.mutate()}
                    variant="outline"
                    size="lg"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Mute All
                  </Button>

                  <Button 
                    onClick={() => setSessionSettings({
                      ...sessionSettings,
                      room_locked: !session.room_locked
                    })}
                    variant="outline"
                    size="lg"
                  >
                  {session.room_locked ? (
                    <><Lock className="w-5 h-5 mr-2" /> Unlock Room</>
                  ) : (
                    <><Unlock className="w-5 h-5 mr-2" /> Lock Room</>
                  )}
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Mute All on Join</Label>
                  <Switch 
                    checked={session.mute_all_on_join}
                    onCheckedChange={(val) => updateSessionSettingsMutation.mutate({ mute_all_on_join: val })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Request to Speak Required</Label>
                  <Switch 
                    checked={session.request_to_speak_enabled}
                    onCheckedChange={(val) => updateSessionSettingsMutation.mutate({ request_to_speak_enabled: val })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow Self-Unmute</Label>
                  <Switch 
                    checked={session.allow_unmute}
                    onCheckedChange={(val) => updateSessionSettingsMutation.mutate({ allow_unmute: val })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-indigo-600">{sessionParticipants.length}</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Speakers</span>
                  <Badge>{speakerCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Listeners</span>
                  <Badge variant="secondary">{listenerCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Requesting</span>
                  <Badge className="bg-orange-100 text-orange-800">{requestCount}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat & Participants */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat */}
          <div className="lg:col-span-1">
            <LiveChatPanel
              sessionId={sessionId}
              userId={hostUserId}
              userName={user?.full_name}
              isHost={true}
              maxHeight="h-96"
            />
          </div>

          {/* Participants & Moderation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Moderation Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <ModerationPanel
                  sessionId={sessionId}
                  hostUserId={hostUserId}
                  hostName={user?.full_name}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participant Management</CardTitle>
              </CardHeader>
              <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All ({sessionParticipants.length})</TabsTrigger>
                <TabsTrigger value="speakers">Speakers ({speakerCount})</TabsTrigger>
                <TabsTrigger value="requesting">Requesting ({requestCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-3">
                  {sessionParticipants.map(participant => (
                    <ParticipantRow
                       key={participant.id}
                       participant={participant}
                       isHost={true}
                       onMute={(isMuted) => muteParticipantMutation.mutate({ participantId: participant.id, isMuted })}
                       onPromote={() => promoteToSpeakerMutation.mutate(participant.id)}
                       onDemote={() => demoteToListenerMutation.mutate(participant.id)}
                       onTemporaryMute={() => {
                         setSelectedUserToMute(participant);
                         setMuteDialogOpen(true);
                       }}
                     />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="speakers">
                <div className="space-y-3">
                  {sessionParticipants
                    .filter(p => p.voice_state === 'speaker')
                    .map(participant => (
                      <ParticipantRow
                        key={participant.id}
                        participant={participant}
                        isHost={true}
                        onMute={(isMuted) => muteParticipantMutation.mutate({ participantId: participant.id, isMuted })}
                        onDemote={() => demoteToListenerMutation.mutate(participant.id)}
                        onTemporaryMute={() => {
                          setSelectedUserToMute(participant);
                          setMuteDialogOpen(true);
                        }}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="requesting">
                <div className="space-y-3">
                  {sessionParticipants
                    .filter(p => p.voice_state === 'requesting')
                    .map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          <Hand className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-semibold">{participant.user_name}</p>
                            <p className="text-xs text-gray-600">Raised hand</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => promoteToSpeakerMutation.mutate(participant.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Allow to Speak
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
              </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mute Dialog */}
        {selectedUserToMute && (
          <MuteUserDialog
            open={muteDialogOpen}
            onOpenChange={setMuteDialogOpen}
            sessionId={sessionId}
            userId={selectedUserToMute.user_id}
            userName={selectedUserToMute.user_name}
            hostUserId={hostUserId}
            hostName={user?.full_name}
          />
        )}
      </div>
    </div>
  );
}

function ParticipantRow({ participant, isHost, onMute, onPromote, onDemote, onTemporaryMute }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <div>
          <p className="font-semibold">{participant.user_name}</p>
          <div className="flex gap-2 mt-1">
            <Badge className={
              participant.voice_state === 'speaker' ? 'bg-green-100 text-green-800' :
              participant.voice_state === 'requesting' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }>
              {participant.voice_state}
            </Badge>
            {participant.is_muted ? (
              <Badge variant="outline">
                <MicOff className="w-3 h-3 mr-1" /> Muted
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">
                <Mic className="w-3 h-3 mr-1" /> Live
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isHost && (
        <div className="flex gap-2">
          <Button
            onClick={() => onMute(!participant.is_muted)}
            variant="outline"
            size="sm"
          >
            {participant.is_muted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button
            onClick={onTemporaryMute}
            variant="outline"
            size="sm"
            title="Temporarily mute user"
          >
            <Clock className="w-4 h-4" />
          </Button>
          {participant.voice_state !== 'speaker' && onPromote && (
            <Button onClick={() => onPromote()} variant="outline" size="sm">
              Promote
            </Button>
          )}
          {participant.voice_state === 'speaker' && onDemote && (
            <Button onClick={() => onDemote()} variant="outline" size="sm">
              Demote
            </Button>
          )}
        </div>
      )}
    </div>
  );
}