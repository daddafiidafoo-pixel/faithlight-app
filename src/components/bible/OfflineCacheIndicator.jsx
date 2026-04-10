/**
 * Offline Cache Indicator & Download Button
 * 
 * Shows cached status and allows per-chapter download for offline reading.
 * Uses the offlineCacheStrategy module for light-level passive caching.
 */

import React, { useState, useEffect } from 'react';
import { Download, Check, AlertCircle, Trash2 } from 'lucide-react';
import {
  isCached,
  getCacheStats,
  cacheChapterText,
  clearChapterCache,
} from '@/lib/offlineCacheStrategy';

export default function OfflineCacheIndicator({
  languageCode,
  bookId,
  chapter,
  verses,
  uiLanguage = 'en',
  onCached,
}) {
  const [isCachedLocally, setIsCachedLocally] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState('');

  const labels = {
    en: {
      downloading: 'Saving for offline...',
      saved: 'Saved offline',
      download: 'Save offline',
      delete: 'Delete offline copy',
      nocache: 'Enable offline reading by saving chapters',
      error: 'Failed to save offline',
    },
    om: {
      downloading: 'Akka aanaa kufu keessa akka kuufamaa jira...',
      saved: 'Akka aanaa kufu keessa kuufama',
      download: 'Akka aanaa kufu keessa kuufi',
      delete: 'Galmee akka aanaa kufu keessa jiru hachii',
      nocache: 'Boqonnaa kuufsuun dubbisa akka aanaa kufu keessaa gargaaru dandeessi',
      error: 'Kuufsuun akka aanaa kufu keessa dhabame',
    },
    am: {
      downloading: 'ለመስመር ውጪ ይህ ይቀመጣል...',
      saved: 'ለመስመር ውጪ ተቀምጧል',
      download: 'ለመስመር ውጪ ቆምት',
      delete: 'ለመስመር ውጪ ቅጂ ሂድ',
      nocache: 'ምዕራፍ በ መስመር ውጪ ልያስተካክል ይህን ቆምት',
      error: 'ለመስመር ውጪ ለመቆምት ተስኖ',
    },
    sw: {
      downloading: 'Inahifadhi kwa kumbumuzi...',
      saved: 'Kuhifadhiwa kwa kumbumuzi',
      download: 'Hifadhi kwa kumbumuzi',
      delete: 'Futa nakala ya kumbumuzi',
      nocache: 'Weka sura kwa kumbumuzi ili kusoma bila mtandao',
      error: 'Imeshindwa kuhifadhi kwa kumbumuzi',
    },
  };

  const L = labels[uiLanguage] || labels.en;

  // Check if chapter is cached on mount and when params change
  useEffect(() => {
    const cached = isCached(languageCode, bookId, chapter);
    setIsCachedLocally(cached);
  }, [languageCode, bookId, chapter]);

  const handleDownload = async () => {
    if (!verses || verses.length === 0) {
      setShowMessage(L.nocache);
      return;
    }

    setLoading(true);
    try {
      cacheChapterText(languageCode, bookId, chapter, verses);
      setIsCachedLocally(true);
      setShowMessage(L.saved);
      onCached?.(true);

      // Clear message after 3 seconds
      setTimeout(() => setShowMessage(''), 3000);
    } catch (err) {
      setShowMessage(L.error);
      setTimeout(() => setShowMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    clearChapterCache(languageCode, bookId, chapter);
    setIsCachedLocally(false);
    onCached?.(false);
  };

  return (
    <div className="space-y-2">
      {/* Cache Status Indicator */}
      {isCachedLocally && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">{L.saved}</span>
        </div>
      )}

      {/* Download/Delete Buttons */}
      <div className="flex gap-2">
        {!isCachedLocally ? (
          <button
            onClick={handleDownload}
            disabled={loading || !verses?.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: '#EDE9FE',
              color: '#8B5CF6',
            }}
            title={!verses?.length ? L.nocache : ''}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                {L.downloading}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {L.download}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
            }}
          >
            <Trash2 className="w-4 h-4" />
            {L.delete}
          </button>
        )}
      </div>

      {/* Message Display */}
      {showMessage && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor:
              showMessage === L.error ? '#FEF2F2' : '#ECFDF5',
            color: showMessage === L.error ? '#991B1B' : '#166534',
            border: `1px solid ${
              showMessage === L.error ? '#FECACA' : '#BBFFBE'
            }`,
          }}
        >
          {showMessage === L.error ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          {showMessage}
        </div>
      )}
    </div>
  );
}