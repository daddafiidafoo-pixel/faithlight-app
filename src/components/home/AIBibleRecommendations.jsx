import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Sparkles, BookOpen, Lightbulb, Map, RefreshCw, ChevronRight } from 'lucide-react';

const TYPE_CONFIG = {
  verse: { icon: BookOpen, color: 'bg-blue-100 text-blue-700', label: 'Verse' },
  topic: { icon: Lightbulb, color: 'bg-amber-100 text-amber-700', label: 'Topic' },
  study_plan: { icon: Map, color: 'bg-purple-100 text-purple-700', label: 'Study Plan' },
  theme: { icon: Sparkles, color: 'bg-green-100 text-green-700', label: 'Theme' },
};

function RecommendationCard({ rec }) {
  const config = TYPE_CONFIG[rec.type] || TYPE_CONFIG.verse;
  const Icon = config.icon;

  const linkTo = rec.book && rec.chapter
    ? `${createPageUrl('BibleReader')}?book=${encodeURIComponent(rec.book)}&chapter=${rec.chapter}`
    : createPageUrl('BibleStudyHub');

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col">
      <CardContent className="pt-4 pb-4 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-2">
          <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
            <Icon className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>
              {rec.reference && (
                <span className="text-xs text-gray-500 font-medium">{rec.reference}</span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{rec.title}</h4>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-2 flex-1">{rec.description}</p>
        {rec.reason && (
          <p className="text-xs text-indigo-600 italic mb-3">✨ {rec.reason}</p>
        )}
        <Link to={linkTo}>
          <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1">
            Explore <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function AIBibleRecommendations({ user }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['bible-recommendations', user?.id, refreshKey],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated().catch(() => false);
      if (!isAuth) return { recommendations: [] };
      const res = await base44.functions.invoke('getBibleRecommendations', {}).catch(() => ({ data: { recommendations: [] } }));
      return res.data || { recommendations: [] };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // 15 min cache
    retry: false,
  });

  const recommendations = data?.recommendations || [];
  const contextSummary = data?.context_summary;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
              {contextSummary && (
                <p className="text-sm text-gray-500 mt-0.5">{contextSummary}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setRefreshKey(k => k + 1); }}
            disabled={isLoading || isFetching}
            className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-40 animate-pulse bg-white/60">
                <CardContent className="pt-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-indigo-200 bg-white/60">
            <CardContent className="pt-8 pb-8 text-center">
              <Sparkles className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Start reading the Bible to get personalized recommendations!</p>
              <Link to={createPageUrl('BibleReader')}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <BookOpen className="w-4 h-4" /> Open Bible Reader
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}