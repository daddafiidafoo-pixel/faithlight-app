import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, Download, Share2, Trash2, Lock, Users, Clock, Users2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SessionRecordings({ groupId, userId, userRole }) {
  const queryClient = useQueryClient();
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [playingRecordingId, setPlayingRecordingId] = useState(null);

  const { data: recordings = [] } = useQuery({
    queryKey: ['group-recordings', groupId],
    queryFn: async () => {
      const recs = await base44.entities.SessionRecording.filter({ group_id: groupId });
      return recs.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));
    },
  });

  const { data: userRecordings = [] } = useQuery({
    queryKey: ['user-recordings', userId],
    queryFn: async () => {
      const recs = await base44.entities.SessionRecording.filter({ host_user_id: userId });
      return recs.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));
    },
  });

  const deleteRecordingMutation = useMutation({
    mutationFn: async (recordingId) => {
      return await base44.entities.SessionRecording.delete(recordingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-recordings', groupId]);
      queryClient.invalidateQueries(['user-recordings', userId]);
      toast.success('Recording deleted');
    },
  });

  const incrementViewCountMutation = useMutation({
    mutationFn: async (recordingId) => {
      const rec = recordings.find(r => r.id === recordingId);
      return await base44.entities.SessionRecording.update(recordingId, {
        view_count: (rec?.view_count || 0) + 1,
      });
    },
  });

  const canAccessRecording = (recording) => {
    if (recording.host_user_id === userId) return true; // Host can always access
    if (recording.access_level === 'host_only') return false;
    if (recording.access_level === 'co_hosts' && userRole !== 'CO_HOST') return false;
    return true; // all_members can access
  };

  const accessibleRecordings = recordings.filter(canAccessRecording);
  const isHost = userRole === 'OWNER';

  const handlePlayRecording = (recordingId) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      setPlayingRecordingId(recordingId);
      incrementViewCountMutation.mutate(recordingId);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="group" className="space-y-4">
        <TabsList>
          <TabsTrigger value="group">Group Recordings ({recordings.length})</TabsTrigger>
          {isHost && <TabsTrigger value="my">My Sessions ({userRecordings.length})</TabsTrigger>}
        </TabsList>

        {/* Group Recordings */}
        <TabsContent value="group">
          {accessibleRecordings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No recordings available yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {accessibleRecordings.map(recording => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  onPlay={() => handlePlayRecording(recording.id)}
                  onSelect={() => setSelectedRecording(recording)}
                  canDelete={recording.host_user_id === userId}
                  onDelete={() => deleteRecordingMutation.mutate(recording.id)}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Sessions (Host only) */}
        {isHost && (
          <TabsContent value="my">
            {userRecordings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  You haven't recorded any sessions yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userRecordings.map(recording => (
                  <RecordingCard
                    key={recording.id}
                    recording={recording}
                    onPlay={() => handlePlayRecording(recording.id)}
                    onSelect={() => setSelectedRecording(recording)}
                    canDelete={true}
                    onDelete={() => deleteRecordingMutation.mutate(recording.id)}
                    formatDuration={formatDuration}
                    showStats={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Recording Details Dialog */}
      <Dialog open={!!selectedRecording} onOpenChange={() => setSelectedRecording(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRecording?.session_title}</DialogTitle>
          </DialogHeader>
          {selectedRecording && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Host</p>
                  <p className="font-semibold">{selectedRecording.host_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="font-semibold">{formatDuration(selectedRecording.duration_seconds)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Recorded</p>
                  <p className="font-semibold">
                    {new Date(selectedRecording.end_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Participants</p>
                  <p className="font-semibold">{selectedRecording.participant_count || 0}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button
                  onClick={() => {
                    handlePlayRecording(selectedRecording.id);
                    setSelectedRecording(null);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Play Recording
                </Button>

                {selectedRecording.recording_url && (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedRecording.recording_url);
                      toast.success('Link copied!');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                )}

                {selectedRecording.host_user_id === userId && (
                  <Button
                    onClick={() => {
                      deleteRecordingMutation.mutate(selectedRecording.id);
                      setSelectedRecording(null);
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Recording
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Playback Dialog */}
      <Dialog open={!!playingRecordingId} onOpenChange={() => setPlayingRecordingId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {recordings.find(r => r.id === playingRecordingId)?.session_title}
            </DialogTitle>
          </DialogHeader>
          {playingRecordingId && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Recording Player</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Audio recording would play here in production
                  </p>
                </div>
              </div>

              {recordings.find(r => r.id === playingRecordingId) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Duration:{' '}
                      {formatDuration(
                        recordings.find(r => r.id === playingRecordingId)?.duration_seconds
                      )}
                    </span>
                    <span>
                      Views:{' '}
                      {recordings.find(r => r.id === playingRecordingId)?.view_count || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecordingCard({
  recording,
  onPlay,
  onSelect,
  canDelete,
  onDelete,
  formatDuration,
  showStats,
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{recording.session_title}</h3>
            <p className="text-sm text-gray-600 mt-1">{recording.host_name}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(recording.duration_seconds)}
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1">
                <Users2 className="w-3 h-3" />
                {recording.participant_count || 0} participants
              </Badge>

              {recording.access_level === 'host_only' ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Host Only
                </Badge>
              ) : recording.access_level === 'co_hosts' ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Co-Hosts Only
                </Badge>
              ) : null}

              {showStats && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {recording.view_count || 0} views
                </Badge>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {new Date(recording.end_time).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onPlay} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <PlayCircle className="w-4 h-4" />
            </Button>
            <Button onClick={onSelect} size="sm" variant="outline">
              Details
            </Button>
            {canDelete && (
              <Button onClick={onDelete} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}