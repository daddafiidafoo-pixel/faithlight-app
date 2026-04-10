import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function FeedbackTrendAnalyzer({ courseId, contentId, contentType }) {
  const { data: trendAnalysis } = useQuery({
    queryKey: ['feedback-trends', courseId, contentId, contentType],
    queryFn: async () => {
      if (!courseId || !contentId) return null;
      const results = await base44.entities.FeedbackTrendAnalysis.filter({
        course_id: courseId,
        content_id: contentId,
        content_type: contentType,
      }, '-created_date');
      return results.length > 0 ? results[0] : null;
    },
  });

  if (!trendAnalysis) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center text-gray-600">
          No feedback trends available yet
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const issuesData = trendAnalysis.common_issues?.map(issue => ({
    name: issue.issue,
    count: issue.count,
    percentage: issue.percentage,
  })) || [];

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return colors[priority] || colors.medium;
  };

  const getSentimentColor = (score) => {
    if (score > 0.2) return 'text-green-600';
    if (score < -0.2) return 'text-red-600';
    return 'text-gray-600';
  };

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Feedback Items</p>
            <p className="text-3xl font-bold text-indigo-600">{trendAnalysis.total_feedback_count}</p>
            <p className="text-xs text-gray-500 mt-1">
              {trendAnalysis.time_period_start} to {trendAnalysis.time_period_end}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Sentiment Score</p>
            <p className={`text-3xl font-bold ${getSentimentColor(trendAnalysis.avg_sentiment_score)}`}>
              {(trendAnalysis.avg_sentiment_score * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {trendAnalysis.avg_sentiment_score > 0 ? '✓ Positive' : trendAnalysis.avg_sentiment_score < 0 ? '✗ Negative' : 'Neutral'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Priority Level</p>
            <Badge className={`${getPriorityColor(trendAnalysis.improvement_priority)} text-lg`}>
              {trendAnalysis.improvement_priority.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Common Issues */}
      {issuesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `${value} reports`} />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {issuesData.map((issue, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm text-gray-700">{issue.name}</span>
                  <Badge variant="outline">{issue.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positive Trends */}
      {trendAnalysis.positive_trends?.length > 0 && (
        <Card className="border-l-4 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Positive Feedback Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendAnalysis.positive_trends.map((theme, idx) => (
                <Badge key={idx} className="bg-green-600">
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {trendAnalysis.recommended_actions?.length > 0 && (
        <Card className="border-l-4 border-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Recommended Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {trendAnalysis.recommended_actions.map((action, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700">
                  <span className="font-semibold text-indigo-600">{idx + 1}.</span>
                  {action}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}