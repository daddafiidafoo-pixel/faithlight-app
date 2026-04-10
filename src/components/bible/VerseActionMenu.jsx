import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, Bookmark, StickyNote, Share2, MoreVertical } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import AIVerseExplainer from './AIVerseExplainer';

export default function VerseActionMenu({
  verseRef,
  verseText,
  onHighlight,
  onBookmark,
  onAddNote,
  onShare,
}) {
  const { t } = useI18n();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-2">
      {/* Primary Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={onHighlight}
          variant="outline"
          size="sm"
          className="gap-2 flex-1 text-xs"
        >
          <Highlighter className="w-4 h-4" />
          {t('actions.highlight', 'Highlight')}
        </Button>
        <Button
          onClick={onBookmark}
          variant="outline"
          size="sm"
          className="gap-2 flex-1 text-xs"
        >
          <Bookmark className="w-4 h-4" />
          {t('actions.bookmark', 'Bookmark')}
        </Button>
        <Button
          onClick={onAddNote}
          variant="outline"
          size="sm"
          className="gap-2 flex-1 text-xs"
        >
          <StickyNote className="w-4 h-4" />
          {t('actions.note', 'Note')}
        </Button>
      </div>

      {/* AI Explainer */}
      <AIVerseExplainer verseRef={verseRef} verseText={verseText} />

      {/* Additional Actions */}
      <Button
        onClick={onShare}
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs"
      >
        <Share2 className="w-4 h-4" />
        {t('actions.share', 'Share')}
      </Button>
    </div>
  );
}