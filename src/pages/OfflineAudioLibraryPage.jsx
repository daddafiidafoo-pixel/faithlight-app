import React, { useState, useEffect, useRef } from 'react';
import { getAllDownloadedChapters, deleteChapterAudio, getTotalStorageUsed, getChapterAudioBlob, getBlobURL, saveChapterAudio, isChapterDownloaded } from '@/lib/audioOfflineDB';
import { Trash2, Play, HardDrive, WifiOff, BookOpen, Loader2, Download, Search, Pause, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 }, { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 }, { name: 'Isaiah', chapters: 66 }, { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 }, { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 }, { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 }, { name: 'Revelation', chapters: 22 },
];

const TRANSLATION = 'KJV';

function DownloadBrowser({ downloadedKeys, onDownloaded }) {
  const [expandedBook, setExpandedBook] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [bookSearch, setBookSearch] = useState('');

  const getAudioUrl = async (book, chapter) => {
    // Try fetching from BibleBrain via backend function
    try {
      const res = await base44.functions.invoke('getChapterAudio', { book, chapter, translation: TRANSLATION });
      return res?.data?.audioUrl || null;
    } catch {
      return null;
    }
  };

  const handleDownload = async (book, chapter) => {
    const key = `${book}_${chapter}`;
    setDownloading(d => ({ ...d, [key]: true }));
    try {
      const url = await getAudioUrl(book, chapter);
      if (!url) throw new Error('No audio URL found for this chapter');
      await saveChapterAudio(book, chapter, TRANSLATION, url);
      toast.success(`${book} ${chapter} saved for offline!`);
      onDownloaded();
    } catch (e) {
      toast.error(e.message || 'Download failed');
    }
    setDownloading(d => ({ ...d, [key]: false }));
  };

  const filteredBooks = BIBLE_BOOKS.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <p className="font-bold text-gray-900 text-sm mb-3">📥 Download Chapters</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={bookSearch} onChange={e => setBookSearch(e.target.value)}
            placeholder="Search books…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {filteredBooks.map(book => (
          <div key={book.name}>
            <button
              onClick={() => setExpandedBook(expandedBook === book.name ? null : book.name)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <BookOpen size={14} className="text-indigo-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">{book.name}</p>
                  <p className="text-xs text-gray-400">{book.chapters} chapters</p>
                </div>
              </div>
              {expandedBook === book.name
                ? <ChevronDown size={16} className="text-gray-400" />
                : <ChevronRight size={16} className="text-gray-400" />}
            </button>

            {expandedBook === book.name && (
              <div className="px-4 pb-3 bg-gray-50">
                <div className="grid grid-cols-6 gap-1.5 pt-2">
                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => {
                    const key = `${book.name}_${ch}`;
                    const isDownloaded = downloadedKeys.has(`${book.name}_${ch}_${TRANSLATION}`);
                    const isLoading = downloading[key];
                    return (
                      <button
                        key={ch}
                        onClick={() => !isDownloaded && !isLoading && handleDownload(book.name, ch)}
                        disabled={isDownloaded || isLoading}
                        className={`h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                          isDownloaded
                            ? 'bg-green-100 text-green-600 cursor-default'
                            : isLoading
                            ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        {isLoading ? <Loader2 size={11} className="animate-spin" /> : isDownloaded ? <Check size={11} /> : ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OfflineAudioLibraryPage() {
  const [chapters, setChapters] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingKey, setPlayingKey] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [search, setSearch] = useState('');
  const audioRef = useRef(null);

  const loadLibrary = async () => {
    setLoading(true);
    const [list, size] = await Promise.all([getAllDownloadedChapters(), getTotalStorageUsed()]);
    setChapters(list.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
    setTotalSize(size);
    setLoading(false);
  };

  useEffect(() => { loadLibrary(); }, []);

  const downloadedKeys = new Set(chapters.map(c => `${c.book}_${c.chapter}_${c.translation}`));

  const handleDelete = async (c) => {
    await deleteChapterAudio(c.book, c.chapter, c.translation);
    if (playingKey === c.key) { audioRef.current?.pause(); setPlayingKey(null); setIsPlaying(false); }
    toast('Removed from offline library');
    loadLibrary();
  };

  const handlePlay = async (c) => {
    if (playingKey === c.key) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); }
      return;
    }
    const entry = await getChapterAudioBlob(c.book, c.chapter, c.translation);
    if (!entry) { toast.error('File not found'); return; }
    const url = getBlobURL(entry.blob);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingKey(c.key);
      setIsPlaying(true);
    }
  };

  const filteredChapters = chapters.filter(c =>
    !search || `${c.book} ${c.chapter}`.toLowerCase().includes(search.toLowerCase())
  );

  const currentTrack = chapters.find(c => c.key === playingKey);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 pt-10 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <WifiOff className="w-6 h-6 text-indigo-300" />
            <h1 className="text-2xl font-bold text-white">Offline Audio</h1>
          </div>
          <p className="text-slate-300 text-sm">Download chapters to listen without internet</p>
          {chapters.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-indigo-200">
              <HardDrive className="w-4 h-4" />
              <span>{chapters.length} chapter{chapters.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">
        {/* Mini player bar */}
        {playingKey && currentTrack && (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{currentTrack.book} — Chapter {currentTrack.chapter}</p>
              <p className="text-xs text-gray-400">{currentTrack.translation}</p>
            </div>
            <button onClick={() => handlePlay(currentTrack)}
              className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white">
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button onClick={() => { audioRef.current?.pause(); setPlayingKey(null); setIsPlaying(false); }}
              className="p-1.5 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        )}

        <audio
          ref={audioRef}
          onEnded={() => { setPlayingKey(null); setIsPlaying(false); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 gap-1">
          {[['library', '🎧 My Library'], ['download', '📥 Download']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            {chapters.length > 0 && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search book or chapter…"
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : chapters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="py-16 text-center">
                  <Download className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">No offline chapters yet</p>
                  <p className="text-gray-400 text-xs mt-1">Switch to the <strong>Download</strong> tab to save chapters.</p>
                  <button onClick={() => setActiveTab('download')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                    Browse & Download →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 px-1">{filteredChapters.length} of {chapters.length} saved chapters</p>
                {filteredChapters.map(c => (
                  <div key={c.key} className={`bg-white rounded-2xl border shadow-sm transition-all ${playingKey === c.key ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3 p-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${playingKey === c.key ? 'bg-indigo-600' : 'bg-indigo-100'}`}>
                        <BookOpen className={`w-5 h-5 ${playingKey === c.key ? 'text-white' : 'text-indigo-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{c.book} — Chapter {c.chapter}</p>
                        <p className="text-xs text-gray-400">
                          {c.translation} · {formatBytes(c.size || 0)} · {c.savedAt ? format(new Date(c.savedAt), 'MMM d, yyyy') : '—'}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => handlePlay(c)}
                          className={`p-2.5 rounded-xl transition-colors ${playingKey === c.key ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                          {playingKey === c.key && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(c)}
                          className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-4 flex items-center gap-2 text-sm text-gray-500">
                  <HardDrive className="w-4 h-4 flex-shrink-0" />
                  <span>Total storage: <strong className="text-gray-700">{formatBytes(totalSize)}</strong></span>
                  <button onClick={loadLibrary} className="ml-auto text-xs text-indigo-500 hover:underline">Refresh</button>
                </div>
              </>
            )}
          </>
        )}

        {/* Download Tab */}
        {activeTab === 'download' && (
          <DownloadBrowser downloadedKeys={downloadedKeys} onDownloaded={loadLibrary} />
        )}
      </div>
    </div>
  );
}