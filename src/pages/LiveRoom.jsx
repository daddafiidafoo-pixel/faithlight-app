import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Mic, MicOff, Video, VideoOff, Hand, PhoneOff, Loader2, AlertCircle, Lock } from 'lucide-react';
import { useUITranslation } from '@/components/useUITranslation';

import HostControls from '@/components/live/HostControls';
import SpeakerManager from '@/components/live/SpeakerManager';
import ParticipantList from '@/components/live/ParticipantList';
import RaiseHandQueue from '@/components/live/RaiseHandQueue';
import RoomChat from '@/components/live/RoomChat';
import VideoGrid from '@/components/live/VideoGrid';
import AudioStage from '@/components/live/AudioStage';
import LiveReactions from '@/components/live/LiveReactions';
import LivePermissionGate from '@/components/live/LivePermissionGate';
import { useEntitlement } from '@/components/live/useEntitlement';
import { useAgoraClient } from '@/components/live/useAgoraClient';
import RecordingControls from '@/components/live/RecordingControls';

export default function LiveRoom() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');

  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [myMember, setMyMember] = useState(null);
  const [handRaised, setHandRaised] = useState(false);
  const [raiseHandFeedback, setRaiseHandFeedback] = useState(null); // 'sent' | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [showPaywall, setShowPaywall] = useState(null);

  const { isPremium } = useEntitlement(user?.id);

  // Determine user role for Agora
  const getUserRoleForAgora = () => {
    if (!myMember) return 'listener';
    if (myMember.role === 'host') return 'host';
    if (myMember.role === 'cohost') return 'cohost';
    if (myMember.role === 'speaker') return 'speaker';
    return 'listener';
  };

  const agoraRole = getUserRoleForAgora();
  const { joined: agoraJoined, error: agoraError } = useAgoraClient(roomId, agoraRole);

  // Init user + room
  useEffect(() => {
    const init = async () => {
      if (!roomId) { setError('No room ID'); setLoading(false); return; }
      try {
        const u = await base44.auth.me();
        setUser(u);
        const rooms = await base44.entities.LiveRoom.filter({ id: roomId }, '', 1);
        if (!rooms[0]) { setError('Room not found'); return; }
        const r = rooms[0];
        setRoom(r);
        if (r.status === 'ended') { setError('This session has ended.'); return; }
        if (r.is_locked && r.host_id !== u.id) { setError('This room is locked. New participants cannot join.'); return; }
        if (r.type === 'video' && !isPremium && r.host_id !== u.id) {
          setShowPaywall('video'); return;
        }
        // Check paid event ticket access
        if (r.is_paid && Number(r.ticket_price) > 0 && r.host_id !== u.id) {
          const tickets = await base44.entities.EventTicket.filter({ event_id: r.id, user_id: u.id, status: 'paid' }, '', 1);
          if (!tickets[0]) {
            setShowPaywall('ticket'); setRoom(r); setLoading(false); return;
          }
        }
      } catch {
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [roomId]);

  // Load members
  useEffect(() => {
    if (!roomId) return;
    base44.entities.LiveRoomMember.filter({ room_id: roomId }, 'joined_at', 1000)
      .then(res => {
        setMembers(res);
        if (user) setMyMember(res.find(m => m.user_id === user.id && !m.left_at) || null);
      });
  }, [roomId, user?.id]);

  // Subscribe to member changes
  useEffect(() => {
    if (!roomId) return;
    const unsub = base44.entities.LiveRoomMember.subscribe(event => {
      if (event.data?.room_id !== roomId) return;
      setMembers(prev => {
        const idx = prev.findIndex(m => m.id === event.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = event.data; return next; }
        return event.type === 'create' ? [...prev, event.data] : prev;
      });
      if (event.data?.user_id === user?.id) setMyMember(event.data);
    });
    return unsub;
  }, [roomId, user?.id]);

  // Subscribe to room status changes
  useEffect(() => {
    if (!roomId) return;
    const unsub = base44.entities.LiveRoom.subscribe(event => {
      if (event.id === roomId) {
        setRoom(event.data);
        if (event.data?.status === 'ended') setError('The host has ended this session.');
      }
    });
    return unsub;
  }, [roomId]);

  // Join room
  useEffect(() => {
    const join = async () => {
      if (!room || !user || myMember || error || showPaywall) return;
      const existing = members.find(m => m.user_id === user.id && !m.left_at);
      if (existing) return;
      const role = user.id === room.host_id ? 'host' : 'listener';
      const created = await base44.entities.LiveRoomMember.create({
        room_id: roomId,
        user_id: user.id,
        user_name: user.full_name,
        user_avatar: user.avatar_url,
        role,
        joined_at: new Date().toISOString(),
      });
      setMyMember(created);
    };
    join();
  }, [room, user, members, error, showPaywall]);

  const { t } = useUITranslation();
  const isHost = user?.id === room?.host_id;
  const isCohost = myMember?.role === 'cohost';
  const canSpeak = isHost || isCohost || myMember?.role === 'speaker';
  const canControl = isHost || isCohost;
  const activeMembers = members.filter(m => !m.left_at);
  const listenerCount = activeMembers.filter(m => m.role === 'listener').length;

  const handleToggleMic = async () => {
    if (!canSpeak) { setShowPaywall('speak'); return; }
    if (!myMember) return;
    const next = !isMicOn;
    setIsMicOn(next);
    await base44.entities.LiveRoomMember.update(myMember.id, { is_speaking: next });
  };

  const handleToggleCam = async () => {
    if (!canSpeak) { setShowPaywall('speak'); return; }
    if (room?.type !== 'video') return;
    if (!myMember) return;
    const next = !isCamOn;
    setIsCamOn(next);
    await base44.entities.LiveRoomMember.update(myMember.id, { is_on_video: next });
  };

  const handleRaiseHand = async () => {
    if (!user) return;

    const now = Date.now();
    const maxPending = isPremium ? 2 : 1;
    const cooldownMs = isPremium ? 2 * 60 * 1000 : 5 * 60 * 1000;

    // Fast check via UserLiveLimit
    const limits = await base44.entities.UserLiveLimit.filter(
      { room_id: roomId, user_id: user.id }, '', 1
    ).catch(() => []);
    const limit = limits[0];

    if (limit) {
      if (limit.denied_until && new Date(limit.denied_until) > new Date()) return; // denial cooldown
      if (limit.pending_count >= maxPending) return; // too many pending
      if (limit.next_allowed_request_at && new Date(limit.next_allowed_request_at) > new Date()) return; // rate limit
    }

    // Compute priority score
    const isNewAccount = user.created_date
      ? (now - new Date(user.created_date).getTime()) < 24 * 60 * 60 * 1000
      : false;
    let score = isPremium ? 100 : 10;
    if (isNewAccount) score -= 3;

    // New account basic gets longer cooldown
    const effectiveCooldownMs = (!isPremium && isNewAccount) ? 10 * 60 * 1000 : cooldownMs;
    const nextAllowed = new Date(now + effectiveCooldownMs).toISOString();

    await base44.entities.LiveRequest.create({
      room_id: roomId,
      user_id: user.id,
      user_name: user.full_name,
      type: 'raise_hand',
      status: 'pending',
      priority_score: score,
      user_plan_at_request: isPremium ? 'premium' : 'basic',
      is_new_account: isNewAccount,
    });

    // Update or create UserLiveLimit
    if (limit) {
      await base44.entities.UserLiveLimit.update(limit.id, {
        pending_count: (limit.pending_count || 0) + 1,
        last_request_at: new Date().toISOString(),
        next_allowed_request_at: nextAllowed,
        plan_snapshot: isPremium ? 'premium' : 'basic',
      });
    } else {
      await base44.entities.UserLiveLimit.create({
        room_id: roomId,
        user_id: user.id,
        plan_snapshot: isPremium ? 'premium' : 'basic',
        pending_count: 1,
        last_request_at: new Date().toISOString(),
        next_allowed_request_at: nextAllowed,
      });
    }

    setHandRaised(true);
    // Show toast-style feedback via a brief state
    setRaiseHandFeedback('sent');
    setTimeout(() => setRaiseHandFeedback(null), 4000);
  };

  const handleLeave = async () => {
    if (myMember) {
      await base44.entities.LiveRoomMember.update(myMember.id, { left_at: new Date().toISOString() });
    }
    navigate(createPageUrl('LiveEvents'));
  };

  // Speaker now-live toast: watch myMember role transition to speaker
  const prevRoleRef = useRef(null);
  const [nowLiveToast, setNowLiveToast] = useState(false);

  useEffect(() => {
    if (prevRoleRef.current !== 'speaker' && myMember?.role === 'speaker') {
      setNowLiveToast(true);
      setTimeout(() => setNowLiveToast(false), 5000);
    }
    prevRoleRef.current = myMember?.role;
  }, [myMember?.role]);

  // ---- LOADING / ERROR STATES ----
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" /><p className="text-gray-400">Joining room…</p></div>
    </div>
  );

  if (showPaywall && !error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <LivePermissionGate type={showPaywall} event={room} onDismiss={() => navigate(createPageUrl('LiveEvents'))} />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-red-800 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">{error}</h3>
        <Button onClick={() => navigate(createPageUrl('LiveEvents'))} variant="outline" className="mt-2 text-white border-gray-600 hover:bg-gray-800">Back to Live Events</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Raise hand feedback toast */}
      {raiseHandFeedback === 'sent' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-indigo-500/40 rounded-xl px-4 py-3 shadow-xl text-center max-w-xs w-full mx-4">
          <p className="text-white font-semibold text-sm">{t('live.raise_hand.sent.title', 'Request sent')}</p>
          <p className="text-white/60 text-xs mt-0.5">{t('live.raise_hand.sent.body', 'Your request to speak has been sent to the host.')}</p>
        </div>
      )}
      {/* Now live toast */}
      {nowLiveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900 border border-green-500/40 rounded-xl px-4 py-3 shadow-xl text-center max-w-xs w-full mx-4">
          <p className="text-green-300 font-semibold text-sm">{t('live.speaker.now_live.title', 'You are now live')}</p>
          <p className="text-green-200/70 text-xs mt-0.5">{t('live.speaker.now_live.body', 'Please speak clearly and respectfully.')}</p>
        </div>
      )}
      {/* Top Bar — only for video mode; audio stage renders its own header */}
      {room.type === 'video' && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <h1 className="text-sm font-semibold truncate">{room.title}</h1>
            <Badge className="bg-purple-800 text-purple-200 text-xs flex-shrink-0">🎥 Video</Badge>
            {room.is_locked && <Badge className="bg-red-900 text-red-300 text-xs"><Lock className="w-3 h-3 mr-1" />Locked</Badge>}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1.5 flex-shrink-0">
                <PhoneOff className="w-4 h-4" /><span className="hidden sm:inline">Leave</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>{isHost ? 'End session?' : 'Leave room?'}</AlertDialogTitle>
              <AlertDialogDescription>{isHost ? 'All participants will be disconnected.' : 'You can rejoin while the session is live.'}</AlertDialogDescription>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeave} className="bg-red-600 hover:bg-red-700">{isHost ? 'End Session' : 'Leave'}</AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Main Layout */}
      <div className={`flex ${room.type === 'video' ? 'h-[calc(100vh-56px)]' : 'h-screen'}`}>
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stage */}
          <div className={`flex-1 overflow-y-auto ${room.type === 'audio_stage' ? 'p-0' : 'p-4 space-y-4'}`}>
            {room.type === 'video' ? (
              <>
                <VideoGrid members={activeMembers} currentUserId={user?.id} />
                {/* Video control bar */}
                <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                  <Button onClick={handleToggleMic} size="sm" variant={isMicOn ? 'default' : 'outline'}
                    className={`gap-2 ${isMicOn ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}`}>
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isMicOn ? 'Mute' : 'Unmute'}</span>
                  </Button>
                  <Button onClick={handleToggleCam} size="sm" variant={isCamOn ? 'default' : 'outline'}
                    className={`gap-2 ${isCamOn ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}`}>
                    {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isCamOn ? 'Cam Off' : 'Cam On'}</span>
                  </Button>
                </div>
              </>
            ) : (
              <AudioStage
                room={room}
                members={activeMembers}
                currentUserId={user?.id}
                listenerCount={listenerCount}
                maxAudience={room.max_audience}
                myMember={myMember}
                isMicOn={isMicOn}
                handRaised={handRaised}
                isPremium={isPremium}
                onToggleMic={handleToggleMic}
                onRaiseHand={handleRaiseHand}
                onOpenChat={() => {}}
                onLeave={handleLeave}
              />
            )}
          </div>

          {/* Control bar only shown for video mode; audio stage has its own bottom bar */}
          {room.type === 'video' && (
            <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-2" />
          )}
        </div>

        {/* Right Sidebar (host controls + chat) — shown for both modes on desktop */}
        {canControl && (
          <div className="hidden md:flex w-72 flex-shrink-0 bg-[#0D1526] border-l border-white/10 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <HostControls room={room} members={activeMembers} isHost={isHost} isCohost={isCohost} onEndRoom={() => navigate(createPageUrl('LiveEvents'))} />
              <RecordingControls room={room} sessionId={room?.recording_id || roomId} isHost={isHost} isCohost={isCohost} />
              <SpeakerManager roomId={roomId} members={activeMembers} />
              <RaiseHandQueue roomId={roomId} isHost={isHost} isCohost={isCohost} />
              <ParticipantList members={activeMembers} isHost={isHost} isCohost={isCohost} roomId={roomId} />
            </div>
            {room.allow_chat && user && (
              <div className="flex-shrink-0 p-3 border-t border-white/10">
                <RoomChat roomId={roomId} user={user} isHost={isHost} isCohost={isCohost} allowChat={room.allow_chat} />
              </div>
            )}
          </div>
        )}

        {/* Non-host video sidebar */}
        {!canControl && room.type === 'video' && (
          <div className="hidden md:flex w-72 flex-shrink-0 bg-gray-900 border-l border-gray-800 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3">
              <ParticipantList members={activeMembers} isHost={false} isCohost={false} roomId={roomId} />
            </div>
            {room.allow_chat && user && (
              <div className="flex-shrink-0 p-3 border-t border-gray-800">
                <RoomChat roomId={roomId} user={user} isHost={false} isCohost={false} allowChat={room.allow_chat} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}