import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookMarked, Lightbulb, HelpCircle } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

export default function BibleStudyMode() {
  const { t } = useI18n();
  const [verseRef, setVerseRef] = useState('John 3:16');
  const [verseText, setVerseText] = useState('For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.');
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateStudy = async () => {
    if (!verseRef.trim() || !verseText.trim()) {
      setError('Please enter both verse reference and text');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('generateBibleStudyMode', {
        verse_reference: verseRef,
        verse_text: verseText,
        language: localStorage.getItem('faithlight_ui_lang') || 'en'
      });
      setStudy(response.data);
    } catch (err) {
      setError('Failed to generate study. Please try again.');
      console.error('[BibleStudyMode] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">📖 Interactive Bible Study</h1>
          <p className="text-indigo-700">Deep dive into any Bible verse with AI assistance</p>
        </div>

        {/* Input Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-600" />
              Enter Verse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verse Reference (e.g., John 3:16)
              </label>
              <Input
                placeholder="John 3:16"
                value={verseRef}
                onChange={(e) => setVerseRef(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verse Text
              </label>
              <Textarea
                placeholder="For God so loved the world..."
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                className="rounded-lg min-h-24"
              />
            </div>
            <Button
              onClick={generateStudy}
              disabled={loading || !verseRef.trim() || !verseText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5" />
                  Generate Study Guide
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Study Content */}
        {study && (
          <div className="space-y-6">
            {/* Simple Explanation */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">💬 Simple Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {study.simple_explanation}
                </p>
              </CardContent>
            </Card>

            {/* Historical Context */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">📚 Historical Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {study.historical_context}
                </p>
              </CardContent>
            </Card>

            {/* Key Words */}
            {study.key_words && study.key_words.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🔑 Key Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {study.key_words.map((word, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cross References */}
            {study.cross_references && study.cross_references.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🔗 Cross-References</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {study.cross_references.map((ref, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-gray-700">
                        <span className="font-semibold text-indigo-600">→</span>
                        {ref}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reflection Questions */}
            {study.reflection_questions && study.reflection_questions.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Reflection Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {study.reflection_questions.map((question, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="font-semibold text-indigo-600 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="text-gray-700">{question}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Personalized Prayer */}
            <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">🙏 Personalized Prayer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed italic">
                  {study.personalized_prayer}
                </p>
              </CardContent>
            </Card>

            {/* Study Another Button */}
            <Button
              onClick={generateStudy}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              Study Another Verse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}