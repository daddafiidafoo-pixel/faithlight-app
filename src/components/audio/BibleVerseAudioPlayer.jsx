/**
 * BibleVerseAudioPlayer
 * Reusable audio player that streams a Bible chapter/verse via Bible Brain.
 * Reads audio_fileset_id from the BibleLanguage entity for the selected language.
 * Includes play/pause, loading state, and language-specific error messaging.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, VolumeX, Volume2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Language-specific error messages
const LANG_ERRORS = {
  en: 'Audio not available for this verse',
  om: 'Sagaleen aayata kanaaf hin jiru',
  am: 'ድምፅ ለዚህ ቁጥር አይገኝም',
  ar: 'الصوت غير متاح لهذه الآية',
  fr: 'Audio non disponible pour ce verset',
  sw: 'Sauti haipatikani kwa aya hii',
};

function getErrorMsg(langCode) {
  return LANG_ERRORS[langCode] || LANG_ERRORS.en;
}

/**
 * @param {object}  props
 * @param {string}  props.book            - Bible Brain book ID (e.g. "PSA")
 * @param {number}  props.chapter         - Chapter number
 * @param {number}  [props.verse]         - Verse number (optional)
 * @param {string}  [props.lang='en']     - Language code matching BibleLanguage.language_code
 * @param {string}  [props.audioFilesetId]- Override: explicit fileset ID (skips DB lookup)
 * @param {string}  [props.size='md']     - 'sm' | 'md' | 'lg'
 * @param {string}  [props.className]     - Extra Tailwind classes on the wrapper
 */
export default function BibleVerseAudioPlayer({
  book,
  chapter,
  verse,
  lang = 'en',
  audioFilesetId: propFilesetId,
  size = 'md',
  className = '',
}) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [filesetId, setFilesetId] = useState(propFilesetId || null);
  const audioRef = useRef(null);

  // Reset when verse changes
  useEffect(() => {
    setAudioUrl(null);
    setPlaying(false);
    setError(false);
    setIsFallback(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [book, chapter, verse, lang]);

  // Resolve audio_fileset_id from BibleLanguage entity if not provided
  useEffect(() => {
    if (propFilesetId) {
      setFilesetId(propFilesetId);
      return;
    }
    base44.entities.BibleLanguage.filter({ language_code: lang, is_active: true })
      .then(results => {
        if (results.length > 0 && results[0].audio_fileset_id) {
          setFilesetId(results[0].audio_fileset_id);
        }
      })
      .catch(() => {});
  }, [lang, propFilesetId]);

  const fetchAndPlay = async () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const res = await base44.functions.invoke('bibleBrainAPI', {
        action: 'audioForVerse',
        book,
        chapter,
        verse,
        lang,
        filesetId, // pass resolved fileset so backend can use it directly
      });

      const url = res?.data?.audioUrl;
      const fallback = res?.data?.fallback;

      if (!url) {
        setError(true);
        setLoading(false);
        return;
      }

      setAudioUrl(url);
      setIsFallback(!!fallback);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => setError(true));
          setPlaying(true);
        }
      }, 50);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  if (!book || !chapter) return null;

  // Size variants
  const btnSize = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[52px]',
  }[size];

  const iconSize = { sm: 14, md: 16, lg: 18 }[size];

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <VolumeX size={iconSize} className="text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground">{getErrorMsg(lang)}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={fetchAndPlay}
        disabled={loading}
        aria-label={playing ? 'Pause audio' : 'Play audio'}
        className={`flex items-center font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 ${btnSize}`}
      >
        {loading
          ? <Loader2 size={iconSize} className="animate-spin" />
          : playing
            ? <Pause size={iconSize} />
            : <Volume2 size={iconSize} />
        }
        {loading ? 'Loading…' : playing ? 'Pause' : 'Listen'}
      </button>

      {isFallback && (
        <span className="text-xs text-muted-foreground italic">(English audio)</span>
      )}

      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        onError={() => { setError(true); setPlaying(false); }}
        className="hidden"
      />
    </div>
  );
}