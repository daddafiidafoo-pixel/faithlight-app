import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Unified audio playback controller for Bible audio
 * Handles resume, progress saving, next/prev chapter navigation, and completion tracking
 */
export function useAudioPlaybackController({
  filesetId,
  languageCode,
  onChapterChanged,
  onProgressUpdated,
} = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  const saveTimerRef = useRef(null);
  const user = useRef(null);

  // Initialize user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          user.current = await base44.auth.me();
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    initUser();
  }, []);

  /**
   * Save progress to database (throttled)
   */
  const saveProgress = useCallback(
    async (position, completed = false) => {
      if (!user.current || !currentBook || !currentChapter || !filesetId || !languageCode) {
        return;
      }

      try {
        // Find or create progress record
        const existing = await base44.entities.AudioListenProgress.filter(
          {
            user_id: user.current.id,
            fileset_id_audio: filesetId,
            book_id: currentBook.id,
            chapter: currentChapter,
            language_code: languageCode,
          },
          '-updated_date',
          1
        );

        const delta = position - (existing[0]?.last_position_seconds || 0);
        const totalSeconds = Math.max(0, (existing[0]?.total_listen_seconds || 0) + delta);

        const updateData = {
          last_position_seconds: position,
          total_listen_seconds: totalSeconds,
          last_listened_at: new Date().toISOString(),
          ...(duration > 0 && { duration_seconds: duration }),
        };

        // Mark completed if 90% through (if duration known) or on ended
        if (completed || (duration > 0 && position >= duration * 0.9)) {
          updateData.is_completed = true;
          updateData.completed_at = new Date().toISOString();
        }

        if (existing[0]) {
          await base44.entities.AudioListenProgress.update(existing[0].id, updateData);
        } else {
          await base44.entities.AudioListenProgress.create({
            user_id: user.current.id,
            fileset_id_audio: filesetId,
            language_code: languageCode,
            book_id: currentBook.id,
            chapter: currentChapter,
            ...updateData,
          });
        }

        if (onProgressUpdated) {
          onProgressUpdated({ position, totalSeconds, completed });
        }
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    },
    [currentBook, currentChapter, filesetId, languageCode, duration, onProgressUpdated]
  );

  /**
   * Start playing a chapter and resume from saved position
   */
  const playChapter = useCallback(
    async (bookId, chapter, book, streamUrl) => {
      setLoading(true);
      setError(null);

      try {
        setCurrentBook(book);
        setCurrentChapter(chapter);

        // Load previous progress
        if (user.current) {
          const existing = await base44.entities.AudioListenProgress.filter(
            {
              user_id: user.current.id,
              fileset_id_audio: filesetId,
              book_id: bookId,
              chapter,
              language_code: languageCode,
            },
            '-updated_date',
            1
          );

          if (existing[0]?.last_position_seconds > 10) {
            if (audioRef.current) {
              audioRef.current.currentTime = existing[0].last_position_seconds;
            }
          }
        }

        // Set stream and play
        if (audioRef.current) {
          audioRef.current.src = streamUrl;
          audioRef.current.play();
          setIsPlaying(true);
        }

        if (onChapterChanged) {
          onChapterChanged({ book, chapter });
        }
      } catch (err) {
        console.error('Failed to play chapter:', err);
        setError('Failed to load audio');
      } finally {
        setLoading(false);
      }
    },
    [filesetId, languageCode, onChapterChanged]
  );

  /**
   * Toggle play/pause
   */
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  /**
   * Handle time update (with throttled saves)
   */
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Throttle save to every 15 seconds
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        saveProgress(audioRef.current.currentTime);
      }, 15000);
    }
  }, [saveProgress]);

  /**
   * Handle pause (save immediately)
   */
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    if (audioRef.current) {
      saveProgress(audioRef.current.currentTime);
    }
  }, [saveProgress]);

  /**
   * Handle ended (mark completed)
   */
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      saveProgress(audioRef.current.currentTime, true);
    }
  }, [saveProgress]);

  /**
   * Handle duration change
   */
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  // Set up audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [handleTimeUpdate, handlePause, handleEnded, handleLoadedMetadata]);

  return {
    audioRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    currentBook,
    currentChapter,
    loading,
    error,
    playChapter,
    togglePlay,
    saveProgress,
  };
}