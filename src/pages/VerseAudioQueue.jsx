import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, SkipForward, SkipBack, Volume2,
  Music2, BookOpen, Trash2, ListMusic, ChevronUp, ChevronDown,
  Repeat, Shuffle, Globe, AlertCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// ── Playback language options ──────────────────────────────────────────────
const VERSE_AUDIO_LANGUAGE_OPTIONS = [
  { value: 'en',             label: 'English',                            enabled: true  },
  { value: 'hae',            label: 'Afaan Oromoo (Bahaa)',               enabled: true  },
  { value: 'gaz',            label: 'Afaan Oromoo (Lixaa Giddugaleessa)', enabled: true  },
  { value: 'am',             label: 'አማርኛ',                             enabled: false, note: 'Coming Soon' },
  { value: 'ar',             label: 'العربية',                            enabled: false, note: 'Coming Soon' },
  { value: 'sw',             label: 'Kiswahili',                          enabled: false, note: 'Coming Soon' },
  { value: 'fr',             label: 'Français',                           enabled: false, note: 'Coming Soon' },
  { value: 'ti',             label: 'ትግርኛ',                             enabled: false, note: 'Coming Soon' },
];

const AUDIO_UNAVAILABLE_MSG = {
  en:  'Audio is not available for the selected language.',
  hae: 'Sagaleen afaan filatame kanaaf hin argamu.',
  gaz: 'Sagaleen afaan filatame kanaaf hin argamu.',
  am:  'ለተመረጠው ቋንቋ የድምፅ ንባብ አይገኝም።',
  default: 'Audio is not available for the selected language.',
};

const EMPTY_STATE_MSG = {
  en:  { title: 'No verses in your queue yet.', sub: 'Add saved verses or send a verse from the Bible Reader to start playback.' },
  hae: { title: 'Aayanni kamiyyuu keessa hin jiru.', sub: 'Taphannaa jalqabuuf aayata kuufatte ykn kan amma dubbisaa jirtu dabali.' },
  gaz: { title: 'Aayanni kamiyyuu keessa hin jiru.', sub: 'Taphannaa jalqabuuf aayata kuufatte ykn kan amma dubbisaa jirtu dabali.' },
  am:  { title: 'በተራው ውስጥ ምንም አይነት ጥቅስ የለም።', sub: 'ማጫወት ለመጀመር የተቀመጡ ጥቅሶችን ወይም አሁን የምታነቡትን ጥቅስ ያክሉ።' },
};

// ── Ambient tracks ─────────────────────────────────────────────────────────
const AMBIENT_TRACKS = [
  { id: 'peaceful', label: '🕊️ Peaceful Piano',    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'nature',   label: '🌿 Nature & Stillness', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 'none',     label: '🔇 No Music',            url: null },
];

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

// ── TTS hook ───────────────────────────────────────────────────────────────
function useTextToSpeech() {
  const synthRef = useRef(window.speechSynthesis);

  const speak = useCallback((text, rate = 1.0, onEnd) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = 0.95;
    utter.volume = 1;
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang === 'en-US')
      || voices[0];
    if (preferred) utter.voice = preferred;
    utter.onend = onEnd;
    synthRef.current.speak(utter);
  }, []);

  const pause  = useCallback(() => synthRef.current.pause(), []);
  const resume = useCallback(() => synthRef.current.resume(), []);
  const cancel = useCallback(() => synthRef.current.cancel(), []);

  return { speak, pause, resume, cancel };
}

