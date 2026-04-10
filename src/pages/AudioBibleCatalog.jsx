import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAudioCatalog } from '../components/audio/useAudioCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft,
  Volume2, Loader2, BookOpen, Clock, Gauge, AlertCircle, Settings2,
  Download, Bookmark, BookmarkCheck, Rewind, FastForward,
} from 'lucide-react';
import { toast } from 'sonner';
import VerseTimestampPanel from '../components/audio/VerseTimestampPanel';
import { useBookmarks, BookmarkButton, BookmarksPanel } from '../components/audio/AudioBookmarks';

// ── Constants ───────────────────────────────────────────────────────────────
const BOOK_IDS = {
  Genesis:'GEN',Exodus:'EXO',Leviticus:'LEV',Numbers:'NUM',Deuteronomy:'DEU',
  Joshua:'JOS',Judges:'JDG',Ruth:'RUT','1 Samuel':'1SA','2 Samuel':'2SA',
  '1 Kings':'1KI','2 Kings':'2KI','1 Chronicles':'1CH','2 Chronicles':'2CH',
  Ezra:'EZR',Nehemiah:'NEH',Esther:'EST',Job:'JOB',Psalms:'PSA',
  Proverbs:'PRO',Ecclesiastes:'ECC','Song of Solomon':'SNG',Isaiah:'ISA',
  Jeremiah:'JER',Lamentations:'LAM',Ezekiel:'EZK',Daniel:'DAN',
  Hosea:'HOS',Joel:'JOL',Amos:'AMO',Obadiah:'OBA',Jonah:'JON',
  Micah:'MIC',Nahum:'NAH',Habakkuk:'HAB',Zephaniah:'ZEP',Haggai:'HAG',
  Zechariah:'ZEC',Malachi:'MAL',Matthew:'MAT',Mark:'MRK',Luke:'LUK',
  John:'JHN',Acts:'ACT',Romans:'ROM','1 Corinthians':'1CO','2 Corinthians':'2CO',
  Galatians:'GAL',Ephesians:'EPH',Philippians:'PHP',Colossians:'COL',
  '1 Thessalonians':'1TH','2 Thessalonians':'2TH','1 Timothy':'1TI','2 Timothy':'2TI',
  Titus:'TIT',Philemon:'PHM',Hebrews:'HEB',James:'JAS','1 Peter':'1PE',
  '2 Peter':'2PE','1 John':'1JN','2 John':'2JN','3 John':'3JN',Jude:'JUD',Revelation:'REV',
};

const CHAPTER_COUNTS = {
  Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,
  '1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,
  Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,
  'Song of Solomon':8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,
  Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,
  Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,Matthew:28,Mark:16,Luke:24,
  John:21,Acts:28,Romans:16,'1 Corinthians':16,'2 Corinthians':13,Galatians:6,
  Ephesians:6,Philippians:4,Colossians:4,'1 Thessalonians':5,'2 Thessalonians':3,
  '1 Timothy':6,'2 Timothy':4,Titus:3,Philemon:1,Hebrews:13,James:5,'1 Peter':5,
  '2 Peter':3,'1 John':5,'2 John':1,'3 John':1,Jude:1,Revelation:22,
};

