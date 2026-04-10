import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mic, MicOff, Video, Trash2, UserCheck, UserX, ChevronDown, ChevronUp, Globe, Twitter, Instagram, Youtube } from 'lucide-react';

const ROLE_COLORS = {
  host:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
  cohost:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
  speaker:  'bg-green-500/20 text-green-300 border-green-500/30',
  listener: 'bg-white/10 text-white/50 border-white/10',
};

function Avatar({ name, url }) {
  if (url) return <img src={url} alt={name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-6 h-6 rounded-full bg-indigo-400/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function MiniProfilePopover({ member }) {
  const sl = member.user_social_links || {};
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-0 focus:outline-none">
          <Avatar name={member.user_name} url={member.user_avatar} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" className="w-56 p-3 bg-[#1E293B] border-white/10 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={member.user_name} url={member.user_avatar} />
          <div>
            <p className="text-xs font-semibold text-white/90">{member.user_name}</p>
            <Badge className={`text-[10px] border capitalize py-0 px-1 ${ROLE_COLORS[member.role] || ROLE_COLORS.listener}`}>
              {member.role}
            </Badge>
          </div>
        </div>
        {member.user_live_bio && (
          <p className="text-[11px] text-white/60 italic mb-2">"{member.user_live_bio}"</p>
        )}
        {member.user_website && (
          <a href={member.user_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline mb-1">
            <Globe className="w-3 h-3" /> {member.user_website.replace(/^https?:\/\//, '')}
          </a>
        )}
        {(sl.twitter || sl.instagram || sl.youtube) && (
          <div className="flex gap-2 mt-1">
            {sl.twitter && <a href={`https://twitter.com/${sl.twitter}`} target="_blank" rel="noopener noreferrer"><Twitter className="w-3 h-3 text-sky-400" /></a>}
            {sl.instagram && <a href={`https://instagram.com/${sl.instagram}`} target="_blank" rel="noopener noreferrer"><Instagram className="w-3 h-3 text-pink-400" /></a>}
            {sl.youtube && <a href={sl.youtube} target="_blank" rel="noopener noreferrer"><Youtube className="w-3 h-3 text-red-400" /></a>}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function MemberRow({ member, canControl, isOwnHost, onMute, onRemove, onDemote }) {
  const isHostRole = member.role === 'host';
  const isSpeakerOrCohost = ['cohost', 'speaker'].includes(member.role);

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
      <MiniProfilePopover member={member} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/80 truncate">{member.user_name}</p>
      </div>
      <Badge className={`text-[10px] border capitalize py-0 px-1 ${ROLE_COLORS[member.role] || ROLE_COLORS.listener}`}>
        {member.role}
      </Badge>
      <div className="flex items-center gap-1 flex-shrink-0">
        {member.is_speaking ? <Mic className="w-3 h-3 text-green-400" /> : <MicOff className="w-3 h-3 text-white/20" />}
      </div>

      {canControl && !isHostRole && (
        <div className="hidden group-hover:flex gap-0.5 flex-shrink-0">
          {/* Mute individual speaker */}
          {(isSpeakerOrCohost || member.is_speaking) && (
            <button
              onClick={() => onMute(member)}
              className="w-6 h-6 flex items-center justify-center rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
              title="Mute"
            >
              <MicOff className="w-3 h-3" />
            </button>
          )}
          {/* Demote speaker → listener */}
          {isSpeakerOrCohost && isOwnHost && (
            <button
              onClick={() => onDemote(member)}
              className="w-6 h-6 flex items-center justify-center rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
              title="Remove from stage"
            >
              <UserX className="w-3 h-3" />
            </button>
          )}
          {/* Remove from room — with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-6 h-6 flex items-center justify-center rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Remove from room"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Remove participant?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{member.user_name}</strong> will be removed from the session. They can rejoin unless the room is locked.
              </AlertDialogDescription>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(member)} className="bg-red-600 hover:bg-red-700">
                  Remove
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

export default function ParticipantList({ members, isHost, isCohost, roomId }) {
  const [showListeners, setShowListeners] = useState(false);
  const active = (members || []).filter(m => !m.left_at);
  const onStage = active.filter(m => ['host', 'cohost', 'speaker'].includes(m.role));
  const listeners = active.filter(m => m.role === 'listener');
  const canControl = isHost || isCohost;

  const handleMute = async (member) => {
    await base44.entities.LiveRoomMember.update(member.id, {
      is_muted_by_host: true,
      is_speaking: false,
    });
  };

  const handleRemove = async (member) => {
    await base44.entities.LiveRoomMember.update(member.id, {
      left_at: new Date().toISOString(),
    });
  };

  const handleDemote = async (member) => {
    await base44.entities.LiveRoomMember.update(member.id, { role: 'listener' });
  };

  return (
    <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">
          Participants ({active.length})
        </span>
        {onStage.length > 0 && (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">
            {onStage.length} on stage
          </Badge>
        )}
      </div>

      <div className="p-2">
        {/* On Stage */}
        {onStage.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-white/30 uppercase tracking-wide px-2 mb-1">On Stage</p>
            {onStage.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                canControl={canControl}
                isOwnHost={isHost}
                onMute={handleMute}
                onRemove={handleRemove}
                onDemote={handleDemote}
              />
            ))}
          </div>
        )}

        {/* Listeners (collapsible) */}
        {listeners.length > 0 && (
          <div>
            <button
              onClick={() => setShowListeners(v => !v)}
              className="w-full flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wide px-2 mb-1 hover:text-white/50 transition-colors"
            >
              <span>Listeners ({listeners.length})</span>
              {showListeners ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showListeners && (
              <div className="max-h-48 overflow-y-auto">
                {listeners.map(m => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    canControl={canControl}
                    isOwnHost={isHost}
                    onMute={handleMute}
                    onRemove={handleRemove}
                    onDemote={handleDemote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {active.length === 0 && (
          <p className="text-white/30 text-xs text-center py-4">No participants yet</p>
        )}
      </div>
    </div>
  );
}