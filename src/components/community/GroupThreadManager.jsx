import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquare, Lock, Pin, Archive, MessageCircle } from 'lucide-react';

export default function GroupThreadManager({ groupId, user, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_private: false,
  });

  const { data: threads = [] } = useQuery({
    queryKey: ['group-threads', groupId],
    queryFn: async () => {
      const allThreads = await base44.entities.GroupThread.filter(
        { group_id: groupId, status: 'active' },
        '-created_date',
        100
      );
      return allThreads;
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async (data) => {
      const thread = await base44.entities.GroupThread.create({
        group_id: groupId,
        title: data.title,
        content: data.content,
        creator_id: user.id,
        creator_name: user.full_name,
        is_private: data.is_private,
        allowed_members: data.is_private ? [user.id] : [],
        status: 'active',
      });

      // Notify group members
      const members = await base44.entities.GroupMember.filter({ group_id: groupId });
      const notifications = members
        .filter(m => m.user_id !== user.id)
        .map(m => ({
          user_id: m.user_id,
          group_id: groupId,
          notification_type: 'thread_created',
          title: `New discussion: ${data.title}`,
          message: `${user.full_name} started a ${data.is_private ? 'private' : 'public'} discussion`,
          related_entity_id: thread.id,
          related_entity_type: 'thread',
          triggered_by_user_id: user.id,
          triggered_by_name: user.full_name,
        }));

      if (notifications.length > 0) {
        await base44.entities.GroupNotification.bulkCreate(notifications);
      }

      return thread;
    },
    onSuccess: () => {
      toast.success('Discussion thread created!');
      queryClient.invalidateQueries(['group-threads', groupId]);
      setFormData({ title: '', content: '', is_private: false });
      setShowCreateForm(false);
    },
    onError: () => toast.error('Failed to create thread'),
  });

  const pinThreadMutation = useMutation({
    mutationFn: async (threadId) => {
      const thread = threads.find(t => t.id === threadId);
      return base44.entities.GroupThread.update(threadId, {
        is_pinned: !thread?.is_pinned,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-threads', groupId]);
    },
  });

  const archiveThreadMutation = useMutation({
    mutationFn: async (threadId) => {
      return base44.entities.GroupThread.update(threadId, { status: 'archived' });
    },
    onSuccess: () => {
      toast.success('Thread archived');
      queryClient.invalidateQueries(['group-threads', groupId]);
    },
  });

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }
    createThreadMutation.mutate(formData);
  };

  const pinnedThreads = threads.filter(t => t.is_pinned);
  const regularThreads = threads.filter(t => !t.is_pinned);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Discussion Threads</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Thread Form */}
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-indigo-600 gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Start New Discussion
            </Button>
          ) : (
            <form onSubmit={handleCreateThread} className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <Label htmlFor="title">Discussion Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Thoughts on Chapter 5"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="content">Your Message *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="h-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="w-4 h-4" />
                  Private discussion (only group members)
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createThreadMutation.isPending}
                  className="bg-indigo-600"
                >
                  {createThreadMutation.isPending ? 'Creating...' : 'Create Thread'}
                </Button>
              </div>
            </form>
          )}

          {/* Threads List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Pinned Threads */}
            {pinnedThreads.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> PINNED
                </p>
                <div className="space-y-2">
                  {pinnedThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      user={user}
                      onPin={() => pinThreadMutation.mutate(thread.id)}
                      onArchive={() => archiveThreadMutation.mutate(thread.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Threads */}
            {regularThreads.length > 0 && (
              <div className="space-y-2">
                {regularThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    user={user}
                    onPin={() => pinThreadMutation.mutate(thread.id)}
                    onArchive={() => archiveThreadMutation.mutate(thread.id)}
                  />
                ))}
              </div>
            )}

            {threads.length === 0 && (
              <p className="text-gray-500 text-sm py-8 text-center">
                No discussions yet. Start one to engage with the group!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThreadCard({ thread, user, onPin, onArchive }) {
  const isCreator = user.id === thread.creator_id;

  return (
    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <h4 className="font-medium text-gray-900 truncate">{thread.title}</h4>
            {thread.is_private && <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />}
            {thread.is_pinned && <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            by {thread.creator_name} • {thread.reply_count || 0} replies
          </p>
        </div>
        {isCreator && (
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPin}
              className="h-7 w-7"
              title={thread.is_pinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onArchive}
              className="h-7 w-7 hover:text-red-600"
              title="Archive"
            >
              <Archive className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}