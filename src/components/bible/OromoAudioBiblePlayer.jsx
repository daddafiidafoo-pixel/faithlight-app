import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader } from 'lucide-react';
import { getBibleIsBookCode, buildBibleIsLiveUrl, getAudioBibleConfig } from '@/components/lib/audioBibleHelpers';

const OROMO_BOOKS = [
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth',
  '1-samuel', '2-samuel', '1-kings', '2-kings', '1-chronicles', '2-chronicles', 'ezra', 'nehemiah',
  'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'song-of-solomon', 'isaiah', 'jeremiah',
  'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah',
  'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi', 'matthew', 'mark',
  'luke', 'john', 'acts', 'romans', '1-corinthians', '2-corinthians', 'galatians', 'ephesians',
  'philippians', 'colossians', '1-thessalonians', '2-thessalonians', '1-timothy', '2-timothy',
  'titus', 'philemon', 'hebrews', 'james', '1-peter', '2-peter', '1-john', '2-john',
  '3-john', 'jude', 'revelation'
];

const DISPLAY_NAMES = {
  'song-of-solomon': 'Song of Solomon',
  '1-samuel': '1 Samuel',
  '2-samuel': '2 Samuel',
  '1-kings': '1 Kings',
  '2-kings': '2 Kings',
  '1-chronicles': '1 Chronicles',
  '2-chronicles': '2 Chronicles',
  '1-corinthians': '1 Corinthians',
  '2-corinthians': '2 Corinthians',
  '1-thessalonians': '1 Thessalonians',
  '2-thessalonians': '2 Thessalonians',
  '1-timothy': '1 Timothy',
  '2-timothy': '2 Timothy',
  '1-peter': '1 Peter',
  '2-peter': '2 Peter',
  '1-john': '1 John',
  '2-john': '2 John',
  '3-john': '3 John'
};

export default function OromoAudioBiblePlayer({ initialBook = 'genesis', initialChapter = 1 }) {
  const audioRef = useRef(null);
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [chapter, setChapter] = useState(initialChapter);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const config = getAudioBibleConfig('om');
  const bookCode = getBibleIsBookCode(selectedBook);
  const displayName = DISPLAY_NAMES[selectedBook] || selectedBook.charAt(0).toUpperCase() + selectedBook.slice(1);

  // Determine max chapters for selected book (simplified)
  const maxChapters = {
    genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
    joshua: 24, judges: 21, ruth: 4, psalms: 150, proverbs: 31,
    matthew: 28, mark: 16, luke: 24, john: 21, acts: 28,
    romans: 16, revelation: 22
  }[selectedBook] || 12;

  const liveUrl = bookCode ? buildBibleIsLiveUrl(selectedBook, chapter) : null;

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        setError('Failed to play audio. Make sure you have internet connection.');
        console.error('Playback error:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleNextChapter = () => {
    if (chapter < maxChapters) {
      setChapter(chapter + 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handlePrevChapter = () => {
    if (chapter > 1) {
      setChapter(chapter - 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleBookChange = (e) => {
    setSelectedBook(e.target.value);
    setChapter(1);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleChapterChange = (e) => {
    const newChapter = parseInt(e.target.value);
    setChapter(newChapter);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleError = () => {
    setError('Unable to load audio. The audio for this chapter may not be available.');
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-amber-700 font-medium">Afaan Oromoo Audio Bible</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{displayName} {chapter}</h2>
        <p className="text-xs text-gray-500 mt-1">Bible.is (GAZGAZ)</p>
      </div>

      {/* Book and Chapter Selectors */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Book</label>
          <select
            value={selectedBook}
            onChange={handleBookChange}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            {OROMO_BOOKS.map((book) => (
              <option key={book} value={book}>
                {DISPLAY_NAMES[book] || book}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Chapter</label>
          <select
            value={chapter}
            onChange={handleChapterChange}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            {Array.from({ length: maxChapters }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Volume</label>
          <div className="flex items-center gap-2 mt-1">
            <Volume2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
              }}
              className="w-full h-1 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Audio Element (hidden) */}
      <audio
        ref={audioRef}
        key={`${selectedBook}-${chapter}`}
        src={liveUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onError={handleError}
        onEnded={() => setIsPlaying(false)}
        volume={volume}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handlePrevChapter}
          disabled={chapter <= 1}
          variant="ghost"
          size="icon"
          className="text-amber-700 hover:bg-amber-100"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          onClick={handlePlayPause}
          disabled={isLoading || !bookCode}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full w-14 h-14 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>

        <Button
          onClick={handleNextChapter}
          disabled={chapter >= maxChapters}
          variant="ghost"
          size="icon"
          className="text-amber-700 hover:bg-amber-100"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-gray-500 border-t border-amber-200 pt-4">
        <p>Playing from Bible.is Oromo Bible (GAZGAZ)</p>
        <p className="text-xs text-gray-400 mt-1">Note: Requires active internet connection</p>
      </div>
    </div>
  );
}