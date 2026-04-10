import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const PROGRESS_KEY = 'bibleis_progress';

export function saveProgress(filesetId, book_id, chapter, currentTime) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ filesetId, book_id, chapter, currentTime, ts: Date.now() }));
}

export function loadProgress() {
  try {
    const s = localStorage.getItem(PROGRESS_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

/**
 * Core playback hook for Bible Brain audio.
 * fileset shape: { id, name, filesetId, type }
 */
export function useBibleIsPlayer() {
  const audioRef = useRef(null);
  const sleepTimerRef = useRef(null);

  const [fileset, setFileset] = useState(null);
  const [bookId, setBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [audioItems, setAudioItems] = useState([]); // [{path, verse_start, duration}]
  const [currentFileIdx, setCurrentFileIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sleepMinutes, setSleepMinutes] = useState(null);
  const [sleepRemaining, setSleepRemaining] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [booksList, setBooksList] = useState([]);

  // Load audio for current fileset/book/chapter
  const loadChapter = useCallback(async (fsObj, bkId, ch) => {
    if (!fsObj?.filesetId) return;
    setLoading(true);
    setError(null);
    setAudioItems([]);
    setCurrentFileIdx(0);

    try {
      const res = await base44.functions.invoke('bibleBrainCatalog', {
        action: 'audio',
        filesetId: fsObj.filesetId,
        bookId: bkId,
        chapter: String(ch),
      });

      const items = res.data?.items || [];
      if (items.length === 0 && res.data?.url) {
        // Single URL response
        items.push({ path: res.data.url });
      }
      setAudioItems(items);

      // Restore progress
      const saved = loadProgress();
      if (saved && saved.filesetId === fsObj.filesetId && saved.book_id === bkId && saved.chapter === ch) {
        if (audioRef.current) audioRef.current.currentTime = saved.currentTime || 0;
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || '';
      setError(msg || 'Audio unavailable for this chapter. Try another book or version.');
    } finally {
      setLoading(false);
    }
  }, []);

  // When fileset/book/chapter changes → reload audio
  useEffect(() => {
    if (fileset?.filesetId) {
      loadChapter(fileset, bookId, chapter);
    }
  }, [fileset, bookId, chapter, loadChapter]);

  // Current audio URL
  const currentFile = audioItems[currentFileIdx] || null;
  const audioUrl = currentFile?.path || null;

  // Wire HTML audio element
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.playbackRate = speed;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      saveProgress(fileset?.filesetId, bookId, chapter, audio.currentTime);
    };
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      if (currentFileIdx < audioItems.length - 1) {
        setCurrentFileIdx(i => i + 1);
      } else if (autoPlayNext) {
        nextChapter();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [fileset, bookId, chapter, currentFileIdx, audioItems, autoPlayNext, speed]);

  // Load new src when URL changes
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = audioUrl;
    audio.playbackRate = speed;
    if (isPlaying) audio.play().catch(() => {});
  }, [audioUrl]);

  // Speed change
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const play = () => { audioRef.current?.play().catch(() => {}); setIsPlaying(true); };
  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); };
  const togglePlay = () => (isPlaying ? pause() : play());
  const seekBy = (secs) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + secs); };
  const seekTo = (time) => { if (audioRef.current) audioRef.current.currentTime = time; };
  const nextChapter = () => { setCurrentFileIdx(0); setChapter(c => c + 1); };
  const prevChapter = () => { setCurrentFileIdx(0); setChapter(c => Math.max(1, c - 1)); };

  const startSleepTimer = (minutes) => {
    clearInterval(sleepTimerRef.current);
    setSleepMinutes(minutes);
    setSleepRemaining(minutes * 60);
    sleepTimerRef.current = setInterval(() => {
      setSleepRemaining(r => {
        if (r <= 1) { clearInterval(sleepTimerRef.current); pause(); setSleepMinutes(null); return 0; }
        return r - 1;
      });
    }, 1000);
  };

  const cancelSleepTimer = () => { clearInterval(sleepTimerRef.current); setSleepMinutes(null); setSleepRemaining(0); };

  useEffect(() => {
    return () => { audioRef.current?.pause(); clearInterval(sleepTimerRef.current); };
  }, []);

  return {
    fileset, setFileset,
    bookId, setBookId,
    chapter, setChapter,
    audioItems, currentFileIdx,
    audioUrl, isPlaying, loading, error,
    speed, setSpeed,
    duration, currentTime,
    sleepMinutes, sleepRemaining,
    autoPlayNext, setAutoPlayNext,
    booksList,
    togglePlay, play, pause,
    seekBy, seekTo,
    nextChapter, prevChapter,
    startSleepTimer, cancelSleepTimer,
    loadChapter,
    // backward compat alias
    files: audioItems,
    fileset_id: fileset?.filesetId,
  };
}