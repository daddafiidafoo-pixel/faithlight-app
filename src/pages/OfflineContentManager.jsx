import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, BookOpen, Headphones, Trash2, Check, Clock, HardDrive, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const BIBLE_VERSIONS = [
  { id: 'web', name: 'World English Bible', lang: 'English', size: '4.2 MB', code: 'en' },
  { id: 'kjv', name: 'King James Version', lang: 'English', size: '4.8 MB', code: 'en' },
  { id: 'niv', name: 'New International Version', lang: 'English', size: '4.5 MB', code: 'en' },
  { id: 'om-oromo', name: 'Macaafa Qulqulluu', lang: 'Afaan Oromoo', size: '3.9 MB', code: 'om' },
  { id: 'am-amharic', name: 'አዲስ ኪዳን', lang: 'Amharic (አማርኛ)', size: '4.1 MB', code: 'am' },
  { id: 'sw-swahili', name: 'Biblia Takatifu', lang: 'Kiswahili', size: '4.3 MB', code: 'sw' },
  { id: 'fr-bible', name: 'Louis Segond', lang: 'Français', size: '4.6 MB', code: 'fr' },
  { id: 'ar-bible', name: 'الكتاب المقدس', lang: 'العربية', size: '4.4 MB', code: 'ar' },
];

const STUDY_MATERIALS = [
  { id: 'overcoming-anxiety', name: 'Overcoming Anxiety', type: 'study', size: '1.2 MB', days: 7 },
  { id: 'psalms-comfort', name: 'Psalms of Comfort', type: 'study', size: '0.9 MB', days: 14 },
  { id: 'sermon-mount', name: 'Sermon on the Mount', type: 'sermon', size: '0.7 MB', days: 5 },
  { id: 'prayer-guide', name: '30-Day Prayer Guide', type: 'study', size: '1.4 MB', days: 30 },
  { id: 'faith-oromo', name: 'Amantaa fi Waaqa (Oromo)', type: 'study', size: '0.8 MB', days: 7 },
];

const STORAGE_KEY = 'fl_offline_downloads';
const OFFLINE_MODE_KEY = 'fl_offline_mode';

function getDownloads() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveDownloads(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function StorageBar({ usedMB, totalMB = 200 }) {
  const pct = Math.min(100, (usedMB / totalMB) * 100);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{usedMB} MB used</span>
        <span>{totalMB} MB available</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${pct > 80 ? 'bg-red-400' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function VersionRow({ item, downloaded, onDownload, onDelete, downloading }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${downloaded ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
        <p className="text-xs text-gray-500">{item.lang} · {item.size}</p>
      </div>
      {downloaded ? (
        <div className="flex gap-2 items-center">
          <span className="flex items-center gap-1 text-xs text-indigo-600 font-semibold"><Check size={12} /> Saved</span>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onDownload(item)}
          disabled={downloading === item.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold disabled:opacity-60 transition-all hover:bg-indigo-700"
        >
          {downloading === item.id ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
          {downloading === item.id ? 'Saving…' : 'Download'}
        </button>
      )}
    </div>
  );
}

export default function OfflineContentManagerPage() {
  const [downloads, setDownloads] = useState(getDownloads());
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem(OFFLINE_MODE_KEY) === 'true');
  const [downloading, setDownloading] = useState(null);
  const [showStudy, setShowStudy] = useState(true);
  const [showBible, setShowBible] = useState(true);

  const totalUsedMB = Object.keys(downloads).reduce((acc, id) => {
    const item = [...BIBLE_VERSIONS, ...STUDY_MATERIALS].find(i => i.id === id);
    return acc + parseFloat(item?.size || '0');
  }, 0);

  const handleDownload = async (item) => {
    setDownloading(item.id);
    // Simulate download delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const updated = { ...getDownloads(), [item.id]: { downloadedAt: new Date().toISOString(), size: item.size } };
    saveDownloads(updated);
    setDownloads(updated);
    setDownloading(null);
  };

  const handleDelete = (id) => {
    const updated = { ...downloads };
    delete updated[id];
    saveDownloads(updated);
    setDownloads(updated);
  };

  const toggleOfflineMode = () => {
    const next = !offlineMode;
    setOfflineMode(next);
    localStorage.setItem(OFFLINE_MODE_KEY, String(next));
  };

  const downloadedCount = Object.keys(downloads).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <HardDrive size={20} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Offline Library</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">Download Bible versions and studies for offline use</p>

        {/* Offline Mode Toggle */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border mb-5 transition-all ${offlineMode ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            {offlineMode ? <WifiOff size={20} className="text-white" /> : <Wifi size={20} className="text-indigo-600" />}
            <div>
              <p className={`font-semibold text-sm ${offlineMode ? 'text-white' : 'text-gray-900'}`}>
                {offlineMode ? 'Offline-Only Mode ON' : 'Offline-Only Mode OFF'}
              </p>
              <p className={`text-xs ${offlineMode ? 'text-indigo-200' : 'text-gray-500'}`}>
                {offlineMode ? 'Reader uses only downloaded content' : 'Reader uses network when available'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOfflineMode}
            className={`relative w-12 h-6 rounded-full transition-all ${offlineMode ? 'bg-white' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${offlineMode ? 'left-6 bg-indigo-600' : 'left-0.5 bg-white'} shadow`} />
          </button>
        </div>

        {/* Storage indicator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900">Storage Used</p>
            <span className="text-xs text-gray-500">{downloadedCount} item{downloadedCount !== 1 ? 's' : ''} downloaded</span>
          </div>
          <StorageBar usedMB={totalUsedMB.toFixed(1)} />
        </div>

        {/* Bible Versions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
          <button
            onClick={() => setShowBible(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-600" />
              <span className="font-semibold text-gray-900 text-sm">Bible Translations</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                {BIBLE_VERSIONS.filter(v => downloads[v.id]).length}/{BIBLE_VERSIONS.length}
              </span>
            </div>
            {showBible ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
          </button>
          {showBible && (
            <div className="p-3 space-y-2">
              {BIBLE_VERSIONS.map(v => (
                <VersionRow
                  key={v.id}
                  item={v}
                  downloaded={!!downloads[v.id]}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  downloading={downloading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Study Materials */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowStudy(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50"
          >
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-purple-600" />
              <span className="font-semibold text-gray-900 text-sm">Study Materials</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                {STUDY_MATERIALS.filter(v => downloads[v.id]).length}/{STUDY_MATERIALS.length}
              </span>
            </div>
            {showStudy ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
          </button>
          {showStudy && (
            <div className="p-3 space-y-2">
              {STUDY_MATERIALS.map(v => (
                <VersionRow
                  key={v.id}
                  item={{ ...v, lang: `${v.days}-day ${v.type}` }}
                  downloaded={!!downloads[v.id]}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  downloading={downloading}
                />
              ))}
            </div>
          )}
        </div>

        {offlineMode && downloadedCount === 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            ⚠️ Offline-only mode is on but nothing is downloaded yet. Download content above to use the reader without internet.
          </div>
        )}
      </div>
    </div>
  );
}