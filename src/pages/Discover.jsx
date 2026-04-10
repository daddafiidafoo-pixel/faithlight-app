import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Users, Trophy, Search, BookOpen, MessageSquare, Star, TrendingUp, Filter, X, Loader2, Heart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import CommunityChallenges from '@/components/discover/CommunityChallenges';
import AIGroupSuggester from '@/components/discover/AIGroupSuggester';
import ContentPreferences, { useHiddenItems } from '@/components/discover/ContentPreferences';

const CONTENT_TYPES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'forum', label: 'Discussions', icon: MessageSquare },
  { id: 'study_plan', label: 'Study Plans', icon: BookOpen },
  { id: 'group', label: 'Groups', icon: Users },
  { id: 'devotional', label: 'Devotionals', icon: Heart },
];

const SORT_OPTIONS = [
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
  { id: 'popular', label: 'Most Popular' },
];

const TAGS = ['Prayer', 'Grace', 'Wisdom', 'Psalms', 'John', 'Romans', 'Faith', 'Healing', 'Prophecy', 'Salvation', 'Discipleship', 'Worship'];

function ContentCard({ item, type, onHide }) {
  const [showHide, setShowHide] = useState(false);
  const icons = { forum: MessageSquare, study_plan: BookOpen, group: Users, devotional: Heart };
  const colors = { forum: 'bg-blue-100 text-blue-700', study_plan: 'bg-indigo-100 text-indigo-700', group: 'bg-purple-100 text-purple-700', devotional: 'bg-rose-100 text-rose-700' };
  const Icon = icons[type] || Sparkles;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group relative"
      onMouseEnter={() => setShowHide(true)} onMouseLeave={() => setShowHide(false)}>
      {/* Hide button */}
      {showHide && onHide && (
        <button
          onClick={e => { e.stopPropagation(); onHide(item.id); }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-opacity"
          title="Hide this"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-gray-900 leading-tight">{item.title}</h4>
            {item.is_featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Featured</span>}
          </div>
          {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
            {item.view_count > 0 && <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{item.view_count} views</span>}
            {item.reply_count > 0 && <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />{item.reply_count} replies</span>}
            {item.member_count > 0 && <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{item.member_count}</span>}
            {item.tags?.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-[9px] px-1 py-0 border-gray-200">{t}</Badge>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedDevotional({ user }) {
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a short daily devotional for a Christian user. Include:
- title (engaging, ~5 words)
- scripture_ref (book chapter:verse)  
- scripture_text (the verse text)
- reflection (2-3 inspiring sentences)
- prayer (1 sentence prayer)
- action (one practical step for today)
Theme: ${user?.interests?.[0] || 'Faith and trust in God'}`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            scripture_ref: { type: 'string' },
            scripture_text: { type: 'string' },
            reflection: { type: 'string' },
            prayer: { type: 'string' },
            action: { type: 'string' },
          }
        }
      });
      setDevotional(result);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { if (user) generate(); }, [user?.id]);

  if (loading) return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5 flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
    </div>
  );

  if (!devotional) return null;

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-rose-500" />
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">Today's Devotional</span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{devotional.title}</h3>
      <p className="text-xs text-rose-600 font-semibold mb-2">{devotional.scripture_ref}</p>
      <p className="text-sm text-gray-700 italic mb-3 border-l-2 border-rose-300 pl-3">"{devotional.scripture_text}"</p>
      <p className="text-xs text-gray-600 mb-3">{devotional.reflection}</p>
      <div className="bg-white/70 rounded-lg p-3 space-y-1">
        <p className="text-xs font-semibold text-gray-700">🙏 {devotional.prayer}</p>
        <p className="text-xs text-gray-600">✍️ Today: {devotional.action}</p>
      </div>
      <button onClick={generate} className="mt-3 text-xs text-rose-500 hover:text-rose-700 font-medium">Generate new →</button>
    </div>
  );
}

export default function Discover() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeSort, setActiveSort] = useState('trending');
  const [selectedTag, setSelectedTag] = useState(null);
  const [prefs, setPrefs] = useState({ type_order: ['devotional','forum','study_plan','group'], topics: [], disabled_types: [] });
  const { hidden, hide } = useHiddenItems(user?.id);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch forum topics
  const { data: forumTopics = [] } = useQuery({
    queryKey: ['discover-forums', activeSort],
    queryFn: () => base44.entities.ForumTopic.filter({ status: 'active' }, '-updated_date', 30).catch(() => []),
    retry: false,
  });

  // Fetch study plans
  const { data: studyPlans = [] } = useQuery({
    queryKey: ['discover-plans', activeSort],
    queryFn: () => base44.entities.StudyPlan.filter({ status: 'active' }, '-updated_date', 30).catch(() => []),
    retry: false,
  });

  // Fetch groups
  const { data: groups = [] } = useQuery({
    queryKey: ['discover-groups', activeSort],
    queryFn: () => base44.entities.Group.filter({ privacy: 'public' }, '-updated_date', 30).catch(() => []),
    retry: false,
  });

  // Combine & map
  const allContent = [
    ...forumTopics.map(t => ({ ...t, _type: 'forum', title: t.title, description: t.content?.slice(0, 100), tags: t.tags || [] })),
    ...studyPlans.map(p => ({ ...p, _type: 'study_plan', title: p.title, description: p.description, tags: p.topics || [] })),
    ...groups.map(g => ({ ...g, _type: 'group', title: g.name, description: g.description, tags: g.interests || [] })),
  ];

  const filtered = allContent.filter(item => {
    const matchesType = activeType === 'all' || item._type === activeType;
    const matchesTag = !selectedTag || (item.tags || []).some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));
    const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    const notHidden = !hidden.has(item.id);
    const notDisabledType = !prefs.disabled_types.includes(item._type);
    // Boost items matching preferred topics
    return matchesType && matchesTag && matchesSearch && notHidden && notDisabledType;
  }).sort((a, b) => {
    // Prioritize by type_order preference
    if (prefs.topics.length > 0) {
      const aTopicMatch = (a.tags || []).some(t => prefs.topics.includes(t)) ? -1 : 0;
      const bTopicMatch = (b.tags || []).some(t => prefs.topics.includes(t)) ? -1 : 0;
      if (aTopicMatch !== bTopicMatch) return aTopicMatch - bTopicMatch;
    }
    const aOrder = prefs.type_order.indexOf(a._type);
    const bOrder = prefs.type_order.indexOf(b._type);
    return (aOrder === -1 ? 99 : aOrder) - (bOrder === -1 ? 99 : bOrder);
  });

  const featured = filtered.filter(i => i.is_featured || i.view_count > 50 || i.member_count > 20).slice(0, 3);
  const regular = filtered.slice(0, 30);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
          <p className="text-gray-500 mt-1 text-sm">Explore trending discussions, study plans, groups, and devotionals</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions, groups, study plans..."
            className="pl-9 pr-9 bg-white shadow-sm border-gray-200"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Content Type Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Content Type</p>
              <div className="space-y-1">
                {CONTENT_TYPES.map(ct => {
                  const Icon = ct.icon;
                  return (
                    <button key={ct.id} onClick={() => setActiveType(ct.id)}
                      className={`w-full flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeType === ct.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <Icon className="w-3.5 h-3.5" /> {ct.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`text-xs min-h-[44px] min-w-[44px] px-3 py-2 rounded-full border transition-colors ${selectedTag === tag ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Preferences */}
            {user && <ContentPreferences user={user} onPrefsChange={setPrefs} />}

            {/* Today's Devotional */}
            <FeaturedDevotional user={user} />

            {/* AI Group Suggestions */}
            {user && <AIGroupSuggester user={user} />}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-5">
            <Tabs defaultValue="explore">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <TabsList className="bg-white border border-gray-200 shadow-sm">
                  <TabsTrigger value="explore" className="gap-1.5 text-sm"><Sparkles className="w-3.5 h-3.5" /> Explore</TabsTrigger>
                  <TabsTrigger value="trending" className="gap-1.5 text-sm"><TrendingUp className="w-3.5 h-3.5" /> Trending</TabsTrigger>
                  <TabsTrigger value="challenges" className="gap-1.5 text-sm"><Trophy className="w-3.5 h-3.5" /> Challenges</TabsTrigger>
                </TabsList>

                {/* Sort */}
                <div className="flex gap-1">
                  {SORT_OPTIONS.map(s => (
                    <button key={s.id} onClick={() => setActiveSort(s.id)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeSort === s.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <TabsContent value="explore">
                {/* Active filters display */}
                {(selectedTag || activeType !== 'all' || search) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTag && <Badge className="gap-1 bg-indigo-100 text-indigo-700 border-0">{selectedTag} <button onClick={() => setSelectedTag(null)}><X className="w-3 h-3" /></button></Badge>}
                    {activeType !== 'all' && <Badge className="gap-1 bg-purple-100 text-purple-700 border-0">{CONTENT_TYPES.find(c => c.id === activeType)?.label} <button onClick={() => setActiveType('all')}><X className="w-3 h-3" /></button></Badge>}
                    {search && <Badge className="gap-1 bg-gray-100 text-gray-700 border-0">"{search}" <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button></Badge>}
                  </div>
                )}

                {/* Featured */}
                {featured.length > 0 && !search && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Star className="w-3 h-3 text-amber-500" /> Featured</p>
                    <div className="space-y-2">
                      {featured.map(item => <ContentCard key={item.id} item={item} type={item._type} onHide={user ? hide : null} />)}
                    </div>
                  </div>
                )}

                {/* All Results */}
                <div>
                  {search && <p className="text-xs text-gray-500 mb-3">{filtered.length} results for "{search}"</p>}
                  {regular.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p>No content found. Try adjusting your filters.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {regular.map(item => <ContentCard key={item.id + item._type} item={item} type={item._type} onHide={user ? hide : null} />)}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trending">
                <div className="space-y-4">
                  {/* Trending Forums */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Hot Discussions</p>
                    <div className="space-y-2">
                      {forumTopics.slice(0, 5).map(t => <ContentCard key={t.id} item={{ ...t, description: t.content?.slice(0, 100), tags: t.tags }} type="forum" />)}
                    </div>
                  </div>
                  {/* Popular Groups */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Users className="w-3 h-3" /> Popular Groups</p>
                    <div className="space-y-2">
                      {groups.slice(0, 4).map(g => <ContentCard key={g.id} item={{ ...g, title: g.name, description: g.description, tags: g.interests }} type="group" />)}
                    </div>
                  </div>
                  {/* Featured Study Plans */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Popular Study Plans</p>
                    <div className="space-y-2">
                      {studyPlans.slice(0, 4).map(p => <ContentCard key={p.id} item={{ ...p, tags: p.topics }} type="study_plan" />)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="challenges">
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-gray-900">Community Challenges</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Join time-bound challenges and grow together</p>
                </div>
                <CommunityChallenges user={user} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}