import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListMusic, Plus, Trash2, ChevronUp, ChevronDown, Play, X, Shuffle, Repeat, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

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

const QUEUE_STORAGE_KEY = 'audio_bible_queue';
const QUEUE_MODES_KEY = 'audio_bible_queue_modes';

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY)) || []; } catch { return []; }
}
function saveQueue(queue) {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AudioQueue({ currentBook, currentChapter, currentTranslation, onPlayItem, isDarkMode }) {
  const [queue, setQueue] = useState(loadQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem(QUEUE_MODES_KEY))?.shuffle || false; } catch { return false; }
  });
  const [repeatAll, setRepeatAll] = useState(() => {
    try { return JSON.parse(localStorage.getItem(QUEUE_MODES_KEY))?.repeatAll || false; } catch { return false; }
  });
  const [addBook, setAddBook] = useState(currentBook || 'John');
  const [addChapter, setAddChapter] = useState(currentChapter || '1');
  const [addVerseStart, setAddVerseStart] = useState('');
  const [addVerseEnd, setAddVerseEnd] = useState('');

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const bgColor = isDarkMode ? '#0F1411' : '#F9FAFB';

  // Persist queue
  useEffect(() => { saveQueue(queue); }, [queue]);

  // Persist modes
  useEffect(() => {
    localStorage.setItem(QUEUE_MODES_KEY, JSON.stringify({ shuffle: shuffleMode, repeatAll }));
  }, [shuffleMode, repeatAll]);

  // When external book/chapter changes, find it in queue
  useEffect(() => {
    const idx = queue.findIndex(
      (q) => q.book === currentBook && q.chapter.toString() === currentChapter?.toString()
    );
    if (idx >= 0) setCurrentIndex(idx);
  }, [currentBook, currentChapter]);

  const addToQueue = () => {
    if (!addBook || !addChapter) { toast.error('Select book and chapter'); return; }
    const item = {
      id: Date.now(),
      book: addBook,
      chapter: parseInt(addChapter),
      translation: currentTranslation || 'WEB',
      verseStart: addVerseStart ? parseInt(addVerseStart) : null,
      verseEnd: addVerseEnd ? parseInt(addVerseEnd) : null,
      label: addVerseStart
        ? `${addBook} ${addChapter}:${addVerseStart}${addVerseEnd ? '–' + addVerseEnd : ''}`
        : `${addBook} ${addChapter}`,
    };
    setQueue((q) => [...q, item]);
    toast.success(`Added ${item.label} to queue`);
  };

  const removeFromQueue = (id) => {
    setQueue((q) => q.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    if (queue.length === 0) return;
    setQueue([]);
    toast.success('Queue cleared');
  };

  const moveItem = (idx, dir) => {
    const newQ = [...queue];
    const target = idx + (dir === 'up' ? -1 : 1);
    if (target < 0 || target >= newQ.length) return;
    [newQ[idx], newQ[target]] = [newQ[target], newQ[idx]];
    setQueue(newQ);
    if (currentIndex === idx) setCurrentIndex(target);
    else if (currentIndex === target) setCurrentIndex(idx);
  };

  const playItem = (item, idx) => {
    setCurrentIndex(idx);
    onPlayItem?.(item);
  };

  const playFromStart = () => {
    if (queue.length === 0) { toast.error('Queue is empty'); return; }
    if (shuffleMode) {
      const shuffled = shuffleArray(queue);
      setQueue(shuffled);
      playItem(shuffled[0], 0);
      toast.success('🔀 Playing shuffled queue');
    } else {
      playItem(queue[0], 0);
      toast.success('▶ Playing queue from start');
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    if (shuffleMode) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      playItem(queue[randomIdx], randomIdx);
    } else {
      const next = currentIndex + 1;
      if (next < queue.length) {
        playItem(queue[next], next);
      } else if (repeatAll) {
        playItem(queue[0], 0);
        toast.info('🔁 Repeating queue from start');
      } else {
        toast.info('End of queue');
      }
    }
  };

  const toggleShuffle = () => {
    setShuffleMode((v) => {
      toast.success(!v ? '🔀 Shuffle ON' : 'Shuffle OFF');
      return !v;
    });
  };

  const toggleRepeatAll = () => {
    setRepeatAll((v) => {
      toast.success(!v ? '🔁 Repeat All ON' : 'Repeat All OFF');
      return !v;
    });
  };

  const chapterOptions = Array.from({ length: CHAPTER_COUNTS[addBook] || 1 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">

      {/* Playback Mode Controls */}
      <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ borderColor, backgroundColor: cardColor }}>
        <p className="text-xs font-semibold mr-auto" style={{ color: mutedColor }}>Playback Mode</p>
        <button
          onClick={toggleShuffle}
          title="Shuffle"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
          style={{
            backgroundColor: shuffleMode ? primaryColor : 'transparent',
            color: shuffleMode ? '#fff' : textColor,
            borderColor: shuffleMode ? primaryColor : borderColor,
          }}
        >
          <Shuffle className="w-3.5 h-3.5" />
          Shuffle
        </button>
        <button
          onClick={toggleRepeatAll}
          title="Repeat All"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
          style={{
            backgroundColor: repeatAll ? primaryColor : 'transparent',
            color: repeatAll ? '#fff' : textColor,
            borderColor: repeatAll ? primaryColor : borderColor,
          }}
        >
          <Repeat className="w-3.5 h-3.5" />
          Repeat All
        </button>
      </div>

      {/* Add to queue */}
      <div className="p-3 rounded-lg border space-y-3" style={{ borderColor, backgroundColor: cardColor }}>
        <p className="text-sm font-semibold" style={{ color: textColor }}>Add to Queue</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs mb-1 block" style={{ color: mutedColor }}>Book</label>
            <Select value={addBook} onValueChange={(v) => { setAddBook(v); setAddChapter('1'); }}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: mutedColor }}>Chapter</label>
            <Select value={addChapter} onValueChange={setAddChapter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {chapterOptions.map((c) => <SelectItem key={c} value={c.toString()} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs mb-1 block" style={{ color: mutedColor }}>Verse Start (opt.)</label>
            <input
              type="number" min={1} value={addVerseStart}
              onChange={(e) => setAddVerseStart(e.target.value)}
              placeholder="e.g. 1"
              className="w-full h-8 px-2 text-xs border rounded"
              style={{ borderColor, backgroundColor: bgColor, color: textColor }}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: mutedColor }}>Verse End (opt.)</label>
            <input
              type="number" min={1} value={addVerseEnd}
              onChange={(e) => setAddVerseEnd(e.target.value)}
              placeholder="e.g. 16"
              className="w-full h-8 px-2 text-xs border rounded"
              style={{ borderColor, backgroundColor: bgColor, color: textColor }}
            />
          </div>
        </div>
        <Button onClick={addToQueue} size="sm" className="w-full gap-1" style={{ backgroundColor: primaryColor, color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" />
          Add to Queue
        </Button>
      </div>

      {/* Queue list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold flex items-center gap-1" style={{ color: textColor }}>
            <ListMusic className="w-4 h-4" />
            Queue ({queue.length})
            {shuffleMode && <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ backgroundColor: primaryColor + '30', color: primaryColor }}>🔀</span>}
            {repeatAll && <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ backgroundColor: primaryColor + '30', color: primaryColor }}>🔁</span>}
          </p>
          {queue.length > 0 && (
            <button onClick={clearQueue} className="text-xs text-red-400 hover:text-red-600">Clear all</button>
          )}
        </div>

        {queue.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: mutedColor }}>Queue is empty. Add chapters or verses above to build your playlist.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors`}
                style={{
                  backgroundColor: idx === currentIndex ? (isDarkMode ? '#1E2820' : '#F0FDF4') : cardColor,
                  borderColor: idx === currentIndex ? primaryColor : borderColor,
                  borderLeftWidth: idx === currentIndex ? 3 : 1,
                }}
              >
                <span className="text-xs w-5 text-center shrink-0" style={{ color: idx === currentIndex ? primaryColor : mutedColor }}>
                  {idx === currentIndex ? '▶' : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: textColor }}>{item.label}</p>
                  <p className="text-xs" style={{ color: mutedColor }}>{item.translation}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => playItem(item, idx)} className="p-1 rounded hover:bg-green-100" title="Play now">
                    <Play className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  </button>
                  <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: mutedColor }} />
                  </button>
                  <button onClick={() => moveItem(idx, 'down')} disabled={idx === queue.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: mutedColor }} />
                  </button>
                  <button onClick={() => removeFromQueue(item.id)} className="p-1 rounded hover:bg-red-50 text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {queue.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={playFromStart} size="sm" className="flex-1 gap-1" style={{ backgroundColor: primaryColor, color: '#fff' }}>
            <Play className="w-3.5 h-3.5" />
            {shuffleMode ? 'Shuffle & Play' : 'Play Queue'}
          </Button>
          <Button onClick={playNext} variant="outline" size="sm" className="flex-1 gap-1" disabled={currentIndex >= queue.length - 1 && !repeatAll && !shuffleMode}>
            <SkipForward className="w-3.5 h-3.5" />
            Play Next
          </Button>
        </div>
      )}
    </div>
  );
}