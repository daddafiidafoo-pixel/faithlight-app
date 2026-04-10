/**
 * BibleVersionComparison
 * Side-by-side comparison of two Bible versions for the same passage.
 * Highlights word-level differences between the two translations.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, GitCompare } from 'lucide-react';

const BOOKS = [
  { id: 'GEN', name: 'Genesis' }, { id: 'EXO', name: 'Exodus' }, { id: 'PSA', name: 'Psalms' },
  { id: 'PRO', name: 'Proverbs' }, { id: 'ISA', name: 'Isaiah' }, { id: 'MAT', name: 'Matthew' },
  { id: 'MRK', name: 'Mark' }, { id: 'LUK', name: 'Luke' }, { id: 'JHN', name: 'John' },
  { id: 'ACT', name: 'Acts' }, { id: 'ROM', name: 'Romans' }, { id: '1CO', name: '1 Corinthians' },
  { id: 'GAL', name: 'Galatians' }, { id: 'EPH', name: 'Ephesians' }, { id: 'PHP', name: 'Philippians' },
  { id: 'HEB', name: 'Hebrews' }, { id: 'JAS', name: 'James' }, { id: 'REV', name: 'Revelation' },
];

/** Tokenize verse text into words for diffing */
function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
}

/** Return spans with diff highlighting for a verse pair */
function DiffVerse({ textA, textB, side }) {
  const wordsA = useMemo(() => tokenize(textA), [textA]);
  const wordsB = useMemo(() => tokenize(textB), [textB]);
  const setA = useMemo(() => new Set(wordsA), [wordsA]);
  const setB = useMemo(() => new Set(wordsB), [wordsB]);

  const words = (side === 'A' ? textA : textB || '').split(/(\s+)/);
  const refSet = side === 'A' ? setB : setA;

  return (
    <span>
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^\w]/g, '');
        if (!clean || /^\s+$/.test(word)) return <span key={i}>{word}</span>;
        const isDiff = clean && !refSet.has(clean);
        return (
          <span
            key={i}
            className={isDiff ? 'bg-yellow-200 text-yellow-900 rounded px-0.5' : ''}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

async function fetchVerses(filesetId, bookId, chapter) {
  if (!filesetId || filesetId.startsWith('REPLACE')) return null;
  try {
    const res = await base44.functions.invoke('bibleBrainProxy', {
      action: 'text',
      versionId: filesetId,
      book: bookId,
      chapter: String(chapter),
    });
    return res?.data?.data?.verses ?? null;
  } catch {
    return null;
  }
}

export default function BibleVersionComparison({ catalog }) {
  const versions = useMemo(
    () => (catalog?.versions ?? []).filter(v => v.hasText && !v.pending && v.textFilesetId && !v.textFilesetId.startsWith('REPLACE')),
    [catalog]
  );

  const [versionA, setVersionA] = useState(versions[0]?.id || 'en_web');
  const [versionB, setVersionB] = useState(versions[1]?.id || 'en_kjv');
  const [bookId, setBookId] = useState('JHN');
  const [chapter, setChapter] = useState(3);
  const [versesA, setVersesA] = useState(null);
  const [versesB, setVersesB] = useState(null);
  const [loading, setLoading] = useState(false);

  const metaA = useMemo(() => catalog?.versions?.find(v => v.id === versionA), [catalog, versionA]);
  const metaB = useMemo(() => catalog?.versions?.find(v => v.id === versionB), [catalog, versionB]);

  async function load() {
    setLoading(true);
    setVersesA(null);
    setVersesB(null);
    const [a, b] = await Promise.all([
      fetchVerses(metaA?.textFilesetId, bookId, chapter),
      fetchVerses(metaB?.textFilesetId, bookId, chapter),
    ]);
    setVersesA(a);
    setVersesB(b);
    setLoading(false);
  }

  // Map versesB by verse number for easy lookup
  const verseMapB = useMemo(() => {
    const map = {};
    (versesB || []).forEach(v => { map[v.verse] = v.text; });
    return map;
  }, [versesB]);

  if (!versions.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        <GitCompare className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>No Bible versions available for comparison yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Version A</label>
          <Select value={versionA} onValueChange={setVersionA}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {versions.map(v => <SelectItem key={v.id} value={v.id}>{v.abbr || v.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Version B</label>
          <Select value={versionB} onValueChange={setVersionB}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {versions.map(v => <SelectItem key={v.id} value={v.id}>{v.abbr || v.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Book</label>
          <Select value={bookId} onValueChange={setBookId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-64">
              {BOOKS.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Chapter</label>
          <div className="flex gap-2">
            <Input
              type="number" min={1} max={150} value={chapter}
              onChange={e => setChapter(Math.max(1, Number(e.target.value || 1)))}
            />
            <Button onClick={load} disabled={loading || versionA === versionB} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Compare'}
            </Button>
          </div>
        </div>
      </div>

      {versionA === versionB && (
        <p className="text-sm text-amber-600 text-center">Please select two different versions to compare.</p>
      )}

      {/* Diff legend */}
      {versesA && (
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          <span className="bg-yellow-200 text-yellow-900 rounded px-1 py-0.5">highlighted</span>
          <span>= words that differ from the other version</span>
        </div>
      )}

      {/* Side-by-side */}
      {versesA && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Version A */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-indigo-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="font-semibold text-indigo-800">{metaA?.abbr || metaA?.title}</span>
              <Badge variant="outline" className="text-xs">{BOOKS.find(b => b.id === bookId)?.name} {chapter}</Badge>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {versesA.map(v => (
                <div key={v.verse} className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0 pt-0.5">{v.verse}</span>
                  <p className="text-sm leading-relaxed text-gray-800">
                    <DiffVerse textA={v.text} textB={verseMapB[v.verse] || ''} side="A" />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Version B */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="font-semibold text-purple-800">{metaB?.abbr || metaB?.title}</span>
              <Badge variant="outline" className="text-xs">{BOOKS.find(b => b.id === bookId)?.name} {chapter}</Badge>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {(versesB || []).map(v => {
                const textA = versesA?.find(a => a.verse === v.verse)?.text || '';
                return (
                  <div key={v.verse} className="flex gap-2">
                    <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0 pt-0.5">{v.verse}</span>
                    <p className="text-sm leading-relaxed text-gray-800">
                      <DiffVerse textA={textA} textB={v.text} side="B" />
                    </p>
                  </div>
                );
              })}
              {!versesB?.length && (
                <p className="text-sm text-gray-400 italic">No text available for this version.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!versesA && !loading && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select two versions and click Compare to view side-by-side.</p>
        </div>
      )}
    </div>
  );
}