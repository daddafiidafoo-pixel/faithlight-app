import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../components/PullToRefresh';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Users, Trophy, BookOpen, MessageSquare, Heart, Zap, Flame, TrendingUp, ChevronRight, Star, Send, X, BarChart2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const FEED_TYPES = {
  badge_earned:        { icon: '🏆', border: 'border-amber-200',  bg: 'bg-amber-50',  label: 'earned a badge' },
  level_up:            { icon: '⬆️', border: 'border-purple-200', bg: 'bg-purple-50', label: 'leveled up' },
  verse_shared:        { icon: '📖', border: 'border-blue-200',   bg: 'bg-blue-50',   label: 'shared a verse' },
  group_joined:        { icon: '👥', border: 'border-green-200',  bg: 'bg-green-50',  label: 'joined a group' },
  study_completed:     { icon: '✅', border: 'border-emerald-200',bg: 'bg-emerald-50',label: 'completed a study' },
  challenge_completed: { icon: '⚡', border: 'border-orange-200', bg: 'bg-orange-50', label: 'completed a challenge' },
  insight_shared:      { icon: '💡', border: 'border-indigo-200', bg: 'bg-indigo-50', label: 'shared an insight' },
  streak_milestone:    { icon: '🔥', border: 'border-red-200',    bg: 'bg-red-50',    label: 'hit a streak milestone' },
  prayer_answered:     { icon: '🙏', border: 'border-teal-200',   bg: 'bg-teal-50',   label: 'had a prayer answered' },
};

const REACTIONS = ['🙏', '❤️', '🔥', '✨', '👏', '💪'];

