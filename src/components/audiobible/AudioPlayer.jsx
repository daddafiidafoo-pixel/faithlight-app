/**
 * AudioPlayer — polished playback card
 * Shows: progress bar, play/pause, ±15s, speed, sleep timer, download badge, streaming badge
 */
import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Moon, X, Download, Wifi, Loader2 } from 'lucide-react';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [10, 20, 30, 60];

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({
  bookName, chapter,
  isPlaying, loading, error,
  currentTime, duration, speed, setSpeed,
  sleepMinutes, sleepRemaining,
  togglePlay, seekBy, seekTo,
  nextChapter, prevChapter,
  startSleepTimer, cancelSleepTimer,
  audioUrl,
  drivingMode = false,
}) {
  const [showSleep, setShowSleep] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${drivingMode ? 'p-8' : 'p-5'}`}>
      {/* Title + streaming badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Now Playing</p>
          <h2 className={`font-bold text-gray-900 ${drivingMode ? 'text-3xl' : 'text-xl'}`}>
            {bookName || '—'} {chapter}
          </h2>
        </div>
        {!drivingMode && (
          <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 ml-2 mt-1 flex-shrink-0">
            <Wifi className="w-3 h-3" />
            <span>Streaming</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div
          className="h-2 bg-gray-100 rounded-full cursor-pointer relative group"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekTo(((e.clientX - rect.left) / rect.width) * duration);
          }}
        >
          <div
            className="h-full bg-indigo-600 rounded-full transition-all relative"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-indigo-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Main controls */}
      <div className={`flex items-center justify-center ${drivingMode ? 'gap-8 mb-6' : 'gap-5 mb-5'}`}>
        <button onClick={prevChapter} className="text-gray-500 hover:text-indigo-600 transition-colors">
          <SkipBack className={drivingMode ? 'w-9 h-9' : 'w-6 h-6'} />
        </button>

        <button onClick={() => seekBy(-15)} className="flex flex-col items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <RotateCcw className={drivingMode ? 'w-7 h-7' : 'w-5 h-5'} />
          <span className="text-xs mt-0.5">15</span>
        </button>

        <button
          onClick={togglePlay}
          disabled={loading && !audioUrl}
          className={`rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all disabled:opacity-60 ${drivingMode ? 'w-24 h-24' : 'w-16 h-16'}`}
        >
          {loading && !audioUrl
            ? <Loader2 className={`animate-spin ${drivingMode ? 'w-10 h-10' : 'w-7 h-7'}`} />
            : isPlaying
            ? <Pause className={drivingMode ? 'w-12 h-12' : 'w-8 h-8'} />
            : <Play className={`${drivingMode ? 'w-12 h-12' : 'w-8 h-8'} ml-0.5`} />
          }
        </button>

        <button onClick={() => seekBy(15)} className="flex flex-col items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <FastForward className={drivingMode ? 'w-7 h-7' : 'w-5 h-5'} />
          <span className="text-xs mt-0.5">15</span>
        </button>

        <button onClick={nextChapter} className="text-gray-500 hover:text-indigo-600 transition-colors">
          <SkipForward className={drivingMode ? 'w-9 h-9' : 'w-6 h-6'} />
        </button>
      </div>

      {/* Speed */}
      <div className={`flex items-center justify-center gap-2 ${drivingMode ? 'mb-5' : 'mb-4'}`}>
        <span className={`text-gray-400 ${drivingMode ? 'text-sm' : 'text-xs'}`}>Speed:</span>
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`rounded-full border font-medium transition-colors ${
              speed === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 text-gray-600 hover:border-indigo-400'
            } ${drivingMode ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Sleep timer */}
      {!drivingMode && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {sleepMinutes ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs text-amber-700">
                Sleep in {Math.floor(sleepRemaining / 60)}:{String(sleepRemaining % 60).padStart(2, '0')}
              </span>
              <button onClick={cancelSleepTimer} className="text-amber-500 hover:text-amber-700">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowSleep(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <Moon className="w-3.5 h-3.5" />
                Sleep timer
              </button>
              {showSleep && SLEEP_OPTIONS.map(m => (
                <button
                  key={m}
                  onClick={() => { startSleepTimer(m); setShowSleep(false); }}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
                >
                  {m}m
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-center text-xs text-red-500 mt-3">{error}</p>
      )}
    </div>
  );
}