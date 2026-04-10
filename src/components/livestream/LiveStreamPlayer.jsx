import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Radio, Eye } from 'lucide-react';
import LiveChatPanel from './LiveChatPanel';

export default function LiveStreamPlayer({ stream, user, onClose }) {
  const [hasViewed, setHasViewed] = useState(false);

  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.LiveStream.update(stream.id, {
        viewer_count: (stream.viewer_count || 0) + 1,
        peak_viewers: Math.max(stream.peak_viewers || 0, (stream.viewer_count || 0) + 1),
        total_views: (stream.total_views || 0) + 1,
      });
    },
  });

  useEffect(() => {
    if (!hasViewed) {
      incrementViewMutation.mutate();
      setHasViewed(true);
    }

    return () => {
      if (stream.status === 'live') {
        base44.entities.LiveStream.update(stream.id, {
          viewer_count: Math.max(0, (stream.viewer_count || 1) - 1),
        });
      }
    };
  }, []);

  const videoUrl = stream.status === 'ended' ? stream.recording_url : stream.stream_url;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0">
        <div className="grid md:grid-cols-3 h-full">
          {/* Video Player */}
          <div className="md:col-span-2 bg-black">
            <div className="p-4 bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{stream.title}</h2>
                  {stream.status === 'live' && (
                    <Badge className="bg-red-600 mt-2 animate-pulse">● LIVE</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {stream.viewer_count || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-white text-center">
                  <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Stream will begin shortly...</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-900 text-white">
              <p className="text-sm">{stream.description}</p>
            </div>
          </div>

          {/* Chat Panel */}
          {stream.chat_enabled && (
            <div className="border-l border-gray-200">
              <LiveChatPanel streamId={stream.id} user={user} isLive={stream.status === 'live'} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}