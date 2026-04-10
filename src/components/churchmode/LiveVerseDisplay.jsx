import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Eye, EyeOff, Maximize2, Minimize2, Loader2 } from 'lucide-react';

const POLL_INTERVAL = 3500; // 3.5 seconds

export default function LiveVerseDisplay({ sessionId, initialVerseRef, initialVerseText, isHighContrast, onToggleHighContrast }) {
  const [verseRef, setVerseRef] = useState(initialVerseRef || null);
  const [verseText, setVerseText] = useState(initialVerseText || null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const lastRefRef = useRef(initialVerseRef || null);

  // Poll for verse updates
  useEffect(() => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const res = await base44.functions.invoke('churchmode_getSession', { sessionId });
        const data = res.data;
        if (!data?.success) return;

        const newRef = data.currentVerseRef;
        const newText = data.currentVerseText;
        const updatedAt = data.verseUpdatedAt;

        if (newRef && newRef !== lastRefRef.current) {
          lastRefRef.current = newRef;
          setVerseRef(newRef);
          setVerseText(newText || null);
          setLastUpdatedAt(updatedAt);
          setIsNew(true);
          setTimeout(() => setIsNew(false), 3000);
        }
      } catch {
        // silent — don't break the session
      }
    };

    // Initial fetch
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [sessionId]);

  if (!verseRef) {
    return (
      <div className={`rounded-2xl border p-6 text-center space-y-2 ${
        isHighContrast ? 'bg-black border-white/30' : 'bg-white/10 border-white/20'
      }`}>
        <BookOpen className="w-8 h-8 mx-auto opacity-40 text-indigo-300" />
        <p className="text-sm text-indigo-200 opacity-60">Waiting for pastor to display a verse…</p>
        <div className="flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400 opacity-40" />
        </div>
      </div>
    );
  }

  const hcBg = 'bg-black';
  const hcText = 'text-white';
  const hcRef = 'text-yellow-300';
  const hcBorder = 'border-yellow-400';

  const normalBg = 'bg-indigo-900/60';
  const normalText = 'text-white';
  const normalRef = 'text-amber-300';
  const normalBorder = 'border-white/20';

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-500 ${
      isHighContrast ? `${hcBg} ${hcBorder}` : `${normalBg} ${normalBorder}`
    } ${isNew ? 'ring-4 ring-amber-400/60 animate-pulse' : ''} ${expanded ? 'fixed inset-4 z-50 rounded-3xl' : ''}`}>

      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
        isHighContrast ? 'border-white/20 bg-black' : 'border-white/10 bg-white/10'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">Live Verse</span>
          {isNew && (
            <span className="text-xs bg-amber-400 text-gray-900 font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleHighContrast}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={isHighContrast ? 'Normal contrast' : 'High contrast (accessibility)'}
          >
            {isHighContrast ? (
              <Eye className="w-4 h-4 text-yellow-300" />
            ) : (
              <EyeOff className="w-4 h-4 text-indigo-300" />
            )}
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {expanded
              ? <Minimize2 className="w-4 h-4 text-indigo-300" />
              : <Maximize2 className="w-4 h-4 text-indigo-300" />
            }
          </button>
        </div>
      </div>

      {/* Verse content */}
      <div className={`p-6 flex flex-col items-center text-center space-y-4 ${expanded ? 'min-h-full justify-center' : ''}`}>
        {/* Reference */}
        <p className={`text-lg font-bold tracking-wide ${isHighContrast ? hcRef : normalRef}`}>
          📖 {verseRef}
        </p>

        {/* Verse text or placeholder */}
        {verseText ? (
          <blockquote className={`leading-relaxed font-medium max-w-lg mx-auto ${
            isHighContrast
              ? `text-white ${expanded ? 'text-3xl' : 'text-xl'}`
              : `text-white/90 ${expanded ? 'text-2xl' : 'text-lg'}`
          }`}>
            "{verseText}"
          </blockquote>
        ) : (
          <p className={`italic opacity-60 ${isHighContrast ? 'text-gray-300 text-lg' : 'text-indigo-200 text-base'}`}>
            Open your Bible to {verseRef}
          </p>
        )}
      </div>

      {/* Full-screen backdrop dismiss */}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-3 right-3 bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
        >
          <Minimize2 className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}