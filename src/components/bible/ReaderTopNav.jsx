import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Volume2, Search, MoreVertical } from 'lucide-react';
import OfflineChapterIndicator from './OfflineChapterIndicator';
import { useI18n } from '../I18nProvider';

export default function ReaderTopNav({
  currentBook,
  currentChapter,
  isDarkMode,
  onBack,
  onOpenBookChapter,
  onAudio,
  onSearch,
  onMore,
  translation,
  verses,
}) {
  const { t } = useI18n();
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <header 
      className="sticky top-0 z-40 flex items-center h-14 px-4 border-b"
      style={{ 
        backgroundColor: cardColor,
        borderColor: isDarkMode ? '#2A2F2C' : '#E6E6E6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div className="flex-1 flex items-center justify-between max-w-5xl mx-auto w-full">
        {/* Left: Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          title={t('actions.back', 'Back')}
          className="h-10 w-10"
          style={{ color: primaryColor }}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Center: Book + Chapter */}
        <button
          onClick={onOpenBookChapter}
          className="text-center flex-1 mx-2 hover:opacity-70 transition-opacity"
        >
          <p className="font-semibold text-base" style={{ color: textColor }}>
            {currentBook && currentChapter ? `${currentBook} ${currentChapter}` : t('bible.selectPassage', 'Select')}
          </p>
        </button>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1">
          {currentBook && currentChapter && (
            <>
              <OfflineChapterIndicator
                book={currentBook}
                chapter={currentChapter}
                translation={translation}
                verses={verses}
                isDarkMode={isDarkMode}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onAudio}
                title={t('actions.audio', 'Audio')}
                className="h-10 w-10"
                style={{ color: primaryColor }}
              >
                <Volume2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearch}
                title={t('actions.search', 'Search')}
                className="h-10 w-10"
                style={{ color: primaryColor }}
              >
                <Search className="w-5 h-5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMore}
            title={t('actions.more', 'More')}
            className="h-10 w-10"
            style={{ color: primaryColor }}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}