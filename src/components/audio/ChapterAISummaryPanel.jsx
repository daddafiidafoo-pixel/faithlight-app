import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, X, BookOpen, Lightbulb, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ChapterAISummaryPanel({ book, chapter, verses, isDarkMode }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const primaryColor = isDarkMode ? '#8FB996' : '#6366F1';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6B7280';
  const cardColor = isDarkMode ? '#1A2520' : '#F0F4FF';
  const borderColor = isDarkMode ? '#2A3F35' : '#C7D2FE';

  const generate = async () => {
    if (!verses || verses.length === 0) { toast.error('No verses loaded yet'); return; }
    setLoading(true);
    setOpen(true);
    setSummary(null);
    try {
      const verseText = verses.slice(0, 80).map(v => `${v.verse}. ${v.text}`).join('\n');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize ${book} chapter ${chapter} from the Bible. Structure your response as JSON with these fields:
- overview: 2-3 sentence overview of what happens in this chapter
- key_themes: array of 3-4 short theme labels (e.g., "Faith", "Redemption")
- key_events: array of 3 short bullet points of major events or teachings
- spiritual_lesson: 1-2 sentences on the main spiritual application or lesson

Be concise, clear, and spiritually insightful. The audience is everyday Bible readers.

CHAPTER TEXT:
${verseText}`,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            key_themes: { type: 'array', items: { type: 'string' } },
            key_events: { type: 'array', items: { type: 'string' } },
            spiritual_lesson: { type: 'string' },
          }
        }
      });
      setSummary(result);
    } catch (e) {
      toast.error('Failed to generate summary');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={generate}
        disabled={loading}
        className="gap-2 w-full sm:w-auto"
        style={{ borderColor: primaryColor, color: primaryColor }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Generating Summary…' : `AI Summary: ${book} ${chapter}`}
      </Button>

      {/* Summary Panel */}
      {open && (
        <Card className="mt-4" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="font-semibold text-sm" style={{ color: textColor }}>
                  {book} {chapter} — AI Summary
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-black/10 transition-colors"
                style={{ color: mutedColor }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading && (
              <div className="flex flex-col items-center py-6 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                <p className="text-sm" style={{ color: mutedColor }}>Analyzing chapter…</p>
              </div>
            )}

            {summary && !loading && (
              <div className="space-y-4">
                {/* Overview */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>Overview</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: textColor }}>{summary.overview}</p>
                </div>

                {/* Key Themes */}
                {summary.key_themes?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: mutedColor }}>Key Themes</span>
                    <div className="flex flex-wrap gap-2">
                      {summary.key_themes.map((theme, i) => (
                        <Badge
                          key={i}
                          className="text-xs"
                          style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40` }}
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Events */}
                {summary.key_events?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Lightbulb className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: mutedColor }}>Key Events</span>
                    </div>
                    <ul className="space-y-1">
                      {summary.key_events.map((ev, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: textColor }}>
                          <span style={{ color: primaryColor }} className="mt-0.5 flex-shrink-0">•</span>
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Spiritual Lesson */}
                {summary.spiritual_lesson && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}15`, border: `1px solid ${primaryColor}30` }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>Spiritual Lesson</span>
                    </div>
                    <p className="text-sm italic leading-relaxed" style={{ color: textColor }}>{summary.spiritual_lesson}</p>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 mt-1"
                  onClick={generate}
                  style={{ borderColor, color: mutedColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  Regenerate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}