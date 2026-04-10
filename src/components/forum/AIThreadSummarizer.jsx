import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ListChecks, CheckCircle } from 'lucide-react';

export default function AIThreadSummarizer({ topicId, topicTitle, replyCount }) {
  // Fetch thread summary
  const { data: summary, isLoading } = useQuery({
    queryKey: ['thread-summary', topicId],
    queryFn: async () => {
      if (!topicId) return null;
      const summaries = await base44.entities.ThreadSummary.filter(
        { topic_id: topicId },
        '-generated_at',
        1
      );
      return summaries.length > 0 ? summaries[0] : null;
    },
    enabled: !!topicId && replyCount > 5,
  });

  if (!summary && isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 animate-pulse">
        <CardContent className="pt-6 pb-6">
          <div className="h-6 bg-amber-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-amber-100 rounded w-full mb-2" />
          <div className="h-4 bg-amber-100 rounded w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Thread Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Text */}
        <div>
          <p className="text-gray-700 leading-relaxed">{summary.summary_text}</p>
        </div>

        {/* Key Points */}
        {summary.key_points?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4" />
              Key Points
            </h4>
            <ul className="space-y-2">
              {summary.key_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 font-bold">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Consensus */}
        {summary.consensus && (
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Consensus
            </h4>
            <p className="text-sm text-gray-700">{summary.consensus}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-600 flex items-center gap-2 pt-2 border-t border-amber-200">
          <Sparkles className="w-3 h-3" />
          AI-generated summary of {summary.reply_count_at_summary} replies
        </div>
      </CardContent>
    </Card>
  );
}