import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, Volume2, VolumeX, ChevronUp, ChevronDown,
  Music, Music2, SkipBack, SkipForward
} from 'lucide-react';

// Ambient music tracks using oscillator-based Web Audio (no external URLs needed)
const AMBIENT_TRACKS = [
  { id: 'none', label: 'No Music', emoji: '🔇' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { id: 'worship', label: 'Worship', emoji: '🙏' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
];

const SPEEDS = [0.6, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0];

// Create ambient drone sound via Web Audio API
function createAmbientNode(audioCtx, trackId) {
  if (trackId === 'none') return null;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 2);
  masterGain.connect(audioCtx.destination);

  const configs = {
    peaceful: [
      { freq: 174, type: 'sine', gain: 0.6 },
      { freq: 261.6, type: 'sine', gain: 0.4 },
      { freq: 349.2, type: 'sine', gain: 0.3 },
    ],
    worship: [
      { freq: 196, type: 'sine', gain: 0.5 },
      { freq: 293.7, type: 'sine', gain: 0.4 },
      { freq: 392, type: 'sine', gain: 0.25 },
    ],
    nature: [
      { freq: 220, type: 'sine', gain: 0.35 },
      { freq: 329.6, type: 'sine', gain: 0.3 },
      { freq: 440, type: 'sine', gain: 0.2 },
    ],
  };

  const nodes = [];
  const track = configs[trackId] || configs.peaceful;

  track.forEach(({ freq, type, gain }) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    // slow gentle LFO vibrato
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.3, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    g.gain.setValueAtTime(gain, audioCtx.currentTime);
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    nodes.push(osc, g, lfo, lfoGain);
  });

  return { masterGain, nodes };
}