// ── Feed Card ────────────────────────────────────────────────────────────────
function FeedCard({ event, user, onReact }) {
  const cfg = FEED_TYPES[event.event_type] || { icon: '📌', border: 'border-gray-200', bg: 'bg-white', label: 'shared something' };
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['feed-comments', event.id],
    queryFn: () => base44.entities.GroupDiscussion.filter({ group_id: event.id, post_type: 'feed_comment' }, 'created_date', 20).catch(() => []),
    enabled: showComments,
  });

  const addComment = useMutation({
    mutationFn: () => base44.entities.GroupDiscussion.create({
      group_id: event.id,
      post_type: 'feed_comment',
      author_id: user.id,
      author_name: user.full_name,
      content: commentText.trim(),
    }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries(['feed-comments', event.id]);
    },
  });

  const userReactions = event.reactions || {};
  const totalReactions = Object.values(userReactions).reduce((s, arr) => s + (arr?.length || 0), 0);

  return (
    <Card className={`border ${cfg.border} overflow-hidden hover:shadow-sm transition-shadow`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
            {(event.user_name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-900 leading-snug">
                <span className="font-semibold">{event.user_name || 'Someone'}</span>
                <span className="text-gray-500"> {cfg.label}</span>
                {event.subject && <span className="font-medium text-indigo-700"> — {event.subject}</span>}
              </p>
              <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            </div>

            {/* Body */}
            {event.description && <p className="text-sm text-gray-700 mt-1 leading-relaxed">{event.description}</p>}
            {event.verse_text && (
              <div className={`mt-2 ${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
                <p className="text-sm italic text-gray-800">"{event.verse_text}"</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1">— {event.verse_reference}</p>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] text-gray-400">{event.created_date ? formatDistanceToNow(new Date(event.created_date), { addSuffix: true }) : ''}</span>
              {event.group_name && <Badge variant="outline" className="text-[10px] h-4 px-1.5">{event.group_name}</Badge>}
            </div>

            {/* Reaction summary */}
            {totalReactions > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(userReactions).filter(([, arr]) => arr?.length > 0).map(([emoji, arr]) => (
                  <button key={emoji} onClick={() => onReact(event, emoji)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${arr?.includes(user?.id) ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 hover:border-indigo-200'}`}>
                    {emoji} {arr.length}
                  </button>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
              {/* React */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-gray-500 hover:text-indigo-600 px-2"
                  onClick={() => setShowReactions(p => !p)}>
                  <span>😊</span> React
                </Button>
                {showReactions && (
                  <div className="absolute bottom-8 left-0 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-1">
                    {REACTIONS.map(em => (
                      <button key={em} className="text-lg hover:scale-125 transition-transform p-1"
                        onClick={() => { onReact(event, em); setShowReactions(false); }}>
                        {em}
                      </button>
                    ))}
                    <button onClick={() => setShowReactions(false)} className="ml-1 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              {/* Comment toggle */}
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-gray-500 hover:text-indigo-600 px-2"
                onClick={() => setShowComments(p => !p)}>
                <MessageSquare className="w-3.5 h-3.5" />
                {event.comment_count > 0 ? event.comment_count : ''} Comment
              </Button>
            </div>

            {/* Comments section */}
            {showComments && (
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold flex-shrink-0">
                      {(c.author_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-semibold text-gray-800">{c.author_name} </span>
                      <span className="text-xs text-gray-700">{c.content}</span>
                    </div>
                  </div>
                ))}
                {user && (
                  <div className="flex gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-[10px] font-bold flex-shrink-0">
                      {(user.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        className="flex-1 border rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) addComment.mutate(); }}
                      />
                      <Button size="sm" className="h-7 w-7 p-0 rounded-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={!commentText.trim() || addComment.isPending}
                        onClick={() => addComment.mutate()}>
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Leaderboard Sidebar ──────────────────────────────────────────────────────
function LeaderboardSidebar({ user }) {
  const [tab, setTab] = useState('points');

  const { data: topPoints = [] } = useQuery({
    queryKey: ['lb-points'],
    queryFn: () => base44.entities.UserPoints.filter({}, '-total_points', 10).catch(() => []),
  });
  const { data: topStreaks = [] } = useQuery({
    queryKey: ['lb-streaks'],
    queryFn: () => base44.entities.UserStreak.filter({}, '-current_streak', 10).catch(() => []),
  });
  const { data: topBadges = [] } = useQuery({
    queryKey: ['lb-badges'],
    queryFn: () => base44.entities.UserBadge.filter({}, '-created_date', 100).catch(() => []),
  });

  // Aggregate badge counts
  const badgeCounts = topBadges.reduce((acc, b) => {
    acc[b.user_id] = acc[b.user_id] || { user_id: b.user_id, user_name: b.user_name, count: 0 };
    acc[b.user_id].count++;
    return acc;
  }, {});
  const topBadgeUsers = Object.values(badgeCounts).sort((a, b) => b.count - a.count).slice(0, 10);

  const RANK = ['🥇', '🥈', '🥉'];
  const rows = tab === 'points' ? topPoints : tab === 'streaks' ? topStreaks : topBadgeUsers;

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-4 pb-4">
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
        </h3>
        <div className="flex gap-1 mb-3 border-b pb-2">
          {[['points', '⭐ Points'], ['streaks', '🔥 Streaks'], ['badges', '🏅 Badges']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`text-[11px] px-2 py-1 rounded-md font-medium transition-colors ${tab === key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {rows.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No data yet</p>}
          {rows.map((row, i) => {
            const name = row.user_name || 'User';
            const value = tab === 'points' ? `${(row.total_points || 0).toLocaleString()} pts`
              : tab === 'streaks' ? `${row.current_streak || 0}d`
              : `${row.count} 🏅`;
            const isMe = row.user_id === user?.id;
            return (
              <div key={row.id || row.user_id} className={`flex items-center gap-2 p-1.5 rounded-lg ${isMe ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
                <span className="w-5 text-center text-sm">{RANK[i] || <span className="text-xs text-gray-400">#{i + 1}</span>}</span>
                <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-[10px] font-bold flex-shrink-0">
                  {name[0].toUpperCase()}
                </div>
                <span className="flex-1 text-xs font-medium text-gray-900 truncate">{name}{isMe && ' (you)'}</span>
                <span className="text-xs font-bold text-indigo-600">{value}</span>
              </div>
            );
          })}
        </div>
        <Link to={createPageUrl('GamificationLeaderboard')}>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-indigo-600 gap-1">
            Full Leaderboard <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ── Challenges Sidebar ───────────────────────────────────────────────────────
function ChallengesSidebar() {
  const { data: challenges = [] } = useQuery({
    queryKey: ['team-challenges-active'],
    queryFn: () => base44.entities.TeamChallenge.filter({ status: 'active' }, '-created_date', 5).catch(() => []),
  });

  if (challenges.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-4 pb-4">
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-500" /> Active Challenges
        </h3>
        <div className="space-y-2">
          {challenges.map(c => {
            const pct = Math.min(100, Math.round(((c.current_progress || 0) / (c.goal || 1)) * 100));
            return (
              <div key={c.id} className="bg-white rounded-lg border border-orange-200 p-2.5">
                <p className="text-xs font-semibold text-gray-900">{c.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-orange-600 font-semibold">{pct}%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{c.participant_count || 0} participants</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SocialFeed() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [newVerse, setNewVerse] = useState('');
  const [newVerseRef, setNewVerseRef] = useState('');
  const [postType, setPostType] = useState('insight_shared');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['social-feed', filter],
    queryFn: () => {
      const query = filter === 'all' ? {} : { event_type: filter };
      return base44.entities.GamificationEvent.filter(query, '-created_date', 50).catch(() => []);
    },
    refetchInterval: 30000,
  });

  // Real-time updates
  useEffect(() => {
    const unsub = base44.entities.GamificationEvent.subscribe(() => {
      queryClient.invalidateQueries(['social-feed']);
    });
    return unsub;
  }, [queryClient]);

  const sharePost = useMutation({
    mutationFn: () => base44.entities.GamificationEvent.create({
      user_id: user.id,
      user_name: user.full_name,
      event_type: postType,
      subject: postType === 'verse_shared' ? newVerseRef : null,
      description: newPost.trim(),
      verse_text: postType === 'verse_shared' ? newVerse : null,
      verse_reference: postType === 'verse_shared' ? newVerseRef : null,
      reactions: {},
      comment_count: 0,
    }),
    onSuccess: () => {
      toast.success('Shared! 🎉');
      setNewPost(''); setNewVerse(''); setNewVerseRef('');
      queryClient.invalidateQueries(['social-feed']);
    },
  });

  const reactMutation = useMutation({
    mutationFn: async ({ event, emoji }) => {
      if (!user) return;
      const reactions = { ...(event.reactions || {}) };
      if (!reactions[emoji]) reactions[emoji] = [];
      const idx = reactions[emoji].indexOf(user.id);
      if (idx >= 0) reactions[emoji].splice(idx, 1);
      else reactions[emoji].push(user.id);
      return base44.entities.GamificationEvent.update(event.id, { reactions });
    },
    onMutate: async ({ event, emoji }) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['social-feed', filter] });
      const previous = queryClient.getQueryData(['social-feed', filter]);
      queryClient.setQueryData(['social-feed', filter], (old = []) =>
        old.map(e => {
          if (e.id !== event.id) return e;
          const reactions = { ...(e.reactions || {}) };
          if (!reactions[emoji]) reactions[emoji] = [];
          const idx = reactions[emoji].indexOf(user.id);
          if (idx >= 0) reactions[emoji] = reactions[emoji].filter(id => id !== user.id);
          else reactions[emoji] = [...reactions[emoji], user.id];
          return { ...e, reactions };
        })
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['social-feed', filter], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['social-feed', filter] }),
  });

  const FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'insight_shared', label: '💡 Insights' },
    { value: 'verse_shared', label: '📖 Verses' },
    { value: 'badge_earned', label: '🏆 Badges' },
    { value: 'challenge_completed', label: '⚡ Challenges' },
    { value: 'streak_milestone', label: '🔥 Streaks' },
  ];

  const handleRefresh = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['social-feed'] });
  }, [queryClient]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-indigo-600" /> Community Feed
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Achievements, insights, and group activities</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('Groups')}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Groups</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Compose box */}
            {user && (
              <Card className="border-indigo-200 bg-white">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {[['insight_shared', '💡', 'Insight'], ['verse_shared', '📖', 'Verse'], ['prayer_answered', '🙏', 'Prayer']].map(([type, icon, label]) => (
                      <button key={type} onClick={() => setPostType(type)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${postType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {(user.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <textarea
                        className="w-full border rounded-xl px-3 py-2 text-sm min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
                        placeholder={postType === 'verse_shared' ? 'What did this verse mean to you?' : postType === 'prayer_answered' ? 'Share how God answered your prayer...' : 'Share a Biblical insight or reflection...'}
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                      />
                      {postType === 'verse_shared' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Verse text" value={newVerse} onChange={e => setNewVerse(e.target.value)} />
                          <input className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="e.g. John 3:16" value={newVerseRef} onChange={e => setNewVerseRef(e.target.value)} />
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 px-4"
                          onClick={() => sharePost.mutate()}
                          disabled={!newPost.trim() || sharePost.isPending}>
                          <Send className="w-3.5 h-3.5" /> Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter bar */}
            <div className="flex gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setFilter(value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filter === value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-400'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Feed */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-400 animate-pulse">Loading feed...</div>
            ) : events.length === 0 ? (
              <Card className="border-dashed border-gray-300 bg-white">
                <CardContent className="py-16 text-center">
                  <Zap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nothing here yet</p>
                  <p className="text-gray-400 text-sm mt-1">Earn badges, complete challenges, and share insights!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <FeedCard key={event.id} event={event} user={user}
                    onReact={(e, emoji) => user && reactMutation.mutate({ event: e, emoji })} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <LeaderboardSidebar user={user} />
            <ChallengesSidebar />
            <Card className="border-gray-200">
              <CardContent className="pt-4 pb-4 space-y-1">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Quick Links</h3>
                {[
                  { label: 'Bible Tutor', icon: BookOpen, page: 'BibleTutor' },
                  { label: 'Study Groups', icon: Users, page: 'Groups' },
                  { label: 'Full Leaderboard', icon: BarChart2, page: 'GamificationLeaderboard' },
                  { label: 'Forum', icon: MessageSquare, page: 'Forum' },
                ].map(({ label, icon: Icon, page }) => (
                  <Link key={page} to={createPageUrl(page)}>
                    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <Icon className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-700">{label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
}