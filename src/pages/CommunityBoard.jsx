import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Plus, X, BookOpen, Trophy, MessageSquare, Flame, Clock, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const POSTS_KEY = 'fl_community_board_posts';
const LIKES_KEY = 'fl_community_board_likes';
const SAVES_KEY = 'fl_community_board_saves';

const TYPES = [
  { value: 'verse', label: '📖 Verse', color: '#6366F1' },
  { value: 'prayer', label: '🙏 Prayer', color: '#8B5CF6' },
  { value: 'quiz', label: '🏆 Quiz Result', color: '#F59E0B' },
  { value: 'reflection', label: '✨ Reflection', color: '#10B981' },
];

const SEED_POSTS = [
  { id: 's1', type: 'verse', content: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you."', reference: 'Jeremiah 29:11', likes: 24, date: new Date(Date.now() - 86400000).toISOString() },
  { id: 's2', type: 'prayer', content: 'Lord, give me the strength to face today\'s challenges with grace and faith. Amen 🙏', likes: 18, date: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 's3', type: 'quiz', content: 'Just scored 5/5 on the John Chapter 3 quiz! 🎉 The story of Nicodemus is so rich with meaning.', likes: 31, date: new Date(Date.now() - 3600000 * 7).toISOString() },
  { id: 's4', type: 'reflection', content: 'Reading Psalm 23 today reminded me that even in my darkest valleys, I am never alone. What a comfort!', reference: 'Psalm 23', likes: 42, date: new Date(Date.now() - 86400000 * 2).toISOString() },
];

function loadPosts() {
  try {
    const stored = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    return [...stored, ...SEED_POSTS.filter(s => !stored.find(p => p.id === s.id))];
  } catch { return SEED_POSTS; }
}
function loadSet(key) { try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); } }
function saveSet(key, set) { localStorage.setItem(key, JSON.stringify([...set])); }
function savePosts(posts) { localStorage.setItem(POSTS_KEY, JSON.stringify(posts.filter(p => !SEED_POSTS.find(s => s.id === p.id)))); }

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostCard({ post, liked, saved, onLike, onSave }) {
  const type = TYPES.find(t => t.value === post.type) || TYPES[0];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: type.color + '18', color: type.color }}>{type.label}</span>
        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{timeAgo(post.date)}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-2 italic">"{post.content}"</p>
      {post.reference && (
        <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mb-2"><BookOpen size={10} />{post.reference}</p>
      )}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
        <button onClick={onLike} className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: liked ? '#F43F5E' : '#9CA3AF' }}>
          <Heart size={15} fill={liked ? '#F43F5E' : 'none'} />
          {(post.likes || 0) + (liked ? 1 : 0)}
        </button>
        <button onClick={onSave} className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: saved ? '#6366F1' : '#9CA3AF' }}>
          <Bookmark size={15} fill={saved ? '#6366F1' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 ml-auto"
          onClick={() => navigator.share ? navigator.share({ text: post.content }) : navigator.clipboard?.writeText(post.content)}>
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  );
}

function PostModal({ onSave, onClose }) {
  const [form, setForm] = useState({ type: 'verse', content: '', reference: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    onSave({ ...form, id: Date.now().toString(), likes: 0, date: new Date().toISOString() });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Share with Community</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => set('type', t.value)}
                  className="py-2 px-3 rounded-xl border-2 text-xs font-medium text-left transition-all"
                  style={{ borderColor: form.type === t.value ? t.color : '#E5E7EB', backgroundColor: form.type === t.value ? t.color + '15' : 'white', color: form.type === t.value ? t.color : '#6B7280' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Content *</label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)} required rows={4}
              placeholder={form.type === 'verse' ? 'Paste a verse that moved you...' : form.type === 'prayer' ? 'Share a prayer...' : form.type === 'quiz' ? 'Share your quiz achievement...' : 'Share a reflection...'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          {(form.type === 'verse' || form.type === 'reflection') && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Reference (optional)</label>
              <input value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="e.g. Romans 8:28"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          )}
          <p className="text-xs text-gray-400 text-center">✓ Posted anonymously</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>Post Anonymously</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CommunityBoard() {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState(new Set());
  const [saves, setSaves] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('all'); // all | saved

  useEffect(() => {
    setPosts(loadPosts());
    setLikes(loadSet(LIKES_KEY));
    setSaves(loadSet(SAVES_KEY));
  }, []);

  const handleLike = (id) => {
    const next = new Set(likes);
    likes.has(id) ? next.delete(id) : next.add(id);
    setLikes(next); saveSet(LIKES_KEY, next);
  };
  const handleSave = (id) => {
    const next = new Set(saves);
    saves.has(id) ? next.delete(id) : next.add(id);
    setSaves(next); saveSet(SAVES_KEY, next);
  };
  const handlePost = (post) => {
    const updated = [post, ...posts];
    setPosts(updated); savePosts(updated); setShowModal(false);
  };

  const displayed = posts
    .filter(p => filter === 'all' || p.type === filter)
    .filter(p => tab === 'saved' ? saves.has(p.id) : true)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      <div className="px-4 pt-6 pb-5" style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)' }}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Community Board</h1>
              <p className="text-indigo-200 text-sm">{posts.length} posts shared anonymously</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Plus size={15} /> Share
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-2">
            {['all', 'saved'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={{ background: tab === t ? 'white' : 'transparent', color: tab === t ? '#4F46E5' : 'rgba(255,255,255,0.8)' }}>
                {t === 'saved' ? `🔖 Saved (${saves.size})` : '🌍 All Posts'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button onClick={() => setFilter('all')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
            style={{ borderColor: filter === 'all' ? '#4F46E5' : '#E5E7EB', background: filter === 'all' ? '#EEF2FF' : 'white', color: filter === 'all' ? '#4F46E5' : '#6B7280' }}>
            All
          </button>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
              style={{ borderColor: filter === t.value ? t.color : '#E5E7EB', background: filter === t.value ? t.color + '15' : 'white', color: filter === t.value ? t.color : '#6B7280' }}>
              {t.label}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-14">
            <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600">{tab === 'saved' ? 'No saved posts yet' : 'No posts yet'}</p>
            <p className="text-sm text-gray-400">Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(p => (
              <PostCard key={p.id} post={p} liked={likes.has(p.id)} saved={saves.has(p.id)}
                onLike={() => handleLike(p.id)} onSave={() => handleSave(p.id)} />
            ))}
          </div>
        )}
      </div>

      {showModal && <PostModal onSave={handlePost} onClose={() => setShowModal(false)} />}
    </div>
  );
}