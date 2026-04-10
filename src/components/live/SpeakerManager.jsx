import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Clock, Plus, X, Calendar, Mic } from 'lucide-react';

// ── Direct Invite Panel ─────────────────────────────────────────────────────
function DirectInvitePanel({ members, roomId }) {
  const [search, setSearch] = useState('');
  const [invitedIds, setInvitedIds] = useState(new Set());

  const listeners = (members || []).filter(
    m => !m.left_at && m.role === 'listener'
  );
  const filtered = listeners.filter(m =>
    m.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const inviteAsSpeaker = async (member) => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    await base44.entities.SpeakerInvite.create({
      room_id: roomId,
      user_id: member.user_id,
      approved_by: member.user_id,
      status: 'pending_accept',
      expires_at: expiresAt,
      requested_at: new Date().toISOString(),
    });
    setInvitedIds(prev => new Set([...prev, member.user_id]));
  };

  const promoteToCohost = async (member) => {
    await base44.entities.LiveRoomMember.update(member.id, { role: 'cohost' });
    setInvitedIds(prev => new Set([...prev, member.user_id]));
  };

  return (
    <div className="space-y-2">
      <p className="text-white/50 text-xs">Invite a listener directly to speak or become co-host.</p>
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search participants…"
        className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-indigo-500"
      />
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-white/30 text-xs text-center py-2">No listeners found</p>
        )}
        {filtered.map(m => {
          const done = invitedIds.has(m.user_id);
          return (
            <div key={m.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-400/20 flex items-center justify-center text-indigo-300 text-[10px] font-bold flex-shrink-0">
                {m.user_name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="flex-1 text-white/80 text-xs truncate">{m.user_name}</span>
              {done ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Invited</Badge>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => inviteAsSpeaker(m)}
                    className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5 hover:bg-indigo-500/30 transition-colors"
                    title="Invite to speak"
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => promoteToCohost(m)}
                    className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded px-1.5 py-0.5 hover:bg-purple-500/30 transition-colors"
                    title="Make co-host"
                  >
                    Co-host
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Q&A / Schedule Panel ────────────────────────────────────────────────────
function SchedulePanel({ roomId }) {
  const [items, setItems] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('');

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    setItems(prev => [...prev, { id: Date.now(), label, time: newTime.trim(), announced: false }]);
    setNewLabel('');
    setNewTime('');
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const announce = async (item) => {
    // Broadcast via LiveRoom metadata (simple approach: update room description suffix)
    // In a real impl this would use a dedicated EventAnnouncement entity or chat broadcast
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, announced: true } : i));
    // Write a chat-like broadcast message
    await base44.entities.LiveRoomChat?.create?.({
      room_id: roomId,
      user_id: 'system',
      user_name: '📢 Host',
      message: `📅 Coming up: ${item.label}${item.time ? ` at ${item.time}` : ''}`,
      created_date: new Date().toISOString(),
    }).catch(() => {});
  };

  return (
    <div className="space-y-2">
      <p className="text-white/50 text-xs">Schedule upcoming speakers or Q&A slots — visible to participants.</p>
      <div className="flex gap-1.5">
        <Input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="e.g. Q&A with John"
          className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1"
        />
        <Input
          value={newTime}
          onChange={e => setNewTime(e.target.value)}
          placeholder="e.g. 7:30pm"
          className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 w-20"
        />
        <button
          onClick={addItem}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {items.length === 0 && (
          <p className="text-white/30 text-xs text-center py-2">No items scheduled</p>
        )}
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-white/30 flex-shrink-0" />
            <span className="flex-1 text-white/80 text-xs truncate">
              {item.label}{item.time && <span className="text-white/40 ml-1">@ {item.time}</span>}
            </span>
            {item.announced ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Sent</Badge>
            ) : (
              <button
                onClick={() => announce(item)}
                className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded px-1.5 py-0.5 hover:bg-amber-500/30 transition-colors"
              >
                Announce
              </button>
            )}
            <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────
export default function SpeakerManager({ roomId, members }) {
  const [tab, setTab] = useState('invite');

  return (
    <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center gap-2">
        <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-indigo-300 text-xs font-semibold uppercase tracking-wide">Speaker Management</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {['invite', 'schedule'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors capitalize ${
              tab === t
                ? 'text-indigo-300 border-b-2 border-indigo-400 bg-indigo-500/10'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'invite' ? '👤 Direct Invite' : '📅 Schedule'}
          </button>
        ))}
      </div>

      <div className="p-3">
        {tab === 'invite' ? (
          <DirectInvitePanel members={members} roomId={roomId} />
        ) : (
          <SchedulePanel roomId={roomId} />
        )}
      </div>
    </div>
  );
}