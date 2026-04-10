/**
 * PlaylistPanel.jsx
 * Slide-up drawer showing the current queue and sleep timer controls.
 */
import React, { useState } from 'react';
import {
  X, ListMusic, Trash2, Moon, ChevronUp, ChevronDown,
  Play, Music2, Timer, CheckCircle2
} from 'lucide-react';
import { usePlaylistStore } from './usePlaylistStore';

const SLEEP_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function SleepTimerSection() {
  const { sleepMinutes, sleepEndsAt, setSleepTimer, cancelSleepTimer } = usePlaylistStore();
  const [selecting, setSelecting] = useState(false);

  const remaining = sleepEndsAt ? Math.max(0, Math.ceil((sleepEndsAt - Date.now()) / 60000)) : 0;
  const isActive = sleepMinutes > 0 && sleepEndsAt;

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Moon size={14} className={isActive ? 'text-indigo-500' : 'text-gray-400'} />
          <span className="text-sm font-semibold text-gray-700">Sleep Timer</span>
          {isActive && (
            <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
              {remaining}m left
            </span>
          )}
        </div>
        {isActive ? (
          <button
            onClick={cancelSleepTimer}
            className="text-xs text-red-500 hover:text-red-600 font-semibold"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setSelecting(v => !v)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            {selecting ? 'Close' : 'Set Timer'}
          </button>
        )}
      </div>

      {selecting && !isActive && (
        <div className="flex flex-wrap gap-2 mt-1">
          {SLEEP_OPTIONS.map(min => (
            <button
              key={min}
              onClick={() => { setSleepTimer(min); setSelecting(false); }}
              className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-xs font-semibold text-gray-600 transition-colors"
            >
              {min}m
            </button>
          ))}
        </div>
      )}

      {!isActive && !selecting && (
        <p className="text-xs text-gray-400">Audio will stop automatically after a set time.</p>
      )}
    </div>
  );
}

export default function PlaylistPanel({ currentSrc, onPlayAt, onClose }) {
  const { queue, currentIndex, removeFromQueue, clearQueue, reorderQueue } = usePlaylistStore();

  if (queue.length === 0) {
    return (
      <div className="border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ListMusic size={15} className="text-indigo-500" />
            <span className="text-sm font-bold text-gray-800">Queue</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Music2 size={28} className="mb-2 opacity-40" />
          <p className="text-sm font-medium">Queue is empty</p>
          <p className="text-xs mt-0.5">Add chapters from the Bible Reader</p>
        </div>
        <SleepTimerSection />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 bg-white max-h-72 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ListMusic size={15} className="text-indigo-500" />
          <span className="text-sm font-bold text-gray-800">
            Queue <span className="text-gray-400 font-normal">({queue.length})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearQueue}
            className="text-xs text-red-400 hover:text-red-500 font-semibold flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear
          </button>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 ml-1">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Track list */}
      <div className="overflow-y-auto flex-1">
        {queue.map((track, idx) => {
          const isPlaying = idx === currentIndex;
          return (
            <div
              key={track.src + idx}
              className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-50 transition-colors ${
                isPlaying ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Index / playing indicator */}
              <div className="w-5 flex-shrink-0 text-center">
                {isPlaying ? (
                  <div className="flex gap-0.5 items-end h-4 justify-center">
                    <div className="w-0.5 bg-indigo-500 rounded animate-bounce" style={{ height: '60%', animationDelay: '0ms' }} />
                    <div className="w-0.5 bg-indigo-500 rounded animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
                    <div className="w-0.5 bg-indigo-500 rounded animate-bounce" style={{ height: '40%', animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <span className="text-xs text-gray-300 font-mono">{idx + 1}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isPlaying ? 'text-indigo-700' : 'text-gray-800'}`}>
                  {track.title}
                </p>
                {track.subtitle && (
                  <p className="text-xs text-gray-400 truncate">{track.subtitle}</p>
                )}
              </div>

              {/* Reorder up/down */}
              <div className="flex flex-col gap-0">
                <button
                  onClick={() => idx > 0 && reorderQueue(idx, idx - 1)}
                  disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-20 p-0.5"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => idx < queue.length - 1 && reorderQueue(idx, idx + 1)}
                  disabled={idx === queue.length - 1}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-20 p-0.5"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Play now */}
              {!isPlaying && (
                <button
                  onClick={() => onPlayAt(idx)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 min-w-[28px] min-h-[28px] flex items-center justify-center"
                  aria-label="Play now"
                >
                  <Play size={13} />
                </button>
              )}

              {/* Remove */}
              <button
                onClick={() => removeFromQueue(idx)}
                className="p-1.5 text-gray-300 hover:text-red-400 min-w-[28px] min-h-[28px] flex items-center justify-center"
                aria-label="Remove from queue"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Sleep timer */}
      <SleepTimerSection />
    </div>
  );
}

/**
 * Utility exported so any page can add a track to the queue
 */
export function addToQueue(track) {
  const store = usePlaylistStore.getState();
  return store.addToQueue(track);
}