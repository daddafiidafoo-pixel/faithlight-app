import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader, FileText, MessageCircle, CheckSquare, Zap } from 'lucide-react';

export default function SessionSummaryViewer({ sessionId }) {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['session-summary', sessionId],
    queryFn: async () => {
      const summaries = await base44.entities.SessionSummary.filter({
        session_id: sessionId,
      });
      return summaries[0];
    },
    refetchInterval: summaries => {
      // Keep polling if status is "generating"
      return summaries?.status === 'generating' ? 2000 : false;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
            <p className="text-gray-600">Generating session summary with AI...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !summary) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Unable to generate summary</p>
              <p className="text-sm text-red-700">The AI summary could not be generated for this session.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summary.status === 'failed') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Summary generation failed</p>
              <p className="text-sm text-red-700">{summary.summary_text}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Session Summary
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            AI Generated
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="points">
              <MessageCircle className="w-4 h-4 mr-2" />
              Points ({summary.discussion_points?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="decisions">
              <CheckSquare className="w-4 h-4 mr-2" />
              Decisions ({summary.decisions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Zap className="w-4 h-4 mr-2" />
              Actions ({summary.action_items?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">Duration: {summary.duration_minutes} minutes</p>
              <p className="text-sm text-gray-600 mb-3">Participants: {summary.participants?.join(', ')}</p>
            </div>
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap text-gray-700">{summary.summary_text}</p>
            </div>
          </TabsContent>

          {/* Discussion Points Tab */}
          <TabsContent value="points" className="space-y-2">
            {summary.discussion_points && summary.discussion_points.length > 0 ? (
              summary.discussion_points.map((point, idx) => (
                <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">{point}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No discussion points captured</p>
            )}
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-2">
            {summary.decisions && summary.decisions.length > 0 ? (
              summary.decisions.map((decision, idx) => (
                <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-900">{decision}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No decisions made</p>
            )}
          </TabsContent>

          {/* Action Items Tab */}
          <TabsContent value="actions" className="space-y-2">
            {summary.action_items && summary.action_items.length > 0 ? (
              summary.action_items.map((action, idx) => (
                <div key={idx} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-orange-900 flex-1">{action.item}</p>
                    {action.due_date && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {new Date(action.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  {action.owner && (
                    <p className="text-xs text-orange-700 mt-1">Owner: {action.owner}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No action items</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}