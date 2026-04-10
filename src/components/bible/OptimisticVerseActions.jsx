import React, { useState } from 'react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerseInteractionMutation } from './useOptimisticMutations';

/**
 * OptimisticVerseActions
 * Provides instant visual feedback for bookmark/save toggles
 * Heart and bookmark icons respond immediately on touch
 */
export default function OptimisticVerseActions({
  verseId,
  verseRef,
  isSaved = false,
  isBookmarked = false,
  onSave,
  onBookmark,
  onShare,
}) {
  const saveInteraction = useVerseInteractionMutation(verseId, isSaved);
  const bookmarkInteraction = useVerseInteractionMutation(verseId, isBookmarked);

  const handleSave = async () => {
    try {
      await saveInteraction.toggle(async (id, newState) => {
        await onSave?.(id, newState);
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkInteraction.toggle(async (id, newState) => {
        await onBookmark?.(id, newState);
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="flex gap-2">
      {/* Save/Like button */}
      <Button
        onClick={handleSave}
        disabled={saveInteraction.isPending}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <Heart
          className={`w-4 h-4 transition-all ${
            saveInteraction.state
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400'
          }`}
        />
        <span className="text-xs">
          {saveInteraction.state ? 'Saved' : 'Save'}
        </span>
      </Button>

      {/* Bookmark button */}
      <Button
        onClick={handleBookmark}
        disabled={bookmarkInteraction.isPending}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <Bookmark
          className={`w-4 h-4 transition-all ${
            bookmarkInteraction.state
              ? 'fill-amber-500 text-amber-500'
              : 'text-gray-400'
          }`}
        />
        <span className="text-xs">
          {bookmarkInteraction.state ? 'Marked' : 'Bookmark'}
        </span>
      </Button>

      {/* Share button */}
      <Button
        onClick={onShare}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <Share2 className="w-4 h-4 text-gray-400" />
        <span className="text-xs">Share</span>
      </Button>
    </div>
  );
}