import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Lock, Globe, MessageCircle, Search, Send, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

const BIBLE_TOPICS = [
  'Prayer', 'Faith', 'Grace', 'Salvation', 'Holy Spirit', 'Worship', 'Discipleship',
  'Marriage & Family', 'Forgiveness', 'Prophecy', 'End Times', 'Parables',
  'Psalms', 'Proverbs', 'Genesis', 'Isaiah', 'Romans', 'Revelation',
  'Sermon on the Mount', 'Fruits of the Spirit', 'Armor of God'
];

// ── Group Wall / Feed ─────────────────────────────────────────────────────────
function GroupFeed({ group, user }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['group-feed', group.id],
    queryFn: () => base44.entities.GroupPost.filter({ group_id: group.id }, '-created_date', 30),
    refetchInterval: 15000
  });

  const post = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setPosting(true);
    try {
      await base44.entities.GroupPost.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name || 'Anonymous',
        content: text.trim(),
        is_pinned: false
      });
      setText('');
      queryClient.invalidateQueries(['group-feed', group.id]);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <p className="text-sm font-bold text-gray-700 mb-3">Group Wall</p>
      {user ? (
        <form onSubmit={post} className="flex gap-2 mb-4">
          <Textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share something with the group..." rows={1} className="flex-1 resize-none text-sm" />
          <Button type="submit" size="sm" disabled={posting || !text.trim()} className="self-end">
            <Send className="w-3 h-3" />
          </Button>
        </form>
      ) : null}
      <div className="space-y-3 max-h-56 overflow-y-auto">
        {posts.map(p => (
          <div key={p.id} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
              {(p.user_name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-gray-900 text-xs">{p.user_name}</span>
                <span className="text-gray-400 text-xs">{formatDistanceToNow(new Date(p.created_date), { addSuffix: true })}</span>
              </div>
              <p className="text-gray-700">{p.content}</p>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No posts yet. Start the conversation!</p>}
      </div>
    </div>
  );
}

// ── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({ group, user, myMemberIds, pendingRequestIds, onJoin, onRequestJoin }) {
  const [showFeed, setShowFeed] = useState(false);
  const isMine = group.creator_user_id === user?.id;
  const isMember = isMine || myMemberIds.includes(group.id);
  const hasPending = pendingRequestIds.includes(group.id);
  const isPrivate = group.privacy === 'private';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 truncate">{group.name}</h3>
              {isPrivate ? <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" /> : <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />}
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {group.interests?.slice(0, 3).map(t => (
            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3" /> {group.member_count || 1}
          </span>
          <div className="flex gap-2">
            {isMember ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowFeed(!showFeed)}>
                  <MessageCircle className="w-3 h-3 mr-1" /> {showFeed ? 'Hide Feed' : 'Feed'}
                </Button>
                <Link to={createPageUrl(`GroupDetail?id=${group.id}`)}>
                  <Button size="sm" variant="outline">Open</Button>
                </Link>
              </>
            ) : hasPending ? (
              <Button size="sm" variant="outline" disabled className="gap-1 text-amber-600">
                <Clock className="w-3 h-3" /> Requested
              </Button>
            ) : isPrivate ? (
              <Button size="sm" variant="outline" onClick={() => onRequestJoin(group)} className="gap-1">
                <Lock className="w-3 h-3" /> Request to Join
              </Button>
            ) : (
              <Button size="sm" onClick={() => onJoin(group)}>
                <Plus className="w-3 h-3 mr-1" /> Join
              </Button>
            )}
          </div>
        </div>
        {showFeed && isMember && <GroupFeed group={group} user={user} />}
      </CardContent>
    </Card>
  );
}

// ── Create Group Dialog ───────────────────────────────────────────────────────
function CreateGroupDialog({ open, onClose, user, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', privacy: 'public', topic: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await base44.entities.Group.create({
        creator_user_id: user.id,
        creator_name: user.full_name,
        owner_id: user.id,
        name: form.name,
        description: form.description,
        privacy: form.privacy,
        group_type: 'topic',
        interests: form.topic ? [form.topic] : [],
        member_count: 1,
        is_active: true
      });
      onCreated();
      onClose();
      setForm({ name: '', description: '', privacy: 'public', topic: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Discussion Group</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Group Name</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Romans Deep Dive" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will your group study or discuss?" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Visibility</label>
              <Select value={form.privacy} onValueChange={v => setForm(f => ({ ...f, privacy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Bible Topic</label>
              <Select value={form.topic} onValueChange={v => setForm(f => ({ ...f, topic: v }))}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>
                  {BIBLE_TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !form.name.trim()}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DiscussionGroups() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allGroups = [] } = useQuery({
    queryKey: ['discussion-groups'],
    queryFn: () => base44.entities.Group.filter({ is_active: true }, '-member_count', 50)
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['my-memberships', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id }),
    enabled: !!user
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-join-requests', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id, status: 'pending' }),
    enabled: !!user
  });

  const myMemberIds = myMemberships.filter(m => m.status === 'active').map(m => m.group_id);
  const pendingRequestIds = pendingRequests.map(m => m.group_id);

  const joinGroup = async (group) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    await base44.entities.GroupMember.create({
      group_id: group.id,
      user_id: user.id,
      user_name: user.full_name,
      role: 'member',
      status: 'active',
      joined_at: new Date().toISOString()
    });
    await base44.entities.Group.update(group.id, { member_count: (group.member_count || 1) + 1 });
    queryClient.invalidateQueries(['my-memberships']);
    queryClient.invalidateQueries(['discussion-groups']);
  };

  const requestToJoin = async (group) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    // Create pending membership
    await base44.entities.GroupMember.create({
      group_id: group.id,
      user_id: user.id,
      user_name: user.full_name,
      role: 'member',
      status: 'pending',
      joined_at: new Date().toISOString()
    });
    // Notify the group creator
    await base44.entities.Notification.create({
      user_id: group.creator_user_id,
      type: 'group_invite',
      title: 'Join Request',
      content: `${user.full_name || 'Someone'} requested to join your private group "${group.name}"`,
      source_user_id: user.id,
      source_user_name: user.full_name,
      related_id: group.id,
      related_type: 'Group',
      is_read: false
    });
    queryClient.invalidateQueries(['pending-join-requests']);
  };

  const myGroups = allGroups.filter(g => g.creator_user_id === user?.id || myMemberIds.includes(g.id));
  const filtered = allGroups.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topicFilter === 'all' || g.interests?.includes(topicFilter);
    return matchSearch && matchTopic;
  });
  const displayGroups = activeTab === 'my-groups' ? myGroups : filtered;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-indigo-600" /> Discussion Groups
            </h1>
            <p className="text-gray-500 mt-1">Join or create groups centered on Bible books, topics, and studies</p>
          </div>
          {user && (
            <Button onClick={() => setShowCreate(true)} className="gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" /> Create Group
            </Button>
          )}
        </div>

        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border w-fit">
          {[{ id: 'all', label: 'All Groups' }, { id: 'my-groups', label: 'My Groups' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'all' && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by topic" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {BIBLE_TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {displayGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                {activeTab === 'my-groups' ? 'You haven\'t joined any groups yet.' : 'No groups found.'}
              </p>
              {user && <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> Create a Group</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayGroups.map(g => (
              <GroupCard key={g.id} group={g} user={user}
                myMemberIds={myMemberIds}
                pendingRequestIds={pendingRequestIds}
                onJoin={joinGroup}
                onRequestJoin={requestToJoin}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog open={showCreate} onClose={() => setShowCreate(false)} user={user}
        onCreated={() => {
          queryClient.invalidateQueries(['discussion-groups']);
          queryClient.invalidateQueries(['my-memberships']);
        }}
      />
    </div>
  );
}