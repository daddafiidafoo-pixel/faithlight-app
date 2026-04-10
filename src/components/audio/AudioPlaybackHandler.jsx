import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';

/**
 * AudioPlaybackHandler
 * 
 * Unified decision tree for audio playback:
 * - If online: play saved stream URL or fetch + save + play
 * - If offline: show modal with options (read offline, download, device voice)
 * - Prevents infinite spinners with timeout + retry
 */
export default function AudioPlaybackHandler({
  isOpen,
  onClose,
  bookId,
  chapter,
  language,
  versionId,
  onPlayStream,      // (streamUrl) => void
  onReadOffline,     // () => void
  onDownloadChapter, // () => void
  onListenDeviceVoice, // () => void
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [hasOfflineText, setHasOfflineText] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(false);

  // Fetch stream URL with timeout
  const fetchStreamUrl = async () => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 10000)
    );

    try {
      // Call your Bible Brain API or stream URL cache
      // This is a placeholder — replace with actual API
      const response = await Promise.race([
        fetch(`/api/audio-stream?book=${bookId}&chapter=${chapter}&lang=${language}&version=${versionId}`),
        timeout,
      ]);

      if (!response.ok) throw new Error('Stream fetch failed');

      const { streamUrl } = await response.json();
      return streamUrl;
    } catch (err) {
      console.error('Stream fetch error:', err);
      throw err;
    }
  };

  const checkOfflineStatus = async () => {
    try {
      // Check if chapter text is offline
      const offlineText = await base44.entities.OfflineTextChapter.filter(
        { bookId, chapter },
        '-created_date',
        1
      );
      setHasOfflineText(offlineText.length > 0);

      // Check if device TTS is available
      const supported = window.speechSynthesis && 'SpeechSynthesisUtterance' in window;
      setTtsAvailable(supported);
    } catch (err) {
      console.error('Offline status check failed:', err);
    }
  };

  const handlePlayAudio = async () => {
    setLoading(true);
    setError(null);

    const isOnline = navigator.onLine;

    if (!isOnline) {
      // Offline: show modal with options
      await checkOfflineStatus();
      setShowOfflineModal(true);
      setLoading(false);
      return;
    }

    // Online: fetch and play stream
    try {
      let streamUrl;

      // Try to get cached URL first
      const cached = await base44.entities.OfflineAudio.filter(
        { bookId, chapter, language, versionId },
        '-created_date',
        1
      );

      if (cached.length > 0 && cached[0].audio_source_url) {
        streamUrl = cached[0].audio_source_url;
      } else {
        // Fetch new stream URL
        streamUrl = await fetchStreamUrl();

        // Save for next time
        await base44.entities.OfflineAudio.create({
          bookId,
          chapter,
          language,
          versionId,
          audio_source_url: streamUrl,
        }).catch(() => {}); // Ignore save errors
      }

      onPlayStream(streamUrl);
      onClose();
    } catch (err) {
      console.error('Playback error:', err);
      setError(t('audio.fetchFailed', 'Failed to load audio'));
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('offline.reading.title', 'Offline Reading')}</DialogTitle>
          </DialogHeader>
          {loading && (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-600">{t('common.loading', 'Loading…')}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                size="sm"
                className="mt-2"
                onClick={handlePlayAudio}
              >
                {t('common.retry', 'Retry')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showOfflineModal} onOpenChange={setShowOfflineModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('audio.offline.title', 'You\'re offline')}</DialogTitle>
            <DialogDescription>
              {t('audio.offline.needsInternet', 'Audio needs internet to play.')}
              <br />
              {t('audio.offline.canReadOffline', 'You can still read offline if you downloaded the chapter.')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              {t('audio.offline.chooseAction', 'Choose an option below.')}
            </p>

            {hasOfflineText && (
              <Button
                onClick={() => {
                  onReadOffline();
                  setShowOfflineModal(false);
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                {t('audio.offline.readOffline', 'Read Offline')}
              </Button>
            )}

            {!hasOfflineText && (
              <Button
                onClick={() => {
                  onDownloadChapter();
                  setShowOfflineModal(false);
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                {t('audio.offline.downloadChapter', 'Download this chapter')}
              </Button>
            )}

            {ttsAvailable && (
              <Button
                onClick={() => {
                  onListenDeviceVoice();
                  setShowOfflineModal(false);
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                {t('audio.offline.listenDeviceVoice', 'Listen with Device Voice')}
              </Button>
            )}

            <Button
              onClick={() => setShowOfflineModal(false)}
              variant="ghost"
              className="w-full"
            >
              {t('audio.offline.cancel', 'Cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}