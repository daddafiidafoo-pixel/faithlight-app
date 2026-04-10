import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserX, Crown, Archive, AlertTriangle, Settings, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GroupAdminPanel({ groupId, group, user }) {
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [settings, setSettings] = useState({ name: group?.name || '', description: group?.description || '', privacy: group?.privacy || 'public' });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId }, '-created_date', 200).catch(() => []),
    enabled: !!groupId,
  });

  const { data: flaggedPosts = [] } = useQuery({
    queryKey: ['group-flagged-posts', groupId],
    queryFn: () => base44.entities.GroupForumPost.filter({ group_id: groupId, is_moderated: true }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  const { data: archivedThreads = [] } = useQuery({
    queryKey: ['group-archived-threads', groupId],
    queryFn: () => base44.entities.GroupThread.filter({ group_id: groupId, status: 'archived' }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['group-all-recent-posts', groupId],
    queryFn: () => base44.entities.GroupForumPost.filter({ group_id: groupId }, '-created_date', 30).catch(() => []),
    enabled: !!groupId,
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => base44.entities.GroupMember.update(id, { role }),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries(['group-members', groupId]); },
    onError: () => toast.error('Failed to update role'),
  });

  const removeMember = useMutation({
    mutationFn: (id) => base44.entities.GroupMember.delete(id),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries(['group-members', groupId]);
      base44.entities.Group.update(groupId, { member_count: Math.max(0, (group?.member_count || 1) - 1) }).catch(() => {});
    },
    onError: () => toast.error('Failed to remove member'),
  });

  const moderatePost = useMutation({
    mutationFn: ({ id, hide }) => base44.entities.GroupForumPost.update(id, { is_moderated: hide }),
    onSuccess: () => { toast.success('Post updated'); queryClient.invalidateQueries(['group-all-recent-posts', groupId]); queryClient.invalidateQueries(['group-forum-replies', groupId]); },
  });

  const restoreThread = useMutation({
    mutationFn: (id) => base44.entities.GroupThread.update(id, { status: 'active' }),
    onSuccess: () => { toast.success('Thread restored'); queryClient.invalidateQueries(['group-archived-threads', groupId]); queryClient.invalidateQueries(['group-threads', groupId]); },
  });

  const saveSettings = useMutation({
    mutationFn: () => base44.entities.Group.update(groupId, { name: settings.name.trim(), description: settings.description.trim(), privacy: settings.privacy }),
    onSuccess: () => { toast.success('Settings saved!'); queryClient.invalidateQueries(['group', groupId]); setShowSettings(false); },
    onError: () => toast.error('Failed to save settings'),
  });

  const ROLE_BG = { owner: 'bg-purple-100 text-purple-800', admin: 'bg-amber-100 text-amber-800', moderator: 'bg-blue-100 text-blue-800', member: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
      </div>

      {/* Group Settings */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowSettings(s => !s)}>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Group Settings</span>
            {showSettings ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </CardTitle>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-3 pt-0">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Name</label><Input value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Description</label><Textarea value={settings.description} className="h-20 resize-none" onChange={e => setSettings(s => ({ ...s, description: e.target.value }))} /></div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Privacy</label>
              <Select value={settings.privacy} onValueChange={v => setSettings(s => ({ ...s, privacy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌐 Public</SelectItem>
                  <SelectItem value="private">🔒 Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>Cancel</Button>
              <Button size="sm" className="bg-indigo-600" disabled={saveSettings.isPending} onClick={() => saveSettings.mutate()}>{saveSettings.isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Posts — moderation */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-500" /> Recent Posts ({allPosts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-60 overflow-y-auto pt-0">
          {allPosts.length === 0 ? <p className="text-xs text-gray-400">No posts yet.</p> : allPosts.map(post => (
            <div key={post.id} className={`flex items-start justify-between gap-2 p-2 rounded-lg border ${post.is_moderated ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700">{post.author_name}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{post.content}</p>
              </div>
              <button
                onClick={() => moderatePost.mutate({ id: post.id, hide: !post.is_moderated })}
                className={`flex-shrink-0 p-1 rounded text-xs ${post.is_moderated ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                title={post.is_moderated ? 'Restore post' : 'Hide post'}
              >
                {post.is_moderated ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Members */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /> Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto pt-0">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">{(member.user_name || 'U')[0].toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.user_name}</p>
                  <p className="text-xs text-gray-400">{member.joined_at ? format(new Date(member.joined_at), 'MMM d, yyyy') : ''}</p>
                </div>
              </div>
              {member.user_id !== user?.id ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Select value={member.role} onValueChange={role => updateRole.mutate({ id: member.id, role })}>
                    <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <button onClick={() => { if (confirm(`Remove ${member.user_name}?`)) removeMember.mutate(member.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Remove">
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Badge className={`text-xs ${ROLE_BG[member.role] || ROLE_BG.member}`}>{member.role} (you)</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Archived Threads */}
      {archivedThreads.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowArchived(s => !s)}>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><Archive className="w-4 h-4" /> Archived Threads ({archivedThreads.length})</span>
              {showArchived ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </CardTitle>
          </CardHeader>
          {showArchived && (
            <CardContent className="space-y-2 pt-0">
              {archivedThreads.map(thread => (
                <div key={thread.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{thread.title}</p>
                    <p className="text-xs text-gray-400">by {thread.creator_name} · {thread.reply_count || 0} replies</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => restoreThread.mutate(thread.id)}>Restore</Button>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}