import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '../components/PullToRefresh';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Loader2, Search, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// Debounce hook — avoids re-filtering on every keystroke
function useDebounced(value, delay = 250) {
  const [v, setV] = React.useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// Weighted relevance scoring: title matches score higher than body
function scoreItem(item, q) {
  if (!q) return 0;
  const query = q.toLowerCase().trim();
  const title = (item.title || '').toLowerCase();
  const body = (item.body || '').toLowerCase();
  const author = (item.user_name || '').toLowerCase();
  let score = 0;
  if (title.includes(query)) score += 50;
  if (body.includes(query)) score += 15;
  if (author.includes(query)) score += 20;
  const words = query.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (title.split(/\W+/).includes(w)) score += 10;
    if (body.split(/\W+/).includes(w)) score += 3;
  }
  // Recency boost (max +10, decays over 100 days)
  const daysOld = (Date.now() - new Date(item.created_date).getTime()) / 86400000;
  score += Math.max(0, 10 - daysOld * 0.1);
  return score;
}
import PostCard from '../components/community/PostCard';
import CreatePostForm from '../components/community/CreatePostForm';
import SignInPromptModal from '../components/community/SignInPromptModal';

const CATEGORIES = ['All', 'Teaching', 'Devotional', 'Testimony', 'Question', 'Announcement'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Liked' },
];
const LANGUAGES = [
  { code: 'all', label: '🌍 All Languages' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'om', label: '🇪🇹 Afaan Oromoo' },
  { code: 'am', label: '🇪🇹 Amharic' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'sw', label: '🇹🇿 Swahili' },
];

export default function Community() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [userLikedIds, setUserLikedIds] = useState([]);
  const debouncedSearch = useDebounced(search);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLanguage(u?.preferred_language_code || 'all');
    }).catch(() => {});
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.CommunityPost.filter({ status: 'published' }, '-created_date', 100),
    refetchInterval: 30000,
  });

  // Load user's likes
  useEffect(() => {
    if (!user) return;
    base44.entities.PostLike.filter({ user_id: user.id }, '-created_date', 200)
      .then(likes => setUserLikedIds(likes.map(l => l.post_id)))
      .catch(() => {});
  }, [user]);

  const handleLikeToggle = async (post) => {
    if (!user) { toast.error('Sign in to like posts'); return; }
    const liked = userLikedIds.includes(post.id);
    if (liked) {
      // Unlike
      const existing = await base44.entities.PostLike.filter({ post_id: post.id, user_id: user.id });
      if (existing[0]) await base44.entities.PostLike.delete(existing[0].id);
      setUserLikedIds(prev => prev.filter(id => id !== post.id));
      await base44.entities.CommunityPost.update(post.id, { like_count: Math.max(0, (post.like_count || 1) - 1) }).catch(() => {});
    } else {
      // Like
      await base44.entities.PostLike.create({ post_id: post.id, user_id: user.id });
      setUserLikedIds(prev => [...prev, post.id]);
      await base44.entities.CommunityPost.update(post.id, { like_count: (post.like_count || 0) + 1 }).catch(() => {});
    }
    queryClient.invalidateQueries(['community-posts']);
  };

  // Memoized filtering + sorting + pagination
  const { paged: filtered, total: filteredTotal, hasNext, hasPrev } = useMemo(() => {
    let out = posts.filter(p => {
      if (category !== 'All' && p.category !== category) return false;
      if (language !== 'all' && p.language && p.language !== language) return false;
      if (dateFrom && new Date(p.created_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(p.created_date) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });

    const q = debouncedSearch.trim();
    if (q) {
      out = out
        .map(p => ({ p, s: scoreItem(p, q) }))
        .filter(o => o.s > 0)
        .sort((a, b) => b.s - a.s)
        .map(o => o.p);
    } else {
      if (sort === 'oldest') out.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      else if (sort === 'popular') out.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
      else out.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    const total = out.length;
    const start = (page - 1) * PAGE_SIZE;
    const paged = out.slice(start, start + PAGE_SIZE);
    return { paged, total, hasNext: start + paged.length < total, hasPrev: page > 1 };
  }, [posts, category, language, debouncedSearch, sort, dateFrom, dateTo, page]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [category, language, debouncedSearch, sort, dateFrom, dateTo]);

  const handleRefresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ['community-posts'] }), [queryClient]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" /> Community
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Biblical education posts from the community</p>
          </div>
          {user && !showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Post
            </Button>
          )}
          {!user && (
            <Button onClick={() => setShowSignIn(true)} variant="outline" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Post
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showForm && user && (
          <div className="mb-6">
            <CreatePostForm
              user={user}
              onSuccess={() => { setShowForm(false); queryClient.invalidateQueries(['community-posts']); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2 mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search posts, authors…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full sm:w-44">
                <Globe className="w-3.5 h-3.5 mr-1 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Second row: date range + sort */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-gray-400 flex-shrink-0">From</span>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="flex-1 h-8 text-xs" />
              <span className="text-xs text-gray-400 flex-shrink-0">To</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="flex-1 h-8 text-xs" />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Active filters feedback */}
          {(category !== 'All' || language !== 'all' || search || dateFrom || dateTo || sort !== 'newest') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {category !== 'All' && <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{category}</span>}
              {language !== 'all' && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{LANGUAGES.find(l => l.code === language)?.label}</span>}
              {search && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">"{search}"</span>}
              {dateFrom && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">From {dateFrom}</span>}
              {dateTo && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">To {dateTo}</span>}
              {sort !== 'newest' && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{SORT_OPTIONS.find(s => s.value === sort)?.label}</span>}
              <button
                onClick={() => { setCategory('All'); setLanguage('all'); setSearch(''); setDateFrom(''); setDateTo(''); setSort('newest'); }}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >Clear all</button>
              <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No posts found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredTotal)} of {filteredTotal} post{filteredTotal !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {filtered.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  userLikedIds={userLikedIds}
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>
            {(hasNext || hasPrev) && (
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage(p => p - 1)} className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <span className="text-xs text-gray-500">Page {page}</span>
                <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage(p => p + 1)} className="gap-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {showSignIn && (
          <SignInPromptModal
            message="Sign in to post, like, and comment in the community."
            onClose={() => setShowSignIn(false)}
          />
        )}
      </div>
      </div>
    </PullToRefresh>
  );
}