import React, { useState, useEffect } from 'react';
import { Search, Clock, TrendingUp, X, BookOpen, Heart, MapPin, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const TRENDING_TOPICS = [
  { label: 'Peace', emoji: '🕊️', query: 'peace' },
  { label: 'Anxiety', emoji: '😟', query: 'do not be anxious' },
  { label: 'Comfort', emoji: '🤗', query: 'comfort in suffering' },
  { label: 'Strength', emoji: '💪', query: 'strength in weakness' },
  { label: 'Hope', emoji: '🌅', query: 'hope for the future' },
  { label: 'Forgiveness', emoji: '🤍', query: 'forgive one another' },
  { label: 'Love', emoji: '❤️', query: 'love one another' },
  { label: 'Fear Not', emoji: '✨', query: 'do not fear' },
  { label: 'Healing', emoji: '🙏', query: 'healing and restoration' },
  { label: 'Wisdom', emoji: '📖', query: 'wisdom from above' },
];

const EMOTIONAL_TOPICS = [
  { label: 'Feeling Anxious', query: 'do not be anxious', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Seeking Comfort', query: 'comfort in trouble', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Feeling Hopeless', query: 'hope in God', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Need Strength', query: 'strength from the Lord', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Feeling Lonely', query: 'God is with you', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'Grieving', query: 'mourn and be comforted', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { label: 'Grateful', query: 'thanksgiving and praise', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Seeking Purpose', query: 'plans to prosper you', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const RANGE_OPTIONS = [
  { label: 'Psalms', range: 'Psalms' },
  { label: 'Proverbs', range: 'Proverbs' },
  { label: 'New Testament', range: 'New Testament' },
  { label: 'Gospels', range: 'Matthew Mark Luke John' },
  { label: 'Paul\'s Letters', range: 'Romans Corinthians Galatians Ephesians' },
  { label: 'Prophets', range: 'Isaiah Jeremiah Ezekiel Daniel' },
];

const HISTORY_KEY = 'fl_search_history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function addToHistory(q) {
  if (!q.trim()) return;
  const h = getHistory().filter(x => x !== q).slice(0, 9);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...h]));
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [rangeFilter, setRangeFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState(getHistory);
  const [activeTab, setActiveTab] = useState('keyword'); // keyword | emotional | range

  const doSearch = async (q, range = '') => {
    const finalQuery = range ? `${q} ${range}` : q;
    if (!finalQuery.trim()) return;
    addToHistory(q);
    setHistory(getHistory());
    setQuery(q);
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const { data } = await base44.functions.invoke('faithAIEngine', {
        action: 'search_verses',
        query: finalQuery,
        limit: 10,
      });
      // faithAIEngine returns verses or we fall back to a structured AI response
      if (data?.verses) {
        setResults(data.verses);
      } else {
        // Use InvokeLLM as fallback
        const aiResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Find 6 Bible verses about: "${finalQuery}". Return as JSON array with fields: reference (e.g. John 3:16), text (full verse), book, relevance (brief 1-sentence explanation why it fits).`,
          response_json_schema: {
            type: 'object',
            properties: {
              verses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    reference: { type: 'string' },
                    text: { type: 'string' },
                    book: { type: 'string' },
                    relevance: { type: 'string' },
                  },
                },
              },
            },
          },
        });
        setResults(aiResult?.verses || []);
      }
    } catch {
      // Fallback: show placeholder
      setResults([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(query, rangeFilter);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-600" /> Advanced Bible Search
          </h1>
          <p className="text-sm text-gray-500 mt-1">Search by keywords, emotions, or Bible range</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search verses, topics, keywords..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'keyword', label: 'Keywords', icon: <Search className="w-3.5 h-3.5" /> },
            { id: 'emotional', label: 'How I Feel', icon: <Heart className="w-3.5 h-3.5" /> },
            { id: 'range', label: 'By Range', icon: <BookOpen className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content (shown when not searched) */}
        {!searched && (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === 'keyword' && (
                <div className="space-y-5">
                  {/* Recent searches */}
                  {history.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Recent Searches
                        </p>
                        <button onClick={() => { clearHistory(); setHistory([]); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {history.map((h, i) => (
                          <button key={i} onClick={() => doSearch(h)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-400 hover:text-purple-700 transition-colors shadow-sm">
                            <Clock className="w-3 h-3 text-gray-400" /> {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5" /> Trending Topics
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {TRENDING_TOPICS.map(t => (
                        <button
                          key={t.query}
                          onClick={() => doSearch(t.query)}
                          className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-300 hover:shadow transition-all text-left"
                        >
                          <span className="text-lg">{t.emoji}</span>
                          <span className="text-sm font-medium text-gray-800">{t.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emotional' && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Select how you're feeling to find comforting verses:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EMOTIONAL_TOPICS.map(t => (
                      <button
                        key={t.label}
                        onClick={() => doSearch(t.query)}
                        className={`px-3 py-3 rounded-xl border text-sm font-semibold text-left hover:opacity-80 transition-opacity ${t.color}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'range' && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Filter results to a specific Bible section:</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {RANGE_OPTIONS.map(r => (
                      <button
                        key={r.range}
                        onClick={() => setRangeFilter(r.range === rangeFilter ? '' : r.range)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${rangeFilter === r.range ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {rangeFilter && (
                    <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700 flex items-center justify-between">
                      <span>Filtering: <strong>{RANGE_OPTIONS.find(r => r.range === rangeFilter)?.label}</strong></span>
                      <button onClick={() => setRangeFilter('')}><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  {rangeFilter && (
                    <button
                      onClick={() => doSearch(query || 'faith hope love', rangeFilter)}
                      className="mt-3 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors"
                    >
                      Search in {RANGE_OPTIONS.find(r => r.range === rangeFilter)?.label}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <p className="text-sm text-gray-500">Searching Scripture…</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">{results.length} verses found</p>
              <button onClick={() => { setSearched(false); setResults([]); }} className="text-xs text-purple-600 hover:underline">New Search</button>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No results found. Try different keywords.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                  >
                    <p className="text-xs font-bold text-purple-600 mb-1.5">{v.reference}</p>
                    <p className="text-sm text-gray-800 leading-relaxed italic">"{v.text}"</p>
                    {v.relevance && (
                      <p className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-2 py-1.5">{v.relevance}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}