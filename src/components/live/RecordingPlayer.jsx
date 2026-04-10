import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';

export default function RecordingPlayer({ recording, eventType }) {
  const [loading, setLoading] = useState(false);

  if (!recording || recording.status !== 'ready' || !recording.playback_url) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Recording Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-800">
            The recording is being processed. Please check back in a few moments.
          </p>
        </CardContent>
      </Card>
    );
  }

  const duration = recording.duration_seconds ? 
    `${Math.floor(recording.duration_seconds / 60)}:${String(recording.duration_seconds % 60).padStart(2, '0')}` : 
    'Unknown';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Recording
          </span>
          <Badge variant="outline">{duration}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventType === 'audio_stage' ? (
          <audio 
            controls 
            className="w-full"
            src={recording.playback_url}
            style={{ height: '40px' }}
          >
            Your browser does not support the audio element.
          </audio>
        ) : (
          <video 
            controls 
            className="w-full rounded-lg bg-black"
            src={recording.playback_url}
            style={{ maxHeight: '400px' }}
          >
            Your browser does not support the video element.
          </video>
        )}
        <p className="text-xs text-gray-500">
          Ready since {new Date(recording.ready_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}