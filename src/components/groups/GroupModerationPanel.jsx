import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield, Users, Settings, MessageSquare, Trash2, AlertTriangle,
  UserX, VolumeX, CheckCircle, XCircle, Edit2, Save, Globe, Lock, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function GroupModerationPanel({ groupId, group, user }) {
  const queryClient = useQueryClient();
  const [settingsForm, setSettingsForm] = useState({
    name: group?.name || '',
    description: group?.description || '',
    privacy: group?.privacy || 'public',
    rules: group?.rules || '',
  });
  const [editingSettings, setEditingSettings] = useState(false);

  // Members
  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ['mod-members', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId }, '-created_date', 200).catch(() => []),
    enabled: !!groupId,
  });

  // Group Threads
  const { data: threads = [], refetch: refetchThreads } = useQuery({
    queryKey: ['mod-threads', groupId],
    queryFn: () => base44.entities.GroupThread.filter({ group_id: groupId }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  // Prayer Requests
  const { data: prayers = [], refetch: refetchPrayers } = useQuery({
    queryKey: ['mod-prayers', groupId],
    queryFn: () => base44.entities.PrayerRequest.filter({ group_id: groupId }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  // ── Member Actions ─────────────────────────────────────────────────────────
  const kickMutation = useMutation({
    mutationFn: (memberId) => base44.entities.GroupMember.delete(memberId),
    onSuccess: () => { toast.success('Member removed'); refetchMembers(); queryClient.invalidateQueries(['group-members', groupId]); },
    onError: () => toast.error('Failed to remove member'),
  });

  const banMutation = useMutation({
    mutationFn: (memberId) => base44.entities.GroupMember.update(memberId, { role: 'banned' }),
    onSuccess: () => { toast.success('Member banned'); refetchMembers(); },
    onError: () => toast.error('Failed to ban member'),
  });

  const muteMutation = useMutation({
    mutationFn: (memberId) => base44.entities.GroupMember.update(memberId, { is_muted: true }),
    onSuccess: () => { toast.success('Member muted'); refetchMembers(); },
    onError: () => toast.error('Failed to mute member'),
  });

  const unmuteMutation = useMutation({
    mutationFn: (memberId) => base44.entities.GroupMember.update(memberId, { is_muted: false }),
    onSuccess: () => { toast.success('Member unmuted'); refetchMembers(); },
    onError: () => toast.error('Failed to unmute member'),
  });

  const promoteModMutation = useMutation({
    mutationFn: (memberId) => base44.entities.GroupMember.update(memberId, { role: 'moderator' }),
    onSuccess: () => { toast.success('Promoted to moderator'); refetchMembers(); },
    onError: () => toast.error('Failed to promote'),
  });

  // ── Thread Actions ─────────────────────────────────────────────────────────
  const deleteThreadMutation = useMutation({
    mutationFn: (threadId) => base44.entities.GroupThread.update(threadId, { status: 'archived' }),
    onSuccess: () => { toast.success('Thread archived'); refetchThreads(); },
    onError: () => toast.error('Failed to archive thread'),
  });

  const pinThreadMutation = useMutation({
    mutationFn: ({ id, pin }) => base44.entities.GroupThread.update(id, { is_pinned: pin }),
    onSuccess: (_, v) => { toast.success(v.pin ? 'Thread pinned' : 'Thread unpinned'); refetchThreads(); },
    onError: () => toast.error('Failed to update thread'),
  });

  // ── Prayer Actions ─────────────────────────────────────────────────────────
  const deletePrayerMutation = useMutation({
    mutationFn: (prayerId) => base44.entities.PrayerRequest.update(prayerId, { status: 'archived' }),
    onSuccess: () => { toast.success('Prayer request archived'); refetchPrayers(); },
    onError: () => toast.error('Failed to archive prayer request'),
  });

  // ── Group Settings ─────────────────────────────────────────────────────────
  const saveSettingsMutation = useMutation({
    mutationFn: () => base44.entities.Group.update(groupId, settingsForm),
    onSuccess: () => {
      toast.success('Settings saved!');
      setEditingSettings(false);
      queryClient.invalidateQueries(['group', groupId]);
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const activeMembers = members.filter(m => m.role !== 'banned');
  const bannedMembers = members.filter(m => m.role === 'banned');
  const activeThreads = threads.filter(t => t.status !== 'archived');
  const activePrayers = prayers.filter(p => p.status !== 'archived');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-amber-600" />
        <h2 className="text-lg font-bold text-gray-900">Group Moderation</h2>
        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Admin</Badge>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" className="text-xs gap-1">
            <Users className="w-3 h-3" /> Members ({activeMembers.length})
          </TabsTrigger>
          <TabsTrigger value="threads" className="text-xs gap-1">
            <MessageSquare className="w-3 h-3" /> Threads ({activeThreads.length})
          </TabsTrigger>
          <TabsTrigger value="prayers" className="text-xs gap-1">
            🙏 Prayers ({activePrayers.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs gap-1">
            <Settings className="w-3 h-3" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-3 mt-4">
          {bannedMembers.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-2">
              <p className="text-xs font-semibold text-red-700 mb-2">Banned Members ({bannedMembers.length})</p>
              <div className="space-y-2">
                {bannedMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{m.user_name}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => base44.entities.GroupMember.update(m.id, { role: 'member' }).then(() => { toast.success('Member unbanned'); refetchMembers(); })}>
                      Unban
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {activeMembers.map(m => {
              const isMe = m.user_id === user?.id;
              const isOwner = m.role === 'admin';
              return (
                <Card key={m.id} className="shadow-none border-gray-100">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {m.user_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.user_name} {isMe && <span className="text-gray-400">(you)</span>}</p>
                          <Badge variant="outline" className="text-xs capitalize">{m.role || 'member'}</Badge>
                        </div>
                      </div>
                      {!isMe && !isOwner && (
                        <div className="flex gap-1.5 flex-wrap">
                          {m.is_muted ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => unmuteMutation.mutate(m.id)}>
                              <VolumeX className="w-3 h-3" /> Unmute
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => muteMutation.mutate(m.id)}>
                              <VolumeX className="w-3 h-3" /> Mute
                            </Button>
                          )}
                          {m.role !== 'moderator' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => promoteModMutation.mutate(m.id)}>
                              <Shield className="w-3 h-3" /> Mod
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => { if (confirm(`Remove ${m.user_name}?`)) kickMutation.mutate(m.id); }}>
                            <UserX className="w-3 h-3" /> Kick
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => { if (confirm(`Ban ${m.user_name}? They will not be able to rejoin.`)) banMutation.mutate(m.id); }}>
                            <AlertTriangle className="w-3 h-3" /> Ban
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Threads Tab */}
        <TabsContent value="threads" className="space-y-3 mt-4">
          {activeThreads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No active threads</p>
          ) : (
            activeThreads.map(thread => (
              <Card key={thread.id} className="shadow-none border-gray-100">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{thread.title}</p>
                      <p className="text-xs text-gray-500">By {thread.creator_name} · {thread.reply_count || 0} replies</p>
                      {thread.is_pinned && <Badge className="mt-1 text-xs bg-amber-100 text-amber-700 border-0">📌 Pinned</Badge>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => pinThreadMutation.mutate({ id: thread.id, pin: !thread.is_pinned })}>
                        {thread.is_pinned ? 'Unpin' : '📌 Pin'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { if (confirm('Archive this thread?')) deleteThreadMutation.mutate(thread.id); }}>
                        <Trash2 className="w-3 h-3" /> Archive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Prayer Requests Tab */}
        <TabsContent value="prayers" className="space-y-3 mt-4">
          {activePrayers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No prayer requests</p>
          ) : (
            activePrayers.map(p => (
              <Card key={p.id} className="shadow-none border-gray-100">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-500">By {p.user_name} · {p.prayer_count || 0} praying</p>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">{p.status}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                      onClick={() => { if (confirm('Archive this prayer request?')) deletePrayerMutation.mutate(p.id); }}>
                      <Trash2 className="w-3 h-3" /> Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Group Settings</CardTitle>
                {editingSettings ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1 h-8" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
                      <Save className="w-3 h-3" /> {saveSettingsMutation.isPending ? 'Saving…' : 'Save'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingSettings(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => setEditingSettings(true)}>
                    <Edit2 className="w-3 h-3" /> Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Group Name</label>
                <Input
                  value={settingsForm.name}
                  onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
                  disabled={!editingSettings}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={settingsForm.description}
                  onChange={e => setSettingsForm(p => ({ ...p, description: e.target.value }))}
                  disabled={!editingSettings}
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Visibility</label>
                <div className="flex gap-3 mt-2">
                  {[{ value: 'public', label: 'Public', icon: Globe }, { value: 'private', label: 'Private', icon: Lock }].map(opt => (
                    <button
                      key={opt.value}
                      disabled={!editingSettings}
                      onClick={() => setSettingsForm(p => ({ ...p, privacy: opt.value }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        settingsForm.privacy === opt.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600'
                      } ${!editingSettings ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-300 cursor-pointer'}`}
                    >
                      <opt.icon className="w-4 h-4" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Community Rules</label>
                <Textarea
                  value={settingsForm.rules}
                  onChange={e => setSettingsForm(p => ({ ...p, rules: e.target.value }))}
                  disabled={!editingSettings}
                  rows={4}
                  placeholder="Enter group rules, one per line..."
                  className="mt-1 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}