// ── Main component ──────────────────────────────────────────────────────────
export default function VerseAudioQueue() {
  const [user, setUser] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [ambientTrack, setAmbientTrack] = useState(AMBIENT_TRACKS[0]);
  const [ambientVolume, setAmbientVolume] = useState(30);
  const [showQueue, setShowQueue] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [playbackLang, setPlaybackLang] = useState('en');
  const ambientRef = useRef(null);
  const { speak, pause: ttsPause, resume: ttsResume, cancel } = useTextToSpeech();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: savedVerses = [] } = useQuery({
    queryKey: ['saved-verses-queue', user?.id],
    queryFn: () => base44.entities.SavedVerse.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
    enabled: !!user?.id,
  });

  // Ambient volume sync
  useEffect(() => {
    if (ambientRef.current) ambientRef.current.volume = ambientVolume / 100;
  }, [ambientVolume]);

  // Ambient play/pause with main playback
  useEffect(() => {
    if (!ambientRef.current) return;
    if (isPlaying && ambientTrack.url) ambientRef.current.play().catch(() => {});
    else ambientRef.current.pause();
  }, [isPlaying, ambientTrack]);

  const currentVerse = queue[currentIdx];
  const selectedLangOption = VERSE_AUDIO_LANGUAGE_OPTIONS.find(o => o.value === playbackLang);
  const audioAvailable = selectedLangOption?.enabled ?? false;

  const getNextIdx = useCallback(() => {
    if (shuffleOn) return Math.floor(Math.random() * queue.length);
    if (repeatOn) return currentIdx;
    return currentIdx < queue.length - 1 ? currentIdx + 1 : null;
  }, [currentIdx, queue.length, shuffleOn, repeatOn]);

  const playVerse = useCallback((idx) => {
    if (!queue[idx]) return;
    const verse = queue[idx];
    const text = `${verse.reference}. ${verse.verse_text || verse.text || ''}`;
    setCurrentIdx(idx);
    setIsPlaying(true);
    setIsPaused(false);
    speak(text, speed, () => {
      if (autoAdvance) {
        const next = getNextIdx();
        if (next !== null) setTimeout(() => playVerse(next), 800);
        else setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    });
  }, [queue, speed, speak, autoAdvance, getNextIdx]);

  const handlePlay = () => {
    if (!audioAvailable) { toast.error(AUDIO_UNAVAILABLE_MSG[playbackLang] || AUDIO_UNAVAILABLE_MSG.default); return; }
    if (queue.length === 0) { toast.info('Add verses to your queue first'); return; }
    if (isPaused) { ttsResume(); setIsPaused(false); return; }
    playVerse(currentIdx);
  };

  const handlePause = () => { ttsPause(); setIsPaused(true); setIsPlaying(false); if (ambientRef.current) ambientRef.current.pause(); };
  const handleStop  = () => { cancel(); setIsPlaying(false); setIsPaused(false); if (ambientRef.current) { ambientRef.current.pause(); ambientRef.current.currentTime = 0; } };
  const handleNext  = () => { cancel(); playVerse(currentIdx < queue.length - 1 ? currentIdx + 1 : 0); };
  const handlePrev  = () => { cancel(); playVerse(currentIdx > 0 ? currentIdx - 1 : queue.length - 1); };

  const addToQueue = (verse) => {
    if (queue.find(q => q.id === verse.id)) { toast.info('Already in queue'); return; }
    setQueue(q => [...q, verse]);
    toast.success('Added to queue');
  };

  const removeFromQueue = (id) => {
    setQueue(q => q.filter(v => v.id !== id));
    if (currentIdx >= queue.length - 1) setCurrentIdx(Math.max(0, currentIdx - 1));
  };

  const clearQueue = () => { cancel(); setQueue([]); setIsPlaying(false); setCurrentIdx(0); };

  const emptyMsg = EMPTY_STATE_MSG[playbackLang] || EMPTY_STATE_MSG.en;
  const unavailableMsg = AUDIO_UNAVAILABLE_MSG[playbackLang] || AUDIO_UNAVAILABLE_MSG.default;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {ambientTrack.url && <audio ref={ambientRef} src={ambientTrack.url} loop preload="none" />}

      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Music2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Verse Audio Queue</h1>
        <p className="text-white/60 text-sm mt-1">Listen to saved verses in your preferred language</p>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">

        {/* ── Playback Language Selector ── */}
        <Card className="bg-white/10 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-indigo-300" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Playback Language</p>
            </div>
            <select
              value={playbackLang}
              onChange={e => { setPlaybackLang(e.target.value); handleStop(); }}
              className="w-full min-h-[44px] bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {VERSE_AUDIO_LANGUAGE_OPTIONS.map(lang => (
                <option
                  key={lang.value}
                  value={lang.value}
                  disabled={!lang.enabled}
                  className="bg-slate-800 text-white"
                >
                  {lang.label}{!lang.enabled ? ` — ${lang.note || 'Coming Soon'}` : ''}
                </option>
              ))}
            </select>
            {!audioAvailable && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-900/30 rounded-lg border border-amber-500/30">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">{unavailableMsg}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Now Playing Card ── */}
        <Card className="bg-white/10 border-white/10 text-white">
          <CardContent className="pt-6 pb-4">
            {currentVerse ? (
              <AnimatePresence mode="wait">
                <motion.div key={currentVerse.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isPlaying
                      ? <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}><BookOpen className="w-8 h-8 text-white" /></motion.div>
                      : <BookOpen className="w-8 h-8 text-white/60" />}
                  </div>
                  <p className="text-sm font-semibold text-indigo-300 mb-2">{currentVerse.reference || currentVerse.book}</p>
                  <p className="text-base text-white/90 leading-relaxed italic line-clamp-4">"{currentVerse.verse_text || currentVerse.text || '—'}"</p>
                  <p className="text-xs text-white/40 mt-3">{currentIdx + 1} of {queue.length}</p>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* ── Empty State ── */
              <div className="text-center py-4 space-y-3">
                <BookOpen className="w-10 h-10 text-white/20 mx-auto" />
                <div>
                  <p className="text-white/70 text-sm font-semibold">{emptyMsg.title}</p>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed max-w-xs mx-auto">{emptyMsg.sub}</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => document.getElementById('saved-verses-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add from Saved Verses
                  </button>
                  <Link
                    to="/BibleReaderPage"
                    className="w-full min-h-[44px] bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" /> Open Bible Reader
                  </Link>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => setShuffleOn(v => !v)} className={`p-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${shuffleOn ? 'text-indigo-300' : 'text-white/40 hover:text-white/70'}`}>
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={handlePrev} disabled={queue.length === 0} className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={queue.length === 0 || !audioAvailable}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                title={!audioAvailable ? unavailableMsg : queue.length === 0 ? 'Add verses first' : ''}
              >
                {isPlaying
                  ? <Pause className="w-6 h-6 text-indigo-800" />
                  : <Play className="w-6 h-6 text-indigo-800 ml-0.5" />}
              </button>
              <button onClick={handleNext} disabled={queue.length === 0} className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <SkipForward className="w-6 h-6" />
              </button>
              <button onClick={() => setRepeatOn(v => !v)} className={`p-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${repeatOn ? 'text-indigo-300' : 'text-white/40 hover:text-white/70'}`}>
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Speed */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-white/40">Speed:</span>
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setSpeed(s); if (isPlaying && currentVerse) { cancel(); setTimeout(() => playVerse(currentIdx), 100); } }}
                  className={`text-xs px-2 py-1 rounded-full min-h-[32px] transition-all ${speed === s ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Background Music ── */}
        <Card className="bg-white/10 border-white/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">🎵 Background Music</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {AMBIENT_TRACKS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setAmbientTrack(t); if (ambientRef.current) { ambientRef.current.pause(); ambientRef.current.currentTime = 0; } }}
                  className={`text-xs px-3 py-1.5 rounded-full min-h-[36px] transition-all ${ambientTrack.id === t.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {ambientTrack.url && (
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-white/50 flex-shrink-0" />
                <Slider min={0} max={100} step={5} value={[ambientVolume]} onValueChange={([v]) => setAmbientVolume(v)} className="flex-1" />
                <span className="text-xs text-white/40 w-8">{ambientVolume}%</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-white/60">Auto-advance to next verse</span>
              <button
                onClick={() => setAutoAdvance(v => !v)}
                className={`relative inline-flex h-6 w-10 rounded-full transition-colors min-h-[36px] items-center ${autoAdvance ? 'bg-indigo-500' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${autoAdvance ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ── Queue ── */}
        <Card className="bg-white/10 border-white/10">
          <CardContent className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setShowQueue(v => !v)} className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wide min-h-[36px]">
                <ListMusic className="w-4 h-4" />
                Queue ({queue.length})
                {showQueue ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {queue.length > 0 && (
                <button onClick={clearQueue} className="text-xs text-red-400 hover:text-red-300 min-h-[36px] px-2">Clear all</button>
              )}
            </div>
            {showQueue && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {queue.length === 0 && (
                  <p className="text-white/30 text-xs text-center py-4">Queue is empty.</p>
                )}
                {queue.map((v, i) => (
                  <div
                    key={v.id}
                    onClick={() => { cancel(); playVerse(i); }}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${i === currentIdx && isPlaying ? 'bg-indigo-500/30 border border-indigo-400/30' : 'hover:bg-white/5'}`}
                  >
                    {i === currentIdx && isPlaying && (
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">{v.reference || v.book}</p>
                      <p className="text-xs text-white/40 truncate">{v.verse_text || v.text}</p>
                      <p className="text-xs text-indigo-400/60 mt-0.5">{selectedLangOption?.label}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFromQueue(v.id); }} className="p-1 text-white/30 hover:text-red-400 flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Saved Verses Library ── */}
        <div id="saved-verses-section">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-3 px-1">📖 Your Saved Verses</p>
          {!user ? (
            <p className="text-white/30 text-xs text-center py-6">Sign in to access your saved verses</p>
          ) : savedVerses.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-white/30 text-xs">No saved verses yet.</p>
              <Link to="/BibleReaderPage" className="inline-flex items-center gap-2 min-h-[44px] px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors">
                <BookOpen className="w-4 h-4" /> Open Bible Reader
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedVerses.map(v => (
                <Card key={v.id} className="bg-white/5 border-white/10">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-indigo-300">{v.reference || `${v.book} ${v.chapter}:${v.verse}`}</p>
                        <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{v.verse_text || v.text}</p>
                      </div>
                      <button
                        onClick={() => addToQueue(v)}
                        className="text-xs px-3 py-1.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex-shrink-0 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Queue
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}