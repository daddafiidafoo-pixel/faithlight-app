import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, AlertCircle, Video, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';

export default function EventArchive() {
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [session, setSession] = useState(null);
  const [recording, setRecording] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event_id');
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchArchive = async () => {
      if (!eventId || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch event
        const eventData = await base44.entities.LiveRoom.read(eventId);
        setEvent(eventData);

        // Fetch session
        const sessionData = await base44.entities.EventSession.read(sessionId);
        setSession(sessionData);

        // Fetch recording
        const recordings = await base44.entities.EventRecording.filter({
          event_id: eventId,
          session_id: sessionId
        });
        if (recordings.length > 0) {
          setRecording(recordings[0]);
        }

        // Fetch participants
        const participantList = await base44.entities.ParticipantLog.filter({
          event_id: eventId,
          session_id: sessionId
        });
        setParticipants(participantList);

        // Fetch moderation logs (only if host/admin)
        if (user?.id === eventData.host_id || user?.role === 'admin') {
          const moderationLogs = await base44.entities.ModerationLog.filter({
            event_id: eventId,
            session_id: sessionId
          });
          setLogs(moderationLogs);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching archive:', err);
        setLoading(false);
      }
    };

    if (user) {
      fetchArchive();
    }
  }, [eventId, sessionId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading archive...</div>
      </div>
    );
  }

  if (!event || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--faith-light-bg)] to-[var(--faith-light-bg-secondary)] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="pt-6 flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Archive not found
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isHost = user?.id === event.host_id;
  const durationMinutes = recording ? Math.floor(recording.duration_seconds / 60) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--faith-light-bg)] to-[var(--faith-light-bg-secondary)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          ← Back
        </Button>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[var(--faith-light-primary)] to-[#1E40AF] text-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-white/80 mb-4">Event Archive - {format(new Date(session.started_at), 'PPP p')}</p>

          {/* RECORDING PLAYER */}
          {recording?.status === 'ready' && recording?.playback_url && (
            <div className="bg-black/20 rounded-lg p-4 border border-white/20">
              <video
                src={recording.playback_url}
                controls
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: '400px' }}
              />
              <p className="text-sm text-white/70 mt-2">
                Duration: {durationMinutes} minutes
              </p>
            </div>
          )}

          {recording?.status === 'processing' && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-100">⏳ Recording is being processed... This may take a few minutes.</p>
            </div>
          )}

          {recording?.status === 'failed' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-100">❌ Recording failed: {recording.error_message}</p>
            </div>
          )}
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[var(--faith-light-primary)]" />
                <p className="text-sm text-gray-600">Started</p>
              </div>
              <p className="font-semibold">{format(new Date(session.started_at), 'PPP')}</p>
              <p className="text-sm text-gray-600">{format(new Date(session.started_at), 'p')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[var(--faith-light-primary)]" />
                <p className="text-sm text-gray-600">Participants</p>
              </div>
              <p className="font-semibold">{participants.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-[var(--faith-light-primary)]" />
                <p className="text-sm text-gray-600">Recording</p>
              </div>
              <Badge className={recording?.status === 'ready' ? 'bg-green-600' : 'bg-yellow-600'}>
                {recording?.status === 'ready' ? '✓ Ready' : 'Processing...'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <Tabs defaultValue="participants">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants">
              Participants ({participants.length})
            </TabsTrigger>
            {isHost && (
              <TabsTrigger value="moderation">
                Moderation ({logs.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* PARTICIPANTS */}
          <TabsContent value="participants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-sm">{p.user_name}</p>
                        <p className="text-xs text-gray-600 capitalize">{p.role}</p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {p.duration_seconds ? `${Math.floor(p.duration_seconds / 60)}m` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODERATION */}
          {isHost && (
            <TabsContent value="moderation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Moderation Log</CardTitle>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 ? (
                    <p className="text-gray-600 text-sm">No moderation actions taken</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {logs.map(log => (
                        <div key={log.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                          <p className="font-medium capitalize">{log.action}</p>
                          <p className="text-xs text-gray-600">by {log.actor_user_id}</p>
                          {log.target_user_id && (
                            <p className="text-xs text-gray-600">target: {log.target_user_id}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}