import React, { useState, useEffect, useRef } from 'react';
import { Languages, Eye, EyeOff, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { addBookmark } from '@/components/audio/AudioBookmarksPanel';
import { toast } from 'sonner';

const SUPPORTED_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'om', label: 'Afaan Oromoo' },
  { code: 'am', label: 'Amharic' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

export default function FollowAlongPlayer({ currentTime, verses = [], language, onLanguageChange, trackSrc, trackTitle }) {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const activeVerseRef = useRef(null);

  const activeIdx = verses.findIndex(v =>
    currentTime >= (v.startSec || 0) && currentTime < (v.endSec || Infinity)
  );

  useEffect(() => {
    if (activeVerseRef.current && expanded) {
      activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeIdx, expanded]);

  const bookmarkVerse = (v) => {
    if (!trackSrc) return;
    const added = addBookmark({
      title: `${trackTitle || 'Audio'} — v.${v.verseNum}`,
      subtitle: v.text?.slice(0, 60) + '…',
      src: trackSrc,
      timestamp: v.startSec || 0,
    });
    if (added) toast.success(`Verse ${v.verseNum} bookmarked`);
    else toast('Already bookmarked');
  };

  if (!verses.length) return null;

  return (
    <div className="border-t border-indigo-100 bg-indigo-50/50">
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          onClick={() => setVisible(v => !v)}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600"
        >
          {visible ? <Eye size={13} /> : <EyeOff size={13} />}
          Follow Along
        </button>

        {visible && (
          <>
            <div className="relative ml-auto">
              <select
                value={language}
                onChange={e => onLanguageChange?.(e.target.value)}
                className="text-xs font-semibold text-indigo-700 bg-transparent border border-indigo-200 rounded-lg px-2 py-1 pr-5 appearance-none cursor-pointer"
              >
                {SUPPORTED_LANGS.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <Languages size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
            </div>

            <button
              onClick={() => setExpanded(e => !e)}
              className="text-indigo-500 p-0.5"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </>
        )}
      </div>

      {visible && (
        <div className={`px-4 pb-3 ${expanded ? 'max-h-48 overflow-y-auto' : ''}`}>
          {expanded ? (
            <div className="space-y-1">
              {verses.map((v, i) => (
                <div
                  key={i}
                  ref={i === activeIdx ? activeVerseRef : null}
                  className={`text-xs leading-relaxed px-2 py-1.5 rounded-lg transition-all duration-300 flex items-start gap-1.5 group ${
                    i === activeIdx
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : i < activeIdx
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  <span className={`font-bold flex-shrink-0 mt-0.5 ${i === activeIdx ? 'opacity-70' : 'opacity-50'}`}>
                    {v.verseNum}
                  </span>
                  <span className="flex-1">{v.text}</span>
                  {trackSrc && (
                    <button
                      onClick={() => bookmarkVerse(v)}
                      className={`opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 transition-opacity ${
                        i === activeIdx ? 'text-white/70 hover:text-white' : 'text-indigo-400 hover:text-indigo-600'
                      }`}
                      aria-label={`Bookmark verse ${v.verseNum}`}
                    >
                      <Bookmark size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            activeIdx >= 0 ? (
              <div className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-sm leading-relaxed flex items-start gap-2 group">
                <span className="font-black opacity-70 text-xs mt-0.5 flex-shrink-0">
                  v.{verses[activeIdx]?.verseNum}
                </span>
                <span className="flex-1">{verses[activeIdx]?.text}</span>
                {trackSrc && (
                  <button
                    onClick={() => bookmarkVerse(verses[activeIdx])}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-white/70 hover:text-white transition-opacity p-0.5"
                    aria-label="Bookmark this verse"
                  >
                    <Bookmark size={13} />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white/60 rounded-xl px-4 py-2 text-xs text-indigo-400 text-center">
                Verse text will highlight as audio plays
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}