import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Loader2, Volume2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * VerseAudioPlayer — generates and plays AI narration of any text.
 * Props:
 *   text      {string}  The text to narrate
 *   label     {string}  Display label (e.g. "Verse of the Day")
 *   compact   {boolean} Compact inline mode vs full card
 */
export default function VerseAudioPlayer({ text, label = 'Listen', compact = false }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  // Clean up audio on unmount or text change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setAudioUrl(null);
      setPlaying(false);
      setProgress(0);
    };
  }, [text]);

  const generateAndPlay = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    if (!text?.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Use browser's built-in speech synthesis as primary (free, instant)
      // Falls back gracefully without requiring an external TTS API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to use a pleasant English voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex'))) || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => { setPlaying(true); setLoading(false); };
        utterance.onend = () => { setPlaying(false); setProgress(0); };
        utterance.onerror = () => { setPlaying(false); setError('Playback error'); setLoading(false); };

        // Simulate progress
        const duration = Math.max(text.length * 55, 3000);
        const start = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - start;
          const pct = Math.min(99, (elapsed / duration) * 100);
          setProgress(pct);
          if (pct >= 99) clearInterval(progressInterval);
        }, 200);
        utterance.onend = () => {
          clearInterval(progressInterval);
          setPlaying(false);
          setProgress(0);
        };

        window.speechSynthesis.speak(utterance);
        setLoading(false);
      } else {
        setError('Audio not supported in this browser');
        setLoading(false);
      }
    } catch (e) {
      setError('Could not generate audio');
      setLoading(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setProgress(0);
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={generateAndPlay}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: playing ? '#EEF2FF' : 'rgba(108,92,231,0.1)',
            border: 'none', borderRadius: 99, padding: '6px 14px',
            cursor: loading ? 'default' : 'pointer',
            color: '#6C5CE7', fontSize: 13, fontWeight: 600,
          }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : playing ? <Pause size={13} /> : <Play size={13} />}
          {loading ? 'Loading…' : playing ? 'Pause' : label}
        </motion.button>
        {playing && (
          <button onClick={handleStop} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}>
            <X size={13} />
          </button>
        )}
        {error && <span style={{ fontSize: 11, color: '#EF4444' }}>{error}</span>}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #EEF2FF',
          boxShadow: '0px 2px 8px rgba(108,92,231,0.08)',
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: playing ? '#6C5CE7' : '#EEF2FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            {loading
              ? <Loader2 size={18} color="#6C5CE7" className="animate-spin" />
              : <Volume2 size={18} color={playing ? 'white' : '#6C5CE7'} />
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>{label}</p>
            {playing ? (
              <div style={{ height: 4, background: '#EEF2FF', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: '#6C5CE7', borderRadius: 99, width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            ) : (
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Tap to listen · AI narration</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {playing && (
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleStop}
                style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#EF4444" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={generateAndPlay}
              disabled={loading}
              style={{
                background: playing ? '#6C5CE7' : '#EEF2FF',
                border: 'none', borderRadius: 8, width: 32, height: 32,
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {loading
                ? <Loader2 size={14} color="#6C5CE7" className="animate-spin" />
                : playing
                  ? <Pause size={14} color="white" />
                  : <Play size={14} color="#6C5CE7" />
              }
            </motion.button>
          </div>
        </div>

        {error && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>{error}</p>}
      </motion.div>
    </AnimatePresence>
  );
}