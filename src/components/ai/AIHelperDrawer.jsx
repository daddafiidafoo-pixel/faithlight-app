import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Copy, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const EXPLANATION_MODES = {
  summary: { label: 'Summary', icon: '📖' },
  deep: { label: 'Deep Study', icon: '🔍' },
  theology: { label: 'Theology', icon: '⛪' },
};

export default function AIHelperDrawer({
  open = false,
  onOpenChange = null,
  reference = '',
  translationId = 'WEB',
  passages = [],
  context = 'bible', // 'bible', 'quiz', 'study-plan'
  user = null,
}) {
  const [mode, setMode] = useState('summary');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Auto-fetch explanation when drawer opens
  useEffect(() => {
    if (open && reference && !explanation && !loading) {
      fetchExplanation();
    }
  }, [open, reference, mode]);

  const getPromptForMode = () => {
    const passageText = passages.join('\n\n') || reference;
    const basePrompt = `Reference: ${reference}\nTranslation: ${translationId}\n\nPassage:\n${passageText}`;

    const modePrompts = {
      summary: `${basePrompt}\n\nProvide a clear, concise summary of this scripture passage in 2-3 sentences. Focus on the main message and practical takeaway.`,
      deep: `${basePrompt}\n\nProvide a detailed theological analysis including: historical context, key themes, original language insights (if applicable), and cross-references to related passages.`,
      theology: `${basePrompt}\n\nWhat are the core theological doctrines or principles taught in this passage? How does it connect to broader Christian theology?`,
    };

    return modePrompts[mode] || modePrompts.summary;
  };

  const fetchExplanation = async () => {
    if (!reference) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: getPromptForMode(),
      });
      setExplanation(response);
    } catch (err) {
      setError(
        err.message || 'Failed to generate explanation. Please try again.'
      );
      console.error('AI explanation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeedback = async (rating) => {
    if (!user?.id) {
      toast.error('Please log in to save feedback');
      return;
    }

    try {
      setFeedback(rating);
      // Could save to database if needed
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Feedback save error:', err);
    }
  };

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      toast.success('Copied to clipboard');
    }
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader className="flex items-start justify-between mb-6 pr-4">
          <div className="flex-1">
            <SheetTitle className="text-base">AI Bible Assistant</SheetTitle>
            <p className="text-xs text-gray-500 mt-1">
              {reference || 'Select a passage'}
            </p>
          </div>
        </SheetHeader>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Unable to Load</p>
              <p className="text-red-700 text-xs mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchExplanation}
                className="mt-2 h-7 text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Mode Selection */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2 uppercase">Study Mode</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(EXPLANATION_MODES).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  setExplanation(null);
                }}
                className={`p-2 rounded-lg border transition-all text-sm ${
                  mode === key
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="block text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-sm text-gray-500">
                {mode === 'summary' && 'Generating summary...'}
                {mode === 'deep' && 'Analyzing theology...'}
                {mode === 'theology' && 'Exploring doctrine...'}
              </p>
            </div>
          ) : explanation ? (
            <>
              {/* Explanation Content */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mt-3 mb-2 text-gray-900">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {explanation}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Feedback */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">Helpful?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveFeedback(5)}
                    className={`p-1.5 rounded transition-all ${
                      feedback === 5
                        ? 'bg-green-200 text-green-700'
                        : 'bg-white text-gray-400 hover:text-green-600'
                    }`}
                    title="Yes"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSaveFeedback(1)}
                    className={`p-1.5 rounded transition-all ${
                      feedback === 1
                        ? 'bg-red-200 text-red-700'
                        : 'bg-white text-gray-400 hover:text-red-600'
                    }`}
                    title="No"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Copy Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="w-full gap-2 h-9"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </Button>
            </>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">Select a study mode above to start</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        {!loading && explanation && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            AI-generated explanations are supplementary. Consult multiple sources and scholarly commentaries for complete understanding.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}