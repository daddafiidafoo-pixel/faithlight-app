import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, ChevronDown, Bookmark, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioPlayerStore } from './AudioPlayerState';
import BookmarkManager from './BookmarkManager';
import AudioMeterDisplay from '../premium/AudioMeterDisplay';
import { useI18n } from '../I18nProvider';

export default function FloatingAudioPlayer() {
  const { t } = useI18n();
  const {
    isPlaying,
    setIsPlaying,
    currentBook,
    currentChapter,
    currentVerseIndex,
    verses,
    speed,
    setSpeed,
    translation,
    showMiniPlayer,
    setShowMiniPlayer
  } = useAudioPlayerStore();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);

  // Enable background audio playback on mobile (prevent pause on screen lock)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.plugins?.backgroundMode) {
      window.plugins.backgroundMode.enable();
    }
  }, []);

  if (!showMiniPlayer || !verses.length) return null;

  // Check if audio is actually available (no empty/missing URLs)
  const hasValidAudio = verses.some(v => v?.audio_url);
  if (!hasValidAudio) {
    return null; // Don't render player if no audio available
  }

  const currentVerse = verses[currentVerseIndex];
  const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentVerseIndex > 0) {
      useAudioPlayerStore.setState({ currentVerseIndex: currentVerseIndex - 1 });
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentVerseIndex < verses.length - 1) {
      useAudioPlayerStore.setState({ currentVerseIndex: currentVerseIndex + 1 });
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ width: '320px' }}
    >
      {/* Header */}
       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 flex justify-between items-center">
         <div className="flex-1">
           <p className="text-xs font-semibold opacity-90">{t('audio.nowPlaying', 'Now Playing')}</p>
           <p className="text-sm font-bold truncate">
             {currentBook} {currentChapter}:{currentVerse?.verse}
           </p>
         </div>
         <Button
           variant="ghost"
           size="icon"
           onClick={() => setShowMiniPlayer(false)}
           className="h-6 w-6 text-white hover:bg-white/20"
           title={t('audio.collapse', 'Collapse')}
         >
           <ChevronDown className="w-4 h-4" />
         </Button>
       </div>

      {/* Verse Preview */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 max-h-16 overflow-y-auto">
        <p className="text-xs text-gray-600 line-clamp-3">
          {currentVerse?.text}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="p-3 space-y-3">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentVerseIndex === 0}
            className="h-8 w-8"
            title={t('audio.previousVerse', 'Previous verse')}
          >
            <SkipBack className="w-4 h-4 text-gray-700" />
          </Button>

          <Button
            onClick={handlePlayPause}
            className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            title={isPlaying ? t('audio.pause', 'Pause') : t('audio.play', 'Play')}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentVerseIndex === verses.length - 1}
            className="h-8 w-8"
            title={t('audio.nextVerse', 'Next verse')}
          >
            <SkipForward className="w-4 h-4 text-gray-700" />
          </Button>
        </div>

        {/* Audio Meter */}
          <AudioMeterDisplay />

        {/* Speed Control */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="w-full flex items-center justify-center gap-2"
              title={t('audio.playbackSpeed', 'Playback speed')}
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-semibold">{speed}x</span>
            </Button>

          {showSpeedMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSpeed(s);
                    setShowSpeedMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-sm rounded transition-all ${
                    speed === s
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmark Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBookmarkDialog(true)}
            className="flex-1 gap-2"
            title={t('audio.bookmark', 'Bookmark this verse')}
          >
            <Bookmark className="w-4 h-4" />
            {t('audio.bookmarkBtn', 'Bookmark')}
          </Button>
        </div>

        {/* Translation Info */}
        <p className="text-xs text-center text-gray-500 px-2">
          {translation}
        </p>
      </div>

      {/* Bookmark Dialog */}
      {showBookmarkDialog && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 m-2 max-h-96 overflow-y-auto">
            <BookmarkManager
              book={currentBook}
              chapter={parseInt(currentChapter)}
              verse={currentVerse?.verse || 1}
              translation={translation}
              onClose={() => setShowBookmarkDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}