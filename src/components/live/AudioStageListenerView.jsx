import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Crown, Star, Radio, Hand, MessageCircle, Laugh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import SpeakerInviteModal from './SpeakerInviteModal';

function SpeakingRing({ active }) {
  if (!active) return null;
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
      <span className="absolute inset-0 rounded-full border-2 border-amber-400/60" />
    </>
  );
}

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

export default function AudioStageListenerView({
  room,
  members,
  currentUserId,
  listenerCount,
  maxAudience,
  onLeave,
}) {
  const [handRaised, setHandRaised] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [lastRaiseHandTime, setLastRaiseHandTime] = useState(0);
  const [raiseHandCooldown, setRaiseHandCooldown] = useState(0);

  const speakers = (members || []).filter(m =>
    ['host', 'cohost', 'speaker'].includes(m.role) && !m.left_at
  );
  const hostMember = speakers.find(m => m.role === 'host');

  // Rate limit: 1 raise hand per 2 minutes
  useEffect(() => {
    if (raiseHandCooldown > 0) {
      const timer = setTimeout(() => setRaiseHandCooldown(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [raiseHandCooldown]);

  const handleRaiseHand = async () => {
    const now = Date.now();
    if (now - lastRaiseHandTime < 120000) { // 2 minutes
      setRaiseHandCooldown(Math.ceil((120000 - (now - lastRaiseHandTime)) / 1000));
      return;
    }

    try {
      await base44.entities.LiveRequest.create({
        room_id: room.id,
        user_id: currentUserId,
        user_name: members.find(m => m.user_id === currentUserId)?.user_name || 'User',
        type: 'raise_hand',
        status: 'pending',
      });
      setHandRaised(true);
      setLastRaiseHandTime(now);
    } catch (error) {
      console.error('Error raising hand:', error);
    }
  };

  const handleAcceptInvite = async () => {
    setInviteLoading(true);
    try {
      // Find and update the speaker invite
      const invites = await base44.entities.SpeakerInvite.filter({
        room_id: room.id,
        user_id: currentUserId,
        status: 'pending_accept'
      });

      if (invites[0]) {
        await base44.entities.SpeakerInvite.update(invites[0].id, {
          status: 'accepted'
        });
      }

      // Promote user to speaker in live_room_members
      const memberRecords = await base44.entities.LiveRoomMember.filter({
        room_id: room.id,
        user_id: currentUserId
      });

      if (memberRecords[0]) {
        await base44.entities.LiveRoomMember.update(memberRecords[0].id, {
          role: 'speaker',
          is_speaking: false // Start muted
        });
      }

      setShowInviteModal(false);
      setInviteLoading(false);
    } catch (error) {
      console.error('Error accepting invite:', error);
      setInviteLoading(false);
    }
  };

  const handleDeclineInvite = async () => {
    try {
      const invites = await base44.entities.SpeakerInvite.filter({
        room_id: room.id,
        user_id: currentUserId,
        status: 'pending_accept'
      });

      if (invites[0]) {
        await base44.entities.SpeakerInvite.update(invites[0].id, {
          status: 'declined'
        });
      }

      setShowInviteModal(false);
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };

  const handleReaction = (emoji) => {
    const id = Date.now();
    setFloatingReactions(prev => [...prev, { emoji, id }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(x => x.id !== id)), 2000);
  };

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

      {/* STAGE: Speakers */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-8">
        {/* Host bubble (large, centered) */}
        {hostMember ? (
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-28 h-28 ${hostMember.is_speaking ? 'ring-4 ring-amber-400 rounded-full' : ''}`}>
              {hostMember.is_speaking && <SpeakingRing active />}
              {hostMember.user_avatar ? (
                <img
                  src={hostMember.user_avatar}
                  alt={hostMember.user_name}
                  className="w-28 h-28 rounded-full object-cover relative z-10"
                />
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
          <div className="flex flex-wrap justify-center gap-4">
            {speakers.filter(m => m.role !== 'host').map(m => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                <div className={`relative w-16 h-16 ${m.is_speaking ? 'ring-3 ring-purple-400 rounded-full' : ''}`}>
                  {m.user_avatar ? (
                    <img src={m.user_avatar} alt={m.user_name} className="w-16 h-16 rounded-full object-cover relative z-10" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold relative z-10">
                      {m.user_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  {m.role === 'cohost' && (
                    <div className="absolute -top-1 -right-1 bg-purple-400 rounded-full p-0.5 z-20">
                      <Star className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 z-20 ${m.is_speaking ? 'bg-green-500' : 'bg-gray-600'}`}>
                    {m.is_speaking ? <Mic className="w-2 h-2 text-white" /> : <MicOff className="w-2 h-2 text-white" />}
                  </div>
                </div>
                <p className="text-white/70 text-xs text-center max-w-[56px] truncate">{m.user_name?.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING REACTIONS */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 pointer-events-none flex gap-2">
        {floatingReactions.map(r => (
          <span key={r.id} className="text-2xl animate-bounce" style={{ animationDuration: '0.5s' }}>
            {r.emoji}
          </span>
        ))}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-[#1E293B] border-t border-white/10 px-4 py-3 flex items-center justify-around">
        {/* Reactions */}
        <div className="flex gap-2 justify-center">
          {[
            { emoji: '🤲', label: 'Amen' },
            { emoji: '🙏', label: 'Pray' },
            { emoji: '❤️', label: 'Love' },
            { emoji: '💡', label: 'Insight' },
          ].map(r => (
            <button
              key={r.emoji}
              onClick={() => handleReaction(r.emoji)}
              className="text-xl hover:scale-125 transition-transform active:scale-150"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>

        {/* Chat */}
        <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Chat</span>
        </button>

        {/* Raise Hand / Requested */}
        <button
          onClick={handleRaiseHand}
          disabled={handRaised || raiseHandCooldown > 0}
          className={`flex flex-col items-center gap-1 transition-colors ${
            handRaised ? 'text-yellow-400 cursor-not-allowed' : raiseHandCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-white/70 hover:text-white'
          }`}
        >
          <Hand className="w-5 h-5" />
          <span className="text-[10px]">
            {handRaised ? 'Requested' : raiseHandCooldown > 0 ? `${raiseHandCooldown}s` : 'Raise Hand'}
          </span>
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px]">Leave</span>
        </button>
      </div>

      {/* SPEAKER INVITE MODAL */}
      <SpeakerInviteModal
        isOpen={showInviteModal}
        userName="User"
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
        isLoading={inviteLoading}
      />
    </div>
  );
}