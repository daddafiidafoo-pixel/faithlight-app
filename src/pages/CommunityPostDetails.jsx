import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, Loader2, Send, MessageCircle, HelpCircle, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

export default function CommunityPostDetails() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const loadComments = async () => {
    const all = await base44.entities.HomeCommunityComment.list('created_date', 200).catch(() => []);
    setComments(all.filter(c => c.post_id === postId && c.status === 'published'));
  };

  useEffect(() => {
    if (!postId) return;
    const init = async () => {
      setLoading(true);
      const [allPosts, u] = await Promise.all([
        base44.entities.HomeCommunityPost.list('-created_date', 200).catch(() => []),
        base44.auth.me().catch(() => null),
      ]);
      const found = allPosts.find(p => p.id === postId) || null;
      setPost(found);
      setUser(u);
      if (found) await loadComments();
      setLoading(false);
    };
    init();
  }, [postId]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!user) { setLoginPrompt(true); return; }
    setSending(true);
    await base44.entities.HomeCommunityComment.create({
      post_id: postId,
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      body: replyText.trim(),
      status: 'published',
    });
    await base44.entities.HomeCommunityPost.update(postId, {
      reply_count: (post.reply_count || 0) + 1,
    }).catch(() => {});
    setPost(p => p ? { ...p, reply_count: (p.reply_count || 0) + 1 } : p);
    setReplyText('');
    toast.success('Reply posted!');
    await loadComments();
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!post) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Post not found.</p>
      <Link to={createPageUrl('CommunityDiscussions')}><Button variant="outline">Back to Community</Button></Link>
    </div>
  );

  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.discussion;
  const TypeIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('CommunityDiscussions')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Community
        </Link>

        {/* Post */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
              <TypeIcon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            {post.tags?.length > 0 && post.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t}</span>
            ))}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="prose prose-sm prose-slate max-w-none text-gray-700 mb-4">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
            <span>{post.user_name || 'Anonymous'}</span>
            <span>·</span>
            <span>{timeAgo(post.created_date)}</span>
            <span>·</span>
            <span>{post.reply_count || 0} replies</span>
          </div>
        </div>

        {/* Replies */}
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">Replies ({comments.length})</h2>
        <div className="space-y-3 mb-5">
          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-800 mb-2">{c.body}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{c.user_name || 'Anonymous'}</span>
                <span>·</span>
                <span>{timeAgo(c.created_date)}</span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No replies yet. Be the first to respond!</p>
          )}
        </div>

        {/* Reply box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          {!user && (
            <p className="text-xs text-gray-400 mb-2">
              <button onClick={() => base44.auth.redirectToLogin()} className="text-indigo-600 underline">Sign in</button> to reply.
            </p>
          )}
          <Textarea
            placeholder={user ? 'Write a reply…' : 'Sign in to reply…'}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
            disabled={!user}
          />
          <div className="flex justify-end mt-3">
            {user ? (
              <Button onClick={handleReply} disabled={sending || !replyText.trim()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Reply
              </Button>
            ) : (
              <Button onClick={() => base44.auth.redirectToLogin()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">Sign In to Reply</Button>
            )}
          </div>
        </div>
      </div>

      {/* Login prompt modal */}
      <Dialog open={loginPrompt} onOpenChange={setLoginPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Sign in to reply</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">You can read discussions publicly, but you need an account to reply.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setLoginPrompt(false)}>Cancel</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}