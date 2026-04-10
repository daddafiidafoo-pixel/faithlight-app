import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ModuleSummaryGenerator({ module, isDarkMode, onSummaryGenerated }) {
  const [showDialog, setShowDialog] = useState(false);
  const [summary, setSummary] = useState(null);
  const [takeaways, setTakeaways] = useState([]);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Create a comprehensive summary and key takeaways for a lesson/course on: "${module.title}".

The lesson covers: ${module.ai_summary || 'theological and biblical content'}

Please provide:
1. A 2-3 sentence overview of the main concepts
2. 5-7 key takeaways as actionable bullet points
3. How this connects to Christian living and faith

Format as JSON with keys: overview (string), takeaways (array of strings)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            takeaways: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setSummary(data.overview);
      setTakeaways(data.takeaways || []);
      onSummaryGenerated?.({
        ...module,
        ai_summary: data.overview,
        key_takeaways: data.takeaways
      });
      toast.success('Summary generated!');
    },
    onError: () => {
      toast.error('Failed to generate summary');
    }
  });

  const handleCopySummary = () => {
    const fullText = `${module.title}\n\n${summary}\n\nKey Takeaways:\n${takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Copied to clipboard!');
  };

  if (!module) return null;

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        size="sm"
        className="gap-2"
        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
      >
        <Sparkles className="w-4 h-4" />
        AI Summary
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: cardColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: textColor }}>
              {module.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!summary && !generateSummaryMutation.isPending ? (
              <Button
                onClick={() => generateSummaryMutation.mutate()}
                className="w-full gap-2"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                <Sparkles className="w-4 h-4" />
                Generate AI Summary
              </Button>
            ) : null}

            {generateSummaryMutation.isPending && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                <span className="ml-3" style={{ color: mutedColor }}>Generating summary...</span>
              </div>
            )}

            {summary && (
              <>
                {/* Overview */}
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: textColor }}>Overview</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>
                    {summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                {takeaways.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: textColor }}>Key Takeaways</h3>
                    <ul className="space-y-2">
                      {takeaways.map((takeaway, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-lg text-sm flex gap-3"
                          style={{ backgroundColor: bgColor }}
                        >
                          <span style={{ color: primaryColor }} className="font-bold flex-shrink-0">
                            {idx + 1}.
                          </span>
                          <span style={{ color: textColor }}>
                            {takeaway}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Copy Button */}
                <Button
                  onClick={handleCopySummary}
                  className="w-full gap-2"
                  variant="outline"
                  style={{ borderColor, color: textColor }}
                >
                  <Copy className="w-4 h-4" />
                  Copy Summary
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}