import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, HardDrive, Trash2, CheckCircle, Loader2, ChevronDown, ChevronUp, WifiOff } from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah',
  'Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke',
  'John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy',
  'Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John',
  'Jude','Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,
  'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,
  '1 Chronicles':29,'2 Chronicles':36,'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,
  'Psalm':150,'Proverbs':31,'Ecclesiastes':12,'Song of Songs':8,'Isaiah':66,'Jeremiah':52,
  'Lamentations':5,'Ezekiel':48,'Daniel':12,'Hosea':14,'Joel':3,'Amos':9,'Obadiah':1,
  'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,'Haggai':2,'Zechariah':14,
  'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,'Acts':28,'Romans':16,
  '1 Corinthians':16,'2 Corinthians':13,'Galatians':6,'Ephesians':6,'Philippians':4,
  'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,
  'Titus':3,'Philemon':1,'Hebrews':13,'James':5,'1 Peter':5,'2 Peter':3,'1 John':5,
  '2 John':1,'3 John':1,'Jude':1,'Revelation':22
};

function chapterKey(translation, book, chapter) {
  return `bible_${book}_${chapter}_${translation}`;
}

function isDownloaded(translation, book, chapter) {
  return !!localStorage.getItem(chapterKey(translation, book, chapter));
}

function getStorageUsedKB() {
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('bible_')) total += (localStorage.getItem(key) || '').length;
  }
  return Math.round(total / 1024);
}

function deleteChapter(translation, book, chapter) {
  localStorage.removeItem(chapterKey(translation, book, chapter));
}

