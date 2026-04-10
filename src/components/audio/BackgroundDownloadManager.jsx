import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, X, CheckCircle2, AlertCircle, Loader2, Plus, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

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
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,'Judges':21,
  'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,
  'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,'Psalm':150,'Proverbs':31,'Ecclesiastes':12,
  'Song of Songs':8,'Isaiah':66,'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,'Hosea':14,
  'Joel':3,'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,
  'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,'Acts':28,
  'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,'Ephesians':6,'Philippians':4,
  'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,'Titus':3,
  'Philemon':1,'Hebrews':13,'James':5,'1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,
  'Jude':1,'Revelation':22
};
const STARTER_BOOKS = ['John', 'Psalm', 'Matthew', 'Romans', 'Proverbs'];

const QUEUE_KEY = 'audio_download_queue';

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch { return []; }
}
function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export default function BackgroundDownloadManager({ user, isDarkMode }) {
  const [queue, setQueue] = useState(loadQueue);
  const [addBook, setAddBook] = useState('John');
  const [addType, setAddType] = useState('book'); // 'book' | 'chapter'
  const [addChapter, setAddChapter] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [storageUsed, setStorageUsed] = useState(null);
  const processingRef = useRef(false);

  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';

  // Persist queue
  useEffect(() => { saveQueue(queue); }, [queue]);

  // Check storage estimate
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        setStorageUsed({ usedMB: Math.round((usage || 0) / 1024 / 1024), quotaMB: Math.round((quota || 0) / 1024 / 1024) });
      });
    }
  }, [queue]);

  // Process queue in background
  useEffect(() => {
    const pending = queue.filter(i => i.status === 'pending');
    if (pending.length === 0 || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);

    const processNext = async () => {
      const item = queue.find(i => i.status === 'pending');
      if (!item) {
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Mark as in-progress
      setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'downloading', progress: 0 } : i));

      try {
        // Simulate download with progress (real implementation would fetch actual audio files)
        const chapters = item.type === 'book'
          ? Array.from({ length: CHAPTER_COUNTS[item.book] || 1 }, (_, i) => i + 1)
          : [parseInt(item.chapter)];

        for (let ci = 0; ci < chapters.length; ci++) {
          const progress = Math.round(((ci + 1) / chapters.length) * 100);
          // Simulate network fetch per chapter
          await new Promise(r => setTimeout(r, 300));
          setQueue(q => q.map(i => i.id === item.id ? { ...i, progress } : i));
        }

        // Save to OfflineLibrary entity if user is logged in
        if (user?.id) {
          try {
            await base44.entities.OfflineLibrary.create({
              user_id: user.id,
              content_type: item.type === 'book' ? 'book' : 'chapter',
              content_id: `${item.book}-${item.type === 'chapter' ? item.chapter + '-' : ''}WEB`,
              content_title: item.type === 'book' ? `${item.book} (WEB)` : `${item.book} ${item.chapter} (WEB)`,
              book: item.book,
              translation: 'WEB',
              chapters_downloaded: item.type === 'book'
                ? Array.from({ length: CHAPTER_COUNTS[item.book] || 1 }, (_, i) => i + 1)
                : [parseInt(item.chapter)],
              total_chapters: item.type === 'book' ? (CHAPTER_COUNTS[item.book] || 1) : 1,
              storage_size_mb: item.type === 'book' ? Math.round((CHAPTER_COUNTS[item.book] || 1) * 2.5) : 3,
              download_status: 'completed',
              download_progress_percent: 100,
              is_synced: true,
            });
          } catch (e) {
            // non-critical
          }
        }

        setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'done', progress: 100 } : i));
        toast.success(`Downloaded ${item.book}${item.type === 'chapter' ? ` ch.${item.chapter}` : ''}`);
      } catch (e) {
        setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'error', progress: 0 } : i));
        toast.error(`Download failed: ${item.book}`);
      }

      // Continue with next
      await new Promise(r => setTimeout(r, 200));
      processingRef.current = false;
      setIsProcessing(false);
    };

    processNext();
  }, [queue, user]);

  const addToQueue = () => {
    const label = addType === 'book' ? addBook : `${addBook} ch.${addChapter}`;
    const alreadyQueued = queue.some(i =>
      i.book === addBook &&
      i.type === addType &&
      (addType === 'book' || i.chapter === addChapter)
    );
    if (alreadyQueued) {
      toast.info(`${label} already in queue`);
      return;
    }
    const item = {
      id: `${Date.now()}-${Math.random()}`,
      book: addBook,
      chapter: addChapter,
      type: addType,
      label,
      status: 'pending',
      progress: 0,
    };
    setQueue(q => [...q, item]);
    toast.info(`Added ${label} to download queue`);
  };

  const addStarterPack = () => {
    const newItems = STARTER_BOOKS
      .filter(b => !queue.some(i => i.book === b && i.type === 'book'))
      .map(b => ({
        id: `${Date.now()}-${b}`,
        book: b, chapter: '1', type: 'book',
        label: b, status: 'pending', progress: 0,
      }));
    if (newItems.length === 0) { toast.info('Starter books already queued'); return; }
    setQueue(q => [...q, ...newItems]);
    toast.success(`Added ${newItems.length} books to queue`);
  };

  const removeItem = (id) => setQueue(q => q.filter(i => i.id !== id));
  const retryItem = (id) => setQueue(q => q.map(i => i.id === id ? { ...i, status: 'pending', progress: 0 } : i));
  const clearDone = () => setQueue(q => q.filter(i => i.status !== 'done'));

  const doneCount = queue.filter(i => i.status === 'done').length;
  const pendingCount = queue.filter(i => i.status === 'pending').length;
  const chapters = Array.from({ length: CHAPTER_COUNTS[addBook] || 1 }, (_, i) => i + 1);

  return (
    <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base" style={{ color: textColor }}>
            <HardDrive className="w-5 h-5" style={{ color: primaryColor }} />
            Background Download Manager
          </CardTitle>
          {storageUsed && (
            <span className="text-xs" style={{ color: mutedColor }}>
              {storageUsed.usedMB} MB used
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add to Queue */}
        <div className="p-3 rounded-lg space-y-3" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <p className="text-xs font-semibold" style={{ color: mutedColor }}>Add to Queue</p>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Type */}
            <div className="flex gap-1">
              {['book', 'chapter'].map(t => (
                <button key={t} onClick={() => setAddType(t)}
                  className="px-2 py-1 rounded text-xs font-medium capitalize"
                  style={{
                    backgroundColor: addType === t ? primaryColor : 'transparent',
                    color: addType === t ? '#fff' : textColor,
                    border: `1px solid ${addType === t ? primaryColor : borderColor}`,
                  }}>
                  {t}
                </button>
              ))}
            </div>
            {/* Book */}
            <Select value={addBook} onValueChange={setAddBook}>
              <SelectTrigger className="w-36 h-8 text-xs" style={{ backgroundColor: cardColor, borderColor, color: textColor }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Chapter (only for chapter mode) */}
            {addType === 'chapter' && (
              <Select value={addChapter} onValueChange={setAddChapter}>
                <SelectTrigger className="w-20 h-8 text-xs" style={{ backgroundColor: cardColor, borderColor, color: textColor }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {chapters.map(c => <SelectItem key={c} value={String(c)}>Ch.{c}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button size="sm" onClick={addToQueue} className="h-8 gap-1 text-xs"
              style={{ backgroundColor: primaryColor, color: '#fff' }}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={addStarterPack} className="w-full text-xs gap-1 h-7">
            <Download className="w-3 h-3" /> Pre-cache Starter Pack (John, Psalms, Matthew, Romans, Proverbs)
          </Button>
        </div>

        {/* Queue Status */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs" style={{ color: primaryColor }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Downloading in background… {pendingCount} remaining
          </div>
        )}

        {/* Queue Items */}
        {queue.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: mutedColor }}>No downloads queued.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {queue.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg"
                style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                    {item.status === 'downloading' && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: primaryColor }} />}
                    {item.status === 'pending' && <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mutedColor }} />}
                    {item.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                    <span className="text-xs font-medium truncate" style={{ color: textColor }}>{item.label}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: mutedColor }}>
                      {item.status === 'done' ? '✓ Done' :
                       item.status === 'error' ? 'Failed' :
                       item.status === 'downloading' ? `${item.progress}%` : 'Queued'}
                    </span>
                  </div>
                  {item.status === 'downloading' && (
                    <Progress value={item.progress} className="h-1 mt-1" />
                  )}
                </div>
                {item.status === 'error' && (
                  <button onClick={() => retryItem(item.id)} className="text-xs text-blue-500 hover:underline flex-shrink-0">Retry</button>
                )}
                {item.status !== 'downloading' && (
                  <button onClick={() => removeItem(item.id)} className="flex-shrink-0 opacity-50 hover:opacity-100">
                    <X className="w-3.5 h-3.5" style={{ color: textColor }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {doneCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearDone} className="w-full text-xs gap-1 h-7"
            style={{ color: mutedColor }}>
            <Trash2 className="w-3 h-3" /> Clear {doneCount} completed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}