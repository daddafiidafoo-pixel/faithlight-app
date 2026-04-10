import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Hash, Plus, MessageSquare, Users, Lock, Globe, Trash2, X, ChevronRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function GroupChannels({ groupId, user, isAdmin, members }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [form, setForm] = useState({ name: '', description: '', is_private: false });

  const { data: channels = [] } = useQuery({
    queryKey: ['group-channels', groupId],
    queryFn: () => base44.entities.GroupThread.filter({ group_id: groupId, is_pinned: false }, '-updated_date', 30)
      .then(r => r.filter(t => t.thread_type === 'channel'))
      .catch(() => []),
    enabled: !!groupId,
    retry: false,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['channel-messages', selectedChannel?.id],
    queryFn: () => base44.entities.GroupChatMessage.filter({ thread_id: selectedChannel.id }, '-updated_date', 50).catch(() => []),
    enabled: !!selectedChannel?.id,
    retry: false,
    refetchInterval: 10000, // poll every 10s
  });

  const createChannel = useMutation({
    mutationFn: () => base44.entities.GroupThread.create({
      group_id: groupId,
      title: form.name.replace(/\s+/g, '-').toLowerCase(),
      content: form.description || `Channel: ${form.name}`,
      creator_id: user.id,
      creator_name: user.full_name,
      is_private: form.is_private,
      thread_type: 'channel',
      status: 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-channels', groupId]);
      setShowCreate(false);
      setForm({ name: '', description: '', is_private: false });
      toast.success('Channel created!');
    },
  });

  const deleteChannel = useMutation({
    mutationFn: (id) => base44.entities.GroupThread.update(id, { status: 'archived' }),
    onSuccess: () => { queryClient.invalidateQueries(['group-channels', groupId]); setSelectedChannel(null); toast.success('Channel archived'); },
  });

  const sendMessage = useMutation({
    mutationFn: () => base44.entities.GroupChatMessage.create({
      group_id: groupId,
      thread_id: selectedChannel.id,
      sender_id: user.id,
      sender_name: user.full_name,
      content: newMessage,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['channel-messages', selectedChannel.id]);
      setNewMessage('');
      // Update last reply date
      base44.entities.GroupThread.update(selectedChannel.id, { last_reply_date: new Date().toISOString(), reply_count: (selectedChannel.reply_count || 0) + 1 }).catch(() => {});
    },
  });

  if (selectedChannel) {
    return (
      <div className="flex flex-col h-[600px]">
        {/* Channel Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 mb-3">
          <button onClick={() => setSelectedChannel(null)} className="text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <Hash className="w-4 h-4 text-indigo-500" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">{selectedChannel.title}</h3>
            {selectedChannel.content && selectedChannel.content !== `Channel: ${selectedChannel.title}` && (
              <p className="text-xs text-gray-500">{selectedChannel.content}</p>
            )}
          </div>
          {selectedChannel.is_private && <Badge className="bg-gray-100 text-gray-600 border-0 text-xs gap-1"><Lock className="w-2.5 h-2.5" /> Private</Badge>}
          {isAdmin && <button onClick={() => { if (confirm('Archive this channel?')) deleteChannel.mutate(selectedChannel.id); }} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            [...messages].reverse().map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                  {(msg.sender_name || 'U')[0].toUpperCase()}
                </div>
                <div className={`max-w-[75%] ${msg.sender_id === user?.id ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <span className="text-[10px] text-gray-400 px-1">{msg.sender_name}</span>
                  <div className={`px-3 py-2 rounded-xl text-sm ${msg.sender_id === user?.id ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-gray-300 px-1">{msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ''}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        {user && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Message #${selectedChannel.title}`}
              className="flex-1"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) { e.preventDefault(); sendMessage.mutate(); } }}
            />
            <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { if (newMessage.trim()) sendMessage.mutate(); }} disabled={!newMessage.trim() || sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-gray-900">Channels</h3>
          <span className="text-xs text-gray-400">Sub-groups & topic channels</span>
        </div>
        {(isAdmin || user) && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-3.5 h-3.5" /> New Channel
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="border-indigo-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Create Channel</h4>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <Input placeholder="channel-name (e.g. prayer-requests)" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value.replace(/\s+/g, '-').toLowerCase() }))} />
            <Textarea placeholder="What is this channel for? (optional)" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-16" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_private} onChange={e => setForm(p => ({ ...p, is_private: e.target.checked }))} className="rounded" />
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Private channel (invite only)</span>
            </label>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-indigo-600"
                onClick={() => { if (!form.name.trim()) { toast.error('Channel name required'); return; } createChannel.mutate(); }}
                disabled={createChannel.isPending}>
                {createChannel.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Default channels hint */}
      {channels.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <Hash className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No channels yet</p>
          <p className="text-xs text-gray-400 mt-1">Create channels like #prayer, #announcements, or #study-notes to organize group discussions</p>
        </div>
      )}

      <div className="space-y-2">
        {channels.map(ch => (
          <button key={ch.id} onClick={() => setSelectedChannel(ch)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left group">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ch.is_private ? 'bg-gray-100' : 'bg-indigo-100'}`}>
                {ch.is_private ? <Lock className="w-3.5 h-3.5 text-gray-500" /> : <Hash className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">#{ch.title}</p>
                {ch.content && ch.content !== `Channel: ${ch.title}` && (
                  <p className="text-xs text-gray-400 line-clamp-1">{ch.content}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ch.reply_count > 0 && <span className="text-xs text-gray-400">{ch.reply_count} msgs</span>}
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}