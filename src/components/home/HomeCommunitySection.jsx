import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, HelpCircle, Lightbulb, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TYPE_CONFIG = {
  question: { icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Question' },
  insight:  { icon: Lightbulb,   color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Insight' },
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
      <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <TypeIcon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 line-clamp-1">{post.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.body}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-gray-400">{post.user_name || 'Anonymous'}</span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">{timeAgo(post.created_date)}</span>
            {post.reply_count > 0 && <>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-indigo-500">{post.reply_count} replies</span>
            </>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoginPromptModal({ open, onClose }) {
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Sign in to post</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600">You can read discussions publicly, but you need an account to ask questions or comment.</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreatePostModal({ open, onClose, user, defaultType, onCreated }) {
  const [type, setType] = useState(defaultType || 'question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setType(defaultType || 'question'); setTitle(''); setBody(''); setTags(''); } }, [open, defaultType]);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Please fill in title and message.'); return; }
    setSaving(true);
    await base44.entities.HomeCommunityPost.create({
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      type,
      title: title.trim(),
      body: body.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      reply_count: 0,
      status: 'published',
    });
    toast.success('Posted! 🎉');
    setSaving(false);
    onCreated?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Create a Post</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
              <Select value={type} onValueChange={setType}>
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
              <Input placeholder="faith, prayer…" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
            <Input placeholder="What's your question or insight?" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Message</label>
            <Textarea placeholder="Share your thoughts…" value={body} onChange={e => setBody(e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HomeCommunitySection({ user }) {
  const [tab, setTab] = useState('latest');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState('question');

  const loadPosts = async () => {
    setLoading(true);
    const all = await base44.entities.HomeCommunityPost.filter({ status: 'published' }, '-created_date', 20).catch(() => []);
    setPosts(all);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const filtered = useMemo(() => {
    if (tab === 'questions') return posts.filter(p => p.type === 'question');
    if (tab === 'insights') return posts.filter(p => p.type === 'insight');
    if (tab === 'plans') return posts.filter(p => p.related_plan_id);
    return posts;
  }, [posts, tab]);

  const openCreate = (type) => {
    if (!user?.id) { setLoginPrompt(true); return; }
    setCreateType(type);
    setCreateOpen(true);
  };

  const TABS = [
    { key: 'latest', label: 'Latest' },
    { key: 'questions', label: 'Questions' },
    { key: 'insights', label: 'Insights' },
    { key: 'plans', label: 'Study Plan Discussions' },
  ];

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Community</h2>
            <p className="text-xs text-gray-500">Ask questions, share insights, learn together.</p>
          </div>
        </div>
        <Link to={createPageUrl('CommunityDiscussions')}>
          <Button variant="outline" size="sm" className="text-xs">Open Forum</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-100 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-label={`Filter by ${t.label}`}
            aria-pressed={tab === t.key}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">
          No posts yet. Be the first to start a discussion!
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.slice(0, 5).map(post => <PostRow key={post.id} post={post} />)}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
        <Button
          variant="outline" size="sm"
          className="flex-1 text-xs gap-1 text-amber-600 border-amber-100 hover:bg-amber-50"
          onClick={() => openCreate('question')}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Ask a Question
        </Button>
        <Button
          variant="outline" size="sm"
          className="flex-1 text-xs gap-1 text-indigo-600 border-indigo-100 hover:bg-indigo-50"
          onClick={() => openCreate('insight')}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Share Insight
        </Button>
      </div>

      <LoginPromptModal open={loginPrompt} onClose={() => setLoginPrompt(false)} />

      {user && (
        <CreatePostModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          user={user}
          defaultType={createType}
          onCreated={loadPosts}
        />
      )}
    </section>
  );
}