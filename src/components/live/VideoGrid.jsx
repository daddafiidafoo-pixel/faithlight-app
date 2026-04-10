import React from 'react';
import { Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';

function VideoTile({ member, isYou }) {
  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 ${isYou ? 'border-indigo-500' : 'border-gray-700'} ${member.is_speaking ? 'ring-2 ring-green-400' : ''}`}>
      {member.is_on_video ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          {/* In production: replace with actual WebRTC video element */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
              {member.user_name?.[0]?.toUpperCase()}
            </div>
            <p className="text-white text-xs opacity-60">Video stream</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          {member.user_avatar ? (
            <img src={member.user_avatar} alt={member.user_name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
              {member.user_name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      )}
      {/* Name tag */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full">
        {member.role === 'host' && <Crown className="w-3 h-3 text-amber-400" />}
        <span className="text-white text-xs">{member.user_name}{isYou ? ' (You)' : ''}</span>
        {member.is_speaking ? <Mic className="w-3 h-3 text-green-400" /> : <MicOff className="w-3 h-3 text-gray-400" />}
      </div>
    </div>
  );
}

export default function VideoGrid({ members, currentUserId }) {
  const active = (members || []).filter(m => !m.left_at);
  const gridCols = active.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : active.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';

  if (active.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
        <p className="text-gray-500 text-sm">Waiting for participants…</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-2`}>
      {active.map(m => (
        <VideoTile key={m.id} member={m} isYou={m.user_id === currentUserId} />
      ))}
    </div>
  );
}