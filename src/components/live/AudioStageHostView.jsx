import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Lock, Unlock, Radio, Crown, Star, Hand, Trash2, Volume2, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

function SoundWave({ active }) {
  return (
    <div className={`flex items-end justify-center gap-0.5 h-4 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-20'}`}>
      {[3, 6, 9, 12, 9, 6, 3].map((h, i) => (
        <div
          key={i}
          className="w-0.5 bg-green-400 rounded-full"
          style={{
            height: active ? `${h + Math.random() * 4}px` : '2px',
            animation: active ? `pulse 0.8s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AudioStageHostView({
  room,
  members,
  currentUserId,
  listenerCount,
  maxAudience,
  onToggleLock,
  onToggleChatEnabled,
  onMuteAll,
  onEndSession,
}) {
  const [activeTab, setActiveTab] = useState('speakers');
  const [raiseHandRequests, setRaiseHandRequests] = useState([]);
  const [isMutingAll, setIsMutingAll] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const speakers = members.filter(m => ['host', 'cohost', 'speaker'].includes(m.role) && !m.left_at);
  const listeners = members.filter(m => m.role === 'listener' && !m.left_at);
  const hostMember = speakers.find(m => m.role === 'host');

  // Fetch raise hand requests
  useEffect(() => {
    const fetchRequests = async () => {
      const requests = await base44.entities.LiveRequest.filter({
        room_id: room.id,
        status: 'pending'
      });
      setRaiseHandRequests(requests);
    };

    fetchRequests();

    // Subscribe to changes
    const unsub = base44.entities.LiveRequest.subscribe(event => {
      if (event.data?.room_id !== room.id) return;
      fetchRequests();
    });

    return unsub;
  }, [room.id]);

  const handleApproveSpeaker = async (request) => {
    try {
      // Update request status
      await base44.entities.LiveRequest.update(request.id, {
        status: 'approved'
      });

      // Create speaker invite (pending acceptance)
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
      await base44.entities.SpeakerInvite.create({
        room_id: room.id,
        user_id: request.user_id,
        approved_by: currentUserId,
        status: 'pending_accept',
        expires_at: expiresAt.toISOString()
      });

      // Log moderation action
      await base44.entities.ModerationAction.create({
        room_id: room.id,
        actor_user_id: currentUserId,
        target_user_id: request.user_id,
        action: 'approve',
        notes: 'Approved raise-hand request'
      });
    } catch (error) {
      console.error('Error approving speaker:', error);
    }
  };

  const handleDenyRequest = async (request) => {
    try {
      // Update request status
      await base44.entities.LiveRequest.update(request.id, {
        status: 'rejected'
      });

      // Log moderation action
      await base44.entities.ModerationAction.create({
        room_id: room.id,
        actor_user_id: currentUserId,
        target_user_id: request.user_id,
        action: 'deny',
        notes: 'Denied raise-hand request'
      });
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  const handleMuteSpeaker = async (member) => {
    try {
      await base44.entities.LiveRoomMember.update(member.id, {
        is_muted_by_host: true,
        is_speaking: false
      });

      // Log action
      await base44.entities.ModerationAction.create({
        room_id: room.id,
        actor_user_id: currentUserId,
        target_user_id: member.user_id,
        action: 'mute',
        notes: `Muted ${member.user_name}`
      });
    } catch (error) {
      console.error('Error muting speaker:', error);
    }
  };

  const handleRemoveSpeaker = async (member) => {
    try {
      await base44.entities.LiveRoomMember.update(member.id, {
        left_at: new Date().toISOString()
      });

      // Log action
      await base44.entities.ModerationAction.create({
        room_id: room.id,
        actor_user_id: currentUserId,
        target_user_id: member.user_id,
        action: 'remove',
        notes: `Removed ${member.user_name} from stage`
      });
    } catch (error) {
      console.error('Error removing speaker:', error);
    }
  };

  const handleToggleLock = async () => {
    setIsLocking(true);
    try {
      await room.is_locked ? null : base44.entities.LiveRoom.update(room.id, { is_locked: !room.is_locked });
      onToggleLock?.();
    } catch (error) {
      console.error('Error toggling lock:', error);
    } finally {
      setIsLocking(false);
    }
  };

  const handleEndSession = async () => {
    setIsEndingSession(true);
    try {
      await base44.entities.LiveRoom.update(room.id, {
        status: 'ended',
        ended_at: new Date().toISOString()
      });
      onEndSession?.();
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsEndingSession(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] w-72 border-l border-white/10">
      {/* HEADER */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-400">🔴 LIVE</span>
            <span className="text-xs text-white/60">{listenerCount} / {maxAudience || 500}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${room.is_locked ? 'text-red-400 hover:text-red-300' : 'text-white/60 hover:text-white'}`}
            onClick={handleToggleLock}
            disabled={isLocking}
          >
            {room.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
        </div>

        {/* END SESSION BUTTON */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full text-xs" disabled={isEndingSession}>
              {isEndingSession ? 'Ending...' : 'End Session'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              All participants will be disconnected. This cannot be undone.
            </AlertDialogDescription>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndSession} className="bg-red-600 hover:bg-red-700">
                End Session
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none bg-white/5 border-b border-white/10 p-0 h-10">
          <TabsTrigger value="speakers" className="text-xs flex-1">Speakers</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs flex-1 relative">
            Requests
            {raiseHandRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
                {raiseHandRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="people" className="text-xs flex-1">People</TabsTrigger>
        </TabsList>

        {/* SPEAKERS TAB */}
        <TabsContent value="speakers" className="flex-1 overflow-y-auto p-3 space-y-2 m-0">
          {speakers.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-4">No speakers yet</p>
          ) : (
            speakers.map(member => (
              <div
                key={member.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white truncate">{member.user_name}</p>
                    {member.role === 'host' && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                    {member.role === 'cohost' && <Star className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                  </div>
                  <SoundWave active={member.is_speaking} />
                </div>
                {member.role !== 'host' && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:text-red-400"
                      onClick={() => handleMuteSpeaker(member)}
                      title="Mute"
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:text-red-400"
                      onClick={() => handleRemoveSpeaker(member)}
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* REQUESTS TAB */}
        <TabsContent value="requests" className="flex-1 overflow-y-auto p-3 space-y-2 m-0">
          {raiseHandRequests.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-4">No pending requests</p>
          ) : (
            raiseHandRequests.map(request => (
              <div
                key={request.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{request.user_name}</p>
                  <p className="text-[10px] text-white/40">Raised hand</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-green-400 hover:text-green-300"
                    onClick={() => handleApproveSpeaker(request)}
                    title="Approve"
                  >
                    <span className="text-sm">✓</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400 hover:text-red-300"
                    onClick={() => handleDenyRequest(request)}
                    title="Deny"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* PEOPLE TAB */}
        <TabsContent value="people" className="flex-1 overflow-y-auto p-3 space-y-1 m-0">
          <p className="text-xs text-white/60 font-semibold mb-2">{listeners.length} Listening</p>
          {listeners.length === 0 ? (
            <p className="text-xs text-white/50">No listeners</p>
          ) : (
            listeners.map(member => (
              <div key={member.id} className="text-xs text-white/70 flex items-center justify-between gap-2 py-1">
                <span className="truncate">{member.user_name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:text-red-400"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}