const OT_BOOKS = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'];
const NT_BOOKS = ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const SPEEDS = [0.75, 1.0, 1.25, 1.5];
const SLEEP_TIMERS = [0, 10, 20, 30, 60];

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// ── Book List ────────────────────────────────────────────────────────────────
function BookList({ onSelectBook }) {
  const [search, setSearch] = useState('');
  const filter = list => list.filter(b => b.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Select Book</h2>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter books…"
        className="w-full px-4 py-2 mb-4 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-400" />
      {[['Old Testament', OT_BOOKS], ['New Testament', NT_BOOKS]].map(([label, books]) => {
        const filtered = filter(books);
        if (!filtered.length) return null;
        return (
          <div key={label} className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map(book => (
                <button key={book} onClick={() => onSelectBook(book)}
                  className="text-left px-3 py-3 min-h-[44px] rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-sm font-medium text-gray-700 transition-all">
                  {book}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Chapter List ─────────────────────────────────────────────────────────────
function ChapterList({ book, onSelectChapter, onBack }) {
  const count = CHAPTER_COUNTS[book] || 1;
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{book}</h2>
          <p className="text-xs text-gray-400">{count} chapters</p>
        </div>
        <Button size="sm" onClick={() => onSelectChapter(1)} className="bg-indigo-600 hover:bg-indigo-700 gap-1 text-xs">
          <Play className="w-3.5 h-3.5" /> From Ch. 1
        </Button>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {Array.from({ length: count }, (_, i) => i + 1).map(ch => (
          <button key={ch} onClick={() => onSelectChapter(ch)}
            className="py-2.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-sm font-semibold text-gray-700 transition-all">
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Player ───────────────────────────────────────────────────────────────────
function Player({ book, chapter, entry, fallbackMsg, onBack, onChapterChange, prefs, onPrefsChange, getChapterUrl, getTimestamps }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [sleepCountdown, setSleepCountdown] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [loadingTs, setLoadingTs] = useState(false);
  const [downloadAllowed, setDownloadAllowed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const sleepRef = useRef(null);
  const { bookmarks, addBookmark, removeBookmark, bookmarksForChapter } = useBookmarks();

  const speed = prefs.audio_speed || 1.0;
  const sleepTimer = prefs.sleep_timer_minutes || 0;
  const totalChapters = CHAPTER_COUNTS[book] || 1;
  const bookId = BOOK_IDS[book] || book;

  // Fetch audio URL + timestamps + download check when chapter/entry changes
  useEffect(() => {
    if (!entry?.fileset_id_audio || !book || !chapter) { setAudioUrl(null); return; }
    setLoadingUrl(true);
    setAudioError(null);
    setPlaying(false);
    setCurrentTime(0);
    setTimestamps([]);

    const fileset = entry.fileset_id_audio;

    // Fetch URL, timestamps, and download permission in parallel
    Promise.all([
      getChapterUrl(fileset, bookId, chapter),
      getTimestamps(fileset, bookId, chapter),
      base44.functions.invoke('bibleBrain', { action: 'check_downloads', fileset_id: fileset })
        .then(r => r?.data?.allowed || false).catch(() => false),
    ]).then(([url, ts, dlAllowed]) => {
      setAudioUrl(url);
      setTimestamps(ts || []);
      setDownloadAllowed(dlAllowed);
      if (!url) setAudioError('Audio URL not available. Set BIBLE_BRAIN_API_KEY and add fileset_id_audio to catalog.');
    }).catch(e => setAudioError(e.message))
      .finally(() => setLoadingUrl(false));
  }, [book, chapter, entry?.fileset_id_audio]);

  useEffect(() => { if (audioUrl && audioRef.current) audioRef.current.load(); }, [audioUrl]);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  // Sleep timer
  useEffect(() => {
    clearTimeout(sleepRef.current);
    setSleepCountdown(null);
    if (sleepTimer > 0) {
      setSleepCountdown(sleepTimer * 60);
      sleepRef.current = setTimeout(() => { audioRef.current?.pause(); setPlaying(false); toast('😴 Sleep timer ended.'); }, sleepTimer * 60000);
      const tick = setInterval(() => setSleepCountdown(p => p > 0 ? p - 1 : 0), 1000);
      return () => { clearTimeout(sleepRef.current); clearInterval(tick); };
    }
  }, [sleepTimer]);

  // Save position every 5s
  useEffect(() => {
    const id = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused)
        onPrefsChange({ last_audio_book: book, last_audio_chapter: chapter, last_audio_position: Math.floor(audioRef.current.currentTime) });
    }, 5000);
    return () => clearInterval(id);
  }, [book, chapter]);

  // Media Session API (lock screen / background controls)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${book} ${chapter}`,
      artist: entry?.bible_name || 'FaithLight Audio Bible',
      album: entry?.language_name || 'Audio Bible',
      artwork: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    });
    navigator.mediaSession.setActionHandler('play', () => { audioRef.current?.play(); setPlaying(true); });
    navigator.mediaSession.setActionHandler('pause', () => { audioRef.current?.pause(); setPlaying(false); });
    navigator.mediaSession.setActionHandler('previoustrack', () => chapter > 1 && onChapterChange(chapter - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => chapter < totalChapters && onChapterChange(chapter + 1));
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-30));
    navigator.mediaSession.setActionHandler('seekforward', () => skip(30));
    return () => {
      ['play','pause','previoustrack','nexttrack','seekbackward','seekforward'].forEach(a => {
        try { navigator.mediaSession.setActionHandler(a, null); } catch {}
      });
    };
  }, [book, chapter, entry, totalChapters]);

  // Update Media Session position state
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration) return;
    try {
      navigator.mediaSession.setPositionState({ duration, playbackRate: speed, position: currentTime });
    } catch {}
  }, [currentTime, duration, speed]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(e => setAudioError(e.message)); }
  };

  const skip = useCallback((s) => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + s, duration || 9999));
  }, [duration]);

  const seekToTimestamp = (ts) => {
    if (audioRef.current) {
      audioRef.current.currentTime = ts;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    setDownloading(true);
    try {
      const resp = await fetch(audioUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book}_${chapter}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${book} ${chapter}`);
    } catch (e) {
      toast.error('Download failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Now Playing</p>
          <h2 className="text-xl font-bold text-gray-900">{book} {chapter}</h2>
          {entry && <p className="text-xs text-gray-400">{entry.bible_name} · {entry.language_name}</p>}
        </div>
        {/* Bookmark + Download actions */}
        <BookmarkButton book={book} chapter={chapter} currentTime={currentTime} addBookmark={addBookmark} bookmarksForChapter={bookmarksForChapter} />
        {downloadAllowed && (
          <button onClick={handleDownload} disabled={downloading || !audioUrl}
            title="Download this chapter"
            className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
        )}
      </div>

      {fallbackMsg && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />{fallbackMsg}
        </div>
      )}

      {/* Main player card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white mb-4 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            {loadingUrl ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <BookOpen className="w-7 h-7 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg leading-tight">{book}</p>
            <p className="text-indigo-200 text-sm">Chapter {chapter} of {totalChapters}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <input type="range" min="0" max="100"
            value={duration ? Math.round((currentTime / duration) * 100) : 0}
            onChange={e => { if (audioRef.current && duration) audioRef.current.currentTime = (e.target.value / 100) * duration; }}
            className="w-full accent-white h-1.5 cursor-pointer" />
          <div className="flex justify-between text-xs text-indigo-200 mt-1">
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => chapter > 1 && onChapterChange(chapter - 1)} disabled={chapter <= 1}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all" title="Previous chapter">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={() => skip(-30)} className="p-2 rounded-full hover:bg-white/10 transition-all flex flex-col items-center" title="Back 30s">
            <Rewind className="w-4 h-4" />
            <span className="text-xs leading-none">30</span>
          </button>
          <button onClick={() => skip(-10)} className="p-2 rounded-full hover:bg-white/10 transition-all flex flex-col items-center" title="Back 10s">
            <Rewind className="w-4 h-4" />
            <span className="text-xs leading-none">10</span>
          </button>
          <button onClick={togglePlay} disabled={loadingUrl || !audioUrl}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50 mx-2">
            {loadingUrl ? <Loader2 className="w-7 h-7 text-indigo-700 animate-spin" />
              : playing ? <Pause className="w-7 h-7 text-indigo-700" />
              : <Play className="w-7 h-7 text-indigo-700 ml-1" />}
          </button>
          <button onClick={() => skip(10)} className="p-2 rounded-full hover:bg-white/10 transition-all flex flex-col items-center" title="Forward 10s">
            <FastForward className="w-4 h-4" />
            <span className="text-xs leading-none">10</span>
          </button>
          <button onClick={() => skip(30)} className="p-2 rounded-full hover:bg-white/10 transition-all flex flex-col items-center" title="Forward 30s">
            <FastForward className="w-4 h-4" />
            <span className="text-xs leading-none">30</span>
          </button>
          <button onClick={() => chapter < totalChapters && onChapterChange(chapter + 1)} disabled={chapter >= totalChapters}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all" title="Next chapter">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {audioError && <p className="text-center text-xs text-amber-200 mt-3">⚠️ {audioError}</p>}
      </div>

      {/* Speed + Sleep */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Speed</p>
            <div className="flex gap-1.5">
              {SPEEDS.map(s => (
                <button key={s} onClick={() => onPrefsChange({ audio_speed: s })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${speed === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}>
                  {s}x
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Sleep
              {sleepCountdown > 0 && <span className="ml-1 text-amber-500 font-mono">{formatTime(sleepCountdown)}</span>}
            </p>
            <div className="flex gap-1.5">
              {SLEEP_TIMERS.map(t => (
                <button key={t} onClick={() => onPrefsChange({ sleep_timer_minutes: t })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${sleepTimer === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}>
                  {t === 0 ? 'Off' : `${t}m`}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookmarks panel */}
      <BookmarksPanel book={book} chapter={chapter} bookmarks={bookmarks} removeBookmark={removeBookmark} onJump={seekToTimestamp} />

      {/* Verse timestamps */}
      <VerseTimestampPanel timestamps={timestamps} currentTime={currentTime} onVerseClick={seekToTimestamp} book={book} chapter={chapter} />

      <audio ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); if (chapter < totalChapters) onChapterChange(chapter + 1); }}
        onError={() => setAudioError('Stream unavailable for this chapter.')}
      />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AudioBibleCatalog() {
  const { catalog, loading, languages, versionsForLang, resolveEntry, getChapterUrl, getTimestamps, prefs, setPrefs } = useAudioCatalog();
  const [screen, setScreen] = useState('books');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [langCode, setLangCode] = useState(() => prefs.audio_language_code || 'en');
  const [catalogId, setCatalogId] = useState(() => prefs.audio_catalog_id || null);
  const [showSettings, setShowSettings] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState(null);

  useEffect(() => { setPrefs({ audio_language_code: langCode }); }, [langCode]);
  useEffect(() => { if (catalogId) setPrefs({ audio_catalog_id: catalogId }); }, [catalogId]);

  useEffect(() => {
    if (!catalog.length) return;
    const versions = versionsForLang(langCode);
    if (versions.length && (!catalogId || !versions.find(v => v.id === catalogId))) {
      const def = versions.find(v => v.is_default_for_language) || versions[0];
      setCatalogId(def?.id || null);
    }
  }, [langCode, catalog]);

  const { entry, fallbackUsed } = resolveEntry(langCode, catalogId, 'en');
  const versions = versionsForLang(langCode);

  const handleSelectChapter = (ch) => {
    setSelectedChapter(ch);
    if (fallbackUsed?.startsWith('version_switch')) setFallbackMsg(`Switched to ${fallbackUsed.split(':')[1]}.`);
    else if (fallbackUsed?.startsWith('lang_switch')) setFallbackMsg(`No audio in selected language. Using ${fallbackUsed.split(':')[1]}.`);
    else setFallbackMsg(null);
    setScreen('player');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audio Bible</h1>
              <p className="text-xs text-gray-400">{entry?.language_name || 'Select a language'} · {entry?.bible_name || 'No version configured'}</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(v => !v)}
            aria-label="Audio settings"
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition-all">
            <Settings2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <Card className="mb-5 border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Audio Language</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => (
                    <button key={l.code} onClick={() => { setLangCode(l.code); setCatalogId(null); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${langCode === l.code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
              {versions.length > 1 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Audio Version</p>
                  <div className="flex flex-wrap gap-2">
                    {versions.map(v => (
                      <button key={v.id} onClick={() => setCatalogId(v.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${catalogId === v.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                        {v.bible_name}
                        {!v.has_audio && <span className="ml-1 text-red-400 text-xs">(no audio)</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!entry?.fileset_id_audio && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  ⚠️ No fileset configured. Add <strong>fileset_id_audio</strong> to this AudioCatalog entry and set <strong>BIBLE_BRAIN_API_KEY</strong>.
                </div>
              )}
              {entry?.notes && <p className="text-xs text-gray-400 italic">{entry.notes}</p>}
            </CardContent>
          </Card>
        )}

        {/* Screens */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-5">
            {screen === 'books' && <BookList onSelectBook={book => { setSelectedBook(book); setScreen('chapters'); }} />}
            {screen === 'chapters' && (
              <ChapterList book={selectedBook} onSelectChapter={handleSelectChapter} onBack={() => setScreen('books')} />
            )}
            {screen === 'player' && (
              <Player
                book={selectedBook}
                chapter={selectedChapter}
                entry={entry}
                fallbackMsg={fallbackMsg}
                onBack={() => setScreen('chapters')}
                onChapterChange={ch => { setSelectedChapter(ch); setPrefs({ last_audio_chapter: ch }); }}
                prefs={prefs}
                onPrefsChange={setPrefs}
                getChapterUrl={getChapterUrl}
                getTimestamps={getTimestamps}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}