import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Upload, Loader2, FileJson } from 'lucide-react';
import { ALL_LANGUAGES } from '@/lib/bibleLanguageAvailability';

const SUPPORTED_LANGS = Object.entries(ALL_LANGUAGES).map(([code, info]) => ({
  code,
  ...info,
}));

export default function BibleBulkImporter() {
  const fileInputRef = useRef(null);
  const [selectedLang, setSelectedLang] = useState('om');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit');
      return;
    }

    setFile(selected);
    setError(null);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file || !selectedLang) {
      setError('Select a language and JSON file');
      return;
    }

    setImporting(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Read file
      const text = await file.text();
      const verses = JSON.parse(text);

      if (!Array.isArray(verses)) {
        throw new Error('JSON must be an array of verse objects');
      }

      if (verses.length < 31000) {
        throw new Error(
          `Expected ~31,102 verses, got ${verses.length}. Are you sure this is a complete Bible?`
        );
      }

      // Validate structure
      const sample = verses[0];
      const requiredFields = ['language_code', 'book_id', 'book_name', 'chapter', 'verse', 'text'];
      for (const field of requiredFields) {
        if (!(field in sample)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Import in batches
      const batchSize = 1000;
      const totalBatches = Math.ceil(verses.length / batchSize);

      let imported = 0;
      let failed = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = verses.slice(i * batchSize, (i + 1) * batchSize);
        
        const batchResult = await base44.functions.invoke('importBibleLanguage', {
          language_code: selectedLang,
          verses: batch,
        });

        imported += batchResult.imported || 0;
        failed += batchResult.failed || 0;
        
        setProgress(Math.round(((i + 1) / totalBatches) * 100));
      }

      // Now validate
      setProgress(100);
      const validation = await base44.functions.invoke('validateBibleLanguageReadiness', {
        language_code: selectedLang,
      });

      setResult({
        success: true,
        imported,
        failed,
        total: verses.length,
        validation,
      });

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-blue-600" />
          Bible Bulk Importer
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Import 31,000+ verse JSON files for new languages
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Target Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LANGS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedLang === lang.code
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{lang.native}</div>
                <div className="text-xs text-gray-500">{lang.code.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-3">Upload JSON File</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Click to browse or drag and drop</p>
            <p className="text-xs text-gray-500">JSON file with 31,000+ verse objects</p>
            {file && <p className="text-xs text-green-600 font-medium mt-2">✓ {file.name}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-semibold gap-2"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing... {progress}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Start Import
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {importing && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-600">{progress}% complete</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 text-sm">Import Failed</h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {result?.success && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 text-sm">Import Successful!</h3>
                <p className="text-sm text-green-800 mt-1">
                  Imported {result.imported.toLocaleString()} verses
                  {result.failed > 0 && ` (${result.failed} failed)`}
                </p>
              </div>
            </div>

            {/* Validation Summary */}
            {result.validation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-blue-900 text-sm">Validation Summary</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Verse Count */}
                  <div className="flex items-center gap-2">
                    {result.validation.details?.verseCount?.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-blue-900">
                      Verses: {result.validation.details?.verseCount?.current?.toLocaleString() || 'N/A'}
                      / {result.validation.details?.verseCount?.required?.toLocaleString() || 'N/A'}
                    </span>
                  </div>

                  {/* Book Count */}
                  <div className="flex items-center gap-2">
                    {result.validation.details?.bookCount?.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-blue-900">
                      Books: {result.validation.details?.bookCount?.current || 'N/A'}
                      / {result.validation.details?.bookCount?.required || 'N/A'}
                    </span>
                  </div>

                  {/* Chapter Count */}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span className="text-blue-900">
                      Chapters: {result.validation.details?.chapterCoverage?.totalChapters || 'N/A'}
                    </span>
                  </div>

                  {/* Overall Status */}
                  <div className="flex items-center gap-2">
                    {result.validation.ready ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <Badge variant={result.validation.ready ? 'default' : 'outline'}>
                      {result.validation.ready ? 'Ready to Enable' : 'Incomplete'}
                    </Badge>
                  </div>
                </div>

                {result.validation.recommendations?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-2">Next Steps:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {result.validation.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="flex-shrink-0">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                setFile(null);
                setResult(null);
                setProgress(0);
              }}
              variant="outline"
              className="w-full"
            >
              Import Another Language
            </Button>
          </div>
        )}

        {/* Info Box */}
        {!importing && !result && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <p className="font-medium mb-2">📋 JSON Format Requirements:</p>
            <ul className="text-xs space-y-1 ml-4 list-disc text-amber-800">
              <li>Array of objects with: language_code, book_id, book_name, chapter, verse, text</li>
              <li>Minimum 31,102 verses (all 66 books)</li>
              <li>File size limit: 100MB</li>
              <li>Import runs in batches automatically</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}