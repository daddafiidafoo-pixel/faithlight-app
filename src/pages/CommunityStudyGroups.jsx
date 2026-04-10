import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Lock, Globe, BookOpen, Target, MessageCircle, BarChart2, CheckCircle2, Loader2, ChevronRight, Send, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityStudyGroups() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // --- Data Queries ---
  const { data: allGroups = [], isLoading: loadingAll } = useQuery({
    queryKey: ['csg-all'],
    queryFn: () => base44.entities.StudyGroup.filter({ is_public: true }, '-created_date', 50),
  });

  const { data: myGroups = [] } = useQuery({
    queryKey: ['csg-mine', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user,
  });

  const myGroupIds = new Set(myGroups.map(m => m.group_id));

  const filtered = allGroups.filter(g =>
    !searchQuery || g.group_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.study_focus?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Mutations ---
  const joinMutation = useMutation({
    mutationFn: async (group) => {
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name,
        role: 'member',
        member_progress_percentage: 0,
      });
      await base44.entities.StudyGroup.update(group.id, {
        member_count: (group.member_count || 1) + 1,
      });
    },
    onSuccess: (_, group) => {
      toast.success(`Joined "${group.group_name}"!`);
      queryClient.invalidateQueries(['csg-all']);
      queryClient.invalidateQueries(['csg-mine', user?.id]);
    },
    onError: () => toast.error('Failed to join group'),
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Users className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Study Groups</h2>
        <p className="text-gray-500 mb-6">Sign in to discover and join study groups.</p>
        <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Study Groups</h1>
          <p className="text-gray-500 mt-1">Study together, grow together</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" /> Create Group
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4 mt-4">
          <Input
            placeholder="Search groups by name or topic..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          {loadingAll ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={myGroupIds.has(group.id)}
                  onJoin={() => joinMutation.mutate(group)}
                  onOpen={() => setSelectedGroup(group)}
                  joining={joinMutation.isPending}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  No groups found. Be the first to create one!
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="mt-4">
          {myGroups.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              You haven't joined any groups yet.
              <br />
              <Button variant="link" onClick={() => setActiveTab('discover')}>Discover groups →</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map(membership => {
                const group = allGroups.find(g => g.id === membership.group_id);
                if (!group) return null;
                return (
                  <GroupCard
                    key={membership.id}
                    group={group}
                    isMember={true}
                    onOpen={() => setSelectedGroup(group)}
                    membership={membership}
                    user={user}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        user={user}
        onCreated={() => {
          queryClient.invalidateQueries(['csg-all']);
          queryClient.invalidateQueries(['csg-mine', user?.id]);
        }}
      />

      {/* Group Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          user={user}
          isMember={myGroupIds.has(selectedGroup.id)}
          onClose={() => setSelectedGroup(null)}
          onJoin={() => joinMutation.mutate(selectedGroup)}
          onDataChange={() => queryClient.invalidateQueries(['csg-all'])}
        />
      )}
    </div>
  );
}

// ---- Sub-components ----

function GroupCard({ group, isMember, onJoin, onOpen, joining, membership, user }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={onOpen}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{group.group_name}</CardTitle>
          {group.is_public ? (
            <Globe className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          )}
        </div>
        <Badge variant="outline" className="w-fit text-xs">{group.study_focus}</Badge>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {group.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count || 0} members</span>
          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {group.group_progress_percentage || 0}%</span>
        </div>
        {membership && (
          <div className="text-xs text-indigo-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Member
            {membership.role === 'leader' && ' · Leader'}
          </div>
        )}
        <div className="pt-1">
          {isMember ? (
            <Button size="sm" variant="outline" className="w-full gap-1" onClick={e => { e.stopPropagation(); onOpen?.(); }}>
              <ChevronRight className="w-3 h-3" /> Open Group
            </Button>
          ) : (
            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1"
              disabled={joining}
              onClick={e => { e.stopPropagation(); onJoin?.(); }}>
              {joining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GroupDetailModal({ group, user, isMember, onClose, onJoin, onDataChange }) {
  const [activeTab, setActiveTab] = useState('discussion');
  const [newPost, setNewPost] = useState('');
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [], refetch: refetchPosts } = useQuery({
    queryKey: ['group-posts', group.id],
    queryFn: () => base44.entities.GroupPost.filter({ group_id: group.id }, '-created_date', 30),
    enabled: isMember,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', group.id],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: group.id }, '-created_date', 100),
  });

  const { data: sharedNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ['group-shared-notes', group.id],
    queryFn: () => base44.entities.SharedGroupNote.filter({ group_id: group.id }, '-created_date', 30),
    enabled: isMember,
  });

  const postMessage = async () => {
    if (!newPost.trim()) return;
    await base44.entities.GroupPost.create({
      group_id: group.id,
      user_id: user.id,
      user_name: user.full_name,
      content: newPost.trim(),
    });
    setNewPost('');
    refetchPosts();
  };

  const shareNote = async () => {
    if (!newNote.trim()) return;
    await base44.entities.SharedGroupNote.create({
      group_id: group.id,
      user_id: user.id,
      user_name: user.full_name,
      content: newNote.trim(),
    });
    setNewNote('');
    refetchNotes();
    toast.success('Note shared with group!');
  };

  const isLeader = members.find(m => m.user_id === user.id && m.role === 'leader');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {group.is_public ? <Globe className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
            {group.group_name}
          </DialogTitle>
        </DialogHeader>

        {!isMember ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{group.description}</p>
            <Button onClick={onJoin} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" /> Join to Participate
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="discussion" className="text-xs">Discussion</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">Shared Notes</TabsTrigger>
              <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
              {isLeader && <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>}
            </TabsList>

            {/* Discussion */}
            <TabsContent value="discussion" className="space-y-3 mt-3">
              <div className="flex gap-2">
                <Textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share a thought, question, or encouragement..."
                  className="min-h-16 text-sm"
                />
                <Button onClick={postMessage} size="sm" className="bg-indigo-600 hover:bg-indigo-700 self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {posts.map(post => (
                  <div key={post.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-800">{post.user_name}</span>
                      <span className="text-xs text-gray-400">{new Date(post.created_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{post.content}</p>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No posts yet. Start the conversation!</p>}
              </div>
            </TabsContent>

            {/* Shared Notes */}
            <TabsContent value="notes" className="space-y-3 mt-3">
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Share a study note, insight, or key takeaway..."
                  className="min-h-16 text-sm"
                />
                <Button onClick={shareNote} size="sm" className="bg-indigo-600 hover:bg-indigo-700 self-end">
                  <StickyNote className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {sharedNotes.map(note => (
                  <div key={note.id} className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-indigo-800">{note.user_name}</span>
                      <span className="text-xs text-gray-400">{new Date(note.created_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
                {sharedNotes.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No notes shared yet.</p>}
              </div>
            </TabsContent>

            {/* Members */}
            <TabsContent value="members" className="mt-3">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.user_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{m.role || 'member'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">{m.member_progress_percentage || 0}% complete</div>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.member_progress_percentage || 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Leader Progress View */}
            {isLeader && (
              <TabsContent value="progress" className="mt-3 space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Group Progress Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-700">{members.length}</div>
                    <div className="text-xs text-gray-500">Total Members</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {members.length > 0 ? Math.round(members.reduce((acc, m) => acc + (m.member_progress_percentage || 0), 0) / members.length) : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Avg Progress</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...members].sort((a, b) => (b.member_progress_percentage || 0) - (a.member_progress_percentage || 0)).map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-32 truncate">{m.user_name}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${m.member_progress_percentage || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{m.member_progress_percentage || 0}%</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateGroupModal({ open, onClose, user, onCreated }) {
  const [form, setForm] = useState({ group_name: '', description: '', study_focus: 'General', is_public: true });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.group_name.trim()) { toast.error('Group name is required'); return; }
    setSaving(true);
    try {
      const group = await base44.entities.StudyGroup.create({
        ...form,
        group_name: form.group_name.trim(),
        description: form.description.trim(),
        member_count: 1,
        group_progress_percentage: 0,
        creator_id: user.id,
      });
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name,
        role: 'leader',
        member_progress_percentage: 0,
      });
      toast.success('Group created!');
      onCreated?.();
      onClose();
      setForm({ group_name: '', description: '', study_focus: 'General', is_public: true });
    } catch (e) {
      toast.error('Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Group Name *</label>
            <Input value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} placeholder="e.g. Romans Deep Dive" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will this group study?" className="min-h-20 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Study Focus</label>
            <Select value={form.study_focus} onValueChange={v => setForm(f => ({ ...f, study_focus: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['General', 'Gospels', 'Epistles', 'Old Testament', 'Prophecy', 'Prayer', 'Theology', 'Christian Living', 'Evangelism', 'Worship'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Visibility</label>
            <Select value={form.is_public ? 'public' : 'private'} onValueChange={v => setForm(f => ({ ...f, is_public: v === 'public' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌐 Public — anyone can join</SelectItem>
                <SelectItem value="private">🔒 Private — invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}