import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';

const BOOK_PACKS = [
  { label: 'New Testament (27 books)', payload: { book_range: [40, 66] }, desc: 'Matthew → Revelation' },
  { label: 'Old Testament – Law (5 books)', payload: { book_range: [1, 5] }, desc: 'Genesis → Deuteronomy' },
  { label: 'Old Testament – History (12 books)', payload: { book_range: [6, 17] }, desc: 'Joshua → Esther' },
  { label: 'Old Testament – Poetry (5 books)', payload: { book_range: [18, 22] }, desc: 'Job → Song of Songs' },
  { label: 'Old Testament – Prophets (17 books)', payload: { book_range: [23, 39] }, desc: 'Isaiah → Malachi' },
  { label: 'Entire Bible (66 books)', payload: { book_range: [1, 66] }, desc: 'All 31,102 verses — takes ~10+ minutes' },
];

const QUICK_BOOKS = [
  { label: 'John', payload: { book_id: 43 } },
  { label: 'Genesis', payload: { book_id: 1 } },
  { label: 'Psalms', payload: { book_id: 19 } },
  { label: '1 John', payload: { book_id: 62 } },
  { label: 'Romans', payload: { book_id: 45 } },
  { label: 'Matthew', payload: { book_id: 40 } },
];

export default function BibleDataImport() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentAction, setCurrentAction] = useState('');

  const runImport = async (payload, label) => {
    setRunning(true);
    setResult(null);
    setError(null);
    setCurrentAction(label);

    try {
      const res = await base44.functions.invoke('importBibleFromAPI', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setRunning(false);
      setCurrentAction('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bible Data Import</h1>
          <p className="text-gray-500 text-sm">Import WEB (World English Bible) verses into the database. Admin only.</p>
        </div>
      </div>

      {/* Status */}
      {running && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3">
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          <div>
            <p className="font-medium">Importing: {currentAction}</p>
            <p className="text-sm text-blue-600">This may take several minutes. Do not close this page.</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Import Complete</span>
          </div>
          <p className="text-sm text-green-700">Inserted: <strong>{result.total_inserted}</strong> verses | Skipped (already existed): <strong>{result.total_skipped}</strong></p>
          {result.errors?.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer">{result.errors.length} errors (click to expand)</summary>
              <ul className="mt-1 text-xs text-red-500 space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Quick single books */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Quick Import — Single Books
          </CardTitle>
          <p className="text-xs text-gray-500">Import one complete book at a time. Good for testing.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {QUICK_BOOKS.map(b => (
              <Button
                key={b.label}
                variant="outline"
                size="sm"
                disabled={running}
                onClick={() => runImport(b.payload, b.label)}
                className="gap-1"
              >
                {running && currentAction === b.label ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {b.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Book packs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            Import Book Packs
          </CardTitle>
          <p className="text-xs text-gray-500">Import complete sections of the Bible. Already-imported chapters are skipped automatically.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {BOOK_PACKS.map(pack => (
            <div key={pack.label} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm text-gray-800">{pack.label}</p>
                <p className="text-xs text-gray-500">{pack.desc}</p>
              </div>
              <Button
                size="sm"
                disabled={running}
                onClick={() => runImport(pack.payload, pack.label)}
                className="gap-1.5 ml-4 flex-shrink-0"
              >
                {running && currentAction === pack.label ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Import
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>Note:</strong> The WEB (World English Bible) is a public domain translation — no licensing issues. 
        Import is idempotent: re-running will skip already-imported chapters. Start with a quick single book (e.g. John) to verify everything works before running larger packs.
      </div>
    </div>
  );
}