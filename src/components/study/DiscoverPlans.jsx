import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Star, Copy, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const FEATURED_PLANS = [
  {
    id: 'feat_1', title: '30 Days Through the Psalms', description: 'A month of worship, lament, and praise through the most beloved book of the Bible.', duration_days: 30,
    category: 'Devotional', items_count: 30, featured: true,
    plan_items: Array.from({ length: 30 }, (_, i) => ({ label: `Psalm ${i + 1}`, book: 'Psalms', chapter: i + 1, done: false })),
  },
  {
    id: 'feat_2', title: 'Gospel of John — 21 Days', description: "Read through John's Gospel, the most theological account of Jesus' life.", duration_days: 21,
    category: 'Study', items_count: 21, featured: true,
    plan_items: Array.from({ length: 21 }, (_, i) => ({ label: `John ${i + 1}`, book: 'John', chapter: i + 1, done: false })),
  },
  {
    id: 'feat_3', title: 'Proverbs for Wisdom — 31 Days', description: 'One chapter of Proverbs each day for a month of practical wisdom.', duration_days: 31,
    category: 'Wisdom', items_count: 31, featured: true,
    plan_items: Array.from({ length: 31 }, (_, i) => ({ label: `Proverbs ${i + 1}`, book: 'Proverbs', chapter: i + 1, done: false })),
  },
  {
    id: 'feat_4', title: 'Paul\'s Letters — 14 Days', description: 'Journey through Romans, Galatians, and Ephesians for core Christian theology.', duration_days: 14,
    category: 'Theology', items_count: 14, featured: true,
    plan_items: [
      ...Array.from({ length: 7 }, (_, i) => ({ label: `Romans ${i + 1}`, book: 'Romans', chapter: i + 1, done: false })),
      ...Array.from({ length: 7 }, (_, i) => ({ label: `Ephesians ${i + 1}`, book: 'Ephesians', chapter: i + 1, done: false })),
    ],
  },
  {
    id: 'feat_5', title: 'Sermon on the Mount Deep Dive', description: 'Study Matthew 5–7 in depth over 7 days — the heart of Jesus\' teaching.', duration_days: 7,
    category: 'Teaching', items_count: 7, featured: true,
    plan_items: [
      { label: 'Matthew 5:1-12 — The Beatitudes', book: 'Matthew', chapter: 5, done: false },
      { label: 'Matthew 5:13-48 — Salt, Light & the Law', book: 'Matthew', chapter: 5, done: false },
      { label: 'Matthew 6:1-18 — Prayer & Fasting', book: 'Matthew', chapter: 6, done: false },
      { label: 'Matthew 6:19-34 — Treasure & Worry', book: 'Matthew', chapter: 6, done: false },
      { label: 'Matthew 7:1-12 — Judging & Asking', book: 'Matthew', chapter: 7, done: false },
      { label: 'Matthew 7:13-29 — The Narrow Way', book: 'Matthew', chapter: 7, done: false },
      { label: 'Review & Reflection', book: 'Matthew', chapter: 5, done: false },
    ],
  },
  {
    id: 'feat_6', title: 'New Believer Foundations — 7 Days', description: 'Perfect for new Christians — key passages covering salvation, identity, and purpose.', duration_days: 7,
    category: 'Beginner', items_count: 7, featured: true,
    plan_items: [
      { label: 'John 3 — Born Again', book: 'John', chapter: 3, done: false },
      { label: 'Romans 3 — All Have Sinned', book: 'Romans', chapter: 3, done: false },
      { label: 'Romans 8 — Life in the Spirit', book: 'Romans', chapter: 8, done: false },
      { label: 'Ephesians 2 — Saved by Grace', book: 'Ephesians', chapter: 2, done: false },
      { label: 'Psalm 23 — The Lord is My Shepherd', book: 'Psalms', chapter: 23, done: false },
      { label: 'Matthew 6 — The Lord\'s Prayer', book: 'Matthew', chapter: 6, done: false },
      { label: '1 John 1 — Walking in the Light', book: '1 John', chapter: 1, done: false },
    ],
  },
];

