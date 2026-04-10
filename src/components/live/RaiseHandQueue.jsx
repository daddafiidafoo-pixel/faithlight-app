import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Hand, Check, X, Crown, AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000)));
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { display: `${mm}:${ss}`, expired: remaining === 0 };
}

// ── sub-components ─────────────────────────────────────────────────────────
function UserBadges({ req }) {
  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {req.user_plan_at_request === 'premium' && (
        <span className="flex items-center gap-0.5 text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-full px-1.5 py-0">
          <Crown className="w-2.5 h-2.5" /> Premium
        </span>
      )}
      {req.is_new_account && (
        <span className="text-[10px] bg-white/10 text-white/50 border border-white/20 rounded-full px-1.5 py-0">
          New
        </span>
      )}
      {req.is_flagged && (
        <span className="flex items-center gap-0.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/40 rounded-full px-1.5 py-0">
          <AlertTriangle className="w-2.5 h-2.5" /> Flagged
        </span>
      )}
    </div>
  );
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function PendingRow({ req, onApprove, onDeny }) {
  const isPrem = req.user_plan_at_request === 'premium';
  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 border ${
      isPrem ? 'bg-yellow-500/8 border-yellow-500/25' : 'bg-white/5 border-white/10'
    }`}>
      <Avatar name={req.user_name} />
      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-xs font-medium truncate">{req.user_name}</p>
        <UserBadges req={req} />
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-white/30 text-[10px]">{timeAgo(req.created_date)}</span>
        <div className="flex gap-1">
          <button
            onClick={() => onApprove(req)}
            className="h-6 px-2 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/35 transition-colors"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => onDeny(req)}
            className="h-6 px-2 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
          >
            ❌ Deny
          </button>
        </div>
      </div>
    </div>
  );
}

function AwaitingRow({ invite, onCancel }) {
  const { display, expired } = useCountdown(invite.expires_at);
  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 border ${
      expired ? 'bg-white/5 border-white/10 opacity-50' : 'bg-indigo-500/10 border-indigo-500/25'
    }`}>
      <Avatar name={invite.user_name} />
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-xs font-medium truncate">{invite.user_name}</p>
        <p className="text-white/40 text-[10px]">
          {expired ? 'Expired' : 'Invite sent — awaiting acceptance'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {!expired && (
          <span className="flex items-center gap-0.5 text-[10px] text-amber-300">
            <Clock className="w-2.5 h-2.5" /> {display}
          </span>
        )}
        <button
          onClick={() => onCancel(invite)}
          className="h-5 px-1.5 rounded text-[10px] text-white/40 border border-white/15 hover:text-white/70 hover:border-white/30 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-1 py-1 text-[10px] text-white/35 uppercase tracking-wide hover:text-white/55 transition-colors"
      >
        <span>{title} ({count})</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && <div className="space-y-1.5 mt-1">{children}</div>}
    </div>
  );
}

// ── filter bar ─────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Premium', 'New', 'Flagged'];

