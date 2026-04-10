import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * AI-generated discussion summary for instructors
 */
export default function DiscussionSummaryPanel({ forumTopicId, courseId, instructorId, onClose }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const response = await base44.functions.invoke('generateDiscussionSummary', {
        forum_topic_id: forumTopicId,
        course_id: courseId,
        instructor_id: instructorId,
      });
      setSummary(response.data.summary);
      setIsLoading(false);
      return response.data;
    },
  });

  if (isLoading || !summary) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-3" />
              <p className="text-sm text-gray-600">Analyzing discussion...</p>
            </>
          ) : (
            <Button
              onClick={() => generateSummary.mutate()}
              className="gap-2"
              disabled={generateSummary.isPending}
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Summary
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const { key_points, unanswered_questions, action_items, sentiment_score } = summary;

  const sentimentColor =
    sentiment_score > 0.3
      ? 'text-green-600'
      : sentiment_score < -0.3
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Discussion Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">Overview</p>
          <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
        </div>

        {/* Sentiment */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-gray-600">Discussion Tone</p>
            <p className={`text-sm font-bold ${sentimentColor}`}>
              {sentiment_score > 0.3 ? '😊 Positive' : sentiment_score < -0.3 ? '😟 Negative' : '😐 Neutral'}
            </p>
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                sentiment_score > 0
                  ? 'bg-green-500'
                  : sentiment_score < 0
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
              style={{ width: `${50 + sentiment_score * 50}%` }}
            />
          </div>
        </div>

        {/* Key Points */}
        {key_points?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Key Points</p>
            <ul className="space-y-1">
              {key_points.slice(0, 4).map((point, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unanswered Questions */}
        {unanswered_questions?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Questions for Response
            </p>
            <div className="space-y-2">
              {unanswered_questions.slice(0, 3).map((q, i) => (
                <div key={i} className="text-sm p-2 bg-orange-50 border border-orange-200 rounded">
                  {q}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {action_items?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Suggested Actions</p>
            <ul className="space-y-1">
              {action_items.slice(0, 3).map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-600">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {onClose && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
}