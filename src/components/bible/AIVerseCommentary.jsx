import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, BookOpen, Zap, Brain } from 'lucide-react';
import DeepVerseAnalysis from './DeepVerseAnalysis';
import UpsellModal from '../premium/UpsellModal';
import { useUpsellEngine } from '../hooks/useUpsellEngine';
import { useLanguageStore } from '../languageStore';

const getExplanationLanguage = (langCode) => {
  switch (langCode) {
    case 'sw': return 'Kiswahili';
    case 'om': return 'Afaan Oromoo';
    case 'ar': return 'Arabic';
    case 'fr': return 'French';
    case 'am': return 'Amharic';
    case 'ti': return 'Tigrinya';
    default: return 'English';
  }
};

export default function AIVerseCommentary({ book, chapter, verse, endVerse, translation, verseText, isDarkMode, user, plan }) {
  const aiLanguage = useLanguageStore((s) => s.aiLanguage);
  const engine = useUpsellEngine(user, plan);
  const [showCommentary, setShowCommentary] = useState(false);

  // Try to fetch existing commentary
  const { data: existingCommentary } = useQuery({
    queryKey: ['verseCommentary', book, chapter, verse, translation, aiLanguage],
    queryFn: async () => {
      try {
        const result = await base44.entities.VerseCommentary.filter({
          book,
          chapter,
          verse_start: verse,
          translation,
          language: aiLanguage
        }, '-created_date', 1);
        return result.length > 0 ? result[0] : null;
      } catch (error) {
        return null;
      }
    },
  });

  // Generate commentary if needed
  const [commentary, setCommentary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refetch when language changes
  useEffect(() => {
    setCommentary(existingCommentary || null);
  }, [existingCommentary, aiLanguage]);

  const generateCommentary = async () => {
    // Check AI usage gate
    const allowed = await engine.checkAIExplain();
    if (!allowed) return;

    setLoading(true);
    await engine.logAIExplain();
    try {
      const explanationLang = getExplanationLanguage(aiLanguage);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical commentary expert. Provide detailed theological insights for this verse IN ${explanationLang.toUpperCase()}.

VERSE: ${book} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''}
TEXT: "${verseText}"
TRANSLATION: ${translation}

Please provide all responses in ${explanationLang}:
1. THEOLOGICAL INSIGHTS: Deep theological meaning and significance
2. HISTORICAL CONTEXT: Cultural, historical, and geographical context
3. KEY CONCEPTS: Main theological concepts (list 3-5)
4. CROSS REFERENCES: 2-3 related verses with brief explanations
5. PRACTICAL APPLICATION: How to apply this in modern Christian life

Return a JSON object with keys: theological_insights, historical_context, key_concepts (array), cross_references (array with 'reference' and 'similarity' fields), practical_application.
ALL TEXT MUST BE IN ${explanationLang}.`,
        response_json_schema: {
          type: 'object',
          properties: {
            theological_insights: { type: 'string' },
            historical_context: { type: 'string' },
            key_concepts: { type: 'array', items: { type: 'string' } },
            cross_references: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  similarity: { type: 'string' }
                }
              }
            },
            practical_application: { type: 'string' }
          }
        }
      });

      // Save to database
      const saved = await base44.entities.VerseCommentary.create({
        book,
        chapter,
        verse_start: verse,
        verse_end: endVerse || verse,
        verse_text: verseText,
        translation,
        language: aiLanguage,
        theological_insights: response.theological_insights,
        historical_context: response.historical_context,
        key_concepts: response.key_concepts,
        cross_references: response.cross_references,
        practical_application: response.practical_application,
        ai_model: 'GPT-based LLM'
      });

      setCommentary(saved);
    } catch (error) {
      console.error('Error generating commentary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <UpsellModal open={engine.upsellOpen} onClose={engine.closeUpsell} reason={engine.upsellReason} />
      {/* Deep contextual analysis — cross-refs, historical context, Greek/Hebrew, reflection */}
      <DeepVerseAnalysis book={book} chapter={chapter} verse={verse} verseText={verseText} isDarkMode={isDarkMode} />

      {!showCommentary ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowCommentary(true);
            if (!commentary) {
              generateCommentary();
            }
          }}
          className="gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Theological Insights
        </Button>
      ) : (
        <Card style={{
          backgroundColor: isDarkMode ? '#1A1F1C' : '#F9FAFB',
          borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4" />
              AI Commentary
            </CardTitle>
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ AI-generated study notes — not a Bible translation. Always compare with your licensed Bible text.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : commentary ? (
              <div className="divide-y divide-gray-100 -mx-6">
                {[
                  { icon: Zap, label: 'Historical Context', content: commentary.historical_context, color: 'text-amber-600 bg-amber-50' },
                  { icon: Lightbulb, label: 'Theological Insights', content: commentary.theological_insights, color: 'text-indigo-600 bg-indigo-50' },
                  { icon: BookOpen, label: 'Life Application', content: commentary.practical_application, color: 'text-green-600 bg-green-50' },
                ].map(({ icon: Icon, label, content, color }) => content ? (
                  <div key={label} className="px-6 py-4">
                    <h4 className="flex items-center gap-2 font-bold text-sm mb-2">
                      <span className={`p-1 rounded-md ${color}`}><Icon className="w-3.5 h-3.5" /></span>
                      {label}
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700">{content}</p>
                  </div>
                ) : null)}

                {commentary.key_concepts?.length > 0 && (
                  <div className="px-6 py-4">
                    <h4 className="font-bold text-sm mb-2 text-gray-800">Key Concepts</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {commentary.key_concepts.map((concept, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {commentary.cross_references?.length > 0 && (
                  <div className="px-6 py-4">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-gray-800">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Related Verses
                    </h4>
                    <ul className="space-y-2">
                      {commentary.cross_references.map((ref, idx) => (
                        <li key={idx} className="text-xs bg-gray-50 rounded-lg px-3 py-2">
                          <span className="font-bold text-indigo-700">{ref.reference}</span>
                          <span className="text-gray-500 ml-1.5">— {ref.similarity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No commentary available</p>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentary(false)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}