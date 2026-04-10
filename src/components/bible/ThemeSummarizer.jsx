import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, BookOpen } from 'lucide-react';

export default function ThemeSummarizer({ book, themes, isDarkMode }) {
  const [summary, setSummary] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const generateSummary = useMutation({
    mutationFn: async () => {
      if (!selectedTheme) return;

      const prompt = `Provide a comprehensive summary of the theme "${selectedTheme}" throughout the book of ${book} in the Bible.

Include:
1. Overview of how this theme appears in the book
2. Key passages that exemplify this theme (list 3-5 with references)
3. How this theme develops throughout the narrative
4. Theological significance
5. Practical application for modern believers

Keep it educational and accessible.`;

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true
        });

        setSummary(response);
      } catch (error) {
        console.error('Error generating summary:', error);
        setSummary('Unable to generate summary. Please try again.');
      }
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent style={{
        backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF'
      }} className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Key Themes in {book}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!summary ? (
            <>
              <p className="text-sm text-gray-600">Select a theme to explore in depth:</p>
              <div className="grid grid-cols-1 gap-2">
                {(themes || ['Redemption', 'Faith', 'Covenant', 'Judgment', 'Grace']).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 rounded border text-left text-sm transition ${
                      selectedTheme === theme
                        ? 'border-indigo-600 bg-indigo-50 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => generateSummary.mutate()}
                disabled={!selectedTheme || generateSummary.isPending}
                className="w-full gap-2"
              >
                {generateSummary.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  'Summarize Theme'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{selectedTheme} in {book}</h3>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSummary('');
                  setSelectedTheme('');
                }}
                className="w-full"
              >
                Explore Another Theme
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}