function FilterBar({ filter, setFilter, pendingCount, premiumCount }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors border ${
            filter === f
              ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/40'
              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
          }`}
        >
          {f}
        </button>
      ))}
      <div className="ml-auto flex gap-1.5 text-[10px] text-white/40">
        <span className="bg-yellow-500/15 text-yellow-300 px-1.5 rounded-full border border-yellow-500/25">
          ⭐ {premiumCount}
        </span>
        <span className="bg-white/10 text-white/50 px-1.5 rounded-full border border-white/15">
          {pendingCount} pending
        </span>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────
export default function RaiseHandQueue({ roomId, isHost, isCohost }) {
  const [pending, setPending] = useState([]);
  const [awaiting, setAwaiting] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [filter, setFilter] = useState('All');

  const loadAll = useCallback(async () => {
    const [reqs, invites] = await Promise.all([
      base44.entities.LiveRequest.filter({ room_id: roomId }, '-priority_score', 200).catch(() => []),
      base44.entities.SpeakerInvite.filter({ room_id: roomId }, '-created_date', 50).catch(() => []),
    ]);

    const pendingReqs = reqs.filter(r => r.status === 'pending');
    // sort by priority_score DESC then created_date ASC
    pendingReqs.sort((a, b) => {
      const scoreDiff = (b.priority_score || 10) - (a.priority_score || 10);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(a.created_date) - new Date(b.created_date);
    });
    setPending(pendingReqs);

    const awaitingInvites = invites.filter(i => i.status === 'pending_accept');
    setAwaiting(awaitingInvites);

    const resolvedReqs = reqs
      .filter(r => ['approved', 'denied', 'expired', 'cancelled'].includes(r.status))
      .slice(0, 10);
    setResolved(resolvedReqs);
  }, [roomId]);

  useEffect(() => {
    loadAll();
    const unsub = base44.entities.LiveRequest.subscribe(ev => {
      if (ev.data?.room_id !== roomId) return;
      loadAll();
    });
    const unsubInvite = base44.entities.SpeakerInvite.subscribe(ev => {
      if (ev.data?.room_id !== roomId) return;
      loadAll();
    });
    return () => { unsub(); unsubInvite(); };
  }, [roomId, loadAll]);

  const handleApprove = async (req) => {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.LiveRequest.update(req.id, {
      status: 'approved',
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
    });
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    await base44.entities.SpeakerInvite.create({
      room_id: roomId,
      user_id: req.user_id,
      user_name: req.user_name,
      request_id: req.id,
      approved_by: user?.id || '',
      status: 'pending_accept',
      expires_at: expiresAt,
      requested_at: req.created_date,
    });
    loadAll();
  };

  const handleDeny = async (req) => {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.LiveRequest.update(req.id, {
      status: 'denied',
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
    });
    // Update UserLiveLimit with denied_until cooldown
    const cooldownMins = req.user_plan_at_request === 'premium' ? 5 : 10;
    const deniedUntil = new Date(Date.now() + cooldownMins * 60 * 1000).toISOString();
    const limits = await base44.entities.UserLiveLimit.filter({ room_id: roomId, user_id: req.user_id }, '', 1).catch(() => []);
    if (limits[0]) {
      await base44.entities.UserLiveLimit.update(limits[0].id, { denied_until: deniedUntil, pending_count: 0 });
    }
    loadAll();
  };

  const handleCancelInvite = async (invite) => {
    await base44.entities.SpeakerInvite.update(invite.id, { status: 'cancelled' });
    loadAll();
  };

  // Apply filter
  const applyFilter = (reqs) => {
    if (filter === 'Premium') return reqs.filter(r => r.user_plan_at_request === 'premium');
    if (filter === 'New') return reqs.filter(r => r.is_new_account);
    if (filter === 'Flagged') return reqs.filter(r => r.is_flagged);
    return reqs;
  };

  const filteredPending = applyFilter(pending);
  const premiumCount = pending.filter(r => r.user_plan_at_request === 'premium').length;

  if (!isHost && !isCohost) return null;

  return (
    <div className="bg-[#1E293B] rounded-xl border border-yellow-500/20 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Hand className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
            Raise Hand Requests
          </span>
        </div>
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          pendingCount={pending.length}
          premiumCount={premiumCount}
        />
      </div>

      <div className="p-2.5 space-y-2">
        {/* Pending requests */}
        {filteredPending.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-3">
            {filter !== 'All' ? `No ${filter.toLowerCase()} requests` : 'No pending requests'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {filteredPending.map(req => (
              <PendingRow key={req.id} req={req} onApprove={handleApprove} onDeny={handleDeny} />
            ))}
          </div>
        )}

        {/* Awaiting acceptance */}
        <CollapsibleSection title="Awaiting Acceptance" count={awaiting.length} defaultOpen={true}>
          {awaiting.map(inv => (
            <AwaitingRow key={inv.id} invite={inv} onCancel={handleCancelInvite} />
          ))}
        </CollapsibleSection>

        {/* Recent decisions */}
        <CollapsibleSection title="Recent Decisions" count={resolved.length} defaultOpen={false}>
          {resolved.map(req => (
            <div key={req.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/3 border border-white/8">
              <Avatar name={req.user_name} />
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs truncate">{req.user_name}</p>
              </div>
              <span className={`text-[10px] capitalize px-1.5 py-0 rounded-full border ${
                req.status === 'approved'
                  ? 'bg-green-500/15 text-green-400 border-green-500/25'
                  : req.status === 'denied'
                  ? 'bg-red-500/15 text-red-400 border-red-500/25'
                  : 'bg-white/10 text-white/40 border-white/15'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
        </CollapsibleSection>
      </div>
    </div>
  );
}