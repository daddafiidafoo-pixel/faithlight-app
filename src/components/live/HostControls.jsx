import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Mic, MicOff, Lock, Unlock, PhoneOff, AlertTriangle, MessageSquareOff, MessageSquare } from 'lucide-react';

export default function HostControls({ room, members, isHost, isCohost, onEndRoom }) {
  const [loading, setLoading] = useState(false);
  if ((!isHost && !isCohost) || !room) return null;

  const speakers = members?.filter(m => ['host','cohost','speaker'].includes(m.role) && !m.left_at) || [];
  const totalActive = members?.filter(m => !m.left_at).length || 0;

  const handleMuteAll = async () => {
    setLoading(true);
    await base44.entities.LiveRoom.update(room.id, { is_muted_all: !room.is_muted_all });
    setLoading(false);
  };

  const handleLockRoom = async () => {
    setLoading(true);
    await base44.entities.LiveRoom.update(room.id, { is_locked: !room.is_locked });
    setLoading(false);
  };

  const handleToggleChat = async () => {
    setLoading(true);
    await base44.entities.LiveRoom.update(room.id, { allow_chat: !room.allow_chat });
    setLoading(false);
  };

  const handleEndRoom = async () => {
    setLoading(true);
    await base44.entities.LiveRoom.update(room.id, { status: 'ended', ended_at: new Date().toISOString() });
    onEndRoom?.();
    setLoading(false);
  };

  return (
    <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">Host Controls</span>
        {isCohost && !isHost && <Badge className="bg-purple-700 text-purple-200 text-xs">Co-host</Badge>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-white/5">
        <div className="bg-[#0F172A] px-3 py-2.5 text-center">
          <p className="text-white/40 text-[10px] uppercase tracking-wide">On Stage</p>
          <p className="text-amber-400 text-xl font-bold">{speakers.length}</p>
        </div>
        <div className="bg-[#0F172A] px-3 py-2.5 text-center">
          <p className="text-white/40 text-[10px] uppercase tracking-wide">
            {room.type === 'audio_stage' ? 'Listening' : 'Total'}
          </p>
          <p className="text-white text-xl font-bold">
            {totalActive}
            {room.type === 'audio_stage' && (
              <span className="text-white/30 text-xs font-normal"> / {room.max_audience}</span>
            )}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2">
        <button
          onClick={handleMuteAll}
          disabled={loading}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            room.is_muted_all
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
          }`}
        >
          {room.is_muted_all ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {room.is_muted_all ? 'Unmute All' : 'Mute All'}
        </button>

        <button
          onClick={handleLockRoom}
          disabled={loading}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            room.is_locked
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
          }`}
        >
          {room.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          {room.is_locked ? 'Room Locked' : 'Lock Room'}
        </button>

        <button
          onClick={handleToggleChat}
          disabled={loading}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            !room.allow_chat
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
          }`}
        >
          {room.allow_chat ? <MessageSquareOff className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          {room.allow_chat ? 'Disable Chat' : 'Enable Chat'}
        </button>

        {isHost && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                <PhoneOff className="w-4 h-4" /> End Session
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> End Live Room?
              </AlertDialogTitle>
              <AlertDialogDescription>
                All {totalActive} participants will be disconnected. This cannot be undone.
              </AlertDialogDescription>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEndRoom} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? 'Ending…' : 'End Session'}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}