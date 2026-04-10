import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { importBibleVerses } from '../functions/bibleImporter';
import { SAMPLE_VERSES } from '../functions/bibleSampleData';

export default function BibleDataSetup() {
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
  const [results, setResults] = useState(null);
  const [verseCount, setVerseCount] = useState(0);

  const handleImportSampleData = async () => {
    setStatus('loading');
    setResults(null);

    try {
      const importResult = await importBibleVerses(SAMPLE_VERSES, {
        batchSize: 25,
        logProgress: true
      });

      setResults(importResult);
      setStatus('success');

      // Fetch current verse count
      const allVerses = await base44.entities.BibleVerse.list('-updated_date', 1000);
      setVerseCount(allVerses.length);
    } catch (error) {
      setResults({
        inserted: 0,
        skipped: 0,
        duplicates: 0,
        errors: [error.message]
      });
      setStatus('error');
    }
  };

  const handleClearAllVerses = async () => {
    if (!window.confirm('Delete ALL Bible verses? This cannot be undone.')) return;

    setStatus('loading');
    try {
      // Fetch all and delete
      const allVerses = await base44.entities.BibleVerse.list('-updated_date', 10000);
      for (const verse of allVerses) {
        await base44.entities.BibleVerse.delete(verse.id);
      }

      setVerseCount(0);
      setResults({ deleted: allVerses.length });
      setStatus('success');
    } catch (error) {
      setResults({ errors: [error.message] });
      setStatus('error');
    }
  };

  const handleCheckVerses = async () => {
    try {
      const allVerses = await base44.entities.BibleVerse.list('-updated_date', 10000);
      setVerseCount(allVerses.length);
      setResults({
        totalVerses: allVerses.length,
        sample: allVerses.slice(0, 3).map(v => `${v.book} ${v.chapter}:${v.verse}`)
      });
      setStatus('success');
    } catch (error) {
      setResults({ errors: [error.message] });
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Bible Data Setup</CardTitle>
            <CardDescription>
              Manage Bible verse imports and test data
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Total verses in database: <span className="font-bold text-lg text-indigo-600">{verseCount}</span>
              </p>
            </div>

            {/* Import Sample Data */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Phase 2: Import Sample Data</h3>
              <p className="text-sm text-gray-600">
                Imports Genesis 1:1–3, John 3:16–18, Psalm 23:1–6, 1 John 1:9, Romans 8:28 (WEB translation)
              </p>
              <Button
                onClick={handleImportSampleData}
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import Sample Verses
              </Button>
            </div>

            {/* Check Verses */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Check Database</h3>
              <Button
                onClick={handleCheckVerses}
                variant="outline"
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Check Verses
              </Button>
            </div>

            {/* Clear Data */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-gray-900">Danger Zone</h3>
              <Button
                onClick={handleClearAllVerses}
                variant="destructive"
                disabled={status === 'loading' || verseCount === 0}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Verses
              </Button>
            </div>

            {/* Results */}
            {results && (
              <div className={`p-4 rounded-lg ${status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {status === 'success' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-900 font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      Success
                    </div>
                    {results.inserted !== undefined && (
                      <p className="text-sm text-green-800">Inserted: <strong>{results.inserted}</strong></p>
                    )}
                    {results.duplicates !== undefined && (
                      <p className="text-sm text-green-800">Duplicates skipped: <strong>{results.duplicates}</strong></p>
                    )}
                    {results.skipped !== undefined && (
                      <p className="text-sm text-green-800">Invalid rows skipped: <strong>{results.skipped}</strong></p>
                    )}
                    {results.totalVerses !== undefined && (
                      <p className="text-sm text-green-800">Total verses in DB: <strong>{results.totalVerses}</strong></p>
                    )}
                    {results.sample && (
                      <p className="text-sm text-green-800">Sample: {results.sample.join(', ')}</p>
                    )}
                    {results.deleted !== undefined && (
                      <p className="text-sm text-green-800">Deleted: <strong>{results.deleted}</strong> verses</p>
                    )}
                  </div>
                )}
                {status === 'error' && results.errors && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-900 font-semibold">
                      <AlertCircle className="w-5 h-5" />
                      Error
                    </div>
                    {results.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-800">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Test Queries */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Test Queries</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-700 space-y-2">
                <p>✅ After import, these should work:</p>
                <p className="text-indigo-600">John 3:16 → should return verse text</p>
                <p className="text-indigo-600">Genesis 1:1–3 → should return 3 verses</p>
                <p className="text-indigo-600">Psalm 23:1 → should return psalm verse</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}