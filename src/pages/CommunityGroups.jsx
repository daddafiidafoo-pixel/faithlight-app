import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, MapPin, Tag, MessageCircle, Calendar, ChevronRight, X, Send, Heart } from 'lucide-react';

const GROUPS_KEY = 'faithlight_community_groups';
const MY_GROUPS_KEY = 'faithlight_my_groups';

function getGroups() {
  try { return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]'); } catch { return []; }
}
function saveGroups(g) { localStorage.setItem(GROUPS_KEY, JSON.stringify(g)); }
function getMyGroups() {
  try { return JSON.parse(localStorage.getItem(MY_GROUPS_KEY) || '[]'); } catch { return []; }
}
function saveMyGroups(g) { localStorage.setItem(MY_GROUPS_KEY, JSON.stringify(g)); }

const INTERESTS = ['Prayer', 'Bible Study', 'Youth', 'Women', 'Men', 'Worship', 'Missions', 'Family'];

const SEED_GROUPS = [
  { id: 'seed1', name: 'Morning Prayer Warriors', interest: 'Prayer', location: 'Global', members: 42, posts: [] },
  { id: 'seed2', name: 'Youth Bible Study', interest: 'Youth', location: 'North America', members: 18, posts: [] },
  { id: 'seed3', name: "Women's Circle", interest: 'Women', location: 'Global', members: 31, posts: [] },
];

export default function CommunityGroups() {
  const [groups, setGroups] = useState([]);
  const [myGroupIds, setMyGroupIds] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('encouragement');
  const [newGroup, setNewGroup] = useState({ name: '', interest: 'Prayer', location: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let g = getGroups();
    if (g.length === 0) { g = SEED_GROUPS; saveGroups(g); }
    setGroups(g);
    setMyGroupIds(getMyGroups());
  }, []);

  const joinGroup = (id) => {
    const next = myGroupIds.includes(id) ? myGroupIds.filter(x => x !== id) : [...myGroupIds, id];
    setMyGroupIds(next);
    saveMyGroups(next);
    const updated = groups.map(g => g.id === id ? { ...g, members: g.members + (myGroupIds.includes(id) ? -1 : 1) } : g);
    setGroups(updated);
    saveGroups(updated);
  };

  const createGroup = () => {
    if (!newGroup.name.trim()) return;
    const g = { id: Date.now().toString(), ...newGroup, members: 1, posts: [] };
    const updated = [...groups, g];
    setGroups(updated);
    saveGroups(updated);
    const myNext = [...myGroupIds, g.id];
    setMyGroupIds(myNext);
    saveMyGroups(myNext);
    setShowCreate(false);
    setNewGroup({ name: '', interest: 'Prayer', location: '' });
  };

  const postToGroup = () => {
    if (!postText.trim() || !activeGroup) return;
    const post = { id: Date.now(), text: postText, type: postType, ts: new Date().toLocaleString(), likes: 0 };
    const updated = groups.map(g => g.id === activeGroup.id ? { ...g, posts: [post, ...g.posts] } : g);
    setGroups(updated);
    saveGroups(updated);
    setActiveGroup(updated.find(g => g.id === activeGroup.id));
    setPostText('');
  };

  const likePost = (postId) => {
    const updated = groups.map(g => g.id === activeGroup.id
      ? { ...g, posts: g.posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p) }
      : g);
    setGroups(updated);
    saveGroups(updated);
    setActiveGroup(updated.find(g => g.id === activeGroup.id));
  };

  const filtered = filter === 'mine' ? groups.filter(g => myGroupIds.includes(g.id)) : groups;

  const typeColors = { prayer: 'bg-blue-100 text-blue-700', encouragement: 'bg-green-100 text-green-700', study: 'bg-violet-100 text-violet-700' };

  if (activeGroup) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setActiveGroup(null)} className="p-2 rounded-full hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h2 className="font-bold text-slate-900">{activeGroup.name}</h2>
            <p className="text-xs text-slate-500">{activeGroup.members} members · {activeGroup.interest}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Post composer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
            <div className="flex gap-2 mb-3">
              {['prayer', 'encouragement', 'study'].map(t => (
                <button key={t} onClick={() => setPostType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${postType === t ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder={postType === 'prayer' ? 'Share a prayer request...' : postType === 'study' ? 'Post a study meetup or question...' : 'Share an encouragement...'}
              className="w-full text-sm text-slate-800 outline-none resize-none placeholder-slate-400 min-h-[80px]"
            />
            <div className="flex justify-end mt-2">
              <button onClick={postToGroup} disabled={!postText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                <Send className="h-4 w-4" /> Post
              </button>
            </div>
          </div>
          {/* Posts */}
          <div className="space-y-3">
            {activeGroup.posts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No posts yet. Be the first to share!</p>
              </div>
            )}
            {activeGroup.posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[post.type] || 'bg-slate-100 text-slate-600'}`}>
                    {post.type}
                  </span>
                  <span className="text-xs text-slate-400">{post.ts}</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{post.text}</p>
                <button onClick={() => likePost(post.id)} className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 hover:text-rose-500 transition">
                  <Heart className="h-3.5 w-3.5" /> {post.likes} Amens
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Community Groups</h1>
            <p className="text-sm text-slate-500 mt-1">Connect, pray, and grow together</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-violet-700 transition">
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['all', 'mine'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter === f ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200 text-slate-600'}`}>
              {f === 'all' ? 'All Groups' : 'My Groups'}
            </button>
          ))}
        </div>

        {/* Groups list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No groups yet. Create one to get started!</p>
            </div>
          )}
          {filtered.map(g => (
            <div key={g.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <button onClick={() => setActiveGroup(g)} className="flex-1 text-left">
                  <h3 className="font-bold text-slate-900">{g.name}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Tag className="h-3 w-3" />{g.interest}</span>
                    {g.location && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{g.location}</span>}
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Users className="h-3 w-3" />{g.members}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500"><MessageCircle className="h-3 w-3" />{g.posts?.length || 0} posts</span>
                  </div>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => joinGroup(g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${myGroupIds.includes(g.id) ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                    {myGroupIds.includes(g.id) ? '✓ Joined' : 'Join'}
                  </button>
                  <button onClick={() => setActiveGroup(g)} className="p-1">
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full" />
            <h2 className="text-lg font-bold text-slate-900 mt-3 mb-5">Create a Group</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Group Name</label>
                <input value={newGroup.name} onChange={e => setNewGroup(n => ({ ...n, name: e.target.value }))}
                  placeholder="e.g. Thursday Morning Prayer"
                  className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Interest / Category</label>
                <select value={newGroup.interest} onChange={e => setNewGroup(n => ({ ...n, interest: e.target.value }))}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 bg-white">
                  {INTERESTS.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Location (optional)</label>
                <input value={newGroup.location} onChange={e => setNewGroup(n => ({ ...n, location: e.target.value }))}
                  placeholder="e.g. Lagos, Nigeria or Global"
                  className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400" />
              </div>
              <button onClick={createGroup} disabled={!newGroup.name.trim()}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold disabled:opacity-40">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}