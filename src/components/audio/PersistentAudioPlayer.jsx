import React, { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '@/lib/audioStore';
import { Play, Pause, SkipBack, SkipForward, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PersistentAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    play,
    pause,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    nextTrack,
    previousTrack,
    reset,
  } = useAudioStore();

  const audioRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  // Auto-play when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // Play failed, pause state
        pause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, play, pause]);

  // Restore position on load
  useEffect(() => {
    if (audioRef.current && currentTrack && currentTime > 0) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTrack, currentTime]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl || currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 max-w-full">
        {expanded ? (
          // Expanded view
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Now Playing</h3>
              <button
                onClick={() => setExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {currentTrack.book} {currentTrack.chapter}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentTrack.narrator || 'Bible Audio'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={previousTrack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <SkipBack className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={() => (isPlaying ? pause() : play())}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <SkipForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Playback rate */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 block mb-2">
                Speed: {playbackRate}x
              </label>
              <div className="flex gap-2">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-3 py-1 text-xs rounded border ${
                      playbackRate === rate
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={reset}
              variant="outline"
              className="w-full text-sm"
            >
              Stop & Close
            </Button>
          </div>
        ) : (
          // Collapsed view (mini player)
          <div
            onClick={() => setExpanded(true)}
            className="p-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentTrack.book} {currentTrack.chapter}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isPlaying ? pause() : play();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-gray-700" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-700 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}