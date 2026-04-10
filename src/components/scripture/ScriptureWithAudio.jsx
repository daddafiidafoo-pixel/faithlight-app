import React from 'react';
import ScriptureAudioPlayer from '@/components/audio/ScriptureAudioPlayer';

/**
 * Wrapper component that displays scripture text with integrated audio player
 * Props:
 *   - book: Bible book name
 *   - chapter: Chapter number
 *   - verseStart: Starting verse
 *   - verseEnd: Ending verse
 *   - verseText: Full verse text
 *   - language: Language code
 *   - showAudio: Show audio player (default: true)
 */
export default function ScriptureWithAudio({
  book,
  chapter,
  verseStart,
  verseEnd = verseStart,
  verseText,
  language = 'en',
  showAudio = true
}) {
  return (
    <div className="space-y-3">
      {/* Audio Player */}
      {showAudio && (
        <ScriptureAudioPlayer
          book={book}
          chapter={chapter}
          verseStart={verseStart}
          verseEnd={verseEnd}
          verseText={verseText}
          language={language}
        />
      )}

      {/* Scripture Text */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm text-slate-500 mb-2">
          {book} {chapter}:{verseStart}
          {verseEnd !== verseStart && `-${verseEnd}`}
        </div>
        <p className="text-lg leading-relaxed text-slate-900 italic">
          "{verseText}"
        </p>
      </div>
    </div>
  );
}