const CATEGORY_COLORS = {
  Devotional: 'bg-purple-100 text-purple-700',
  Study: 'bg-blue-100 text-blue-700',
  Wisdom: 'bg-amber-100 text-amber-700',
  Theology: 'bg-indigo-100 text-indigo-700',
  Teaching: 'bg-green-100 text-green-700',
  Beginner: 'bg-teal-100 text-teal-700',
};

function FeaturedPlanCard({ plan, onCopy, copying }) {
  return (
    <Card className="border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{plan.title}</h3>
          {plan.featured && <Star className="w-4 h-4 text-amber-400 flex-shrink-0 fill-amber-400" />}
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{plan.description}</p>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge className={`text-xs ${CATEGORY_COLORS[plan.category] || 'bg-gray-100 text-gray-600'}`}>{plan.category}</Badge>
          <span className="text-xs text-gray-400 flex items-center gap-0.5"><Calendar className="w-3 h-3" />{plan.duration_days} days</span>
          <span className="text-xs text-gray-400 flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{plan.items_count} readings</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopy(plan)}
          disabled={copying === plan.id}
          className="w-full gap-1.5 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          {copying === plan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
          {copying === plan.id ? 'Adding...' : 'Add to My Plans'}
        </Button>
      </CardContent>
    </Card>
  );
}

function CommunityPlanCard({ plan, onCopy, copying }) {
  return (
    <Card className="border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(plan.created_by || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{plan.title}</p>
            <p className="text-xs text-gray-400">{plan.duration_days || '?'} days · {(plan.plan_items || []).length} items</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCopy(plan)}
            disabled={copying === plan.id}
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            {copying === plan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {plan.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{plan.description}</p>}
      </CardContent>
    </Card>
  );
}

export default function DiscoverPlans({ user, onPlanAdded }) {
  const [copying, setCopying] = useState(null);
  const [category, setCategory] = useState('All');

  const { data: communityPlans = [] } = useQuery({
    queryKey: ['community-study-plans'],
    queryFn: () => base44.entities.StudyPlan.filter({ is_collaborative: false }, '-created_date', 20).catch(() => []),
    enabled: !!user,
  });

  const copyPlan = async (plan) => {
    if (!user) { toast.error('Sign in to add plans'); return; }
    setCopying(plan.id);
    try {
      const items = (plan.plan_items || []).map(i => ({ ...i, done: false }));
      await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: plan.title,
        description: plan.description || '',
        duration_days: plan.duration_days || 7,
        plan_items: items,
        status: 'active',
        progress_percentage: 0,
      });
      toast.success('Plan added to your study plans!');
      onPlanAdded?.();
    } catch { toast.error('Failed to add plan'); }
    setCopying(null);
  };

  const categories = ['All', 'Devotional', 'Study', 'Wisdom', 'Theology', 'Teaching', 'Beginner'];
  const filtered = category === 'All' ? FEATURED_PLANS : FEATURED_PLANS.filter(p => p.category === category);

  return (
    <div className="space-y-6">
      {/* Featured Plans */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h2 className="font-bold text-gray-900">Featured Plans</h2>
          <span className="text-xs text-gray-400 ml-auto">Curated by FaithLight</span>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(plan => (
            <FeaturedPlanCard key={plan.id} plan={plan} onCopy={copyPlan} copying={copying} />
          ))}
        </div>
      </div>

      {/* Community Plans */}
      {communityPlans.filter(p => p.user_id !== user?.id).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-gray-900">Community Plans</h2>
            <span className="text-xs text-gray-400 ml-auto">Created by members</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {communityPlans.filter(p => p.user_id !== user?.id).slice(0, 8).map(plan => (
              <CommunityPlanCard key={plan.id} plan={plan} onCopy={copyPlan} copying={copying} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}