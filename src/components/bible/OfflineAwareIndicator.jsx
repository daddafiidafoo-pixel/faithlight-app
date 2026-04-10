import React, { useState } from 'react';
import { HardDrive, Wifi, WifiOff, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const CHAPTER_COUNTS = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,
  'Joshua':24,'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,
  '1 Chronicles':29,'2 Chronicles':36,'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,'Psalm':150,'Proverbs':31,
  'Ecclesiastes':12,'Song of Songs':8,'Isaiah':66,'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,
  'Hosea':14,'Joel':3,'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,
  'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,'Acts':28,'Romans':16,
  '1 Corinthians':16,'2 Corinthians':13,'Galatians':6,'Ephesians':6,'Philippians':4,'Colossians':4,
  '1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,'Titus':3,'Philemon':1,
  'Hebrews':13,'James':5,'1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,'Jude':1,'Revelation':22
};

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

export default function OfflineAwareIndicator({ book, chapter, translation, isOnline, isOffline, userId, onDownloaded }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }

  async function upsertOfflineIndex(ch, verseCount) {
    if (!userId) return;
    const res = await base44.entities.OfflineIndex.filter({ user_id: userId, translation, book, chapter: ch }, '-created_date', 1).catch(() => []);
    if (res[0]) {
      await base44.entities.OfflineIndex.update(res[0].id, { is_downloaded: true, verse_count: verseCount }).catch(() => null);
    } else {
      await base44.entities.OfflineIndex.create({ user_id: userId, translation, book, chapter: ch, is_downloaded: true, verse_count: verseCount }).catch(() => null);
    }
  }

  async function downloadBook() {
    const total = CHAPTER_COUNTS[book] || 1;
    setDownloading(true);
    setProgress({ done: 0, total });
    const allVerses = [];

    for (let ch = 1; ch <= total; ch++) {
      try {
        const verses = await base44.entities.BibleVerse.filter({ translation, book, chapter: ch }, 'verse', 200);
        if (verses?.length) {
          allVerses.push(...verses);
          await upsertOfflineIndex(ch, verses.length);
        }
      } catch {}
      setProgress({ done: ch, total });
      await new Promise(r => setTimeout(r, 300));
    }

    if (allVerses.length > 0) {
      localStorage.setItem(`offline_book_${translation}_${book}`, JSON.stringify(allVerses));
      toast.success(`${book} (${translation}) downloaded — ${allVerses.length} verses ready offline`);
      onDownloaded?.();
    } else {
      toast.error('Download failed — no verses found');
    }
    setDownloading(false);
    setProgress(null);
  }

  if (!book || !chapter) return null;

  // Downloading state
  if (downloading) {
    const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Downloading {book}… {pct}% (ch {progress?.done}/{progress?.total})
      </div>
    );
  }

  // Offline / downloaded
  if (isOffline) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
        <HardDrive className="w-3.5 h-3.5" />
        OFFLINE ✅
      </div>
    );
  }

  // Offline device, no downloaded content
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1">
        <WifiOff className="w-3.5 h-3.5" />
        No offline copy available
      </div>
    );
  }

  // Online, not downloaded — show badge + download button
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        <Wifi className="w-3.5 h-3.5" />
        🌐 ONLINE
      </div>
      <button
        onClick={downloadBook}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-emerald-400 hover:text-emerald-700 rounded-full px-3 py-1 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download {book} for offline
      </button>
    </div>
  );
}