import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ChevronRight, Copy, Check } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

const SERMON_TOPICS = [
  'Faith',
  'Hope',
  'Love',
  'Forgiveness',
  'Courage',
  'Prayer',
  'Salvation',
  'Discipleship',
  'Grace',
  'Truth',
  'Joy',
  'Peace',
];

const AUDIENCES = [
  { id: 'general', label: 'General Congregation' },
  { id: 'youth', label: 'Youth & Young Adults' },
  { id: 'seniors', label: 'Seniors' },
  { id: 'families', label: 'Families' },
  { id: 'students', label: 'Students' },
  { id: 'leaders', label: 'Church Leaders' },
];

export default function SermonIllustrationGenerator() {
  const { t, lang } = useI18n();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [count, setCount] = useState(3);
  const [illustrations, setIllustrations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const handleGenerate = async () => {
    if (!topic) return;

    setLoading(true);
    setIllustrations(null);

    try {
      const response = await base44.functions.invoke('generateSermonIllustrations', {
        topic: topic,
        audience: audience,
        count: count,
        userLanguage: lang,
      });

      setIllustrations(response.data.illustrations);
    } catch (err) {
      console.error('Error generating illustrations:', err);
      alert('Failed to generate illustrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('sermon.illustrationTitle', 'Sermon Illustration Generator')}
            </h1>
          </div>
          <p className="text-gray-600">
            {t('sermon.illustrationDesc', 'Generate biblical sermon illustrations for your topic and audience')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT: Input Controls */}
          <Card className="shadow-lg border-blue-200 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {t('sermon.illustrationInput', 'Generate Illustrations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  {t('sermon.selectTopic', 'Sermon Topic')}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Faith, Forgiveness..."
                  list="topics-list"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="topics-list">
                  {SERMON_TOPICS.map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Audience Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  {t('sermon.selectAudience', 'Target Audience')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCES.map(aud => (
                    <button
                      key={aud.id}
                      onClick={() => setAudience(aud.id)}
                      className={`p-3 rounded-lg border text-center text-xs font-medium transition-all ${
                        audience === aud.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  {t('sermon.numberIllustrations', 'Number of Illustrations')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-blue-600 min-w-fit">{count}</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!topic || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('sermon.generating', 'Generating...')}
                  </>
                ) : (
                  <>
                    {t('sermon.generate', 'Generate Illustrations')}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT: Results */}
          {illustrations && (
            <div className="space-y-4">
              {illustrations.content.split(/Illustration \d+:/i).slice(1).map((content, idx) => {
                const id = `ill-${idx}`;
                return (
                  <Card key={id} className="shadow-md border-blue-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">
                          {t('sermon.illustration', 'Illustration')} {idx + 1}
                        </CardTitle>
                        <button
                          onClick={() => handleCopy(content.trim(), id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copied === id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {content.trim()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!illustrations && !loading && (
            <Card className="shadow-lg border-gray-200 bg-gray-50">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 text-sm">
                  {t('sermon.noIllustrations', 'Select a topic and audience to generate illustrations')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}