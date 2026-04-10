import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, AlertCircle, Heart } from 'lucide-react';

/**
 * Community health metrics and insights
 */
export default function CommunityHealthDashboard({ courseId }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['community-health', courseId],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeCommunityHealth', {
        course_id: courseId || '',
      });
      return response.data;
    },
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-600">
          Analyzing community...
        </CardContent>
      </Card>
    );
  }

  const { metrics: metricsData, health_score } = metrics || { health_score: 0 };

  const healthStatus =
    health_score >= 80
      ? { label: 'Healthy', color: 'text-green-600', bg: 'bg-green-50' }
      : health_score >= 50
      ? { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' }
      : { label: 'Concerning', color: 'text-red-600', bg: 'bg-red-50' };

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <Card className={healthStatus.bg}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className={`w-5 h-5 ${healthStatus.color}`} />
            Community Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-4">
            <div>
              <p className={`text-4xl font-bold ${healthStatus.color}`}>
                {health_score}
              </p>
              <p className="text-sm text-gray-600 mt-1">/100</p>
            </div>
            <div className="flex-1">
              <Progress value={health_score} className="h-3" />
              <p className={`text-sm font-semibold mt-2 ${healthStatus.color}`}>
                {healthStatus.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Total Activity</p>
            <p className="text-2xl font-bold">
              {(metricsData?.total_posts || 0) + (metricsData?.total_messages || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Flagged Items</p>
            <p className={`text-2xl font-bold ${metricsData?.flagged_count > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {metricsData?.flagged_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Violation Rate</p>
            <p className="text-2xl font-bold">
              {metricsData?.violation_rate?.toFixed(0) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Engagement</p>
            <p className="text-2xl font-bold">
              {metricsData?.engagement_rate?.toFixed(0) || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Overall Sentiment</span>
            <span className={`text-sm font-semibold ${
              (metricsData?.avg_sentiment_score || 0) > 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {((metricsData?.avg_sentiment_score || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex gap-2 text-xs">
            <div className="flex-1">
              <p className="text-gray-600 mb-1">😊 Positive</p>
              <div className="h-2 bg-green-200 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-1">😐 Neutral</p>
              <div className="h-2 bg-gray-200 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-1">😟 Negative</p>
              <div className="h-2 bg-red-200 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Topics */}
      {metricsData?.top_topics?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Top Discussion Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metricsData.top_topics.slice(0, 5).map((topic, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{topic.topic}</span>
                <Badge variant="outline">{topic.frequency}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}