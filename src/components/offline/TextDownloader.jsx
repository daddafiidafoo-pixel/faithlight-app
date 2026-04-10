import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle, BookOpen, RefreshCw } from 'lucide-react';
import { CHAPTER_COUNTS, ALL_BOOKS, TEXT_VERSIONS, BOOK_IDS } from './offlineConstants';
import { toast } from 'sonner';
import { useI18n } from '../I18nProvider';

function chapterRange(book) {
  return Array.from({ length: CHAPTER_COUNTS[book] || 1 }, (_, i) => i + 1);
}

export default function TextDownloader({ user, onQueued }) {
  const { t } = useI18n();
  const [version, setVersion] = useState('WEB');
  const [book, setBook] = useState('John');
  const [startCh, setStartCh] = useState(1);
  const [endCh, setEndCh] = useState(5);
  const [queueing, setQueueing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, failed }
  const [error, setError] = useState(null);
  const [savedChapters, setSavedChapters] = useState([]); // { book_id, chapter, version_id }

  // Load already-saved chapters for current book
  useEffect(() => {
    loadSaved();
  }, [book, version]);

  const loadSaved = async () => {
    try {
      const existing = await base44.entities.OfflineTextChapter.filter({
        version_id: version,
        book_id: BOOK_IDS[book] || book,
      }, 'chapter', 150);
      setSavedChapters(existing.map(r => r.chapter));
    } catch { setSavedChapters([]); }
  };

  const handleBookChange = (b) => {
    setBook(b);
    setStartCh(1);
    setEndCh(Math.min(5, CHAPTER_COUNTS[b] || 1));
  };

  const queueAndProcess = async () => {
    if (startCh > endCh) { toast.error('Start chapter must be ≤ end chapter.'); return; }
    const chapList = Array.from({ length: endCh - startCh + 1 }, (_, i) => startCh + i);
    const bookId = BOOK_IDS[book] || book;

    setQueueing(true);
    setError(null);

    // Insert queued items (skip already saved)
    const toQueue = chapList.filter(ch => !savedChapters.includes(ch));
    if (!toQueue.length) {
      toast.info('All selected chapters already downloaded.');
      setQueueing(false);
      return;
    }

    try {
      await base44.entities.DownloadQueue.bulkCreate(
        toQueue.map(ch => ({
          type: 'text',
          version_id: version,
          language_code: 'en',
          book_id: bookId,
          book_name: book,
          chapter: ch,
          status: 'queued',
          user_id: user?.id || null,
        }))
      );
    } catch (e) {
      setError('Failed to queue: ' + e.message);
      setQueueing(false);
      return;
    }
    setQueueing(false);
    toast.success(`Queued ${toQueue.length} chapter(s). Processing…`);
    onQueued?.();

    // Poll the queue processor until all chapters are done
    setProcessing(true);
    setProgress({ done: 0, total: toQueue.length, failed: 0 });

    let attempts = 0;
    const maxAttempts = toQueue.length * 3 + 5; // generous ceiling
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await base44.functions.invoke('processDownloadQueue', {});
        const data = res?.data || res;

        // Re-check how many are now saved
        const nowSaved = await base44.entities.OfflineTextChapter.filter({
          version_id: version,
          book_id: BOOK_IDS[book] || book,
        }, 'chapter', 150);
        const savedNums = nowSaved.map(r => r.chapter);
        const done = toQueue.filter(ch => savedNums.includes(ch)).length;
        const failed = toQueue.filter(ch => {
          // mark failed if queue row is failed
          return false; // we'll just show done vs total
        }).length;
        setProgress({ done, total: toQueue.length, failed });

        if (done >= toQueue.length) break; // all saved
        if (data?.remaining === 0 && data?.processed === 0) break; // queue empty, nothing left
      } catch (err) {
        console.error('Queue processing error:', err);
      }
      // Small delay between polls
      await new Promise(r => setTimeout(r, 600));
    }

    setProcessing(false);
    setProgress(null);
    await loadSaved();
    toast.success(`Downloaded chapters of ${book} (${version}).`);
    onQueued?.();
  };

  const chapters = chapterRange(book);
  const totalRange = endCh - startCh + 1;
  const alreadyDone = Array.from({ length: totalRange }, (_, i) => startCh + i).filter(ch => savedChapters.includes(ch)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-500" />
        <p className="font-semibold text-gray-800 text-sm">{t('offline.reading.title', 'Offline Reading')}</p>
      </div>
      <p className="text-xs text-gray-400">{t('offline.reading.desc', 'Download Bible chapters to read without internet.')}</p>

      {/* Version */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Bible Version</label>
        <div className="flex gap-2">
          {TEXT_VERSIONS.map(v => (
            <button key={v.id} onClick={() => setVersion(v.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${version === v.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {v.id} · {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Book */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Book</label>
        <select value={book} onChange={e => handleBookChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400">
          {ALL_BOOKS.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Chapter range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">From Chapter</label>
          <select value={startCh}
            onChange={e => { const v = +e.target.value; setStartCh(v); if (endCh < v) setEndCh(v); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400">
            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">To Chapter</label>
          <select value={endCh} onChange={e => setEndCh(+e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400">
            {chapters.filter(c => c >= startCh).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Status hints */}
      {alreadyDone > 0 && !progress && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {alreadyDone} of {totalRange} chapter{totalRange > 1 ? 's' : ''} already downloaded
        </p>
      )}

      {/* Progress */}
      {progress && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Downloading {book} chapters…</span>
            <span>{progress.done}/{progress.total}{progress.failed > 0 ? ` · ${progress.failed} failed` : ''}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      <Button onClick={queueAndProcess} disabled={queueing || processing}
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
        {(queueing || processing) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {queueing ? 'Queueing…'
          : progress ? `Downloading ${progress.done}/${progress.total}…`
          : `${t('offline.btn.download', 'Download Chapters')} — ${book} Ch. ${startCh}–${endCh}`}
      </Button>
    </div>
  );
}