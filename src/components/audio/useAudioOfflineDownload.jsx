import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'faithlight_offline_audio';

function getStoredDownloads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setStoredDownloads(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Hook to manage offline audio downloads via Service Worker + Cache Storage.
 * 
 * Usage:
 *   const { isDownloaded, status, download, remove } = useAudioOfflineDownload(chapterId, audioUrl);
 * 
 * status: 'idle' | 'downloading' | 'done' | 'error'
 */
export function useAudioOfflineDownload(chapterId, audioUrl) {
  const [status, setStatus] = useState('idle');

  // Check if already cached on mount
  useEffect(() => {
    if (!chapterId) return;
    const stored = getStoredDownloads();
    if (stored[chapterId]) {
      setStatus('done');
    } else {
      setStatus('idle');
    }
  }, [chapterId]);

  // Listen for SW messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event) => {
      const msg = event.data;
      if (!msg || msg.key !== chapterId) return;

      if (msg.type === 'CACHE_AUDIO_DONE') {
        const stored = getStoredDownloads();
        stored[chapterId] = { url: audioUrl, downloadedAt: new Date().toISOString() };
        setStoredDownloads(stored);
        setStatus('done');
      } else if (msg.type === 'CACHE_AUDIO_FAIL') {
        setStatus('error');
      } else if (msg.type === 'DELETE_AUDIO_DONE') {
        const stored = getStoredDownloads();
        delete stored[chapterId];
        setStoredDownloads(stored);
        setStatus('idle');
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [chapterId, audioUrl]);

  const download = useCallback(async () => {
    if (!audioUrl || !chapterId) return;
    if (!('serviceWorker' in navigator)) {
      console.warn('Service worker not supported — offline download unavailable');
      return;
    }

    setStatus('downloading');

    // Register SW if not yet registered
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sw = reg.active || reg.installing || reg.waiting;
      if (sw) {
        sw.postMessage({ type: 'CACHE_AUDIO', url: audioUrl, key: chapterId });
      } else {
        setStatus('error');
      }
    } catch (e) {
      console.error('SW registration error:', e);
      setStatus('error');
    }
  }, [audioUrl, chapterId]);

  const remove = useCallback(async () => {
    if (!audioUrl || !chapterId) return;
    if (!('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: 'DELETE_AUDIO', url: audioUrl, key: chapterId });
      // Optimistically update
      const stored = getStoredDownloads();
      delete stored[chapterId];
      setStoredDownloads(stored);
      setStatus('idle');
    } catch (e) {
      console.error('Remove download error:', e);
    }
  }, [audioUrl, chapterId]);

  return {
    isDownloaded: status === 'done',
    status,
    download,
    remove,
  };
}