import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalm': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Songs': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
  'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

export default function BibleDownloadManager({ isDarkMode }) {
  const [downloads, setDownloads] = useState([]);
  const [activeTab, setActiveTab] = useState('downloaded');

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = () => {
    const downloaded = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('bible_') && key !== 'bible_settings') {
        const parts = key.replace('bible_', '').split('_');
        if (parts.length === 3) {
          const [book, chapter, translation] = parts;
          downloaded.push({
            key,
            book,
            chapter: parseInt(chapter),
            translation,
            size: localStorage.getItem(key).length
          });
        }
      }
    }
    setDownloads(downloaded);
  };

  const deleteDownload = (key, book, chapter) => {
    if (window.confirm(`Delete ${book} ${chapter} from offline storage?`)) {
      localStorage.removeItem(key);
      setDownloads(prev => prev.filter(d => d.key !== key));
      toast.success('Deleted');
      loadDownloads();
    }
  };

  const deleteBook = (bookName, translation) => {
    if (window.confirm(`Delete all chapters of ${bookName} (${translation}) from offline storage?`)) {
      const keysToDelete = downloads
        .filter(d => d.book === bookName && d.translation === translation)
        .map(d => d.key);
      keysToDelete.forEach(key => localStorage.removeItem(key));
      setDownloads(prev => prev.filter(d => !keysToDelete.includes(d.key)));
      toast.success(`${bookName} deleted`);
      loadDownloads();
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const groupByBook = () => {
    const grouped = {};
    downloads.forEach(d => {
      const key = `${d.book}-${d.translation}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(d);
    });
    return grouped;
  };

  const cardBg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const groupedDownloads = groupByBook();
  const sortedBooks = Object.keys(groupedDownloads).sort();

  return (
    <Card style={{ backgroundColor: cardBg, borderColor }} className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <Download className="w-5 h-5" />
          Downloaded Content ({downloads.length} chapters)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {downloads.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p style={{ color: mutedColor }} className="text-sm">No offline content downloaded</p>
            <p style={{ color: mutedColor }} className="text-xs mt-1">Download chapters from the Bible reader to access them offline</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="downloaded">By Book</TabsTrigger>
              <TabsTrigger value="chapters">All Chapters</TabsTrigger>
            </TabsList>

            <TabsContent value="downloaded" className="space-y-3 mt-4">
              {sortedBooks.map(bookKey => {
                const [book, translation] = bookKey.split('-');
                const chapters = groupedDownloads[bookKey];
                const totalSize = chapters.reduce((sum, c) => sum + c.size, 0);
                const totalChapters = CHAPTER_COUNTS[book] || 1;
                const downloadedCount = chapters.length;

                return (
                  <div
                    key={bookKey}
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9F9F9', borderColor }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: textColor }}>
                          {book} ({translation})
                        </p>
                        <p className="text-xs" style={{ color: mutedColor }}>
                          {downloadedCount} of {totalChapters} chapters • {formatBytes(totalSize)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBook(book, translation)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {chapters.sort((a, b) => a.chapter - b.chapter).map(ch => (
                        <div
                          key={ch.key}
                          className="text-xs px-2 py-1 rounded flex items-center gap-1"
                          style={{ backgroundColor: isDarkMode ? '#1A2F1F' : '#E0F2FE', color: '#0369A1' }}
                        >
                          {ch.chapter}
                          <button
                            onClick={() => deleteDownload(ch.key, book, ch.chapter)}
                            className="ml-1 hover:opacity-70"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="chapters" className="space-y-2 mt-4 max-h-64 overflow-y-auto">
              {downloads.sort((a, b) => {
                if (a.book !== b.book) return a.book.localeCompare(b.book);
                return a.chapter - b.chapter;
              }).map(d => (
                <div
                  key={d.key}
                  className="flex items-center justify-between p-2 rounded border"
                  style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9F9F9', borderColor }}
                >
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: textColor }}>
                      {d.book} {d.chapter}:{d.translation}
                    </p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {formatBytes(d.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDownload(d.key, d.book, d.chapter)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}