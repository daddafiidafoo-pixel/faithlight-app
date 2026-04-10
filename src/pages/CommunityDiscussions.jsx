import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Search, HelpCircle, Lightbulb, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TYPE_CONFIG = {
  question:   { icon: HelpCircle,    color: 'text-amber-500',   bg: 'bg-amber-50',   label: 'Question' },
  insight:    { icon: Lightbulb,     color: 'text-indigo-500',  bg: 'bg-indigo-50',  label: 'Insight' },
  discussion: { icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Discussion' },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostRow({ post }) {
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.discussion;
  const TypeIcon = cfg.icon;
  return (
    <Link to={createPageUrl(`CommunityPostDetails?id=${post.id}`)}>
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all hover:border-indigo-100 flex gap-4">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{post.title}</h3>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{post.body}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{post.user_name || 'Anonymous'}</span>
            <span>·</span>
            <span>{timeAgo(post.created_date)}</span>
            {post.reply_count > 0 && <span className="text-indigo-500">{post.reply_count} replies</span>}
          </div>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.slice(0, 4).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CommunityDiscussions() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // create form state
  const [createType, setCreateType] = useState('question');
  const [createTitle, setCreateTitle] = useState('');
  const [createBody, setCreateBody] = useState('');
  const [createTags, setCreateTags] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [all, u] = await Promise.all([
      base44.entities.HomeCommunityPost.list('-created_date', 100).catch(() => []),
      base44.auth.me().catch(() => null),
    ]);
    setPosts(all.filter(p => p.status === 'published'));
    setUser(u);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let x = posts;
    if (typeFilter !== 'all') x = x.filter(p => p.type === typeFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      x = x.filter(p => p.title?.toLowerCase().includes(s) || p.body?.toLowerCase().includes(s));
    }
    return x;
  }, [posts, search, typeFilter]);

  const openCreate = () => {
    if (!user?.id) { setLoginPrompt(true); return; }
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!createTitle.trim() || !createBody.trim()) { toast.error('Please fill in title and message.'); return; }
    setCreating(true);
    await base44.entities.HomeCommunityPost.create({
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      type: createType,
      title: createTitle.trim(),
      body: createBody.trim(),
      tags: createTags.split(',').map(t => t.trim()).filter(Boolean),
      reply_count: 0,
      status: 'published',
    });
    toast.success('Posted!');
    setCreateTitle(''); setCreateBody(''); setCreateTags('');
    setCreating(false);
    setShowCreate(false);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Community</h1>
            <p className="text-gray-500 text-sm">Ask questions, share insights, discuss Scripture. Public to read — sign in to post.</p>
          </div>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={openCreate}>
            <PlusCircle className="w-4 h-4" /> New Post
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="Search discussions…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="insight">Insights</SelectItem>
              <SelectItem value="discussion">Discussions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No posts found. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => <PostRow key={post.id} post={post} />)}
          </div>
        )}
      </div>

      {/* Login prompt */}
      <Dialog open={loginPrompt} onOpenChange={setLoginPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Sign in to post</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">You can read discussions publicly, but you need an account to post or reply.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setLoginPrompt(false)}>Cancel</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create post modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Post</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
                <Select value={createType} onValueChange={setCreateType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="insight">💡 Insight</SelectItem>
                    <SelectItem value="discussion">💬 Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tags (comma separated)</label>
                <Input placeholder="faith, prayer…" value={createTags} onChange={e => setCreateTags(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
              <Input placeholder="What's your question or insight?" value={createTitle} onChange={e => setCreateTitle(e.target.value)} maxLength={120} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Message</label>
              <Textarea placeholder="Write your post…" value={createBody} onChange={e => setCreateBody(e.target.value)} rows={5} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />} Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}