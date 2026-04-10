import React, { useState, useEffect } from 'react';
import { useI18n } from '@/components/I18nProvider';
import BibleVersionSelector from '@/components/bible/BibleVersionSelector';
import BibleChapterNav from '@/components/bible/BibleChapterNav';
import ChapterContent from '@/components/bible/ChapterContent';
import VerseShareCard from '@/components/bible/VerseShareCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, Settings } from 'lucide-react';

export default function BibleReaderNew() {
  const { lang } = useI18n();
  
  const [selectedBibleId, setSelectedBibleId] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentBookName, setCurrentBookName] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);

  const contentLanguage = lang || localStorage.getItem('faithlight-language') || 'en';

  const handleChapterSelect = ({ bookId, chapterNumber, bookName }) => {
    setCurrentBook(bookId);
    setCurrentChapter(chapterNumber);
    setCurrentBookName(bookName);
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bible Reader</h1>
              <p className="text-sm text-gray-600 mt-1">Read scripture in your language</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bible Version Selector */}
          <div className="mt-4">
            <BibleVersionSelector
              language={contentLanguage}
              onSelect={setSelectedBibleId}
              selectedBibleId={selectedBibleId}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Chapter Navigator */}
          <div className="lg:col-span-1">
            {selectedBibleId && (
              <div className="sticky top-24">
                <BibleChapterNav
                  bibleId={selectedBibleId}
                  language={contentLanguage}
                  onChapterSelect={handleChapterSelect}
                  currentBook={currentBook}
                  currentChapter={currentChapter}
                />
              </div>
            )}
          </div>

          {/* Main Content - Chapter Display */}
          <div className="lg:col-span-3">
            {!selectedBibleId ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Select a Bible version to begin reading
                </p>
              </Card>
            ) : !currentBook ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Select a book and chapter to read
                </p>
              </Card>
            ) : (
              <Card className="p-8">
                <ChapterContent
                  bibleId={selectedBibleId}
                  bookId={currentBook}
                  chapterId={`${currentBook}-${currentChapter}`}
                  chapterNumber={currentChapter}
                  language={contentLanguage}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <VerseShareCard
        reference={`${currentBookName} ${currentChapter}`}
        verseText="Chapter text will appear here when a chapter is loaded"
        language={contentLanguage}
        isOpen={showShareCard}
        onClose={() => setShowShareCard(false)}
      />
    </div>
  );
}