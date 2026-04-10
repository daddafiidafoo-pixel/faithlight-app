import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Monitor, Mic } from 'lucide-react';

export default function RoomStatsBar({ participants, videoLimit }) {
  const onStageCount = participants.filter((p) => p.is_on_stage && !p.left_at).length;
  const activeParticipants = participants.filter((p) => !p.left_at).length;
  const speakerCount = participants.filter((p) => p.role === 'speaker' && !p.left_at).length;

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="pt-4">
        <div className="flex items-center justify-start gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Participants</p>
              <p className="text-lg font-bold text-gray-900">{activeParticipants}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">On Video</p>
              <p className="text-lg font-bold text-gray-900">
                {onStageCount} / {videoLimit}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Speaking</p>
              <p className="text-lg font-bold text-gray-900">{speakerCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}