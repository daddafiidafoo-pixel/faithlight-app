import React from 'react';
import { Tv2 } from 'lucide-react';

export default function VideoStage({ speakers = [] }) {
  if (speakers.length === 0) {
    return (
      <div className="w-full bg-black rounded-lg aspect-video flex items-center justify-center border-2 border-gray-800">
        <div className="text-center">
          <Tv2 className="w-12 h-12 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Waiting for speakers...</p>
        </div>
      </div>
    );
  }

  // Grid layout based on number of speakers (1-6)
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2',
    5: 'grid-cols-3',
    6: 'grid-cols-3',
  }[Math.min(speakers.length, 6)] || 'grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-3 w-full bg-black rounded-lg p-3 min-h-96`}>
      {speakers.slice(0, 6).map((speaker) => (
        <div
          key={speaker.id}
          className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center border border-gray-700 overflow-hidden relative"
        >
          {/* Placeholder for video - in real implementation use webrtc */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <img
              src={speaker.user_avatar || 'https://via.placeholder.com/200'}
              alt={speaker.user_name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <p className="text-white text-xs font-medium text-center px-2">{speaker.user_name}</p>
            <p className="text-gray-400 text-xs">{speaker.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}