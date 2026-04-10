import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Pin, Archive, Lock, ChevronDown, ChevronUp, Send, Plus, Trash2 } from 'lucide-react';
import ReactionBar from '../reactions/ReactionBar';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GroupForumPanel({ groupId, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedThread, setExpandedThread] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [form, setForm] = useState({ title: '', content: '', is_private: false });

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['group-threads', groupId],
    queryFn: () => base44.entities.GroupThread.filter({ group_id: groupId }, '-created_date', 100).catch(() => []),
    enabled: !!groupId,
  });

  const { data: allReplies = [] } = useQuery({
    queryKey: ['group-forum-replies', groupId],
    queryFn: () => base44.entities.GroupForumPost.filter({ group_id: groupId }, 'created_date', 500).catch(() => []),
    enabled: !!groupId,
  });

  const active = threads.filter(t => t.status !== 'archived');
  const pinned = active.filter(t => t.is_pinned);
  const regular = active.filter(t => !t.is_pinned);

  const createThread = useMutation({
    mutationFn: () => base44.entities.GroupThread.create({
      group_id: groupId,
      title: form.title.trim(),
      content: form.content.trim(),
      creator_id: user.id,
      creator_name: user.full_name,
      is_private: form.is_private,
      status: 'active',
      reply_count: 0,
    }),
    onSuccess: () => {
      toast.success('Discussion started!');
      queryClient.invalidateQueries(['group-threads', groupId]);
      setForm({ title: '', content: '', is_private: false });
      setShowCreate(false);
    },
    onError: () => toast.error('Failed to create discussion'),
  });

  const createReply = useMutation({
    mutationFn: ({ threadId, content }) => base44.entities.GroupForumPost.create({
      group_id: groupId,
      thread_id: threadId,
      author_id: user.id,
      author_name: user.full_name,
      content,
    }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['group-forum-replies', groupId]);
      const t = threads.find(t => t.id === vars.threadId);
      if (t) base44.entities.GroupThread.update(vars.threadId, {
        reply_count: (t.reply_count || 0) + 1,
        last_reply_date: new Date().toISOString(),
      }).catch(() => {});
      setReplyTexts(prev => ({ ...prev, [vars.threadId]: '' }));
    },
    onError: () => toast.error('Failed to post reply'),
  });

  const pinThread = useMutation({
    mutationFn: (thread) => base44.entities.GroupThread.update(thread.id, { is_pinned: !thread.is_pinned }),
    onSuccess: () => queryClient.invalidateQueries(['group-threads', groupId]),
  });

  const archiveThread = useMutation({
    mutationFn: (id) => base44.entities.GroupThread.update(id, { status: 'archived' }),
    onSuccess: () => {
      toast.success('Thread archived');
      queryClient.invalidateQueries(['group-threads', groupId]);
    },
  });

  const deleteReply = useMutation({
    mutationFn: (id) => base44.entities.GroupForumPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['group-forum-replies', groupId]),
  });

  const ThreadRow = ({ thread }) => {
    const isOpen = expandedThread === thread.id;
    const replies = allReplies.filter(r => r.thread_id === thread.id && !r.is_moderated);

    return (
      <div className={`border rounded-xl overflow-hidden transition-all ${thread.is_pinned ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200 bg-white'}`}>
        <button
          className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-gray-50/80 transition-colors"
          onClick={() => setExpandedThread(isOpen ? null : thread.id)}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <MessageSquare className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 text-sm">{thread.title}</span>
                {thread.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
                {thread.is_private && <Lock className="w-3 h-3 text-gray-400" />}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{thread.content}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{thread.creator_name}</span>
                <span>·</span>
                <span>{thread.reply_count || 0} replies</span>
                {thread.last_reply_date && <span>· {format(new Date(thread.last_reply_date), 'MMM d')}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdmin && (
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => pinThread.mutate(thread)} className={`p-1.5 rounded hover:bg-gray-200 ${thread.is_pinned ? 'text-amber-500' : 'text-gray-400'}`} title={thread.is_pinned ? 'Unpin' : 'Pin'}>
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm('Archive this thread?')) archiveThread.mutate(thread.id); }} className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600" title="Archive">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-200">
            {/* Original post */}
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{thread.content}</p>
              <p className="text-xs text-indigo-600 mt-2">— {thread.creator_name} · {format(new Date(thread.created_date), 'MMM d, yyyy')}</p>
            </div>

            {/* Replies */}
            <div className="divide-y divide-gray-100 bg-gray-50/50">
              {replies.map(post => (
                <div key={post.id} className="p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                    {(post.author_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700">{post.author_name || 'Member'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{format(new Date(post.created_date), 'MMM d, h:mm a')}</span>
                        {(isAdmin || post.author_id === user?.id) && (
                          <button onClick={() => deleteReply.mutate(post.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-2">
                      <ReactionBar targetType="forum_reply" targetId={post.id} user={user} compact />
                    </div>
                  </div>
                </div>
              ))}
              {replies.length === 0 && (
                <p className="p-4 text-sm text-gray-400 text-center italic">No replies yet — be the first!</p>
              )}
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
              <Textarea
                placeholder="Write a reply... (Ctrl+Enter to send)"
                className="h-16 text-sm resize-none flex-1"
                value={replyTexts[thread.id] || ''}
                onChange={e => setReplyTexts(prev => ({ ...prev, [thread.id]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.ctrlKey && replyTexts[thread.id]?.trim()) {
                    createReply.mutate({ threadId: thread.id, content: replyTexts[thread.id].trim() });
                  }
                }}
              />
              <Button
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 self-end flex-shrink-0"
                disabled={!replyTexts[thread.id]?.trim() || createReply.isPending}
                onClick={() => createReply.mutate({ threadId: thread.id, content: replyTexts[thread.id].trim() })}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!showCreate ? (
        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" /> Start Discussion
        </Button>
      ) : (
        <Card className="border-indigo-200">
          <div className="p-5 space-y-3">
            <Input placeholder="Discussion title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea
              placeholder="Share your thoughts, questions, or reflections..."
              className="h-28 resize-none"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
                <input type="checkbox" checked={form.is_private} onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))} className="w-4 h-4 rounded" />
                <Lock className="w-3 h-3" /> Private thread
              </label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" className="bg-indigo-600" disabled={!form.title.trim() || !form.content.trim() || createThread.isPending} onClick={() => createThread.mutate()}>
                  {createThread.isPending ? 'Posting...' : 'Post Thread'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1">
            <Pin className="w-3 h-3" /> Pinned
          </p>
          {pinned.map(t => <ThreadRow key={t.id} thread={t} />)}
        </div>
      )}

      <div className="space-y-2">
        {regular.map(t => <ThreadRow key={t.id} thread={t} />)}
        {active.length === 0 && !isLoading && (
          <Card><CardContent className="py-10 text-center text-gray-400"><MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />No discussions yet. Start one above!</CardContent></Card>
        )}
      </div>
    </div>
  );
}