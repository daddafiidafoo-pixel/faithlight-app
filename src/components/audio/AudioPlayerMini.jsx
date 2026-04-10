import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronUp, ChevronDown, X, Volume2 } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export default function AudioPlayerMini({
  isOpen,
  onClose,
  currentChapter,
  isPlaying,
  onPlayPause,
  onNextChapter,
  onPrevChapter,
  currentTime = 0,
  duration = 0,
  onSeek,
  onSpeedChange,
  onAutoAdvanceToggle,
  onSleepTimerToggle,
  autoAdvance = false,
  sleepTimerEnabled = false,
  sleepTimerMinutes = 30,
  onSleepTimerChange,
  playbackSpeed = 1,
}) {
  const { t } = useI18n();
  const [showControls, setShowControls] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col max-h-96">
          {/* Collapse Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={onClose}
              className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t('audio.nowPlaying', 'Now Playing')}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chapter Info & Progress */}
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {currentChapter || t('audio.selectChapter', 'Select Chapter')}
            </p>
            <div className="mt-2 space-y-1">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevChapter}
              title={t('actions.previous', 'Previous')}
              className="h-10 w-10"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>

            <Button
              onClick={onPlayPause}
              className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNextChapter}
              title={t('actions.next', 'Next')}
              className="h-10 w-10"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>

            <Button
              variant={showControls ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setShowControls(!showControls)}
              title={t('actions.more', 'More')}
              className="h-10 w-10"
            >
              ⋮
            </Button>
          </div>

          {/* Extended Controls */}
          {showControls && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* Playback Speed */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t('audio.speed', 'Speed')}: {playbackSpeed}x
                </label>
                <div className="flex gap-2">
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <Button
                      key={speed}
                      variant={playbackSpeed === speed ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSpeedChange(speed)}
                      className="flex-1 text-xs h-8"
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto-Advance */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t('audio.autoAdvance', 'Auto-Advance Chapters')}
                </label>
                <button
                  onClick={onAutoAdvanceToggle}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    autoAdvance ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      autoAdvance ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Sleep Timer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t('audio.sleepTimer', 'Sleep Timer')}
                  </label>
                  <button
                    onClick={onSleepTimerToggle}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      sleepTimerEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        sleepTimerEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {sleepTimerEnabled && (
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map((mins) => (
                      <Button
                        key={mins}
                        variant={sleepTimerMinutes === mins ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSleepTimerChange(mins)}
                        className="text-xs h-8"
                      >
                        {mins}m
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}