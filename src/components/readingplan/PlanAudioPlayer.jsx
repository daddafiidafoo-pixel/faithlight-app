import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioCatalog } from '../audio/useAudioCatalog';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, Loader2 } from 'lucide-react';

// Map full book name → 3-letter Bible Brain book ID
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

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

export default function PlanAudioPlayer({ assignment, onClose }) {
  const { prefs, resolveEntry, getChapterUrl } = useAudioCatalog();
  const audioRef = useRef(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const chapters = assignment?.chapters || [];
  const current = chapters[chapterIndex];

  const langCode = prefs.audio_language_code || 'en';
  const catalogId = prefs.audio_catalog_id || null;
  const { entry } = resolveEntry(langCode, catalogId, 'en');

  // Fetch audio URL whenever chapter/entry changes
  useEffect(() => {
    if (!current || !entry?.fileset_id_audio) {
      setAudioUrl(null);
      return;
    }
    setLoadingUrl(true);
    setAudioError(null);
    setPlaying(false);
    const bookId = BOOK_IDS[current.book] || current.book;
    getChapterUrl(entry.fileset_id_audio, bookId, current.chapter)
      .then(url => {
        setAudioUrl(url);
        setLoadingUrl(false);
        if (!url) setAudioError('Audio URL unavailable. Configure Bible Brain API key.');
      })
      .catch(e => { setAudioError(e.message); setLoadingUrl(false); });
  }, [chapterIndex, entry?.fileset_id_audio]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(e => setAudioError(e.message)); }
  };

  const skip = (s) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + s); };
  const next = () => { if (chapterIndex < chapters.length - 1) setChapterIndex(i => i + 1); };
  const prev = () => { if (chapterIndex > 0) setChapterIndex(i => i - 1); };

  if (!assignment || !chapters.length) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-200" />
            <div>
              <p className="text-white font-semibold text-sm">Reading Plan Audio</p>
              <p className="text-indigo-200 text-xs">
                {current?.book} {current?.chapter} · {chapterIndex+1}/{chapters.length}
                {entry && <span> · {entry.bible_name}</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-indigo-500 text-indigo-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter pills */}
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto">
          {chapters.map((c, i) => (
            <button key={i} onClick={() => setChapterIndex(i)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${i === chapterIndex ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}>
              {c.book} {c.chapter}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="px-4 pb-1">
          <input type="range" min={0} max={100}
            value={duration ? Math.round((currentTime / duration) * 100) : 0}
            onChange={e => { if (audioRef.current) audioRef.current.currentTime = (e.target.value / 100) * duration; }}
            className="w-full accent-indigo-600 h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-4 pb-4 pt-1">
          <button onClick={prev} disabled={chapterIndex === 0} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-all">
            <SkipBack className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => skip(-10)} className="px-2 py-1.5 rounded-full hover:bg-gray-100 text-gray-500 text-xs transition-all">⏪10</button>
          <button onClick={togglePlay} disabled={loadingUrl || !entry}
            className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-md hover:bg-indigo-700 transition-all disabled:opacity-60">
            {loadingUrl ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : playing ? <Pause className="w-5 h-5 text-white" />
              : <Play className="w-5 h-5 text-white ml-0.5" />}
          </button>
          <button onClick={() => skip(10)} className="px-2 py-1.5 rounded-full hover:bg-gray-100 text-gray-500 text-xs transition-all">10⏩</button>
          <button onClick={next} disabled={chapterIndex === chapters.length - 1} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-all">
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {audioError && <p className="text-center text-xs text-amber-600 pb-3 px-4">{audioError}</p>}
        {!entry && <p className="text-center text-xs text-red-400 pb-3">No audio catalog configured for this language.</p>}

        <audio ref={audioRef} src={audioUrl || undefined}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={next}
          onError={() => setAudioError('Audio stream unavailable.')}
        />
      </div>
    </div>
  );
}