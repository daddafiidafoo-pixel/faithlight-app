import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader, Copy, Check } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

export default function BibleComparison() {
  const { t, lang } = useI18n();
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [verse, setVerse] = useState('16');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [copied, setCopied] = useState(false);

  const BOOKS = [
    'Genesis', 'Exodus', 'Psalms', 'Matthew', 'Mark', 'Luke', 'John',
    'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    'Hebrews', 'James', 'Peter', 'John', 'Revelation'
  ];

  const TRANSLATIONS = [
    { code: 'WEB', name: 'World English Bible' },
    { code: 'KJV', name: 'King James Version' },
    { code: 'NASB', name: 'NASB' },
    { code: 'ESV', name: 'English Standard Version' },
  ];

  const comparePassage = async () => {
    if (!book || !chapter) {
      alert(lang === 'om' ? 'Kitaaba fi lakkaata barreeshi' : 'Please enter a book and chapter');
      return;
    }

    setLoading(true);
    try {
      const reference = `${book} ${chapter}:${verse || ''}`.trim();

      const systemPrompt = lang === 'om'
        ? `Ati barsiisaa waaqa waaqeffannaa keessatti hojjuu danda'a. Versiyoonota Kitaaba Waaqaa garaa gidduutti walbira qabu:
1. Versiyoonota garaa gidduutti walbira qabu
2. Garaagarummaa sirii hiika
3. Seenaa falmii
4. Fayyadhama praktiikaa
Verse: "${reference}"
Hiikuu ofirra seena keessaa.`
        : `Compare different Bible translations of this passage: "${reference}". Include:
1. Side-by-side translations (KJV, WEB, ESV, NASB)
2. Key differences explained
3. Historical context
4. Theological significance
5. Practical application`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare the verse ${reference} across different Bible translations (KJV, WEB, ESV, NASB). Show how the language differs and explain the theological implications.`,
        response_json_schema: {
          type: 'object',
          properties: {
            reference: { type: 'string' },
            translations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  code: { type: 'string' },
                  text: { type: 'string' },
                },
              },
            },
            keyDifferences: { type: 'array', items: { type: 'string' } },
            historicalContext: { type: 'string' },
            theologicalSignificance: { type: 'string' },
            practicalApplication: { type: 'string' },
          },
        },
      });

      setComparison(response.data);
    } catch (error) {
      console.error('Error comparing passage:', error);
      alert(lang === 'om' ? 'Dogoggora walbira qabu' : 'Error comparing passage');
    } finally {
      setLoading(false);
    }
  };

  const copyComparison = () => {
    if (!comparison) return;

    const text = `
Bible Translation Comparison: ${comparison.reference}

TRANSLATIONS:
${comparison.translations?.map(t => `
${t.name} (${t.code}):
"${t.text}"
`).join('\n')}

KEY DIFFERENCES:
${comparison.keyDifferences?.map(d => `• ${d}`).join('\n')}

HISTORICAL CONTEXT:
${comparison.historicalContext}

THEOLOGICAL SIGNIFICANCE:
${comparison.theologicalSignificance}

PRACTICAL APPLICATION:
${comparison.practicalApplication}
    `;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--faith-light-primary-dark)] mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[var(--faith-light-accent)]" />
          {lang === 'om' ? 'Walbira Qayyummaa' : 'Bible Translation Comparison'}
        </h1>
        <p className="text-gray-600">
          {lang === 'om'
            ? 'Versiyoonota Kitaaba garaa gidduutti walbira qabu'
            : 'Compare how different Bible translations render the same passage'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === 'om' ? 'Filadhu Verse' : 'Select Passage'}
            </CardTitle>
            <CardDescription>
              {lang === 'om' ? 'Verse filadhu walbira qabuuf' : 'Choose a Bible passage'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'om' ? 'Kitaaba' : 'Book'}
              </label>
              <select
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
              >
                {BOOKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Lakkaata' : 'Chapter'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Verse' : 'Verse'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  placeholder={lang === 'om' ? 'Filadhu' : 'Optional'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                />
              </div>
            </div>

            <Button
              onClick={comparePassage}
              disabled={loading || !book}
              className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {lang === 'om' ? 'Walbira...' : 'Comparing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {lang === 'om' ? 'Walbira Qabu' : 'Compare'}
                </>
              )}
            </Button>

            <div className="bg-blue-50 p-3 rounded-lg text-xs text-gray-700">
              <p className="font-semibold mb-2">{lang === 'om' ? 'Gargaarsa' : 'Tip'}:</p>
              <p>
                {lang === 'om'
                  ? 'Verse lakkaata baruu utuu ittaa, chapter hundaa walbira qabu.'
                  : 'Leave verse blank to compare the entire chapter.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Display */}
        {comparison ? (
          <Card className="lg:col-span-2 border-2 border-[var(--faith-light-primary)]">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{comparison.reference}</CardTitle>
                  <CardDescription>
                    {lang === 'om' ? 'Walbira qayyummaa' : 'Translation Comparison'}
                  </CardDescription>
                </div>
                <Button
                  onClick={copyComparison}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {lang === 'om' ? 'Haftee' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {lang === 'om' ? 'Gadi Qabuu' : 'Copy'}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[700px] overflow-y-auto">
              {/* Translations */}
              {comparison.translations && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {lang === 'om' ? 'Versiyoonota' : 'Translations'}
                  </h3>
                  <div className="space-y-3">
                    {comparison.translations.map((trans, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-[var(--faith-light-primary)]">
                        <div className="font-semibold text-gray-900 text-sm mb-2">
                          {trans.name} ({trans.code})
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          "{trans.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Differences */}
              {comparison.keyDifferences && comparison.keyDifferences.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {lang === 'om' ? 'Garaagarummaa Sirii' : 'Key Differences'}
                  </h3>
                  <ul className="space-y-2">
                    {comparison.keyDifferences.map((diff, idx) => (
                      <li key={idx} className="text-gray-700 text-sm">
                        • {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Historical Context */}
              {comparison.historicalContext && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'om' ? 'Seenaa Hayyummaa' : 'Historical Context'}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comparison.historicalContext}
                  </p>
                </div>
              )}

              {/* Theological Significance */}
              {comparison.theologicalSignificance && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'om' ? 'Garaagarummaa Waaqeffannaa' : 'Theological Significance'}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comparison.theologicalSignificance}
                  </p>
                </div>
              )}

              {/* Practical Application */}
              {comparison.practicalApplication && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'om' ? 'Fayyadhama Praktiikaa' : 'Practical Application'}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comparison.practicalApplication}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {lang === 'om'
                    ? 'Walbira qayyummaa keessanuu argii'
                    : 'Your comparison will appear here'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}