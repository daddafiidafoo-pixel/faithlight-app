import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Loader2, Copy, Plus, RefreshCw, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const BIBLE_VERSIONS = [
  { value: 'KJV', label: 'KJV - King James Version' },
  { value: 'NIV', label: 'NIV - New International Version' },
  { value: 'ESV', label: 'ESV - English Standard Version' },
  { value: 'NKJV', label: 'NKJV - New King James Version' },
  { value: 'NLT', label: 'NLT - New Living Translation' },
  { value: 'WEB', label: 'WEB - World English Bible (Public Domain)' },
  { value: 'ASV', label: 'ASV - American Standard Version (Public Domain)' },
  { value: 'NASB', label: 'NASB - New American Standard Bible' },
  { value: 'CSB', label: 'CSB - Christian Standard Bible' },
];

export default function ScriptureLookup({ onInsert }) {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('KJV');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingCrossRefs, setLoadingCrossRefs] = useState(false);
  const [crossRefs, setCrossRefs] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setResults(null);
    setCrossRefs(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Bible scholar. The user is searching for: "${q}" in ${version}.

If this looks like a scripture reference (e.g. "John 3:16", "Romans 8:28", "Psalm 23:1-3"), return the verse text(s) verbatim from ${version}.
If this looks like a keyword/topic search (e.g. "faith", "grace", "love"), return the top 5 most relevant and well-known Bible verses related to that topic.

Respond with a JSON object:
- query_type: "reference" or "topic"
- matched_reference: the canonical reference string (e.g. "John 3:16" or "Verses about Faith")
- verses: array of objects with { reference: string, text: string, version: string }
- context_note: optional brief note about the passage or topic (1-2 sentences)`,
        response_json_schema: {
          type: 'object',
          properties: {
            query_type: { type: 'string' },
            matched_reference: { type: 'string' },
            verses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  text: { type: 'string' },
                  version: { type: 'string' },
                },
              },
            },
            context_note: { type: 'string' },
          },
        },
      });
      setResults(result);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCrossRefs = async (verseRef) => {
    setSelectedVerse(verseRef);
    setLoadingCrossRefs(true);
    setCrossRefs(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a Bible scholar, provide cross-references for ${verseRef} (${version}).
Return 5-8 thematically or doctrinally related scripture references with a brief note explaining the connection to each.

JSON response:
- cross_references: array of { reference: string, connection: string, text_preview: string }`,
        response_json_schema: {
          type: 'object',
          properties: {
            cross_references: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  connection: { type: 'string' },
                  text_preview: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setCrossRefs(result.cross_references || []);
    } catch {
      toast.error('Could not load cross-references');
    } finally {
      setLoadingCrossRefs(false);
    }
  };

  const copyVerse = (verse) => {
    navigator.clipboard.writeText(`"${verse.text}" — ${verse.reference} (${verse.version})`);
    toast.success('Verse copied!');
  };

  const insertVerse = (verse) => {
    if (onInsert) {
      onInsert(`"${verse.text}" — ${verse.reference} (${verse.version})`);
      toast.success(`${verse.reference} inserted into sermon`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Scripture Lookup</h3>
          <p className="text-xs text-gray-500">Search by reference or topic, across Bible versions</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder='e.g. "John 3:16" or "grace"'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <Button onClick={search} disabled={isSearching || !query.trim()} size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 px-3">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Version selector */}
      <select
        value={version}
        onChange={e => setVersion(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {BIBLE_VERSIONS.map(v => (
          <option key={v.value} value={v.value}>{v.label}</option>
        ))}
      </select>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{results.matched_reference}</p>
            <Badge variant="outline" className="text-xs">{version}</Badge>
          </div>

          {results.context_note && (
            <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg">{results.context_note}</p>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {results.verses?.map((verse, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-700 mb-1">{verse.reference}</p>
                    <p className="text-sm text-gray-800 leading-relaxed italic">"{verse.text}"</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => copyVerse(verse)} title="Copy" className="p-1 hover:bg-amber-100 rounded text-gray-500 hover:text-gray-700">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {onInsert && (
                      <button onClick={() => insertVerse(verse)} title="Insert into sermon" className="p-1 hover:bg-green-100 rounded text-gray-500 hover:text-green-700">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => fetchCrossRefs(verse.reference)}
                      title="Get cross-references"
                      className="p-1 hover:bg-blue-100 rounded text-gray-500 hover:text-blue-700"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross References */}
      {(loadingCrossRefs || crossRefs) && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              Cross-References for {selectedVerse}
              {loadingCrossRefs && <Loader2 className="w-3.5 h-3.5 animate-spin ml-1 text-blue-400" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 max-h-60 overflow-y-auto">
            {crossRefs?.map((cr, i) => (
              <div key={i} className="border-l-2 border-blue-300 pl-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">{cr.reference}</span>
                  {onInsert && (
                    <button
                      onClick={() => { onInsert(cr.reference); toast.success(`${cr.reference} inserted`); }}
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Insert
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{cr.connection}</p>
                {cr.text_preview && <p className="text-xs text-gray-700 italic mt-0.5">"{cr.text_preview}"</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}