/**
 * BibleTools — Version Comparison, Search, and Offline Downloads
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitCompare, Search, Download } from 'lucide-react';
import BibleVersionComparison from '@/components/bible/BibleVersionComparison';
import BibleSearch from '@/components/bible/BibleSearch';
import OfflineDownloadButton from '@/components/bible/OfflineDownloadButton';
import BiblePicker from '@/components/bible/BiblePicker';

export default function BibleTools() {
  const [catalog, setCatalog] = useState(null);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    base44.functions.invoke('getBibleCatalog').then(res => {
      if (res?.data) setCatalog(res.data);
    }).catch(() => {});
  }, []);

  const selectedVersionMeta = catalog?.versions?.find(v => v.id === selection?.versionId) ?? null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bible Tools</h1>
        <p className="text-sm text-gray-500 mt-1">Compare versions, search scripture, and save for offline reading.</p>
      </div>

      <Tabs defaultValue="compare">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="compare" className="gap-1.5">
            <GitCompare className="w-4 h-4" /> Compare
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="w-4 h-4" /> Search
          </TabsTrigger>
          <TabsTrigger value="offline" className="gap-1.5">
            <Download className="w-4 h-4" /> Offline
          </TabsTrigger>
        </TabsList>

        {/* ── Compare ── */}
        <TabsContent value="compare" className="mt-6">
          <BibleVersionComparison catalog={catalog} />
        </TabsContent>

        {/* ── Search ── */}
        <TabsContent value="search" className="mt-6">
          <BibleSearch catalog={catalog} />
        </TabsContent>

        {/* ── Offline ── */}
        <TabsContent value="offline" className="mt-6 space-y-6">
          <div className="bg-gray-50 border rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-gray-700">Select a version and passage to save offline:</p>
            <BiblePicker catalog={catalog} onChange={setSelection} className="max-w-md" />
          </div>

          {selection && (
            <div className="border rounded-xl p-4 space-y-3">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Selected:</span>{' '}
                {selectedVersionMeta?.title || selection.versionId} — {selection.bookId} {selection.chapter}
              </div>
              <OfflineDownloadButton
                versionMeta={selectedVersionMeta}
                bookId={selection.bookId}
                chapter={selection.chapter}
              />
            </div>
          )}

          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 border">
            <strong>Licensing:</strong> Only public-domain versions (WEB, KJV) can be saved for offline use.
            Streaming-only versions (FCBH / BibleBrain licensed content) require an internet connection.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}