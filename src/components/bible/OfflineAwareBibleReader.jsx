import React, { useState, useEffect } from 'react';
import { useI18n } from '../I18nProvider';
import { getGlobalLanguage } from '../lib/translationHelper';
import { getChapter } from '../offline/offlineBibleCacheService';
import { Wifi, WifiOff, Loader } from 'lucide-react';

export default function OfflineAwareBibleReader({ bookId, chapterId }) {
  const { lang } = useI18n();
  const [content, setContent] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState(null); // 'offline' or 'online'

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load chapter content
  useEffect(() => {
    loadChapterContent();
  }, [bookId, chapterId, lang]);

  const loadChapterContent = async () => {
    setLoading(true);
    setError('');

    try {
      // Try offline first
      const globalLang = getGlobalLanguage();
      const offlineData = await getChapter(bookId, chapterId, globalLang);

      if (offlineData) {
        setContent(offlineData.content);
        setSource('offline');
        setLoading(false);
        return;
      }

      // If not offline and online, fetch from API
      if (isOnline) {
        // TODO: Fetch from API
        setSource('online');
      } else {
        // Offline and no cached data
        setError('Chapter not downloaded for offline use');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading chapter:', err);
      setError('Failed to load chapter');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Indicator */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isOnline
            ? 'bg-green-50 border border-green-200'
            : 'bg-amber-50 border border-amber-200'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              Offline {source === 'offline' && '(Cached)'}
            </span>
          </>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Chapter Content */}
      {content && (
        <div className="prose prose-sm max-w-none">
          <div className="verse-text text-gray-900 leading-relaxed">
            {typeof content === 'string' ? content : JSON.stringify(content)}
          </div>
        </div>
      )}
    </div>
  );
}