export default function ChapterDownloadPanel({ currentBook, currentChapter, translation = 'WEB', verses = [], isDarkMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({}); // key -> 'downloading' | 'done' | 'error'
  const [storageKB, setStorageKB] = useState(0);
  const [downloadedChapters, setDownloadedChapters] = useState({}); // book-chapter -> bool

  const bg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const border = isDarkMode ? '#2A2F2C' : '#E5E7EB';
  const text = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const muted = isDarkMode ? '#A0A0A0' : '#6B7280';

  useEffect(() => {
    setStorageKB(getStorageUsedKB());
  }, [downloadStatus, expanded]);

  const refreshDownloaded = () => {
    const map = {};
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('bible_')) map[key] = true;
    }
    setDownloadedChapters(map);
  };

  useEffect(() => { refreshDownloaded(); }, [expanded]);

  const downloadChapter = async (book, chapter) => {
    const key = chapterKey(translation, book, chapter);
    if (isDownloaded(translation, book, chapter)) return;
    setDownloadStatus(s => ({ ...s, [key]: 'downloading' }));
    try {
      // If we have the current chapter's verses in memory, use them
      if (book === currentBook && chapter === currentChapter && verses.length > 0) {
        localStorage.setItem(key, JSON.stringify(verses));
        setDownloadStatus(s => ({ ...s, [key]: 'done' }));
        refreshDownloaded();
        setStorageKB(getStorageUsedKB());
        return;
      }

      // Otherwise fetch from the base44 BibleVerse entity
      const { base44 } = await import('@/api/base44Client');
      const data = await base44.entities.BibleVerse.filter({ book, chapter, translation }, 'verse', 200);
      if (!data.length) throw new Error('No data');
      localStorage.setItem(key, JSON.stringify(data));
      setDownloadStatus(s => ({ ...s, [key]: 'done' }));
      refreshDownloaded();
      setStorageKB(getStorageUsedKB());
    } catch {
      setDownloadStatus(s => ({ ...s, [key]: 'error' }));
    }
  };

  const handleDeleteChapter = (book, chapter) => {
    deleteChapter(translation, book, chapter);
    refreshDownloaded();
    setStorageKB(getStorageUsedKB());
  };

  const clearAll = () => {
    Object.keys(localStorage).filter(k => k.startsWith('bible_')).forEach(k => localStorage.removeItem(k));
    refreshDownloaded();
    setStorageKB(getStorageUsedKB());
    setDownloadStatus({});
  };

  const totalDownloaded = Object.keys(downloadedChapters).length;

  return (
    <div className="rounded-xl mb-4" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" style={{ color: '#6366F1' }} />
          <span className="text-sm font-semibold" style={{ color: text }}>Offline Downloads</span>
          {totalDownloaded > 0 && (
            <Badge variant="secondary" className="text-xs">{totalDownloaded} chapters</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: muted }}>{storageKB} KB used</span>
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: muted }} /> : <ChevronDown className="w-4 h-4" style={{ color: muted }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: border }}>
          {/* Download current chapter */}
          {currentBook && currentChapter && (
            <div className="pt-3">
              <p className="text-xs font-semibold mb-2" style={{ color: muted }}>Current Chapter</p>
              <ChapterRow
                book={currentBook}
                chapter={currentChapter}
                translation={translation}
                downloadStatus={downloadStatus}
                downloadedChapters={downloadedChapters}
                onDownload={downloadChapter}
                onDelete={handleDeleteChapter}
                isDarkMode={isDarkMode}
                highlight
              />
            </div>
          )}

          {/* Books manager */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: muted }}>Download By Book</p>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {BIBLE_BOOKS.map(book => {
                const total = CHAPTER_COUNTS[book] || 1;
                const dled = Array.from({ length: total }, (_, i) => i + 1).filter(c => downloadedChapters[chapterKey(translation, book, c)]).length;
                if (dled === 0) return null;
                return (
                  <div key={book} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: isDarkMode ? '#242924' : '#F9FAFB' }}>
                    <div>
                      <span className="text-xs font-medium" style={{ color: text }}>{book}</span>
                      <span className="text-xs ml-2" style={{ color: muted }}>{dled}/{total} ch.</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        Array.from({ length: total }, (_, i) => i + 1).forEach(c => handleDeleteChapter(book, c));
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                );
              }).filter(Boolean)}
              {totalDownloaded === 0 && (
                <p className="text-xs text-center py-4" style={{ color: muted }}>No chapters downloaded yet.<br />Download chapters to read offline.</p>
              )}
            </div>
          </div>

          {/* Download next chapters quickly */}
          {currentBook && currentChapter && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: muted }}>Download Next Chapters</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.min(5, (CHAPTER_COUNTS[currentBook] || 1) - currentChapter) }, (_, i) => currentChapter + i + 1).map(c => (
                  <ChapterRow
                    key={c}
                    book={currentBook}
                    chapter={c}
                    translation={translation}
                    downloadStatus={downloadStatus}
                    downloadedChapters={downloadedChapters}
                    onDownload={downloadChapter}
                    onDelete={handleDeleteChapter}
                    isDarkMode={isDarkMode}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {totalDownloaded > 0 && (
            <Button variant="outline" size="sm" className="text-xs text-red-500 border-red-200 hover:bg-red-50 w-full gap-1.5" onClick={clearAll}>
              <Trash2 className="w-3.5 h-3.5" /> Clear All Downloads ({storageKB} KB)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ChapterRow({ book, chapter, translation, downloadStatus, downloadedChapters, onDownload, onDelete, isDarkMode, highlight, compact }) {
  const key = chapterKey(translation, book, chapter);
  const downloaded = !!downloadedChapters[key];
  const status = downloadStatus[key];
  const text = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const muted = isDarkMode ? '#A0A0A0' : '#6B7280';

  if (compact) {
    return (
      <button
        onClick={() => downloaded ? onDelete(book, chapter) : onDownload(book, chapter)}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors"
        style={{
          backgroundColor: downloaded ? '#DCFCE7' : 'transparent',
          borderColor: downloaded ? '#86EFAC' : '#D1D5DB',
          color: downloaded ? '#166534' : muted
        }}
        title={downloaded ? 'Click to remove' : `Download Ch. ${chapter}`}
      >
        {status === 'downloading' ? <Loader2 className="w-3 h-3 animate-spin" /> : downloaded ? <CheckCircle className="w-3 h-3" /> : <Download className="w-3 h-3" />}
        Ch. {chapter}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: highlight ? (isDarkMode ? '#1A2A1A' : '#F0FDF4') : 'transparent', border: highlight ? '1px solid #86EFAC' : 'none' }}>
      <div className="flex items-center gap-2">
        {downloaded ? <CheckCircle className="w-4 h-4 text-green-500" /> : <HardDrive className="w-4 h-4" style={{ color: muted }} />}
        <span className="text-sm" style={{ color: text }}>{book} {chapter}</span>
        {downloaded && <Badge className="text-xs bg-green-100 text-green-700 border-0">Offline</Badge>}
      </div>
      <div className="flex items-center gap-1">
        {!downloaded && (
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onDownload(book, chapter)} disabled={status === 'downloading'}>
            {status === 'downloading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {status === 'error' ? 'Retry' : 'Save'}
          </Button>
        )}
        {downloaded && (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDelete(book, chapter)}>
            <Trash2 className="w-3 h-3 text-red-400" />
          </Button>
        )}
      </div>
    </div>
  );
}