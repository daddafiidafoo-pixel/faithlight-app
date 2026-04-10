import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Crown, Star, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Pulsing ring animation for speaking host
function SpeakingRing({ active }) {
  if (!active) return null;
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
      <span className="absolute inset-0 rounded-full border-2 border-amber-400/60" />
    </>
  );
}

function SpeakerBubble({ member, isYou, isHost: hostFlag }) {
  const isHostRole = member.role === 'host';
  const isCohostRole = member.role === 'cohost';
  const speaking = member.is_speaking;

  const ringColor = isHostRole
    ? 'ring-amber-400'
    : isCohostRole
    ? 'ring-purple-400'
    : 'ring-green-400';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-20 h-20 ${speaking ? `ring-4 ${ringColor} rounded-full` : ''}`}>
        {speaking && <SpeakingRing active={speaking} />}
        {member.user_avatar ? (
          <img
            src={member.user_avatar}
            alt={member.user_name}
            className="w-20 h-20 rounded-full object-cover relative z-10"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold relative z-10">
            {member.user_name?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        {/* Role badge top-right */}
        {isHostRole && (
          <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1 z-20">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
        {isCohostRole && (
          <div className="absolute -top-1 -right-1 bg-purple-400 rounded-full p-1 z-20">
            <Star className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Mic indicator bottom-right */}
        <div className={`absolute -bottom-1 -right-1 rounded-full p-1 z-20 ${speaking ? 'bg-green-500' : 'bg-gray-600'}`}>
          {speaking ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
        </div>
      </div>

      <p className="text-xs font-medium text-white/90 text-center max-w-[72px] truncate">
        {member.user_name?.split(' ')[0]}{isYou ? ' (You)' : ''}
      </p>
      {isHostRole && <span className="text-xs text-amber-400 font-semibold -mt-1">Host</span>}
    </div>
  );
}

// Sound wave animation when someone is speaking
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

export default function AudioStage({
  room,
  members,
  currentUserId,
  listenerCount,
  maxAudience,
  myMember,
  isMicOn,
  handRaised,
  isPremium,
  onToggleMic,
  onRaiseHand,
  onOpenChat,
  onLeave,
  onReaction,
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);

  const speakers = (members || []).filter(m =>
    ['host', 'cohost', 'speaker'].includes(m.role) && !m.left_at
  );
  const isSpeaker = myMember && ['host', 'cohost', 'speaker'].includes(myMember.role);
  const isHost = myMember?.role === 'host';
  const anySpeaking = speakers.some(m => m.is_speaking);
  const hostMember = speakers.find(m => m.role === 'host');

  const REACTIONS = [
    { key: 'amen', emoji: '🤲', label: 'Amen' },
    { key: 'prayer', emoji: '🙏', label: 'Pray' },
    { key: 'love', emoji: '❤️', label: 'Love' },
    { key: 'insight', emoji: '💡', label: 'Insight' },
    { key: 'praise', emoji: '🙌', label: 'Praise' },
  ];

  const handleReaction = (r) => {
    const id = Date.now();
    setFloatingReactions(prev => [...prev, { ...r, id }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(x => x.id !== id)), 2000);
    onReaction?.(r.key);
    setShowReactions(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
          <span className="text-white/60 text-xs">{listenerCount} listening</span>
        </div>
        <div className="flex items-center gap-2">
          {room?.is_locked && (
            <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">🔒 Locked</span>
          )}
          <span className="text-xs text-white/40">{listenerCount} / {maxAudience || 500}</span>
        </div>
      </div>

      {/* ── ROOM TITLE ── */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-white font-semibold text-base leading-tight truncate">{room?.title}</h1>
        {room?.host_name && (
          <p className="text-white/50 text-xs mt-0.5">Host: {room.host_name}</p>
        )}
      </div>

      {/* ── STAGE: Speakers ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-8">
        {/* Host bubble (large, centered) */}
        {hostMember ? (
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-28 h-28 ${hostMember.is_speaking ? 'ring-4 ring-amber-400 rounded-full' : ''}`}>
              {hostMember.is_speaking && <SpeakingRing active />}
              {hostMember.user_avatar ? (
                <img src={hostMember.user_avatar} alt={hostMember.user_name}
                  className="w-28 h-28 rounded-full object-cover relative z-10" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold relative z-10">
                  {hostMember.user_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1.5 z-20">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 rounded-full p-1 z-20 ${hostMember.is_speaking ? 'bg-green-500' : 'bg-gray-600'}`}>
                {hostMember.is_speaking ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
              </div>
            </div>
            <p className="text-white font-medium text-sm">{hostMember.user_name}</p>
            <span className="text-xs text-amber-400 font-semibold">Host</span>
            <SoundWave active={hostMember.is_speaking} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-40">
            <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center">
              <Radio className="w-10 h-10 text-white/50" />
            </div>
            <p className="text-white/50 text-sm">Waiting for host…</p>
          </div>
        )}

        {/* Co-hosts & Speakers row */}
        {speakers.filter(m => m.role !== 'host').length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {speakers.filter(m => m.role !== 'host').map(m => (
              <SpeakerBubble
                key={m.id}
                member={m}
                isYou={m.user_id === currentUserId}
              />
            ))}
          </div>
        )}

        {/* "You are live" indicator for speakers */}
        {isSpeaker && !isHost && (
          <div className="bg-green-500/20 border border-green-500/40 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">You are live</span>
          </div>
        )}
      </div>

      {/* ── FLOATING REACTIONS ── */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 pointer-events-none flex gap-2">
        {floatingReactions.map(r => (
          <span
            key={r.id}
            className="text-2xl animate-bounce"
            style={{ animationDuration: '0.5s' }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* ── REACTION TRAY (slides up) ── */}
      {showReactions && (
        <div className="bg-[#1E293B] border-t border-white/10 px-4 py-3 flex justify-around items-center">
          {REACTIONS.map(r => (
            <button
              key={r.key}
              onClick={() => handleReaction(r)}
              className="flex flex-col items-center gap-1 active:scale-125 transition-transform"
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-white/50 text-[10px]">{r.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="bg-[#1E293B] border-t border-white/10 px-4 py-3 flex items-center justify-around">
        {/* Chat */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
        >
          <span className="text-xl">💬</span>
          <span className="text-[10px]">Chat</span>
        </button>

        {/* Reactions */}
        <button
          onClick={() => setShowReactions(v => !v)}
          className={`flex flex-col items-center gap-1 transition-colors ${showReactions ? 'text-amber-400' : 'text-white/70 hover:text-white'}`}
        >
          <span className="text-xl">🙏</span>
          <span className="text-[10px]">Reactions</span>
        </button>

        {/* Mic (speakers only) / Raise Hand (listeners) */}
        {isSpeaker ? (
          <button
            onClick={onToggleMic}
            className={`flex flex-col items-center gap-1 transition-colors ${isMicOn ? 'text-green-400' : 'text-white/70 hover:text-white'}`}
          >
            <span className="text-xl">{isMicOn ? '🎤' : '🔇'}</span>
            <span className="text-[10px]">{isMicOn ? 'Mute' : 'Unmute'}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={onRaiseHand}
              disabled={handRaised}
              className={`flex flex-col items-center gap-1 transition-colors ${handRaised ? 'text-yellow-400' : 'text-white/70 hover:text-white'}`}
            >
              <span className="text-xl">✋</span>
              <span className="text-[10px]">{handRaised ? 'Raised' : 'Raise Hand'}</span>
            </button>
            <span className="text-[9px] text-white/30 leading-none">
              {isPremium ? '⭐ Priority access' : 'Premium = faster'}
            </span>
          </div>
        )}

        {/* Leave */}
        <button
          onClick={onLeave}
          className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px]">Leave</span>
        </button>
      </div>
    </div>
  );
}