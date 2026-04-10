import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Info, Search, Key } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// DBP v4 fileset IDs — text filesets (type=text_plain or text_format)
const TESTS = [
  {
    name: 'English WEB: John 3 (Bible Brain)',
    versionId: 'ENGWEBN2ET',
    book: 'JHN',
    chapter: '3',
  },
  {
    name: 'Kiswahili: John 3 (Bible Brain)',
    versionId: 'SWHBIBN2ET',
    book: 'JHN',
    chapter: '3',
  },
  {
    name: 'English WEB: Genesis 1 (Bible Brain)',
    versionId: 'ENGWEBN2ET',
    book: 'GEN',
    chapter: '1',
  },
];

// Phase 1 languages to discover
const DISCOVER_LANGS = [
  { appCode: 'en', dbpCodes: ['eng'], label: 'English' },
  { appCode: 'om', dbpCodes: ['orm', 'gaz', 'gax'], label: 'Afaan Oromoo' },
  { appCode: 'am', dbpCodes: ['amh'], label: 'Amharic' },
  { appCode: 'sw', dbpCodes: ['swh', 'swa'], label: 'Kiswahili' },
  { appCode: 'fr', dbpCodes: ['fra', 'fre'], label: 'Français' },
  { appCode: 'ar', dbpCodes: ['arb', 'ara'], label: 'العربية' },
  { appCode: 'pt', dbpCodes: ['por'], label: 'Português' },
  { appCode: 'es', dbpCodes: ['spa'], label: 'Español' },
];

