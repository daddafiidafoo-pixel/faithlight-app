import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Circle, Disc3, Share2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function RecordingControls({
  session,
  isHost,
  groupId,
  onRecordingToggle,
}) {
  const queryClient = useQueryClient();
  const [recordingSettingsOpen, setRecordingSettingsOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState(session?.allow_recording_access || 'all_members');
  const [announceRecording, setAnnounceRecording] = useState(session?.announce_recording ?? true);

  const updateRecordingMutation = useMutation({
    mutationFn: async (updates) => {
      return await base44.entities.LiveSession.update(session.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session', session.id]);
      toast.success('Recording settings updated');
      setRecordingSettingsOpen(false);
    },
  });

  const stopRecordingMutation = useMutation({
    mutationFn: async () => {
      const recordingUrl = `${window.location.origin}/recordings/${session.id}`;
      
      // Create SessionRecording record
      await base44.entities.SessionRecording.create({
        session_id: session.id,
        group_id: groupId,
        host_user_id: session.host_user_id,
        host_name: session.host_name,
        session_title: session.session_title,
        recording_url: recordingUrl,
        start_time: session.recording_start_time,
        end_time: new Date().toISOString(),
        access_level: accessLevel,
      });

      // Update LiveSession with recording URL
      return await base44.entities.LiveSession.update(session.id, {
        recording_enabled: false,
        recording_url: recordingUrl,
        recording_duration_seconds: Math.round(
          (new Date() - new Date(session.recording_start_time)) / 1000
        ),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session', session.id]);
      toast.success('Recording saved and stopped');
      if (onRecordingToggle) onRecordingToggle(false);
    },
    onError: (error) => {
      toast.error('Failed to save recording');
    },
  });

  const startRecordingMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LiveSession.update(session.id, {
        recording_enabled: true,
        recording_start_time: new Date().toISOString(),
        allow_recording_access: accessLevel,
        announce_recording: announceRecording,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session', session.id]);
      toast.success('Recording started');
      if (onRecordingToggle) onRecordingToggle(true);
    },
  });

  if (!isHost) return null;

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {session?.recording_enabled ? (
              <>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                Recording Active
              </>
            ) : (
              <>
                <Disc3 className="w-5 h-5" />
                Session Recording
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.recording_enabled && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Recording in progress. All audio is being captured.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {!session?.recording_enabled ? (
              <Button
                onClick={() => startRecordingMutation.mutate()}
                disabled={startRecordingMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Disc3 className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={() => stopRecordingMutation.mutate()}
                disabled={stopRecordingMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Stop Recording
              </Button>
            )}

            <Button
              onClick={() => setRecordingSettingsOpen(true)}
              variant="outline"
              className="flex-1"
            >
              Settings
            </Button>
          </div>

          {session?.recording_duration_seconds && (
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Recording Duration</p>
              <p className="font-semibold">
                {formatSeconds(session.recording_duration_seconds)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={recordingSettingsOpen} onOpenChange={setRecordingSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recording Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Who can access the recording?</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_members">All Group Members</SelectItem>
                  <SelectItem value="co_hosts">Host & Co-Hosts Only</SelectItem>
                  <SelectItem value="host_only">Host Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                Controls who can view the recording after the session ends.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-semibold">Announce Recording</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Notify participants when recording starts/stops
                </p>
              </div>
              <Switch checked={announceRecording} onCheckedChange={setAnnounceRecording} />
            </div>

            <Button
              onClick={() =>
                updateRecordingMutation.mutate({
                  allow_recording_access: accessLevel,
                  announce_recording: announceRecording,
                })
              }
              disabled={updateRecordingMutation.isPending}
              className="w-full"
            >
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}