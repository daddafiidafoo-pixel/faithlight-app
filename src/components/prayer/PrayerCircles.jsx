import React, { useState } from 'react';
import { Users, Plus, X, Lock, Send, ChevronRight, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const CIRCLES_KEY = 'fl_prayer_circles';
const MEMBERSHIPS_KEY = 'fl_circle_memberships';
const CIRCLE_POSTS_KEY = 'fl_circle_posts';

function loadCircles() {
  return JSON.parse(localStorage.getItem(CIRCLES_KEY) || '[]');
}
function saveCircles(c) {
  localStorage.setItem(CIRCLES_KEY, JSON.stringify(c));
}
function loadMemberships(email) {
  const all = JSON.parse(localStorage.getItem(MEMBERSHIPS_KEY) || '{}');
  return all[email] || [];
}
function saveMembership(email, circleId, join) {
  const all = JSON.parse(localStorage.getItem(MEMBERSHIPS_KEY) || '{}');
  const current = all[email] || [];
  all[email] = join ? [...new Set([...current, circleId])] : current.filter(id => id !== circleId);
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(all));
}
function loadCirclePosts(circleId) {
  const all = JSON.parse(localStorage.getItem(CIRCLE_POSTS_KEY) || '{}');
  return all[circleId] || [];
}
function saveCirclePosts(circleId, posts) {
  const all = JSON.parse(localStorage.getItem(CIRCLE_POSTS_KEY) || '{}');
  all[circleId] = posts;
  localStorage.setItem(CIRCLE_POSTS_KEY, JSON.stringify(all));
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DEFAULT_CIRCLES = [
  { id: 'circle_parents', name: 'Parents of Teens', topic: 'Parenting & Youth', emoji: '👨‍👩‍👧', memberCount: 12 },
  { id: 'circle_health', name: 'Healing & Health', topic: 'Physical & mental healing', emoji: '💚', memberCount: 8 },
  { id: 'circle_work', name: 'Marketplace Ministry', topic: 'Faith at work', emoji: '💼', memberCount: 15 },
  { id: 'circle_local', name: 'Local Community', topic: 'Neighborhood & city needs', emoji: '🏘️', memberCount: 22 },
  { id: 'circle_singles', name: 'Singles & Relationships', topic: 'Relationships & purpose', emoji: '🤍', memberCount: 9 },
];

// ─── Circle Detail View ───
function CircleDetail({ circle, currentEmail, currentName, onClose }) {
  const [posts, setPosts] = useState(() => loadCirclePosts(circle.id));
  const [newRequest, setNewRequest] = useState('');

  const postRequest = () => {
    if (!newRequest.trim()) return;
    const p = {
      id: `cp_${Date.now()}`,
      text: newRequest.trim(),
      authorEmail: currentEmail,
      authorName: currentName || currentEmail?.split('@')[0] || 'Member',
      createdAt: new Date().toISOString(),
      prayedBy: [],
    };
    const updated = [p, ...posts];
    setPosts(updated);
    saveCirclePosts(circle.id, updated);
    setNewRequest('');
    toast.success('Request shared with the circle 🙏');
  };

  const togglePrayed = (postId) => {
    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      const prayedBy = p.prayedBy || [];
      const hasPrayed = prayedBy.includes(currentEmail);
      return {
        ...p,
        prayedBy: hasPrayed ? prayedBy.filter(e => e !== currentEmail) : [...prayedBy, currentEmail],
      };
    });
    setPosts(updated);
    saveCirclePosts(circle.id, updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{circle.emoji}</span>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{circle.name}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1"><Lock size={9} /> Private circle</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {posts.length === 0 && (
            <div className="text-center py-10">
              <Lock size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No requests yet. Be the first to share.</p>
            </div>
          )}
          {posts.map(p => (
            <div key={p.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {p.authorName[0]?.toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-700">{p.authorName}</span>
                <span className="text-xs text-gray-400 ml-auto">{timeAgo(p.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{p.text}</p>
              <button
                onClick={() => togglePrayed(p.id)}
                className={`mt-2 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all min-h-[36px] ${
                  (p.prayedBy || []).includes(currentEmail)
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-500'
                }`}
              >
                🙏 {(p.prayedBy || []).length > 0 ? `${p.prayedBy.length} prayed` : 'Pray'}
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <input
            value={newRequest}
            onChange={e => setNewRequest(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && postRequest()}
            placeholder="Share a prayer request with this circle…"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm min-h-[44px]"
          />
          <button
            onClick={postRequest}
            aria-label="Post"
            className="min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Circle Modal ───
function CreateCircleModal({ onClose, onCreate, currentEmail }) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  const create = () => {
    if (!name.trim()) { toast.error('Circle name is required'); return; }
    const circle = {
      id: `circle_${Date.now()}`,
      name: name.trim(),
      topic: topic.trim() || name.trim(),
      emoji: '🙏',
      memberCount: 1,
      createdBy: currentEmail,
    };
    const updated = [circle, ...loadCircles()];
    saveCircles(updated);
    saveMembership(currentEmail, circle.id, true);
    toast.success('Prayer circle created!');
    onCreate(circle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Create a Circle</h2>
          <button onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Circle name (e.g. 'Parents of Teens')"
          className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Topic / description (optional)"
          className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancel</button>
          <button onClick={create} className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700">Create</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function PrayerCircles({ currentUser }) {
  const email = currentUser?.email;
  const [allCircles, setAllCircles] = useState(() => {
    const custom = loadCircles();
    const customIds = new Set(custom.map(c => c.id));
    return [...custom, ...DEFAULT_CIRCLES.filter(c => !customIds.has(c.id))];
  });
  const [memberships, setMemberships] = useState(() => loadMemberships(email));
  const [activeCircle, setActiveCircle] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const isMember = (circleId) => memberships.includes(circleId);

  const toggleMembership = (circleId) => {
    if (!email) { toast.error('Sign in to join a circle'); return; }
    const joining = !isMember(circleId);
    saveMembership(email, circleId, joining);
    setMemberships(loadMemberships(email));
    toast(joining ? 'Joined circle 🙏' : 'Left circle');
  };

  const openCircle = (circle) => {
    if (!email) { toast.error('Sign in to view circle'); return; }
    if (!isMember(circle.id)) { toast.error('Join this circle first'); return; }
    setActiveCircle(circle);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Users size={15} className="text-indigo-500" /> Prayer Circles
        </h2>
        <button
          onClick={() => {
            if (!email) { toast.error('Sign in to create a circle'); return; }
            setShowCreate(true);
          }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 min-h-[36px] bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
        >
          <Plus size={12} /> New Circle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {allCircles.map(circle => (
          <div key={circle.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            isMember(circle.id) ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-gray-100'
          }`}>
            <span className="text-xl flex-shrink-0">{circle.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{circle.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Lock size={9} /> {circle.topic}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isMember(circle.id) && (
                <button
                  onClick={() => openCircle(circle)}
                  aria-label={`Open ${circle.name}`}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              )}
              <button
                onClick={() => toggleMembership(circle.id)}
                className={`text-xs font-semibold px-3 py-1.5 min-h-[36px] rounded-full transition-all ${
                  isMember(circle.id)
                    ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isMember(circle.id) ? 'Leave' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeCircle && (
        <CircleDetail
          circle={activeCircle}
          currentEmail={email}
          currentName={currentUser?.full_name}
          onClose={() => setActiveCircle(null)}
        />
      )}

      {showCreate && (
        <CreateCircleModal
          onClose={() => setShowCreate(false)}
          onCreate={circle => setAllCircles(prev => [circle, ...prev])}
          currentEmail={email}
        />
      )}
    </div>
  );
}