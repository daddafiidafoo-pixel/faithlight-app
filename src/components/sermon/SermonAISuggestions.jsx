import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SermonAISuggestions({ theme, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  const generateSuggestions = async () => {
    if (!theme?.trim()) {
      toast.error('Please enter a theme first');
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are a sermon planning assistant. Based on the theme: "${theme}", provide JSON with:
1. relatedSermonIdeas: array of 3 alternative sermon angles/titles for this theme
2. suggestedVerses: array of 5 Bible verses highly relevant to this theme (format: "Book Chapter:Verse")
3. sermonOutline: object with 3 key points, each having a title and brief explanation

Return ONLY valid JSON, no markdown or extra text.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            relatedSermonIdeas: {
              type: 'array',
              items: { type: 'string' },
              description: 'Alternative sermon ideas/angles'
            },
            suggestedVerses: {
              type: 'array',
              items: { type: 'string' },
              description: 'Bible verse references'
            },
            sermonOutline: {
              type: 'object',
              properties: {
                point1: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    explanation: { type: 'string' }
                  }
                },
                point2: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    explanation: { type: 'string' }
                  }
                },
                point3: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    explanation: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
      setExpandedSection('ideas');
      toast.success('Suggestions generated!');
    } catch (error) {
      console.error('[SermonAISuggestions] Error:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4" style={{ backgroundColor: cardColor, borderColor }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} style={{ color: '#6C5CE7' }} />
        <h3 className="font-semibold" style={{ color: textColor }}>AI Sermon Suggestions</h3>
      </div>

      <p className="text-sm" style={{ color: mutedColor }}>
        Get AI-powered ideas, verse suggestions, and outlines for your sermon theme.
      </p>

      <Button
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full gap-2"
        style={{ backgroundColor: '#6C5CE7', color: '#FFFFFF' }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating suggestions...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Suggestions
          </>
        )}
      </Button>

      {suggestions && (
        <div className="space-y-3">
          {/* Related Sermon Ideas */}
          <div className="border rounded-lg" style={{ borderColor }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'ideas' ? null : 'ideas')}
              className="w-full p-3 flex items-center justify-between hover:opacity-80 transition-opacity"
              style={{ backgroundColor: bgColor }}
            >
              <span className="font-semibold text-sm" style={{ color: textColor }}>
                💡 Related Sermon Ideas ({suggestions.relatedSermonIdeas?.length || 0})
              </span>
              {expandedSection === 'ideas' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === 'ideas' && (
              <div className="p-3 border-t space-y-2" style={{ borderColor }}>
                {suggestions.relatedSermonIdeas?.map((idea, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="font-bold" style={{ color: '#6C5CE7' }}>•</span>
                    <p style={{ color: textColor }}>{idea}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Verses */}
          <div className="border rounded-lg" style={{ borderColor }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'verses' ? null : 'verses')}
              className="w-full p-3 flex items-center justify-between hover:opacity-80 transition-opacity"
              style={{ backgroundColor: bgColor }}
            >
              <span className="font-semibold text-sm" style={{ color: textColor }}>
                📖 Suggested Verses ({suggestions.suggestedVerses?.length || 0})
              </span>
              {expandedSection === 'verses' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === 'verses' && (
              <div className="p-3 border-t space-y-2" style={{ borderColor }}>
                {suggestions.suggestedVerses?.map((verse, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="font-bold text-indigo-500">{idx + 1}.</span>
                    <p style={{ color: textColor }} className="font-mono">{verse}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sermon Outline */}
          <div className="border rounded-lg" style={{ borderColor }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'outline' ? null : 'outline')}
              className="w-full p-3 flex items-center justify-between hover:opacity-80 transition-opacity"
              style={{ backgroundColor: bgColor }}
            >
              <span className="font-semibold text-sm" style={{ color: textColor }}>
                📋 Sermon Outline (3 Points)
              </span>
              {expandedSection === 'outline' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === 'outline' && (
              <div className="p-3 border-t space-y-3" style={{ borderColor }}>
                {['point1', 'point2', 'point3'].map((pointKey, idx) => {
                  const point = suggestions.sermonOutline?.[pointKey];
                  return (
                    <div key={pointKey} className="pb-3 border-b last:border-b-0" style={{ borderColor }}>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: '#6C5CE7' }}>
                        {idx + 1}. {point?.title}
                      </h4>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {point?.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}