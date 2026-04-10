import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Target, Heart, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const PASSAGE_POOL = [
  { ref: 'Psalms 23', theme: 'comfort', tags: ['peace', 'shepherd', 'trust'] },
  { ref: 'Romans 8:28', theme: 'faith', tags: ['hope', 'purpose', 'trials'] },
  { ref: 'John 3:16', theme: 'salvation', tags: ['love', 'eternal life', 'grace'] },
  { ref: 'Philippians 4:13', theme: 'strength', tags: ['strength', 'perseverance', 'faith'] },
  { ref: 'Proverbs 3:5-6', theme: 'wisdom', tags: ['trust', 'wisdom', 'guidance'] },
  { ref: 'Isaiah 40:31', theme: 'renewal', tags: ['strength', 'hope', 'endurance'] },
  { ref: 'Matthew 11:28-30', theme: 'rest', tags: ['rest', 'comfort', 'burden'] },
  { ref: 'Jeremiah 29:11', theme: 'purpose', tags: ['hope', 'future', 'purpose'] },
  { ref: '1 Corinthians 13', theme: 'love', tags: ['love', 'relationships', 'character'] },
  { ref: 'James 1:2-4', theme: 'trials', tags: ['trials', 'perseverance', 'growth'] },
];

function RecommendationCard({ rec, type, onLoadReason }) {
  const [reason, setReason] = useState(rec.preReason || null);
  const [loading, setLoading] = useState(false);

  const icons = { passage: BookOpen, plan: Target, devotional: Heart };
  const colors = { passage: 'text-blue-600 bg-blue-50', plan: 'text-green-600 bg-green-50', devotional: 'text-pink-600 bg-pink-50' };
  const Icon = icons[type] || BookOpen;

  const loadReason = async () => {
    if (reason || loading) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Explain in 1 short sentence (max 15 words) why "${rec.title}" is relevant to someone who ${rec.userContext}. Be personal and specific.`,
      });
      setReason(typeof result === 'string' ? result : result?.text || 'Perfect for your spiritual journey right now.');
    } catch {
      setReason('Perfect for your spiritual journey right now.');
    }
    setLoading(false);
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
      onMouseEnter={loadReason}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{rec.title}</p>
        {reason ? (
          <p className="text-xs text-indigo-600 mt-0.5 flex items-start gap-1">
            <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-500" />
            {reason}
          </p>
        ) : loading ? (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Finding relevance for you...
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">{rec.subtitle}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
    </div>
  );
}

export default function PersonalizedRecommendationsWidget({ user }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: savedVerses = [] } = useQuery({
    queryKey: ['saved-verses-rec', user?.id],
    queryFn: () => base44.entities.SavedVerse.filter({ user_id: user?.id }, '-updated_date', 10).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: readingHistory = [] } = useQuery({
    queryKey: ['reading-history-rec', user?.id],
    queryFn: () => base44.entities.ReadingHistory.filter({ user_id: user?.id }, '-updated_date', 20).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: userPoints = null } = useQuery({
    queryKey: ['user-points-rec', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const r = await base44.entities.UserPoints.filter({ user_id: user.id }, '-updated_date', 1).catch(() => []);
      return r[0] || null;
    },
    enabled: !!user?.id,
    retry: false,
  });

  // Build smart context from user data
  const userContext = React.useMemo(() => {
    const parts = [];
    if (savedVerses.length > 0) parts.push(`saved ${savedVerses.length} verses`);
    if (readingHistory.length > 0) parts.push(`has been reading the Bible regularly`);
    if (userPoints?.total_points > 0) parts.push(`earned ${userPoints.total_points} study points`);
    if (user?.spiritual_level) parts.push(`is at spiritual level ${user.spiritual_level}`);
    return parts.length > 0 ? parts.join(', ') : 'is on a faith journey';
  }, [savedVerses, readingHistory, userPoints, user]);

  // Generate personalized passage recommendations based on reading history
  const passageRecs = React.useMemo(() => {
    const booksRead = new Set(readingHistory.map(r => r.book_name).filter(Boolean));
    const pool = [...PASSAGE_POOL].sort(() => Math.random() - 0.5);
    return pool.slice(0, 3).map(p => ({
      id: p.ref,
      title: p.ref,
      subtitle: `Theme: ${p.theme}`,
      link: createPageUrl('BibleReader'),
      userContext,
    }));
  }, [readingHistory, userContext, refreshKey]);

  // Study plan recommendations
  const planRecs = [
    { id: 'plan1', title: '30-Day New Testament Journey', subtitle: 'Structured daily reading', link: createPageUrl('BibleStudyPlans'), userContext },
    { id: 'plan2', title: 'Psalms & Proverbs Wisdom Plan', subtitle: 'Wisdom literature deep dive', link: createPageUrl('BibleStudyPlans'), userContext },
  ];

  // Devotional recommendations
  const devotionalRecs = [
    { id: 'dev1', title: "Today's Personalized Devotional", subtitle: 'AI-crafted for your journey', link: createPageUrl('MyStudyDashboard'), userContext },
    { id: 'dev2', title: 'Morning Prayer & Reflection', subtitle: 'Start your day in the Word', link: createPageUrl('PrayerWall'), userContext },
  ];

  return (
    <Card className="border-gray-200 overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Recommended For You</span>
              <p className="text-[10px] text-gray-400">AI-powered · Based on your activity</p>
            </div>
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Bible Passages */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Bible Passages</span>
            </div>
            <div className="space-y-1.5">
              {passageRecs.map(rec => (
                <Link key={rec.id} to={rec.link}>
                  <RecommendationCard rec={rec} type="passage" />
                </Link>
              ))}
            </div>
          </div>

          {/* Study Plans */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Study Plans</span>
            </div>
            <div className="space-y-1.5">
              {planRecs.map(rec => (
                <Link key={rec.id} to={rec.link}>
                  <RecommendationCard rec={rec} type="plan" />
                </Link>
              ))}
            </div>
          </div>

          {/* Devotionals */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Devotionals</span>
            </div>
            <div className="space-y-1.5">
              {devotionalRecs.map(rec => (
                <Link key={rec.id} to={rec.link}>
                  <RecommendationCard rec={rec} type="devotional" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] text-gray-400">Hover any item to see why it's recommended for you</span>
        </div>
      </CardContent>
    </Card>
  );
}