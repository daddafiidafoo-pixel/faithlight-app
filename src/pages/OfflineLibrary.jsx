import React, { useState, useEffect } from 'react';
import { getDownloads, removeDownload } from '@/utils/audioBibleStorage';
import { HardDrive, Trash2, Play, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function estimateSize(download) {
  // rough estimate: 1 min audio ≈ 1 MB at 128kbps
  return download.meta?.estimatedSizeMB
    ? download.meta.estimatedSizeMB * 1024 * 1024
    : 3 * 1024 * 1024; // fallback 3 MB
}

export default function OfflineLibrary() {
  const [downloads, setDownloads] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [playingId, setPlayingId] = useState(null);
  const [audioRef] = useState(() => new Audio());
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDownloads(getDownloads());
  }, []);

  useEffect(() => {
    return () => { audioRef.pause(); };
  }, [audioRef]);

  const refresh = () => setDownloads(getDownloads());

  const totalBytes = downloads.reduce((acc, d) => acc + estimateSize(d), 0);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(downloads.map(d => d.id)));
  };

  const deleteSelected = () => {
    selected.forEach(id => removeDownload(id));
    setSelected(new Set());
    setConfirmDelete(false);
    refresh();
  };

  const deleteSingle = (id) => {
    if (playingId === id) {
      audioRef.pause();
      setPlayingId(null);
    }
    removeDownload(id);
    refresh();
  };

  const togglePlay = (download) => {
    if (playingId === download.id) {
      audioRef.pause();
      setPlayingId(null);
    } else {
      audioRef.pause();
      audioRef.src = download.localUrl;
      audioRef.play().catch(() => {});
      setPlayingId(download.id);
    }
  };

  const groupedByLang = downloads.reduce((acc, d) => {
    const lang = d.meta?.language || 'unknown';
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(d);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <WifiOff className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold">Offline Library</h1>
          </div>
          <p className="text-slate-300 text-sm">Play Bible audio without an internet connection</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <HardDrive className="w-4 h-4 text-indigo-500" />
            <span><strong>{downloads.length}</strong> chapter{downloads.length !== 1 ? 's' : ''} · ~<strong>{formatBytes(totalBytes)}</strong> used</span>
          </div>
          <button
            onClick={refresh}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Empty state */}
        {downloads.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <WifiOff className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">No offline chapters yet</p>
            <p className="text-slate-400 text-sm mt-1">Open the Audio Bible and tap "Save Offline" on any chapter.</p>
          </div>
        )}

        {/* Cleanup toolbar */}
        {downloads.length > 0 && (
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <button
              onClick={selectAll}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Select All
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-slate-500 hover:underline"
            >
              Deselect
            </button>
            {selected.size > 0 && (
              <>
                <span className="text-xs text-slate-400">{selected.size} selected</span>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="ml-auto flex items-center gap-1.5 text-xs text-red-500 font-semibold border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected
                  </button>
                ) : (
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                    <button onClick={deleteSelected} className="text-xs text-white bg-red-500 rounded-lg px-3 py-1.5 font-semibold">Yes, Delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Downloads grouped by language */}
        {Object.entries(groupedByLang).map(([lang, items]) => (
          <div key={lang}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {lang.toUpperCase()}
            </h2>
            <div className="space-y-2">
              {items.map(download => {
                const isPlaying = playingId === download.id;
                const isChecked = selected.has(download.id);
                return (
                  <div
                    key={download.id}
                    className={`bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3 transition-all ${
                      isChecked ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-100'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(download.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {download.meta?.bookId || '—'} · Ch. {download.meta?.chapter || '—'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {download.meta?.versionName || 'Unknown version'} · ~{formatBytes(estimateSize(download))}
                      </p>
                    </div>

                    {/* Play button */}
                    <button
                      onClick={() => togglePlay(download)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isPlaying ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteSingle(download.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Storage tip */}
        {downloads.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
            <strong>Storage tip:</strong> Each audio chapter uses approximately 2–5 MB. Use "Select All → Delete" to free space quickly.
          </div>
        )}
      </div>
    </div>
  );
}