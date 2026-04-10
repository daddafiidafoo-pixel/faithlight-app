import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

function SoundWave({ active }) {
  return (
    <div className={`flex items-end justify-center gap-0.5 h-6 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-20'}`}>
      {[3, 6, 9, 12, 9, 6, 3].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-green-400 rounded-full"
          style={{
            height: active ? `${h + Math.random() * 4}px` : '3px',
            animation: active ? `pulse 0.8s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AudioStageSpeakerView({
  room,
  members,
  currentUserId,
  listenerCount,
  maxAudience,
  myMember,
  onToggleMic,
  onLeaveStage,
}) {
  const [isMicOn, setIsMicOn] = useState(false);

  const handleToggleMic = async () => {
    setIsMicOn(!isMicOn);
    if (myMember) {
      await base44.entities.LiveRoomMember.update(myMember.id, {
        is_speaking: !isMicOn,
      });
    }
    onToggleMic?.();
  };

  const hostMember = members.find(m => m.role === 'host' && !m.left_at);

  return (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
          <span className="text-white/60 text-xs">{listenerCount} listening</span>
        </div>
        <span className="text-xs text-white/40">{listenerCount} / {maxAudience || 500}</span>
      </div>

      {/* ROOM TITLE */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-white font-semibold text-base leading-tight truncate">{room?.title}</h1>
        {room?.host_name && (
          <p className="text-white/50 text-xs mt-0.5">Host: {room.host_name}</p>
        )}
      </div>

      {/* STAGE: Host + Speaker (you) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-8">
        {/* Host */}
        {hostMember ? (
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-24 h-24 ${hostMember.is_speaking ? 'ring-4 ring-amber-400 rounded-full' : ''}`}>
              {hostMember.user_avatar ? (
                <img
                  src={hostMember.user_avatar}
                  alt={hostMember.user_name}
                  className="w-24 h-24 rounded-full object-cover relative z-10"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold relative z-10">
                  {hostMember.user_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <p className="text-white/70 font-medium text-sm">{hostMember.user_name}</p>
            <span className="text-xs text-amber-400 font-semibold">Host</span>
          </div>
        ) : null}

        {/* YOU */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className={`relative w-20 h-20 ${isMicOn ? 'ring-4 ring-green-400 rounded-full' : ''}`}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold relative z-10">
              {myMember?.user_name?.[0]?.toUpperCase() || 'Y'}
            </div>
            <div className={`absolute -bottom-1 -right-1 rounded-full p-1 z-20 ${isMicOn ? 'bg-green-500' : 'bg-gray-600'}`}>
              {isMicOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
            </div>
          </div>
          <p className="text-white font-medium text-sm">{myMember?.user_name?.split(' ')[0] || 'You'}</p>
          <Badge className="bg-green-500/30 text-green-300 border-green-500/50">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            You are live
          </Badge>
          {isMicOn && <SoundWave active={true} />}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-[#1E293B] border-t border-white/10 px-4 py-4 flex items-center justify-around">
        {/* Mic Toggle */}
        <button
          onClick={handleToggleMic}
          className={`flex flex-col items-center gap-2 transition-colors ${isMicOn ? 'text-green-400' : 'text-white/70'}`}
        >
          <span className="text-3xl">{isMicOn ? '🎤' : '🔇'}</span>
          <span className="text-xs font-medium">{isMicOn ? 'Mute' : 'Unmute'}</span>
        </button>

        {/* Leave Stage */}
        <button
          onClick={onLeaveStage}
          className="flex flex-col items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <span className="text-3xl">🚪</span>
          <span className="text-xs font-medium">Leave Stage</span>
        </button>
      </div>
    </div>
  );
}