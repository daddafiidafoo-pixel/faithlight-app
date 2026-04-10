import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, BookOpen, TrendingUp, MessageCircle, Heart,
  Share2, Globe, Lock, Loader2, Plus, BarChart2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// ── Public Notes Feed ──────────────────────────────────────────────────────
function PublicNotesFeed({ currentUser, book, chapter }) {
  const qc = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['publicNotes', book, chapter],
    queryFn: () => base44.entities.VerseNote.filter(
      { book, chapter: parseInt(chapter), is_public: true },
      '-created_date', 20
    ),
    enabled: !!book && !!chapter
  });

  const likeMutation = useMutation({
    mutationFn: async (noteId) => {
      // Simple like tracking via NoteLike entity
      const existing = await base44.entities.NoteLike.filter({ note_id: noteId, user_id: currentUser?.id }).catch(() => []);
      if (existing.length > 0) {
        await base44.entities.NoteLike.delete(existing[0].id);
      } else {
        await base44.entities.NoteLike.create({ note_id: noteId, user_id: currentUser?.id });
      }
    },
    onSuccess: () => qc.invalidateQueries(['publicNotes', book, chapter])
  });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>;

  if (!notes.length) return (
    <div className="text-center py-8 text-gray-400">
      <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">No public notes for this chapter yet.</p>
      <p className="text-xs mt-1">Be the first to share your insights!</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {notes.map(note => (
        <div key={note.id} className="border border-gray-100 rounded-xl p-3 bg-white hover:border-indigo-200 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {(note.created_by || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">{note.created_by?.split('@')[0] || 'Anonymous'}</p>
                <p className="text-xs text-gray-400">
                  {book} {chapter}:{note.verse} · {new Date(note.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">v{note.verse}</Badge>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{note.note_text}"</p>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50">
            <button
              onClick={() => currentUser && likeMutation.mutate(note.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Like</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Discussion Groups Browser ──────────────────────────────────────────────
function DiscussionGroupsBrowser({ currentUser }) {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', topic: '', book: '' });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['bibleDiscussionGroups'],
    queryFn: () => base44.entities.DiscussionGroup.list('-created_date', 20).catch(() => [])
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['myDiscussionGroups', currentUser?.id],
    queryFn: () => base44.entities.DiscussionGroupMember.filter({ user_id: currentUser?.id }).catch(() => []),
    enabled: !!currentUser?.id
  });

  const myGroupIds = myMemberships.map(m => m.group_id);

  const joinMutation = useMutation({
    mutationFn: async (group) => {
      await base44.entities.DiscussionGroupMember.create({
        group_id: group.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name || currentUser.email?.split('@')[0],
        joined_at: new Date().toISOString()
      });
    },
    onSuccess: () => { qc.invalidateQueries(['myDiscussionGroups']); toast.success('Joined group!'); }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.DiscussionGroup.create({
        title: newGroup.name,
        description: `Discussion group focused on ${newGroup.topic || newGroup.book}`,
        topic: newGroup.topic || newGroup.book,
        is_public: true,
        creator_id: currentUser.id,
        member_count: 1
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['bibleDiscussionGroups']);
      setCreating(false);
      setNewGroup({ name: '', topic: '', book: '' });
      toast.success('Discussion group created!');
    }
  });

  const BOOK_GROUPS = ['Genesis', 'Psalms', 'Proverbs', 'Matthew', 'John', 'Romans', 'Revelation'];
  const TOPIC_GROUPS = ['Prophecy', 'Grace & Faith', 'Prayer', 'Discipleship', 'The Holy Spirit', 'End Times'];

  return (
    <div className="space-y-4">
      {/* Quick join by category */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Join by Book</p>
        <div className="flex flex-wrap gap-1.5">
          {BOOK_GROUPS.map(b => (
            <Badge key={b} variant="outline" className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs">
              📖 {b}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Join by Topic</p>
        <div className="flex flex-wrap gap-1.5">
          {TOPIC_GROUPS.map(t => (
            <Badge key={t} variant="outline" className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 text-xs">
              🔍 {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Groups list */}
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">No groups yet. Create the first one!</div>
      ) : (
        <div className="space-y-2">
          {groups.slice(0, 8).map(g => (
            <div key={g.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base flex-shrink-0">
                  {g.topic?.includes('Book') || BOOK_GROUPS.includes(g.topic) ? '📖' : '💬'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{g.title}</p>
                  <p className="text-xs text-gray-400 truncate">{g.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-400">{g.member_count || 0} members</span>
                {myGroupIds.includes(g.id) ? (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">Joined</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => currentUser && joinMutation.mutate(g)}
                    disabled={!currentUser}
                  >
                    Join
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Link to={createPageUrl('DiscussionGroups')}>
            <Button variant="ghost" className="w-full text-xs text-indigo-600 hover:text-indigo-700">
              View All Groups →
            </Button>
          </Link>
        </div>
      )}

      {/* Create new group */}
      {currentUser && (
        <div>
          {!creating ? (
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" /> Create New Discussion Group
            </Button>
          ) : (
            <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50 space-y-2">
              <p className="text-xs font-bold text-indigo-700">New Discussion Group</p>
              <Input value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="Group name..." className="text-sm bg-white" />
              <Input value={newGroup.topic} onChange={e => setNewGroup(p => ({ ...p, topic: e.target.value }))} placeholder="Topic or Bible book focus..." className="text-sm bg-white" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => createMutation.mutate()} disabled={!newGroup.name || createMutation.isPending} className="flex-1 gap-1">
                  {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Community Reading Stats ────────────────────────────────────────────────
function CommunityReadingStats() {
  const { data: recentActivity = [], isLoading } = useQuery({
    queryKey: ['communityReadingStats'],
    queryFn: async () => {
      const [highlights, notes, savedVerses] = await Promise.all([
        base44.entities.VerseHighlight.list('-created_date', 100).catch(() => []),
        base44.entities.VerseNote.filter({ is_public: true }, '-created_date', 50).catch(() => []),
        base44.entities.SavedVerse.list('-created_date', 100).catch(() => [])
      ]);
      return { highlights, notes, savedVerses };
    },
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>;

  const { highlights = [], notes = [], savedVerses = [] } = recentActivity;

  // Most highlighted books
  const bookCounts = {};
  highlights.forEach(h => { bookCounts[h.book] = (bookCounts[h.book] || 0) + 1; });
  const topBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Most saved verses
  const verseCounts = {};
  savedVerses.forEach(v => {
    const key = `${v.book} ${v.chapter}:${v.verse}`;
    verseCounts[key] = (verseCounts[key] || 0) + 1;
  });
  const topVerses = Object.entries(verseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Global stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Highlights', value: highlights.length, icon: '✍️', color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Public Notes', value: notes.length, icon: '📝', color: 'bg-blue-50 border-blue-200' },
          { label: 'Saved Verses', value: savedVerses.length, icon: '🔖', color: 'bg-green-50 border-green-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <div className="text-xl">{s.icon}</div>
            <div className="text-lg font-bold text-gray-800 mt-1">{s.value.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Most read books */}
      {topBooks.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Most Active Books
          </p>
          <div className="space-y-2">
            {topBooks.map(([book, count], i) => (
              <div key={book} className="flex items-center gap-2">
                <span className="text-xs w-4 text-gray-400 font-bold">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium text-gray-700">{book}</span>
                    <span className="text-gray-400">{count} highlights</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${Math.min(100, (count / (topBooks[0]?.[1] || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most saved verses */}
      {topVerses.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Most Saved Verses
          </p>
          <div className="space-y-1.5">
            {topVerses.map(([verse, count]) => (
              <div key={verse} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
                <span className="text-sm font-semibold text-indigo-700">{verse}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CommunityBibleHub({ currentUser, book, chapter }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 text-sm">Community Hub</h3>
          <p className="text-xs text-blue-500">Notes · Discussion Groups · Reading Stats</p>
        </div>
      </div>
      <div className="p-4">
        <Tabs defaultValue="notes">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="notes" className="flex-1 text-xs gap-1"><BookOpen className="w-3 h-3" />Notes</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1 text-xs gap-1"><Users className="w-3 h-3" />Groups</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 text-xs gap-1"><BarChart2 className="w-3 h-3" />Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <PublicNotesFeed currentUser={currentUser} book={book} chapter={chapter} />
          </TabsContent>
          <TabsContent value="groups">
            <DiscussionGroupsBrowser currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="stats">
            <CommunityReadingStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}