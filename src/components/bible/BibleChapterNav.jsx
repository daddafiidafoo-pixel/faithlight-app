import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export default function BibleChapterNav({ bibleId, language, onChapterSelect, currentBook, currentChapter }) {
  const [selectedBook, setSelectedBook] = useState(currentBook);

  const { data: books = [] } = useQuery({
    queryKey: ['bible-books', bibleId],
    queryFn: async () => {
      try {
        return await base44.entities.BibleBook.filter({ bibleId }) || [];
      } catch (error) {
        console.debug('[BibleChapterNav] Failed to fetch books:', error?.message);
        return [];
      }
    },
    enabled: !!bibleId
  });

  const selectedBookObj = books.find(b => b.id === selectedBook);
  const chapterArray = Array.from({ length: selectedBookObj?.chapterCount || 1 }, (_, i) => i + 1);

  const handleChapterSelect = (chapterNum) => {
    onChapterSelect({
      bookId: selectedBook,
      chapterNumber: chapterNum,
      bookName: selectedBookObj?.name
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <Select value={selectedBook || ''} onValueChange={setSelectedBook}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select book..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {books.map(book => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBookObj && (
        <div className="flex flex-wrap gap-2">
          {chapterArray.map(ch => (
            <Button
              key={ch}
              variant={currentChapter === ch ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChapterSelect(ch)}
              className="w-12 h-10"
            >
              {ch}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}