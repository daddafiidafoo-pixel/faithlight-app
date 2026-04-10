import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Radio, Square, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function StreamControlPanel({ stream, onClose }) {
  const queryClient = useQueryClient();
  const [streamUrl, setStreamUrl] = useState(stream.stream_url || '');
  const [recordingUrl, setRecordingUrl] = useState(stream.recording_url || '');

  const goLiveMutation = useMutation({
    mutationFn: async () => {
      if (!streamUrl) {
        throw new Error('Please enter stream URL');
      }
      return await base44.entities.LiveStream.update(stream.id, {
        status: 'live',
        actual_start: new Date().toISOString(),
        stream_url: streamUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-streams-admin']);
      toast.success('Stream is now LIVE!');
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LiveStream.update(stream.id, {
        status: 'ended',
        ended_at: new Date().toISOString(),
        recording_url: recordingUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-streams-admin']);
      toast.success('Stream ended');
      onClose();
    },
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stream.status === 'live' && <Radio className="w-5 h-5 text-red-600 animate-pulse" />}
            Stream Control Panel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">{stream.title}</h3>
            <Badge className={stream.status === 'live' ? 'bg-red-600' : 'bg-blue-600'}>
              {stream.status.toUpperCase()}
            </Badge>
          </div>

          {stream.status === 'scheduled' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="stream_url">Live Stream URL *</Label>
                <Input
                  id="stream_url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter the embed URL from YouTube, Vimeo, or your streaming platform
                </p>
              </div>

              <Button
                onClick={() => goLiveMutation.mutate()}
                disabled={!streamUrl || goLiveMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Radio className="w-4 h-4 mr-2" />
                {goLiveMutation.isPending ? 'Starting...' : 'Go Live Now'}
              </Button>
            </div>
          )}

          {stream.status === 'live' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5 text-red-600 animate-pulse" />
                  <span className="font-bold text-red-600">YOU ARE LIVE</span>
                </div>
                <div className="text-sm text-gray-700">
                  <div>👁 {stream.viewer_count} viewers</div>
                  <div>📈 Peak: {stream.peak_viewers} viewers</div>
                </div>
              </div>

              <div>
                <Label htmlFor="recording_url">Recording URL (Optional)</Label>
                <Input
                  id="recording_url"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-600 mt-1">
                  Add recording URL now or later. Users can watch it after the stream ends.
                </p>
              </div>

              <Button
                onClick={() => endStreamMutation.mutate()}
                disabled={endStreamMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                <Square className="w-4 h-4 mr-2" />
                {endStreamMutation.isPending ? 'Ending...' : 'End Stream'}
              </Button>
            </div>
          )}

          {stream.status === 'ended' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-2">This stream has ended.</p>
              <div className="text-sm text-gray-600">
                <div>Total views: {stream.total_views}</div>
                {stream.recording_url && <div>✅ Recording available</div>}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}