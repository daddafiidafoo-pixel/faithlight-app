/**
 * useAudioBible — master hook for the Audio Bible experience
 * Handles: catalog discovery, book list, audio loading, playback, progress persistence
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const PREFS_KEY = 'audio_bible_prefs_v2';
const PROGRESS_KEY = 'audio_bible_progress_v2';

function savePrefs(prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch { return null; }
}
function saveProgress(filesetId, bookId, chapter, currentTime) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    all[`${filesetId}:${bookId}:${chapter}`] = { currentTime, ts: Date.now() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}
function loadProgress(filesetId, bookId, chapter) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return all[`${filesetId}:${bookId}:${chapter}`]?.currentTime || 0;
  } catch { return 0; }
}

const invoke = (fn, payload) => base44.functions.invoke(fn, payload);

export function useAudioBible() {
  const audioRef = useRef(null);
  const sleepTimerRef = useRef(null);

  // Init from saved prefs
  const savedPrefs = loadPrefs();

  const [lang, setLangState] = useState(savedPrefs?.lang || 'en');
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersionState] = useState(null); // {bibleId, filesetId, bibleName, type}
  const [books, setBooks] = useState([]);
  const [bookId, setBookIdState] = useState(savedPrefs?.bookId || 'JHN');
  const [chapter, setChapterState] = useState(savedPrefs?.chapter || 1);

  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const [audioUrl, setAudioUrl] = useState(null);
  const [verseItems, setVerseItems] = useState([]); // [{verse_start, verse_start_time, ...}]
  const [hasVerseTiming, setHasVerseTiming] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(savedPrefs?.speed || 1);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [sleepMinutes, setSleepMinutes] = useState(null);
  const [sleepRemaining, setSleepRemaining] = useState(0);

  // Persist prefs on change
  useEffect(() => {
    savePrefs({ lang, bookId, chapter, speed, filesetId: selectedVersion?.filesetId });
  }, [lang, bookId, chapter, speed, selectedVersion]);

  // ── Language change → fetch catalog ──────────────────────────────────────────
  const fetchCatalog = useCallback(async (langCode) => {
    setCatalogLoading(true);
    setCatalogError(null);
    setVersions([]);
    setSelectedVersionState(null);
    setBooks([]);
    setAudioUrl(null);
    setVerseItems([]);

    try {
      const res = await invoke('bibleBrainAudio', { action: 'catalog', lang: langCode });
      const vs = res.data?.versions || [];
      setVersions(vs);
      if (vs.length > 0) {
        // Prefer complete (C) + drama, else first
        const best = vs.find(v => v.size === 'C' && v.type === 'audio_drama')
          || vs.find(v => v.size === 'C')
          || vs[0];
        setSelectedVersionState(best);
      }
    } catch (e) {
      setCatalogError(e?.response?.data?.error || e.message || 'Failed to load versions');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatalog(lang); }, [lang]);

  // ── Version change → fetch book list ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedVersion?.filesetId) return;
    setBooksLoading(true);
    invoke('bibleBrainAudio', { action: 'books', filesetId: selectedVersion.filesetId, bibleId: selectedVersion.bibleId })
      .then(res => {
        const bs = res.data?.books || [];
        setBooks(bs);
        // If current bookId not in list, reset to first available
        if (bs.length > 0 && !bs.find(b => b.bookId === bookId)) {
          setBookIdState(bs[0].bookId);
          setChapterState(1);
        }
      })
      .catch(() => {})
      .finally(() => setBooksLoading(false));
  }, [selectedVersion?.filesetId]);

  // ── Book/Chapter change → fetch audio ────────────────────────────────────────
  const loadAudio = useCallback(async (filesetId, bkId, ch) => {
    if (!filesetId || !bkId || !ch) return;
    setAudioLoading(true);
    setAudioError(null);
    setAudioUrl(null);
    setVerseItems([]);
    setHasVerseTiming(false);

    try {
      const res = await invoke('bibleBrainAudio', {
        action: 'chapter',
        filesetId,
        bookId: bkId,
        chapter: String(ch),
      });
      const d = res.data;
      setAudioUrl(d.audioUrl);
      setVerseItems(d.items || []);
      setHasVerseTiming(d.hasVerseTiming || false);
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Audio unavailable for this chapter';
      setAudioError(msg);
    } finally {
      setAudioLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedVersion?.filesetId) {
      loadAudio(selectedVersion.filesetId, bookId, chapter);
    }
  }, [selectedVersion?.filesetId, bookId, chapter]);

  // ── Audio element wiring ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
  }, []);

  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    const audio = audioRef.current;
    audio.pause();
    audio.src = audioUrl;
    audio.playbackRate = speed;
    // Restore saved position
    const saved = loadProgress(selectedVersion?.filesetId, bookId, chapter);
    if (saved > 1) audio.currentTime = saved;
    if (isPlaying) audio.play().catch(() => {});
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      saveProgress(selectedVersion?.filesetId, bookId, chapter, audio.currentTime);
    };
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (autoPlayNext) nextChapter();
      else setIsPlaying(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [selectedVersion, bookId, chapter, autoPlayNext]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // ── Playback controls ─────────────────────────────────────────────────────────
  const play = () => { audioRef.current?.play().catch(() => {}); };
  const pause = () => { audioRef.current?.pause(); };
  const togglePlay = () => (isPlaying ? pause() : play());
  const seekBy = (s) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + s); };
  const seekTo = (t) => { if (audioRef.current) audioRef.current.currentTime = t; };

  const nextChapter = () => {
    const book = books.find(b => b.bookId === bookId);
    const chapCount = Array.isArray(book?.chapters) ? book.chapters.length : (book?.chapters || 150);
    const maxCh = chapCount;
    if (chapter < maxCh) {
      setChapterState(c => c + 1);
    } else {
      // Next book
      const idx = books.findIndex(b => b.bookId === bookId);
      if (idx < books.length - 1) {
        setBookIdState(books[idx + 1].bookId);
        setChapterState(1);
      }
    }
  };

  const prevChapter = () => {
    if (chapter > 1) setChapterState(c => c - 1);
    else {
      const idx = books.findIndex(b => b.bookId === bookId);
      if (idx > 0) {
        setBookIdState(books[idx - 1].bookId);
        setChapterState(1);
      }
    }
  };

  const setLang = (l) => { audioRef.current?.pause(); setLangState(l); };
  const setSelectedVersion = (v) => { audioRef.current?.pause(); setSelectedVersionState(v); };
  const setBookId = (b) => { setBookIdState(b); setChapterState(1); };
  const setChapter = (c) => { setChapterState(c); };
  const setSpeed = (s) => { setSpeedState(s); };

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

  // Active verse index based on currentTime
  const activeVerseIdx = hasVerseTiming
    ? verseItems.findLastIndex(v => v.verse_start_time != null && currentTime >= v.verse_start_time)
    : -1;

  useEffect(() => () => {
    audioRef.current?.pause();
    clearInterval(sleepTimerRef.current);
  }, []);

  return {
    // Language
    lang, setLang,
    // Catalog
    versions, catalogLoading, catalogError,
    // Version
    selectedVersion, setSelectedVersion,
    // Books
    books, booksLoading,
    // Navigation
    bookId, setBookId, chapter, setChapter,
    // Audio
    audioUrl, audioLoading, audioError,
    verseItems, hasVerseTiming, activeVerseIdx,
    // Playback state
    isPlaying, currentTime, duration, speed, setSpeed,
    autoPlayNext, setAutoPlayNext,
    // Sleep timer
    sleepMinutes, sleepRemaining, startSleepTimer, cancelSleepTimer,
    // Controls
    togglePlay, play, pause, seekBy, seekTo, nextChapter, prevChapter,
  };
}