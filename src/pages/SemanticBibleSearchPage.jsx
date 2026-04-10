import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Sparkles, Heart, BookOpen, Copy, Star, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const SUGGESTED_QUERIES = [
  { label: 'Feeling anxious', emoji: '😰', query: 'anxiety and fear, finding peace and trust in God' },
  { label: 'Need hope', emoji: '✨', query: 'hope when life feels hopeless and dark' },
  { label: 'Dealing with loss', emoji: '💙', query: 'grief, mourning, comfort in death and loss' },
  { label: 'Finding purpose', emoji: '🧭', query: 'purpose, calling, meaning in life from God' },
  { label: 'Forgiveness', emoji: '🕊️', query: 'forgiveness, grace, mercy, letting go of bitterness' },
  { label: 'Strength in weakness', emoji: '💪', query: 'strength when I am weak and tired' },
  { label: 'Marriage & relationships', emoji: '❤️', query: 'love, marriage, relationships and family' },
  { label: 'Financial stress', emoji: '💰', query: 'money, provision, trusting God with finances' },
  { label: 'Loneliness', emoji: '🌙', query: 'loneliness, isolation, God is always with me' },
  { label: 'Leadership', emoji: '👑', query: 'leadership, wisdom, guiding others well' },
];

export default function SemanticBibleSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedVerses, setSavedVerses] = useState(new Set());

  const runSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Biblical scholar. A user is searching the Bible for: "${q}"

Return a JSON array of 8 highly relevant Bible verses. For each verse include:
- reference: (e.g. "John 3:16")
- book: book name
- text: the full verse text (KJV or ESV style)
- relevanceScore: 1-10 how relevant this is
- theme: one-word theme (e.g. "Hope", "Peace", "Strength")
- why: 1-2 sentence explanation of why this verse relates to the query
- emotionalContext: one word describing the emotional context (e.g. "comforting", "inspiring", "challenging")

Return ONLY a valid JSON array, no other text.`,
        response_json_schema: {
          type: 'object',
          properties: {
            verses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  book: { type: 'string' },
                  text: { type: 'string' },
                  relevanceScore: { type: 'number' },
                  theme: { type: 'string' },
                  why: { type: 'string' },
                  emotionalContext: { type: 'string' },
                }
              }
            }
          }
        }
      });

      const verses = response?.verses || [];
      setResults({ query: q, verses: verses.sort((a, b) => b.relevanceScore - a.relevanceScore) });
    } catch (e) {
      toast.error('Search failed, please try again');
    }
    setLoading(false);
  };

  const copyVerse = (v) => {
    navigator.clipboard.writeText(`"${v.text}" — ${v.reference}`);
    toast.success('Verse copied!');
  };

  const toggleSave = (ref) => {
    setSavedVerses(prev => {
      const next = new Set(prev);
      if (next.has(ref)) { next.delete(ref); toast('Removed from saved'); }
      else { next.add(ref); toast.success('Verse saved!'); }
      return next;
    });
  };

  const THEME_COLORS = {
    Hope: 'bg-purple-100 text-purple-700',
    Peace: 'bg-blue-100 text-blue-700',
    Strength: 'bg-orange-100 text-orange-700',
    Love: 'bg-red-100 text-red-700',
    Faith: 'bg-indigo-100 text-indigo-700',
    Wisdom: 'bg-yellow-100 text-yellow-700',
    Grace: 'bg-pink-100 text-pink-700',
    Comfort: 'bg-teal-100 text-teal-700',
  };
  const getThemeColor = (theme) => THEME_COLORS[theme] || 'bg-gray-100 text-gray-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> AI-Powered Semantic Search
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Find Verses by <span className="text-indigo-600">Feeling</span></h1>
          <p className="text-gray-500 max-w-lg mx-auto">Search by emotions, life situations, or spiritual needs — not just keywords. Our AI understands what you're going through.</p>
        </div>

        {/* Search Box */}
        <div className="relative mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-base"
                placeholder="e.g. I'm feeling overwhelmed and need peace..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
              />
            </div>
            <Button onClick={() => runSearch()} disabled={loading || !query.trim()}
              className="px-6 py-4 h-auto rounded-2xl bg-indigo-600 hover:bg-indigo-700 gap-2 text-base font-semibold flex-shrink-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Search
            </Button>
          </div>
        </div>

        {/* Suggested Queries */}
        {!results && !loading && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-600 mb-3">Try searching for...</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map(s => (
                <button key={s.label} onClick={() => { setQuery(s.query); runSearch(s.query); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm">
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-6 shadow-md border border-indigo-100">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Searching the Scriptures...</p>
                <p className="text-sm text-gray-400">Finding verses that speak to your heart</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Results for: <span className="text-indigo-600">"{results.query}"</span></h2>
                <p className="text-sm text-gray-500 mt-0.5">{results.verses.length} verses found</p>
              </div>
              <button onClick={() => { setResults(null); setQuery(''); }} className="text-sm text-gray-400 hover:text-gray-600">
                Clear
              </button>
            </div>

            <div className="space-y-4">
              {results.verses.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  {/* Relevance bar */}
                  <div className="h-1 bg-gray-100">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${v.relevanceScore * 10}%` }} />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-indigo-700">{v.reference}</h3>
                        <Badge className={`text-xs ${getThemeColor(v.theme)}`}>{v.theme}</Badge>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{v.emotionalContext}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-500">{v.relevanceScore}/10</span>
                      </div>
                    </div>

                    {/* Verse text */}
                    <blockquote className="text-gray-800 leading-relaxed italic text-base mb-3 pl-3 border-l-4 border-indigo-200">
                      "{v.text}"
                    </blockquote>

                    {/* Why relevant */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{v.why}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyVerse(v)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button onClick={() => toggleSave(v.reference)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${savedVerses.has(v.reference) ? 'text-yellow-600 bg-yellow-50' : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                        <Star className={`w-3.5 h-3.5 ${savedVerses.has(v.reference) ? 'fill-yellow-400' : ''}`} />
                        {savedVerses.has(v.reference) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New search prompt */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm mb-3">Not what you were looking for?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUERIES.slice(0, 4).map(s => (
                  <button key={s.label} onClick={() => { setQuery(s.query); runSearch(s.query); }}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all">
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}