import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Moon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import OfflineDownloadButton from '../audio/OfflineDownloadButton';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [10, 20, 30, 60];

function fmt(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioBiblePlayer({
  bookId, chapter, bookLabel,
  isPlaying, loading, error,
  speed, setSpeed,
  duration, currentTime,
  sleepMinutes, sleepRemaining,
  togglePlay, seekBy, seekTo,
  nextChapter, prevChapter,
  startSleepTimer, cancelSleepTimer,
  drivingMode = false,
  audioUrl = null,
  filesetId = null,
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${drivingMode ? 'p-8' : 'p-5'}`}>
      {/* Title */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Now Playing</p>
        <h2 className={`font-bold text-gray-900 ${drivingMode ? 'text-3xl' : 'text-xl'}`}>
          {bookLabel || bookId} {chapter}
        </h2>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div
          className="h-2 bg-gray-100 rounded-full cursor-pointer relative overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            seekTo(ratio * duration);
          }}
        >
          <div
            className="h-full bg-indigo-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Main controls */}
      <div className={`flex items-center justify-center gap-${drivingMode ? '6' : '4'} mb-5`}>
        <Button
          variant="ghost"
          size={drivingMode ? 'lg' : 'default'}
          onClick={prevChapter}
          className="text-gray-600 hover:text-indigo-600"
          title="Previous chapter"
        >
          <SkipBack className={drivingMode ? 'w-8 h-8' : 'w-5 h-5'} />
        </Button>

        <Button
          variant="ghost"
          size={drivingMode ? 'lg' : 'default'}
          onClick={() => seekBy(-10)}
          className="text-gray-500 hover:text-indigo-600"
          title="Back 10s"
        >
          <RotateCcw className={drivingMode ? 'w-7 h-7' : 'w-4 h-4'} />
          <span className={`ml-1 ${drivingMode ? 'text-base' : 'text-xs'}`}>10</span>
        </Button>

        <Button
          onClick={togglePlay}
          disabled={loading}
          className={`rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md ${drivingMode ? 'w-20 h-20' : 'w-14 h-14'}`}
        >
          {loading
            ? <span className="animate-spin">⟳</span>
            : isPlaying
            ? <Pause className={drivingMode ? 'w-10 h-10' : 'w-6 h-6'} />
            : <Play className={drivingMode ? 'w-10 h-10' : 'w-6 h-6'} />
          }
        </Button>

        <Button
          variant="ghost"
          size={drivingMode ? 'lg' : 'default'}
          onClick={() => seekBy(10)}
          className="text-gray-500 hover:text-indigo-600"
          title="Forward 10s"
        >
          <FastForward className={drivingMode ? 'w-7 h-7' : 'w-4 h-4'} />
          <span className={`ml-1 ${drivingMode ? 'text-base' : 'text-xs'}`}>10</span>
        </Button>

        <Button
          variant="ghost"
          size={drivingMode ? 'lg' : 'default'}
          onClick={nextChapter}
          className="text-gray-600 hover:text-indigo-600"
          title="Next chapter"
        >
          <SkipForward className={drivingMode ? 'w-8 h-8' : 'w-5 h-5'} />
        </Button>
      </div>

      {/* Speed */}
      {!drivingMode && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Speed:</span>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                speed === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-400'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}

      {drivingMode && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-sm text-gray-500">Speed:</span>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-4 py-2 text-sm rounded-xl border-2 font-medium transition-colors ${
                speed === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}

      {/* Sleep timer */}
      <div className="flex items-center justify-center gap-2">
        {sleepMinutes ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <Moon className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs text-amber-700">
              Sleep in {Math.floor(sleepRemaining / 60)}:{String(sleepRemaining % 60).padStart(2, '0')}
            </span>
            <button onClick={cancelSleepTimer} className="text-amber-600 hover:text-amber-800">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Sleep:</span>
            {SLEEP_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => startSleepTimer(m)}
                className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
              >
                {m}m
              </button>
            ))}
          </>
        )}
      </div>

      {/* Offline Download */}
      {!drivingMode && audioUrl && (
        <div className="flex justify-center mt-3">
          <OfflineDownloadButton
            chapterId={`${filesetId || 'audio'}-${bookId}-${chapter}`}
            audioUrl={audioUrl}
            size="sm"
          />
        </div>
      )}

      {error && (
        <p className="text-center text-xs text-red-500 mt-3">{error}</p>
      )}
    </div>
  );
}