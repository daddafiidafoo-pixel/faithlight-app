import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageSquare, Sparkles, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscussionSummarizer({ discussionId, discussionTitle }) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateDiscussionSummary = async () => {
    if (!discussionId) {
      toast.error('No discussion to summarize');
      return;
    }

    setLoading(true);
    try {
      // Fetch discussion and replies
      const discussion = await base44.entities.GroupDiscussion.filter(
        { id: discussionId },
        '-created_date',
        1
      );

      if (!discussion.length) {
        toast.error('Discussion not found');
        setLoading(false);
        return;
      }

      const discussionData = discussion[0];
      
      // Build discussion text with initial post
      let discussionText = `Title: ${discussionData.thread_title}\nTopic: ${discussionData.topic}\n\nInitial Post:\n${discussionData.initial_post}\n\n`;

      // Note: In a real app, you'd fetch replies from a DiscussionReply entity
      // For now, we'll use what we have in the discussion object
      
      const prompt = `Summarize this biblical discussion thread comprehensively. Include:

1. Discussion Overview (2-3 sentences about what the discussion covers)
2. Main Arguments/Perspectives (3-5 key viewpoints presented)
3. Consensus or Key Agreements (any points of agreement)
4. Disputed Points (any areas of disagreement or debate)
5. Scripture References (Bible verses mentioned or relevant)
6. Practical Takeaways (how this applies to daily life/faith)

Discussion:
${discussionText}

Format the response as structured JSON with clear sections.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            main_arguments: { 
              type: 'array',
              items: { type: 'string' }
            },
            consensus: { type: 'string' },
            disputed_points: { 
              type: 'array',
              items: { type: 'string' }
            },
            scripture_references: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  context: { type: 'string' }
                }
              }
            },
            practical_takeaways: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['overview', 'main_arguments', 'scripture_references']
        }
      });

      setSummary(result);
      toast.success('Discussion summary generated');
    } catch (error) {
      console.error('Error summarizing discussion:', error);
      toast.error('Failed to summarize discussion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          generateDiscussionSummary();
        }}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Summarize Discussion
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion Summary
            </DialogTitle>
          </DialogHeader>

          {summary ? (
            <div className="space-y-4">
              {/* Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{summary.overview}</p>
                </CardContent>
              </Card>

              {/* Main Arguments */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Main Arguments & Perspectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.main_arguments?.map((arg, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="font-bold text-indigo-600 flex-shrink-0">{idx + 1}.</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Consensus */}
              {summary.consensus && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Points of Agreement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{summary.consensus}</p>
                  </CardContent>
                </Card>
              )}

              {/* Disputed Points */}
              {summary.disputed_points?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Areas of Debate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.disputed_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Scripture References */}
              {summary.scripture_references?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Scripture References
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {summary.scripture_references.map((ref, idx) => (
                        <div key={idx} className="bg-blue-50 rounded p-3 border border-blue-200">
                          <p className="font-semibold text-sm text-blue-900">{ref.reference}</p>
                          <p className="text-xs text-gray-600 mt-1">{ref.context}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Practical Takeaways */}
              {summary.practical_takeaways?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Practical Takeaways</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.practical_takeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Generating summary...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}