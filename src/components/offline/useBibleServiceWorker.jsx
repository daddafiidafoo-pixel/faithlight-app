/**
 * useBibleServiceWorker
 * ─────────────────────
 * Registers the FaithLight service worker and exposes helpers
 * for pre-caching Bible chapters and querying offline availability.
 *
 * Usage:
 *   const { isOffline, cacheChapter, cachedChapters } = useBibleServiceWorker();
 */
import { useEffect, useState, useCallback } from 'react';

export default function useBibleServiceWorker() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReady, setIsReady]     = useState(false);
  const [cachedUrls, setCachedUrls] = useState([]);

  // Register SW once on mount
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        setIsReady(true);
        // Refresh list of cached chapters
        _getCachedList();
        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', _onMessage);
        // Check for updates every 60s
        const interval = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(interval);
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));

    return () => {
      navigator.serviceWorker.removeEventListener('message', _onMessage);
    };
  }, []);

  // Online/offline events
  useEffect(() => {
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  function _onMessage(event) {
    const { type, payload } = event.data || {};
    if (type === 'CACHED_CHAPTERS') setCachedUrls(payload || []);
  }

  function _getCachedList() {
    navigator.serviceWorker.controller?.postMessage({ type: 'GET_CACHED_CHAPTERS' });
  }

  /**
   * Tell the service worker to pre-fetch and cache a chapter URL.
   * @param {string} url - The API/content URL for the chapter
   */
  const cacheChapter = useCallback((url) => {
    if (!url || !navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: 'CACHE_CHAPTER', payload: { url } });
  }, []);

  /** Clear the entire Bible cache (e.g. to free storage). */
  const clearBibleCache = useCallback(() => {
    navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_BIBLE_CACHE' });
    setCachedUrls([]);
  }, []);

  return {
    isOffline,
    isReady,
    cachedUrls,
    cachedCount: cachedUrls.length,
    cacheChapter,
    clearBibleCache,
    refreshCachedList: _getCachedList,
  };
}