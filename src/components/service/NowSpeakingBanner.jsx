import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Mic } from 'lucide-react';

export default function NowSpeakingBanner({ roomId }) {
  const [currentSpeaker, setCurrentSpeaker] = useState(null);

  useEffect(() => {
    const fetchCurrentSpeaker = async () => {
      try {
        const speaking = await base44.entities.ServiceSpeakerRequest.filter(
          { room_id: roomId, status: 'speaking' },
          '-started_speaking_at',
          1
        );
        setCurrentSpeaker(speaking.length > 0 ? speaking[0] : null);
      } catch (e) {
        console.error('Failed to fetch current speaker:', e);
      }
    };

    fetchCurrentSpeaker();

    const unsubscribe = base44.entities.ServiceSpeakerRequest.subscribe((event) => {
      if (event.data.room_id === roomId) {
        if (event.data.status === 'speaking') {
          setCurrentSpeaker(event.data);
        } else if (
          currentSpeaker?.id === event.id &&
          event.data.status !== 'speaking'
        ) {
          setCurrentSpeaker(null);
        }
      }
    });

    return unsubscribe;
  }, [roomId]);

  if (!currentSpeaker) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 mb-6">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600">
            <Mic className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Now speaking:</p>
            <p className="text-sm font-semibold text-gray-900">
              {currentSpeaker.user_name} —{' '}
              {currentSpeaker.request_type === 'question' && '❓ Question'}
              {currentSpeaker.request_type === 'testimony' && '✝️ Testimony'}
              {currentSpeaker.request_type === 'prayer' && '🙏 Prayer'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}