export default function APIBibleTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discovering, setDiscovering] = useState(false);
  const [keyMissing, setKeyMissing] = useState(false);

  const runTest = async (test) => {
    const startTime = Date.now();
    try {
      const res = await base44.functions.invoke('bibleBrainProxy', {
        action: 'text',
        versionId: test.versionId,
        book: test.book,
        chapter: test.chapter,
      });

      const duration = Date.now() - startTime;
      const d = res?.data;

      // Check for missing key
      if (d?.setup_needed) {
        setKeyMissing(true);
        setTestResults((prev) => [...prev, {
          testName: test.name,
          status: 'error',
          message: 'BIBLE_BRAIN_KEY not set in Base44 environment variables.',
        }]);
        return;
      }

      const verses = d?.data?.verses;

      if (verses && verses.length > 0) {
        setTestResults((prev) => [...prev, {
          testName: test.name,
          status: 'success',
          message: `✅ Loaded ${verses.length} verses in ${duration}ms`,
          preview: verses[0]?.text?.substring(0, 120),
        }]);
      } else {
        setTestResults((prev) => [...prev, {
          testName: test.name,
          status: 'warning',
          message: `No verses returned (${duration}ms). Fileset ID may be wrong — use Discover to find valid IDs.`,
          raw: JSON.stringify(d).slice(0, 200),
        }]);
      }
    } catch (error) {
      setTestResults((prev) => [...prev, {
        testName: test.name,
        status: 'error',
        message: error.message || 'Request failed',
      }]);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    setKeyMissing(false);
    for (const test of TESTS) {
      await runTest(test);
      await new Promise(r => setTimeout(r, 300));
    }
    setLoading(false);
  };

  const discoverLanguages = async () => {
    setDiscovering(true);
    setDiscoverResults([]);
    for (const lang of DISCOVER_LANGS) {
      let found = false;
      for (const code of lang.dbpCodes) {
        try {
          const res = await base44.functions.invoke('bibleBrainProxy', { action: 'list', langCode: code });
          const d = res?.data;
          if (d?.setup_needed) {
            setKeyMissing(true);
            setDiscovering(false);
            return;
          }
          const bibles = d?.data ?? [];
          if (Array.isArray(bibles) && bibles.length > 0) {
            setDiscoverResults(prev => [...prev, {
              lang: lang.label,
              appCode: lang.appCode,
              dbpCode: code,
              count: bibles.length,
              bibles: bibles.slice(0, 3).map(b => ({ id: b.abbr ?? b.id, name: b.name })),
              status: 'success',
            }]);
            found = true;
            break;
          }
        } catch (e) {
          // try next code
        }
      }
      if (!found) {
        setDiscoverResults(prev => [...prev, {
          lang: lang.label,
          appCode: lang.appCode,
          status: 'missing',
        }]);
      }
      await new Promise(r => setTimeout(r, 400));
    }
    setDiscovering(false);
  };

  const statusColor = (status) => {
    if (status === 'success') return 'border-green-200 bg-green-50';
    if (status === 'warning') return 'border-yellow-200 bg-yellow-50';
    return 'border-red-200 bg-red-50';
  };

  const StatusIcon = ({ status }) => {
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />;
    if (status === 'warning') return <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />;
    return <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Key warning */}
      {keyMissing && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-4 flex gap-3 items-start">
            <Key className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">BIBLE_BRAIN_KEY not set</p>
              <p className="text-sm text-orange-800 mt-1">
                Go to <strong>Dashboard → Settings → Environment Variables</strong> and add <code className="bg-orange-100 px-1 rounded">BIBLE_BRAIN_KEY</code> with your DBP API key from <a href="https://4.dbt.io" target="_blank" rel="noreferrer" className="underline">4.dbt.io</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text tests */}
      <Card>
        <CardHeader>
          <CardTitle>Bible Brain Text Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Tests the <code className="bg-gray-100 px-1 rounded">bibleBrainProxy</code> function using DBP v4 fileset IDs.
            Requires <code className="bg-gray-100 px-1 rounded">BIBLE_BRAIN_KEY</code> in environment variables.
          </p>
          <Button onClick={runAllTests} disabled={loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Running Tests…' : 'Run All Tests'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, idx) => (
            <Card key={idx} className={statusColor(result.status)}>
              <CardContent className="pt-4 space-y-1">
                <div className="flex items-start gap-2">
                  <StatusIcon status={result.status} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{result.testName}</p>
                    <p className={`text-sm ${result.status === 'success' ? 'text-green-700' : result.status === 'warning' ? 'text-yellow-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                    {result.preview && (
                      <p className="text-xs text-gray-600 mt-1 italic">"{result.preview}…"</p>
                    )}
                    {result.raw && (
                      <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">{result.raw}</pre>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Discover phase 1 language IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" /> Discover Phase 1 Language Bibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Queries Bible Brain for all 8 Phase 1 languages to find real fileset IDs.
            Use these to populate your <code className="bg-gray-100 px-1 rounded">providerRouter</code> catalog.
          </p>
          <Button onClick={discoverLanguages} disabled={discovering} variant="outline" className="gap-2">
            {discovering && <Loader2 className="w-4 h-4 animate-spin" />}
            {discovering ? 'Discovering…' : 'Discover All Languages'}
          </Button>
        </CardContent>
      </Card>

      {discoverResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Discovery Results:</h3>
          {discoverResults.map((r, idx) => (
            <Card key={idx} className={r.status === 'success' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  {r.status === 'success'
                    ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    : <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-semibold">{r.lang} <span className="text-gray-400 font-normal text-xs">({r.appCode})</span></p>
                    {r.status === 'success' ? (
                      <>
                        <p className="text-sm text-green-700">{r.count} bible(s) found via DBP code <code className="bg-green-100 px-1 rounded">{r.dbpCode}</code></p>
                        <div className="mt-2 space-y-1">
                          {r.bibles.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <code className="bg-white border border-green-200 px-2 py-0.5 rounded font-mono">{b.id}</code>
                              <span className="text-gray-600">{b.name}</span>
                            </div>
                          ))}
                          {r.count > 3 && <p className="text-xs text-gray-500">…and {r.count - 3} more</p>}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Not found on Bible Brain — may need to source from another provider.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <strong>Licensing reminder:</strong> Bible Brain requires a valid API key (<a href="https://4.dbt.io" target="_blank" rel="noreferrer" className="underline">4.dbt.io</a>).
        For monetized apps like FaithLight, ensure your DBP license covers commercial use.
        Do not ship copyrighted text/audio offline without explicit rights for each version.
      </div>
    </div>
  );
}