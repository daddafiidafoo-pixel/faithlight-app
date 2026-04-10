import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, MessageSquare, HelpCircle, BookOpen, AlertTriangle } from 'lucide-react';

export default function AIGroupSummaryPanel({ groupId, passageRef, recentMessages = [] }) {
  const [mode, setMode] = useState(null); // null | 'summary' | 'questions'
  const queryClient = useQueryClient();

  const { data: latestSummary } = useQuery({
    queryKey: ['ai-group-summary', groupId],
    queryFn: async () => {
      const results = await base44.entities.AIGroupSummary.filter({ group_id: groupId }, '-created_date', 1).catch(() => []);
      return results[0] || null;
    },
    enabled: !!groupId,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const generateMutation = useMutation({
    mutationFn: async (type) => {
      const msgText = recentMessages.slice(-30).map(m => `${m.user_name || 'Member'}: ${m.content || m.message || ''}`).join('\n');
      const context = passageRef ? `Current passage: ${passageRef}\n\n` : '';

      const schema = {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } },
          action_questions: { type: 'array', items: { type: 'string' } },
          prayer_prompt: { type: 'string' },
        },
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Bible study group assistant. ${context}

Recent group discussion:
${msgText || '(No recent messages)'}

Generate a helpful group study response with:
- A 4-5 bullet point summary of the discussion
- 3 thoughtful discussion questions that go deeper into the Scripture
- 3 practical action points
- A short prayer prompt related to the passage

Keep it encouraging, non-denominational, and focused on Scripture.`,
        response_json_schema: schema,
      });

      await base44.entities.AIGroupSummary.create({
        group_id: groupId,
        passage_ref: passageRef || '',
        summary: result.summary || '',
        key_points: result.key_points || [],
        action_questions: result.action_questions || [],
        prayer_prompt: result.prayer_prompt || '',
      }).catch(() => null);

      queryClient.invalidateQueries({ queryKey: ['ai-group-summary', groupId] });
      return result;
    },
  });

  const summary = generateMutation.data || latestSummary;
  const isLoading = generateMutation.isPending;

  return (
    <Card className="border-purple-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Study Assistant
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50"
              disabled={isLoading}
              onClick={() => { setMode('summary'); generateMutation.mutate('summary'); }}
            >
              {isLoading && mode === 'summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
              Summarize
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled={isLoading}
              onClick={() => { setMode('questions'); generateMutation.mutate('questions'); }}
            >
              {isLoading && mode === 'questions' ? <Loader2 className="w-3 h-3 animate-spin" /> : <HelpCircle className="w-3 h-3" />}
              Suggest Questions
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating AI insights…
          </div>
        )}

        {!isLoading && summary && (
          <>
            <div className="flex items-start gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">AI-generated content. Always verify with Scripture.</p>
            </div>

            {summary.summary && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Discussion Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
              </div>
            )}

            {summary.key_points?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Points</p>
                <ul className="space-y-1">
                  {summary.key_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-purple-500 font-bold flex-shrink-0">•</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.action_questions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Discussion Questions</p>
                <ul className="space-y-2">
                  {summary.action_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge className="text-xs bg-blue-100 text-blue-700 border-0 flex-shrink-0 mt-0.5">{i + 1}</Badge>
                      <span className="text-sm text-gray-700">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.prayer_prompt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                  🙏 Prayer Prompt
                </p>
                <p className="text-sm text-green-800 italic">{summary.prayer_prompt}</p>
              </div>
            )}

            {latestSummary && !generateMutation.data && (
              <p className="text-xs text-gray-400">From {new Date(latestSummary.created_date).toLocaleDateString()}</p>
            )}
          </>
        )}

        {!isLoading && !summary && (
          <p className="text-sm text-gray-500 text-center py-4">
            Click "Summarize" or "Suggest Questions" to get AI insights for your group discussion.
          </p>
        )}
      </CardContent>
    </Card>
  );
}