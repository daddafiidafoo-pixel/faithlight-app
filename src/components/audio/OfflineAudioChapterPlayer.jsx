import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import OfflineAudioDownloadButton from '@/components/offline/OfflineAudioDownloadButton';
import PlayOfflineToggle from '@/components/offline/PlayOfflineToggle';
import { useOfflineAudioPlayer } from '@/components/audio/useOfflineAudioPlayer';

/**
 * Complete audio chapter player with offline support
 * Shows download button, play offline toggle, and audio player
 */
export default function OfflineAudioChapterPlayer({
  filesetId,
  bookId,
  chapter,
  audioUrl,
  language_code,
  reference,
  verseText,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioId = `${language_code}:${filesetId}:${bookId}:${chapter}`;
  const {
    playOffline,
    setPlayOffline,
    currentSource,
    resolveSource,
    isResolvingSource,
  } = useOfflineAudioPlayer(audioId);

  // Resolve audio source when play offline toggle changes or component mounts
  useEffect(() => {
    resolveSource(audioUrl);
  }, [playOffline, audioUrl, resolveSource]);

  const handlePlayPause = async () => {
    if (!audioRef.current || isResolvingSource) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-slate-50">
      {/* Chapter header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{reference}</h3>
          <p className="text-sm text-slate-600">Chapter {chapter}</p>
        </div>
      </div>

      {/* Audio player */}
      {currentSource && (
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            disabled={isResolvingSource}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <audio
            ref={audioRef}
            src={currentSource}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="flex-1 h-8"
            controls
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <OfflineAudioDownloadButton
          filesetId={filesetId}
          bookId={bookId}
          chapter={chapter}
          audioUrl={audioUrl}
          language_code={language_code}
          reference={reference}
          verseText={verseText}
        />
        <PlayOfflineToggle
          playOffline={playOffline}
          onChange={setPlayOffline}
        />
      </div>

      {/* Status info */}
      {isResolvingSource && (
        <p className="text-xs text-slate-500">Preparing offline audio...</p>
      )}
      {playOffline && currentSource && (
        <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
          ✓ Playing from offline storage
        </p>
      )}
    </div>
  );
}