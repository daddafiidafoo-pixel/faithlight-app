import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getScriptureAudioUrl, generateTTSAudio, formatPassageText } from '@/utils/scriptureAudioService';

/**
 * Scripture Audio Player with Bible Brain + TTS fallback
 * Props:
 *   - book: Bible book name (e.g., "John")
 *   - chapter: Chapter number
 *   - verseStart: Starting verse
 *   - verseEnd: Ending verse (same as start for single)
 *   - verseText: Full verse text
 *   - language: Language code (en, om, fr, sw, ar, ti)
 */
export default function ScriptureAudioPlayer({ 
  book, 
  chapter, 
  verseStart, 
  verseEnd = verseStart, 
  verseText, 
  language = 'en' 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [audioType, setAudioType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  /**
   * Initialize and play audio (Bible Brain or TTS)
   */
  const handlePlayPause = async () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) audioRef.current.pause();
      if (utteranceRef.current) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Play
    setLoading(true);
    setError(null);

    try {
      const { url, type } = await getScriptureAudioUrl(book, chapter, verseStart, language);
      setAudioType(type);

      if (type === 'bible-brain' && url) {
        // Use HTML audio element for Bible Brain
        if (!audioRef.current) {
          audioRef.current = new Audio(url);
          audioRef.current.playbackRate = speed;
          audioRef.current.onended = () => setIsPlaying(false);
        }
        await audioRef.current.play();
      } else {
        // Use TTS
        const text = formatPassageText(book, chapter, verseStart, verseEnd, verseText);
        await generateTTSAudio(text, language);
      }

      setIsPlaying(true);
    } catch (err) {
      setError(err.message);
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update playback speed
   */
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
      {/* Play/Pause Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handlePlayPause}
        disabled={loading}
        className="p-2 h-auto"
        aria-label={loading ? 'Loading audio' : isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {loading ? (
          <Zap className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Volume Icon */}
      <Volume2 className="w-4 h-4 text-slate-400" />

      {/* Speed Control */}
      <select
        value={speed}
        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
        className="text-xs px-2 py-1 border border-slate-200 rounded bg-white"
      >
        <option value={0.75}>0.75x</option>
        <option value={1}>1x</option>
        <option value={1.25}>1.25x</option>
        <option value={1.5}>1.5x</option>
      </select>

      {/* Audio Type Badge */}
      {audioType && (
        <span className="text-xs text-slate-500 ml-auto">
          {audioType === 'bible-brain' ? '🔊 Audio' : '🎤 TTS'}
        </span>
      )}

      {/* Error Message */}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}