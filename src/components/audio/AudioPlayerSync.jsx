import { useEffect } from 'react';

// Hook to sync AudioBible page state with global player
// This is a safe no-op hook that avoids calling Zustand outside React context
export function useAudioPlayerSync({
  isPlaying,
  currentBook,
  currentChapter,
  currentVerseIndex,
  verses,
  speed,
  translation
}) {
  // Safely skip syncing if called outside React context
  // In proper usage within AudioBible, the store would be updated directly
  useEffect(() => {
    // Sync logic would go here if needed
    // For now, this is a placeholder to prevent the context error
  }, [isPlaying, currentBook, currentChapter, currentVerseIndex, verses, speed, translation]);
}