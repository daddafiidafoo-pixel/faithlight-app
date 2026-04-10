import React, { useState } from 'react';
import { useAudioPlayerStore } from '@/components/audio/useAudioPlayerStore';
import { Play, Pause, X, RotateCcw, RotateCw } from 'lucide-react';
import { formatAudioTime } from '@/lib/audioTime';

export function PersistentAudioBarContent() {
  const [expanded, setExpanded] = useState(false);
  
  // Call hook directly in component body
  const audioState = useAudioPlayerStore();
  
  // Defensive null checks before destructuring
  if (!audioState) return null;
  
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    toggle,
    stop,
    setTime,
    clearError,
  } = audioState;
  
  if (!currentTrack) return null;


  const pct = duration ? (currentTime / duration) * 100 : 0;

  const seek = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    setTime(newTime);
  };

  const skip = (secs) => {
    setTime(Math.max(0, Math.min(duration, currentTime + secs)));
  };

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl" role="region" aria-label="Audio player">
      {/* Progress bar */}
      <div
        className="h-1 bg-slate-100 cursor-pointer"
        onClick={seek}
      >
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Error state */}
       {error && (
         <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between">
           <p className="text-xs text-red-800 font-semibold">{error}</p>
           <button
             onClick={clearError}
             className="text-red-600 hover:text-red-800 font-semibold text-xs ml-2 flex-shrink-0"
           >
             ✕
           </button>
         </div>
       )}

      {/* Collapsed bar */}
      {!expanded && (
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <span className="text-purple-600 font-bold text-xs">
              {currentTrack.title?.slice(0, 3).toUpperCase() || '♪'}
            </span>
          </div>

          <div className="flex-1 min-w-0" onClick={() => setExpanded(true)}>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-slate-400">
              {isLoading
                ? 'Loading…'
                : `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => skip(-15)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Rewind 15 seconds"
            >
              <RotateCcw size={16} className="text-slate-600" />
            </button>
            <button
              onClick={toggle}
              disabled={isLoading || !!error || !currentTrack?.url}
              className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="ml-0.5" />
              )}
            </button>
            <button
              onClick={() => skip(15)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Forward 15 seconds"
            >
              <RotateCw size={16} className="text-slate-600" />
            </button>
            <button
              onClick={() => {
                stop();
                setExpanded(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              aria-label="Close audio bar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Collapse"
            >
              ▼
            </button>
            <p className="text-sm font-bold text-slate-800">
              {currentTrack.title}
            </p>
            <button
              onClick={() => {
                stop();
                setExpanded(false);
              }}
              className="text-slate-400 hover:text-red-400"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div>
            <div
              className="h-2 rounded-full bg-slate-100 cursor-pointer overflow-hidden"
              onClick={seek}
            >
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{formatAudioTime(currentTime)}</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => skip(-15)}
              className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              aria-label="Rewind 15 seconds"
            >
              <RotateCcw size={16} className="text-slate-700" />
            </button>
            <button
              onClick={toggle}
              disabled={isLoading || !!error || !currentTrack?.url}
              className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={22} />
              ) : (
                <Play size={22} className="ml-0.5" />
              )}
            </button>
            <button
              onClick={() => skip(15)}
              className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              aria-label="Forward 15 seconds"
            >
              <RotateCw size={16} className="text-slate-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(PersistentAudioBarContent);