import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, MessageSquare, Users, FileText, Hash, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  forum:   { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Discussion' },
  group:   { icon: Users,         color: 'text-green-600',  bg: 'bg-green-50',  label: 'Study Group' },
  plan:    { icon: FileText,      color: 'text-purple-600', bg: 'bg-purple-50', label: 'Study Plan' },
  passage: { icon: BookOpen,      color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Bible Passage' },
};

function ContentCard({ item }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.forum;
  const Icon = cfg.icon;
  return (
    <Card className={`border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all ${item.isForYou ? 'ring-1 ring-purple-100' : ''}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-3">
          <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
              {item.isForYou && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> For You
                </span>
              )}
              {item.date && (
                <span className="text-[10px] text-gray-400">
                  {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                </span>
              )}
            </div>
            <Link to={item.url || '#'}>
              <p className="font-semibold text-sm text-gray-900 hover:text-indigo-700 transition-colors line-clamp-2 leading-snug">
                {item.title}
              </p>
            </Link>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
            )}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    <Hash className="w-2 h-2" />{tag}
                  </span>
                ))}
              </div>
            )}
            {item.meta && <p className="text-[10px] text-gray-400 mt-1.5">{item.meta}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DiscoverContentFeed({ filters = {}, user }) {
  const { contentType = 'all', sort = 'trending', tag } = filters;

  const { data: topics = [], isLoading: tLoading } = useQuery({
    queryKey: ['discover-topics', tag, sort],
    queryFn: async () => {
      try {
        const sortField = sort === 'popular' ? '-replies_count' : '-updated_date';
        const all = await base44.entities.ForumTopic.list(sortField, 30);
        return all.filter(t => !tag || (t.category === tag.toLowerCase()) || (t.tags || []).includes(tag));
      } catch { return []; }
    },
    enabled: contentType === 'all' || contentType === 'forum',
    retry: false,
    staleTime: 60000,
  });

  const { data: groups = [], isLoading: gLoading } = useQuery({
    queryKey: ['discover-groups', tag, sort],
    queryFn: async () => {
      try {
        const sortField = sort === 'popular' ? '-member_count' : '-updated_date';
        const all = await base44.entities.Group.filter({ privacy: 'public' }, sortField, 20);
        if (!tag) return all;
        return all.filter(g =>
          g.name?.toLowerCase().includes(tag.toLowerCase()) ||
          g.description?.toLowerCase().includes(tag.toLowerCase()) ||
          g.focus_topic?.toLowerCase().includes(tag.toLowerCase())
        );
      } catch { return []; }
    },
    enabled: contentType === 'all' || contentType === 'group',
    retry: false,
    staleTime: 60000,
  });

  const { data: plans = [], isLoading: pLoading } = useQuery({
    queryKey: ['discover-plans', tag, sort],
    queryFn: async () => {
      try {
        const all = await base44.entities.StudyPlan.filter({}, '-updated_date', 20);
        if (!tag) return all;
        return all.filter(p =>
          (p.title || '').toLowerCase().includes(tag.toLowerCase()) ||
          (p.topics || []).some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
      } catch { return []; }
    },
    enabled: contentType === 'all' || contentType === 'plan',
    retry: false,
    staleTime: 60000,
  });

  // Fetch user reading history for "For You" scoring
  const { data: readingHistory = [] } = useQuery({
    queryKey: ['fy-reading', user?.id],
    queryFn: () => base44.entities.ReadingHistory.filter({ user_id: user.id }, '-updated_date', 30).catch(() => []),
    enabled: !!user?.id && sort === 'foryou',
    retry: false,
  });

  const { data: userGroups = [] } = useQuery({
    queryKey: ['fy-groups', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id }, '-updated_date', 20).catch(() => []),
    enabled: !!user?.id && sort === 'foryou',
    retry: false,
  });

  const isLoading = tLoading || gLoading || pLoading;

  // Build "For You" interest keywords from reading history
  const interestKeywords = React.useMemo(() => {
    const keywords = new Set();
    readingHistory.forEach(h => { if (h.book_name) keywords.add(h.book_name.toLowerCase()); });
    userGroups.forEach(g => { if (g.group_name) g.group_name.split(' ').forEach(w => keywords.add(w.toLowerCase())); });
    return keywords;
  }, [readingHistory, userGroups]);

  const scoreForYou = (item) => {
    if (!interestKeywords.size) return 0;
    const text = `${item.title} ${item.description} ${item.tags?.join(' ')}`.toLowerCase();
    let score = 0;
    interestKeywords.forEach(kw => { if (text.includes(kw)) score += 1; });
    return score;
  };

  const allItems = [
    ...(contentType === 'all' || contentType === 'forum' ? topics.slice(0, 10).map(t => ({
      type: 'forum',
      title: t.title,
      description: t.content?.slice(0, 120),
      tags: [t.category, ...(t.tags || [])].filter(Boolean),
      date: t.created_date,
      url: createPageUrl(`ForumTopic?id=${t.id}`),
      meta: `${t.replies_count || 0} replies · by ${t.author_name || 'Community'}`,
      popularity: t.replies_count || 0,
    })) : []),
    ...(contentType === 'all' || contentType === 'group' ? groups.slice(0, 6).map(g => ({
      type: 'group',
      title: g.name,
      description: g.description,
      tags: g.focus_topic ? [g.focus_topic] : [],
      date: g.created_date,
      url: createPageUrl(`GroupDetail?id=${g.id}`),
      meta: `${g.member_count || 0} members`,
      popularity: g.member_count || 0,
    })) : []),
    ...(contentType === 'all' || contentType === 'plan' ? plans.slice(0, 5).map(p => ({
      type: 'plan',
      title: p.title,
      description: p.description,
      tags: (p.topics || []).slice(0, 3),
      date: p.created_date,
      url: createPageUrl('BibleStudyPlans'),
      meta: p.duration_days ? `${p.duration_days}-day plan` : 'Study Plan',
      popularity: 0,
    })) : []),
  ];

  // Apply sorting
  const feedItems = [...allItems].sort((a, b) => {
    if (sort === 'foryou') {
      const diff = scoreForYou(b) - scoreForYou(a);
      if (diff !== 0) return diff;
      return new Date(b.date || 0) - new Date(a.date || 0);
    }
    if (sort === 'popular') return (b.popularity || 0) - (a.popularity || 0);
    if (sort === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
    // trending: mix of recency + popularity
    const aScore = (a.popularity || 0) + (new Date(a.date || 0) / 1e10);
    const bScore = (b.popularity || 0) + (new Date(b.date || 0) / 1e10);
    return bScore - aScore;
  }).map(item => ({
    ...item,
    isForYou: sort === 'foryou' && scoreForYou(item) > 0,
  }));

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  if (feedItems.length === 0) return (
    <div className="text-center py-10 text-gray-400">
      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
      <p className="text-sm">No content found{tag ? ` for #${tag}` : ''}.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {tag && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <Hash className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-800">#{tag}</span>
          <span className="text-xs text-indigo-500">({feedItems.length} results)</span>
        </div>
      )}
      {feedItems.map((item, i) => <ContentCard key={i} item={item} />)}
    </div>
  );
}