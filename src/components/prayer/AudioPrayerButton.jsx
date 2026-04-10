import React, { useState, useRef } from 'react';
import { Mic, Loader2, StopCircle, Play, Pause, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const LANG_VOICES = {
  en: 'alloy',
  om: 'nova',    // warm, clear voice for Afaan Oromoo
  am: 'nova',
  ti: 'nova',
  sw: 'shimmer',
  fr: 'echo',
  ar: 'onyx',
};

export default function AudioPrayerButton({ verseText, reference, audioLanguage = 'en' }) {
  const [state, setState] = useState('idle'); // idle | generating | ready | playing | paused
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const generatePrayer = async () => {
    setState('generating');
    setError(null);

    try {
      const res = await base44.functions.invoke('generateAudioPrayer', {
        verseText,
        reference,
        language: audioLanguage,
      });

      if (res.data?.audioUrl) {
        setAudioUrl(res.data.audioUrl);
        setState('ready');
      } else {
        throw new Error('No audio returned');
      }
    } catch (err) {
      console.error('Audio prayer error:', err);
      setError('Could not generate audio. Please try again.');
      setState('idle');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (state === 'playing') {
      audioRef.current.pause();
      setState('paused');
    } else {
      audioRef.current.play();
      setState('playing');
    }
  };

  const dismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setState('idle');
    setError(null);
  };

  return (
    <div className="flex items-center gap-2">
      {state === 'idle' && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={generatePrayer}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-200 transition-colors"
          title="Generate spoken prayer"
        >
          <Mic size={14} />
          <span>Audio Prayer</span>
        </motion.button>
      )}

      {state === 'generating' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 text-purple-500 text-sm">
          <Loader2 size={14} className="animate-spin" />
          <span>Generating…</span>
        </div>
      )}

      {(state === 'ready' || state === 'playing' || state === 'paused') && audioUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold"
        >
          <button onClick={togglePlay} className="flex items-center gap-1.5">
            {state === 'playing' ? <Pause size={14} /> : <Play size={14} />}
            <span>{state === 'playing' ? 'Pause' : 'Play'}</span>
          </button>
          <button onClick={dismiss} className="ml-1 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setState('ready')}
            className="hidden"
          />
        </motion.div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}