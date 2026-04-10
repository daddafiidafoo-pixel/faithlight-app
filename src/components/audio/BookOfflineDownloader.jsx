import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Download, BookOpen, Loader2, CheckCircle, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { base44 as b44direct } from '@/api/base44Client';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs','Isaiah',
  'Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah',
  'Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark',
  'Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
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

const TRANSLATIONS = [
  { value: 'WEB', label: 'World English Bible (WEB)' },
  { value: 'ASV', label: 'American Standard Version (ASV)' },
];

// Save verses to localStorage-based offline store
function saveChapterOffline(book, chapter, translation, verses) {
  const key = `offline_bible_${translation}_${book}_${chapter}`;
  localStorage.setItem(key, JSON.stringify({ book, chapter, translation, verses, savedAt: Date.now() }));
}

function isChapterOffline(book, chapter, translation) {
  return !!localStorage.getItem(`offline_bible_${translation}_${book}_${chapter}`);
}

export default function BookOfflineDownloader({ user, onDownloadStart }) {
  const [showDialog, setShowDialog] = useState(false);
  const [tab, setTab] = useState('chapter');

  // Chapter tab state
  const [chBook, setChBook] = useState('John');
  const [chChapter, setChChapter] = useState('3');
  const [chTranslation, setChTranslation] = useState('WEB');

  // Book tab state
  const [bkBook, setBkBook] = useState('');
  const [bkTranslation, setBkTranslation] = useState('WEB');

  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [done, setDone] = useState(false);

  const resetState = () => {
    setIsDownloading(false);
    setProgress({ current: 0, total: 0, label: '' });
    setDone(false);
  };

  const handleClose = () => {
    if (isDownloading) return; // block close while downloading
    setShowDialog(false);
    setTimeout(resetState, 300);
  };

  // --- Chapter download ---
  const handleDownloadChapter = async () => {
    if (!user?.id) {
      toast.error('Please sign in to download offline content.');
      return;
    }
    if (!chBook || !chChapter) {
      toast.error('Please select a book and chapter.');
      return;
    }

    setIsDownloading(true);
    setDone(false);
    setProgress({ current: 0, total: 1, label: `Fetching ${chBook} ${chChapter}…` });

    try {
      const chNum = parseInt(chChapter);
      const verses = await b44direct.entities.BibleVerse.filter(
        { book: chBook, chapter: chNum, translation: chTranslation },
        'verse',
        200
      );

      if (!verses || verses.length === 0) {
        toast.error(`No verses found for ${chBook} ${chChapter} (${chTranslation}). Make sure verse data has been imported.`);
        setIsDownloading(false);
        return;
      }

      saveChapterOffline(chBook, chChapter, chTranslation, verses);

      // Record in OfflineLibrary
      await base44.entities.OfflineLibrary.create({
        user_id: user.id,
        content_type: 'chapter',
        content_id: `${chBook}-${chChapter}-${chTranslation}`,
        content_title: `${chBook} ${chChapter}`,
        book: chBook,
        chapter: parseInt(chChapter),
        translation: chTranslation,
        chapters_downloaded: [parseInt(chChapter)],
        total_chapters: 1,
        storage_size_mb: Math.round((verses?.length || 30) * 0.002 * 100) / 100,
        download_status: 'completed',
        download_progress_percent: 100,
        is_synced: true,
      });

      setProgress({ current: 1, total: 1, label: 'Download complete!' });
      setDone(true);
      toast.success(`${chBook} ${chChapter} (${verses.length} verses) saved for offline reading.`);
      if (onDownloadStart) onDownloadStart();
    } catch (err) {
      console.error('Chapter download error:', err);
      toast.error('Download failed: ' + (err?.message || 'Please try again.'));
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Book download (chapter by chapter) ---
  const handleDownloadBook = async () => {
    if (!user?.id) {
      toast.error('Please sign in to download offline content.');
      return;
    }
    if (!bkBook) {
      toast.error('Please select a book.');
      return;
    }

    const total = CHAPTER_COUNTS[bkBook] || 1;
    setIsDownloading(true);
    setDone(false);
    setProgress({ current: 0, total, label: `Starting download of ${bkBook}…` });

    const downloaded = [];
    for (let ch = 1; ch <= total; ch++) {
      setProgress({ current: ch, total, label: `Downloading chapter ${ch} of ${total}…` });
      try {
        const verses = await b44direct.entities.BibleVerse.filter(
          { book: bkBook, chapter: ch, translation: bkTranslation },
          'verse',
          200
        );
        if (verses && verses.length > 0) {
          saveChapterOffline(bkBook, ch.toString(), bkTranslation, verses);
          downloaded.push(ch);
        }
      } catch (err) {
        console.error(`Failed chapter ${ch}:`, err);
        // Continue with next chapter
      }
    }

    try {
      await base44.entities.OfflineLibrary.create({
        user_id: user.id,
        content_type: 'book',
        content_id: `${bkBook}-${bkTranslation}`,
        content_title: `${bkBook} (${bkTranslation})`,
        book: bkBook,
        translation: bkTranslation,
        chapters_downloaded: downloaded,
        total_chapters: total,
        storage_size_mb: Math.round(downloaded.length * 2.5),
        download_status: downloaded.length === total ? 'completed' : 'partial',
        download_progress_percent: Math.round((downloaded.length / total) * 100),
        is_synced: true,
      });
    } catch (err) {
      console.error('OfflineLibrary record error:', err);
    }

    setProgress({ current: total, total, label: `${bkBook} download complete!` });
    setDone(true);
    setIsDownloading(false);
    toast.success(`${bkBook} saved for offline reading (${downloaded.length}/${total} chapters).`);
    if (onDownloadStart) onDownloadStart();
  };

  const chChapterCount = CHAPTER_COUNTS[chBook] || 1;
  const chChapters = Array.from({ length: chChapterCount }, (_, i) => i + 1);
  const alreadyDownloaded = chBook && chChapter && isChapterOffline(chBook, chChapter, chTranslation);

  return (
    <>
      <Button
        onClick={() => { resetState(); setShowDialog(true); }}
        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
      >
        <Download className="w-4 h-4" />
        Download for Offline
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-indigo-600" />
              Offline Downloads
            </DialogTitle>
          </DialogHeader>

          {!user?.id ? (
            <div className="py-6 text-center text-sm text-gray-600">
              Please sign in to download offline content.
            </div>
          ) : (
            <div className="space-y-4">
              <Tabs value={tab} onValueChange={(v) => { setTab(v); resetState(); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chapter">Chapter</TabsTrigger>
                  <TabsTrigger value="book">Full Book</TabsTrigger>
                </TabsList>

                {/* CHAPTER TAB */}
                <TabsContent value="chapter" className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Book</label>
                    <Select value={chBook} onValueChange={(v) => { setChBook(v); setChChapter('1'); resetState(); }}>
                      <SelectTrigger><SelectValue placeholder="Choose a book…" /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {BIBLE_BOOKS.map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Chapter</label>
                    <Select value={chChapter} onValueChange={(v) => { setChChapter(v); resetState(); }} disabled={!chBook}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {chChapters.map(c => (
                          <SelectItem key={c} value={c.toString()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Translation</label>
                    <Select value={chTranslation} onValueChange={(v) => { setChTranslation(v); resetState(); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRANSLATIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {alreadyDownloaded && !done && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Already available offline
                    </div>
                  )}

                  {isDownloading && (
                    <ProgressBar label={progress.label} current={progress.current} total={progress.total} />
                  )}

                  {done && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Download complete. Available offline.
                    </div>
                  )}

                  <p className="text-xs text-gray-500 italic">
                    Offline downloads include Bible text for reading and TTS playback. Official audio may require internet depending on translation.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleDownloadChapter}
                      disabled={isDownloading || !chBook || !chChapter}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isDownloading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Downloading…</>
                      ) : (
                        <><Download className="w-4 h-4 mr-2" />Download Chapter</>
                      )}
                    </Button>
                    <Button onClick={handleClose} variant="outline" disabled={isDownloading}>Cancel</Button>
                  </div>
                </TabsContent>

                {/* BOOK TAB */}
                <TabsContent value="book" className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Book</label>
                    <Select value={bkBook} onValueChange={(v) => { setBkBook(v); resetState(); }}>
                      <SelectTrigger><SelectValue placeholder="Choose a book…" /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {BIBLE_BOOKS.map(b => (
                          <SelectItem key={b} value={b}>{b} ({CHAPTER_COUNTS[b]} chapters)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Translation</label>
                    <Select value={bkTranslation} onValueChange={(v) => { setBkTranslation(v); resetState(); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRANSLATIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {bkBook && !isDownloading && !done && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                      <p className="font-medium">{bkBook} — {CHAPTER_COUNTS[bkBook]} chapters</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Estimated size: ~{Math.round(CHAPTER_COUNTS[bkBook] * 2.5)} MB • Downloads chapter by chapter
                      </p>
                    </div>
                  )}

                  {isDownloading && (
                    <ProgressBar label={progress.label} current={progress.current} total={progress.total} />
                  )}

                  {done && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Download complete. Available offline.
                    </div>
                  )}

                  <p className="text-xs text-gray-500 italic">
                    Offline downloads include Bible text for reading and TTS playback. Official audio may require internet depending on translation.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleDownloadBook}
                      disabled={isDownloading || !bkBook}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isDownloading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Downloading {progress.current}/{progress.total}…</>
                      ) : (
                        <><Download className="w-4 h-4 mr-2" />Start Book Download</>
                      )}
                    </Button>
                    <Button onClick={handleClose} variant="outline" disabled={isDownloading}>Cancel</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProgressBar({ label, current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}