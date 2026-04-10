import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2, CheckCircle2, AlertCircle, Volume2, Wifi, WifiOff } from 'lucide-react';
import { CHAPTER_COUNTS, ALL_BOOKS, BOOK_IDS } from './offlineConstants';
import { toast } from 'sonner';
import { useI18n } from '../I18nProvider';

function chapterRange(book) {
  return Array.from({ length: CHAPTER_COUNTS[book] || 1 }, (_, i) => i + 1);
}

export default function AudioDownloader({ user, onQueued }) {
  const { t } = useI18n();
  const [catalog, setCatalog] = useState([]);
  const [langCode, setLangCode] = useState('en');
  const [catalogId, setCatalogId] = useState(null);
  const [book, setBook] = useState('John');
  const [startCh, setStartCh] = useState(1);
  const [endCh, setEndCh] = useState(3);
  const [queueing, setQueueing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [savedChapters, setSavedChapters] = useState([]);

  useEffect(() => {
    base44.entities.AudioCatalog.list('priority', 50).then(data => {
      setCatalog(data);
      const def = data.find(d => d.language_code === 'en' && d.is_default_for_language) || data[0];
      if (def) { setLangCode(def.language_code); setCatalogId(def.id); }
    }).catch(() => {});
  }, []);

  const languages = [...new Map(catalog.map(r => [r.language_code, { code: r.language_code, name: r.language_name }])).values()];
  const versionsForLang = catalog.filter(r => r.language_code === langCode).sort((a, b) => (a.priority || 1) - (b.priority || 1));
  const selectedEntry = catalog.find(r => r.id === catalogId) || versionsForLang[0];
  const hasAudio = selectedEntry?.fileset_id_audio && selectedEntry?.has_audio;

  useEffect(() => { loadSaved(); }, [book, selectedEntry?.fileset_id_audio]);

  const loadSaved = async () => {
    if (!selectedEntry?.fileset_id_audio) { setSavedChapters([]); return; }
    try {
      const existing = await base44.entities.OfflineAudioChapter.filter({
        fileset_id_audio: selectedEntry.fileset_id_audio,
        book_id: BOOK_IDS[book] || book,
      }, 'chapter', 150);
      setSavedChapters(existing.map(r => r.chapter));
    } catch { setSavedChapters([]); }
  };

  const handleBookChange = (b) => {
    setBook(b);
    setStartCh(1);
    setEndCh(Math.min(3, CHAPTER_COUNTS[b] || 1));
  };

  const queueAndProcess = async () => {
    if (!selectedEntry?.fileset_id_audio) { toast.error('No audio fileset configured for this version.'); return; }
    if (startCh > endCh) { toast.error('Start chapter must be ≤ end chapter.'); return; }

    const chapList = Array.from({ length: endCh - startCh + 1 }, (_, i) => startCh + i);
    const bookId = BOOK_IDS[book] || book;
    const toQueue = chapList.filter(ch => !savedChapters.includes(ch));

    if (!toQueue.length) { toast.info('All selected chapters already saved.'); return; }

    setQueueing(true);
    setError(null);
    try {
      await base44.entities.DownloadQueue.bulkCreate(
        toQueue.map(ch => ({
          type: 'audio',
          fileset_id_audio: selectedEntry.fileset_id_audio,
          language_code: selectedEntry.language_code,
          language_name: selectedEntry.language_name,
          bible_name: selectedEntry.bible_name,
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
    toast.success(`Saving stream URLs for ${toQueue.length} chapter(s)…`);
    onQueued?.();

    setProcessing(true);
    setProgress({ done: 0, total: toQueue.length });

    let attempts = 0;
    const maxAttempts = toQueue.length * 3 + 5;
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await base44.functions.invoke('processDownloadQueue', {});
        const data = res?.data || res;
        const nowSaved = await base44.entities.OfflineAudioChapter.filter({
          fileset_id_audio: selectedEntry.fileset_id_audio,
          book_id: BOOK_IDS[book] || book,
        }, 'chapter', 150);
        const savedNums = nowSaved.map(r => r.chapter);
        const done = toQueue.filter(ch => savedNums.includes(ch)).length;
        setProgress({ done, total: toQueue.length });
        if (done >= toQueue.length) break;
        if (data?.remaining === 0 && data?.processed === 0) break;
      } catch (err) {
        console.error('Audio queue error:', err);
      }
      await new Promise(r => setTimeout(r, 800));
    }

    setProcessing(false);
    setProgress(null);
    await loadSaved();
    toast.success(`Stream saved for ${book} Ch. ${startCh}–${endCh}.`);
    onQueued?.();
  };

  const chapters = chapterRange(book);
  const totalRange = endCh - startCh + 1;
  const alreadyDone = Array.from({ length: totalRange }, (_, i) => startCh + i).filter(ch => savedChapters.includes(ch)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-purple-500" />
          <p className="font-semibold text-gray-800 text-sm">{t('offline.audio.title', 'Audio Streaming (Internet required)')}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
          <Wifi className="w-3 h-3" /> {t('offline.btn.requires_internet', 'Requires Internet')}
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        {t('offline.audio.desc', 'Listen to Bible audio online. Internet connection required.')}
      </p>

      {/* Language */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Audio Language</label>
        <div className="flex flex-wrap gap-2">
          {languages.length === 0 && <p className="text-xs text-gray-400">No audio catalog entries found.</p>}
          {languages.map(l => (
            <button key={l.code} onClick={() => { setLangCode(l.code); setCatalogId(null); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${langCode === l.code ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      {versionsForLang.length > 1 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Audio Version</label>
          <div className="flex flex-wrap gap-2">
            {versionsForLang.map(v => (
              <button key={v.id} onClick={() => setCatalogId(v.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${catalogId === v.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                {v.bible_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No audio available */}
      {selectedEntry && !hasAudio && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <WifiOff className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">No audio available for this version.</p>
            <p className="mt-0.5 text-amber-700">Download the text above for offline reading.</p>
          </div>
        </div>
      )}

      {hasAudio && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Book</label>
            <select value={book} onChange={e => handleBookChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-400">
              {ALL_BOOKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">From Chapter</label>
              <select value={startCh}
                onChange={e => { const v = +e.target.value; setStartCh(v); if (endCh < v) setEndCh(v); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-400">
                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">To Chapter</label>
              <select value={endCh} onChange={e => setEndCh(+e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-400">
                {chapters.filter(c => c >= startCh).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {alreadyDone > 0 && !progress && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {alreadyDone} of {totalRange} chapter{totalRange > 1 ? 's' : ''} already saved
            </p>
          )}

          {progress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Saving stream URLs for {book}…</span>
                <span>{progress.done}/{progress.total}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-300 rounded-full"
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
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            {(queueing || processing) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
            {queueing ? 'Saving…'
              : progress ? `Saving ${progress.done}/${progress.total}…`
              : `${t('offline.btn.play', 'Play Audio')} — ${book} Ch. ${startCh}–${endCh}`}
          </Button>
        </>
      )}
    </div>
  );
}