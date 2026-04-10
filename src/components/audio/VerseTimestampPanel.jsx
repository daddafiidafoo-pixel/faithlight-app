import React, { useEffect, useRef } from 'react';

/**
 * Shows live-highlighted verse timestamps below the player.
 * timestamps: [{ verse_start, verse_start_alt, timestamp }]
 * currentTime: seconds (from audio element)
 * onVerseClick: (timestamp_seconds) => void
 */
export default function VerseTimestampPanel({ timestamps, currentTime, onVerseClick, book, chapter }) {
  const activeRef = useRef(null);

  // Find the currently active verse index
  const activeIdx = timestamps.reduce((best, ts, i) => {
    return ts.timestamp <= currentTime ? i : best;
  }, -1);

  // Auto-scroll to active verse
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeIdx]);

  if (!timestamps.length) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {book} {chapter} · Verse Guide
        </p>
        <span className="text-xs text-gray-400">{timestamps.length} verses</span>
      </div>
      <div className="max-h-56 overflow-y-auto py-1">
        {timestamps.map((ts, i) => {
          const isActive = i === activeIdx;
          const verseNum = ts.verse_start || ts.verse_start_alt || (i + 1);
          return (
            <button
              key={i}
              ref={isActive ? activeRef : null}
              onClick={() => onVerseClick(ts.timestamp)}
              className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-all text-sm ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-indigo-50 text-gray-700'
              }`}
            >
              <span className={`w-7 text-center text-xs font-bold shrink-0 ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                {verseNum}
              </span>
              <span className={`text-xs ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                {formatTimestamp(ts.timestamp)}
              </span>
              {isActive && (
                <span className="ml-auto text-xs text-indigo-200 font-medium">▶ Now</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatTimestamp(s) {
  if (!s && s !== 0) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}