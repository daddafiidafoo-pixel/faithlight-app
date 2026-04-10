import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useAudioProgressSaver
 * 
 * Hook for throttled audio progress saving (every 15s).
 * Call on every playback update; hook handles throttling + saves on unmount.
 * 
 * Usage:
 * const saveProgress = useAudioProgressSaver({
 *   filesetId: 'ENGKJVO1DA',
 *   bookId: 'GEN',
 *   bookName: 'Genesis',
 *   chapter: 1,
 *   languageCode: 'en',
 *   durationSeconds: 1200
 * });
 * 
 * // In playback handler:
 * saveProgress(currentPositionSeconds, isPlayingNow);
 */
export function useAudioProgressSaver({
  filesetId,
  bookId,
  bookName,
  chapter,
  languageCode,
  durationSeconds,
}) {
  const lastSaveRef = useRef(0);
  const lastPositionRef = useRef(0);
  const saveTimeoutRef = useRef(null);

  const save = async (positionSeconds, isPlaying = false) => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save if (15s+ elapsed OR user paused/stopped) AND position advanced
    const shouldSaveNow =
      (timeSinceLastSave >= 15000 || !isPlaying) &&
      Math.abs(positionSeconds - lastPositionRef.current) > 0;

    if (shouldSaveNow) {
      lastSaveRef.current = now;
      lastPositionRef.current = positionSeconds;

      try {
        await base44.functions.invoke('saveAudioProgress', {
          fileset_id_audio: filesetId,
          book_id: bookId,
          book_name: bookName,
          chapter,
          language_code: languageCode,
          last_position_seconds: positionSeconds,
          duration_seconds: durationSeconds || null,
          playback_active: isPlaying,
        });
      } catch (err) {
        console.error('Audio progress save error:', err);
        // Silently fail; don't disrupt playback
      }
    } else if (isPlaying && timeSinceLastSave < 15000) {
      // Schedule save after remaining time
      const delay = 15000 - timeSinceLastSave;
      saveTimeoutRef.current = setTimeout(() => {
        save(positionSeconds, isPlaying);
      }, delay);
    }
  };

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Final save with isPlaying=false
      if (lastPositionRef.current > 0) {
        base44.functions.invoke('saveAudioProgress', {
          fileset_id_audio: filesetId,
          book_id: bookId,
          book_name: bookName,
          chapter,
          language_code: languageCode,
          last_position_seconds: lastPositionRef.current,
          duration_seconds: durationSeconds || null,
          playback_active: false,
        }).catch(() => {});
      }
    };
  }, [filesetId, bookId, bookName, chapter, languageCode, durationSeconds]);

  return save;
}