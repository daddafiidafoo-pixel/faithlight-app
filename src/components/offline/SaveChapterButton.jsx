/**
 * SaveChapterButton
 * ─────────────────
 * A compact button to save / unsave the current Bible chapter for offline reading.
 * Drop it into any page that has chapter data available.
 *
 * Props:
 *   bookCode    {string}  - e.g. "GEN"
 *   chapterNum  {number}  - e.g. 1
 *   lang        {string}  - e.g. "en"
 *   title       {string}  - e.g. "Genesis 1"
 *   verses      {Array}   - verse objects to save
 *   size        {"sm"|"md"} - button size
 */
import React from 'react';
import { Download, Check, Trash2, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useOfflineBible from './useOfflineBible';

export default function SaveChapterButton({
  bookCode,
  chapterNum,
  lang = 'en',
  title,
  verses = [],
  size = 'sm',
}) {
  const { isSaved, isSaving, saveForOffline, removeOffline } = useOfflineBible(
    bookCode, chapterNum, lang
  );

  if (isSaving) {
    return (
      <Button variant="outline" size={size} disabled>
        <Loader2 className="w-4 h-4 animate-spin mr-1" />
        Saving…
      </Button>
    );
  }

  if (isSaved) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={removeOffline}
        className="text-green-700 border-green-200 hover:border-red-200 hover:text-red-600"
      >
        <Check className="w-4 h-4 mr-1" />
        Saved offline
        <Trash2 className="w-3 h-3 ml-1 opacity-50" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => saveForOffline(title, verses)}
      disabled={!verses?.length}
      title="Save for offline reading"
    >
      <Download className="w-4 h-4 mr-1" />
      Save offline
    </Button>
  );
}