export default function VerseTTSPlayer({ verses = [], bookName = '', chapterNum = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [ambientTrack, setAmbientTrack] = useState('none');
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [showAmbient, setShowAmbient] = useState(false);

  const synthRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  // Rebuild ambient when track changes
  useEffect(() => {
    stopAmbient();
    if (isPlaying && ambientTrack !== 'none') {
      startAmbient();
    }
  }, [ambientTrack]);

  // Ambient volume
  useEffect(() => {
    if (ambientRef.current?.masterGain) {
      ambientRef.current.masterGain.gain.setTargetAtTime(
        ambientTrack === 'none' ? 0 : ambientVolume * 0.12,
        audioCtxRef.current?.currentTime || 0,
        0.5
      );
    }
  }, [ambientVolume, ambientTrack]);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function startAmbient() {
    if (ambientTrack === 'none') return;
    const ctx = getAudioCtx();
    ambientRef.current = createAmbientNode(ctx, ambientTrack);
  }

  function stopAmbient() {
    if (ambientRef.current) {
      const { masterGain, nodes } = ambientRef.current;
      const ctx = audioCtxRef.current;
      if (ctx && masterGain) {
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        setTimeout(() => {
          nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
          masterGain.disconnect();
        }, 800);
      }
      ambientRef.current = null;
    }
  }

  function stopAll() {
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    stopAmbient();
  }

  const speakVerse = useCallback((idx) => {
    if (!verses[idx]) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(verses[idx].text);
    utterance.rate = speed;
    utterance.volume = muted ? 0 : volume;
    utterance.pitch = 1.0;

    // Pick a good English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en'))
      || null;
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { isSpeakingRef.current = true; };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      const next = idx + 1;
      if (next < verses.length) {
        setCurrentVerseIdx(next);
        speakVerse(next);
      } else {
        setIsPlaying(false);
        setCurrentVerseIdx(0);
        stopAmbient();
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [verses, speed, muted, volume]);

  const handlePlay = () => {
    if (!verses.length) return;
    setIsPlaying(true);
    startAmbient();
    speakVerse(currentVerseIdx);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
    stopAmbient();
  };

  const handleStop = () => {
    stopAll();
    setIsPlaying(false);
    setCurrentVerseIdx(0);
  };

  const handlePrev = () => {
    const idx = Math.max(0, currentVerseIdx - 1);
    setCurrentVerseIdx(idx);
    if (isPlaying) speakVerse(idx);
  };

  const handleNext = () => {
    const idx = Math.min(verses.length - 1, currentVerseIdx + 1);
    setCurrentVerseIdx(idx);
    if (isPlaying) speakVerse(idx);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      // Restart current verse at new speed
      window.speechSynthesis.cancel();
      setTimeout(() => speakVerse(currentVerseIdx), 100);
    }
  };

  if (!verses.length) return null;

  const progress = verses.length > 0 ? ((currentVerseIdx) / verses.length) * 100 : 0;
  const currentVerse = verses[currentVerseIdx];

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
      <div className="w-full max-w-2xl pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-200 rounded-t-2xl shadow-xl px-4 pt-4 pb-2">
                {/* Current verse preview */}
                <div className="bg-indigo-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs font-bold text-indigo-500 mb-0.5">
                    {bookName} {chapterNum}:{currentVerse?.verse}
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    {currentVerse?.text}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Verse counter */}
                <p className="text-xs text-center text-gray-400 mb-3">
                  Verse {currentVerseIdx + 1} of {verses.length}
                </p>

                {/* Speed controls */}
                <div className="flex items-center gap-1 mb-3 justify-center flex-wrap">
                  <span className="text-xs text-gray-500 mr-1">Speed:</span>
                  {SPEEDS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition-all ${speed === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>

                {/* Ambient music */}
                <div className="mb-3">
                  <button
                    onClick={() => setShowAmbient(!showAmbient)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <Music size={12} />
                    Ambient Music
                    {ambientTrack !== 'none' && <span className="bg-indigo-100 text-indigo-600 px-1.5 rounded-full">On</span>}
                  </button>
                  <AnimatePresence>
                    {showAmbient && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {AMBIENT_TRACKS.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setAmbientTrack(t.id)}
                              className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${ambientTrack === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                            >
                              {t.emoji} {t.label}
                            </button>
                          ))}
                        </div>
                        {ambientTrack !== 'none' && (
                          <div className="flex items-center gap-2 mt-2">
                            <Music2 size={11} className="text-gray-400" />
                            <input
                              type="range" min="0" max="1" step="0.05"
                              value={ambientVolume}
                              onChange={e => setAmbientVolume(parseFloat(e.target.value))}
                              className="flex-1 accent-indigo-600"
                            />
                            <span className="text-xs text-gray-400 w-6">{Math.round(ambientVolume * 100)}%</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main player bar */}
        <div className="bg-indigo-600 rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3">
          {/* Expand/collapse */}
          <button onClick={() => setIsOpen(!isOpen)} className="text-indigo-200 hover:text-white">
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">
              {bookName} {chapterNum} — Listen
            </p>
            <p className="text-indigo-200 text-xs truncate">
              {isPlaying ? `▶ Verse ${currentVerseIdx + 1}` : 'Tap play to listen'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button onClick={handlePrev} disabled={currentVerseIdx === 0} className="p-1.5 text-indigo-200 hover:text-white disabled:opacity-30">
              <SkipBack size={15} />
            </button>

            {isPlaying ? (
              <button onClick={handlePause} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
                <Pause size={16} className="text-indigo-600" />
              </button>
            ) : (
              <button onClick={handlePlay} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
                <Play size={16} className="text-indigo-600 ml-0.5" />
              </button>
            )}

            <button onClick={handleNext} disabled={currentVerseIdx >= verses.length - 1} className="p-1.5 text-indigo-200 hover:text-white disabled:opacity-30">
              <SkipForward size={15} />
            </button>

            <button onClick={() => setMuted(!muted)} className="p-1.5 text-indigo-200 hover:text-white ml-1">
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button onClick={handleStop} className="p-1.5 text-indigo-200 hover:text-white">
              <Square size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}