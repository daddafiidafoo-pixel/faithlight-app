import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Trash2, Wifi, WifiOff, CheckCircle,
  RefreshCw, AlertCircle, Search, HardDrive, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BIBLE_PACKAGES, downloadTranslation, removeTranslation } from '@/components/offline/bibleDownloadService.jsx';
import { useIsOnline, useDownloadedTranslations, searchVerses } from '@/components/offline/useBibleOffline.jsx';

export default function OfflineBible() {
  const [user, setUser] = useState(null);
  const isOnline = useIsOnline();
  const { translations: downloaded, loading: metaLoading, refresh } = useDownloadedTranslations();
  const [downloadState, setDownloadState] = useState({});
  const [searchLang, setSearchLang] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [updates, setUpdates] = useState({});

  // Only treat a translation as truly saved if it has real verse content
  const isReallyDownloaded = (meta) => meta && meta.verseCount > 0 && meta.sizeKB > 0;
  const downloadedMap = Object.fromEntries(
    downloaded.filter(isReallyDownloaded).map(d => [d.languageCode, d])
  );
  const corruptMap = Object.fromEntries(
    downloaded.filter(d => !isReallyDownloaded(d)).map(d => [d.languageCode, d])
  );

  const totalMB = Object.values(downloadedMap).reduce((acc, d) => acc + (d.sizeKB || 0) / 1024, 0);
  const totalVerses = Object.values(downloadedMap).reduce((acc, d) => acc + (d.verseCount || 0), 0);
  const hasDownloads = Object.keys(downloadedMap).length > 0;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (downloaded.length === 0 || !isOnline) return;
    const checkUpdates = async () => {
      try {
        const res = await base44.functions.invoke('getBiblePackageVersions', {});
        if (!res.data?.versions) return;
        const newUpdates = {};
        downloaded.forEach(d => {
          const serverVersion = res.data.versions[d.languageCode];
          if (serverVersion && serverVersion !== d.version) {
            newUpdates[d.languageCode] = serverVersion;
          }
        });
        setUpdates(newUpdates);
      } catch { /* no-op */ }
    };
    checkUpdates();
  }, [downloaded.length, isOnline]);

  const handleDownload = useCallback(async (pkg) => {
    if (!user) { toast.error('Please sign in to download offline content'); return; }
    if (!isOnline) { toast.error('An internet connection is required to download'); return; }

    // Clear any corrupt/incomplete previous entry before re-downloading
    if (corruptMap[pkg.code]) {
      await removeTranslation(pkg.code);
    }

    setDownloadState(s => ({ ...s, [pkg.code]: { progress: 0, status: 'downloading' } }));

    try {
      await downloadTranslation(
        pkg.code,
        (progress) => {
          const status = progress < 50 ? 'downloading' : progress < 95 ? 'storing' : 'done';
          setDownloadState(s => ({ ...s, [pkg.code]: { progress, status } }));
        },
        base44.functions.invoke.bind(base44.functions)
      );

      await refresh();
      setUpdates(u => { const n = { ...u }; delete n[pkg.code]; return n; });
      toast.success(`✅ ${pkg.name} Bible downloaded — ready offline!`);
    } catch (err) {
      console.error(err);
      setDownloadState(s => ({ ...s, [pkg.code]: { progress: 0, status: 'error' } }));
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setTimeout(() => setDownloadState(s => { const n = { ...s }; delete n[pkg.code]; return n; }), 1500);
    }
  }, [user, isOnline, refresh, corruptMap]);

  const handleDelete = useCallback(async (langCode, langName) => {
    if (!confirm(`Remove ${langName} Bible from your device?`)) return;
    await removeTranslation(langCode);
    await refresh();
    if (searchLang === langCode) { setSearchLang(''); setSearchResults([]); }
    toast.success(`${langName} removed from device`);
  }, [refresh, searchLang]);

  const handleSearch = useCallback(async () => {
    if (!searchLang || !searchTerm.trim()) return;
    setSearching(true);
    try {
      const results = await searchVerses(searchLang, searchTerm.trim());
      setSearchResults(results);
      if (results.length === 0) toast.info('No verses found for that search term');
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }, [searchLang, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Offline Bible</h1>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {isOnline ? <Wifi size={10} /> : <Wifi size={10} />}
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Download Bible translations — read anywhere, no internet needed</p>
        </div>

        {/* Corrupt entries warning */}
        {Object.keys(corruptMap).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Incomplete downloads detected</p>
              <p className="text-xs text-red-600 mt-1">
                {Object.keys(corruptMap).map(c => BIBLE_PACKAGES.find(p => p.code === c)?.name).filter(Boolean).join(', ')} — these contain 0 verses because Bible data wasn't available on the server when downloaded. Tap <strong>Fix</strong> to re-download once data is available.
              </p>
            </div>
          </div>
        )}

        {/* First-time empty state */}
        {!metaLoading && !hasDownloads && Object.keys(corruptMap).length === 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 mb-6 text-center">
            <Globe className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">No Bible Downloaded Yet</h2>
            <p className="text-sm text-gray-500 mb-1">Choose a language below to download the Bible to your device.</p>
            <p className="text-xs text-gray-400">Each translation is ~3–5 MB. Works offline once downloaded.</p>
          </div>
        )}

        {/* Storage Stats */}
        {hasDownloads && (
          <div className="bg-indigo-600 rounded-2xl p-4 mb-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive size={14} className="opacity-80" />
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Your Offline Library</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{Object.keys(downloadedMap).length}</p>
                <p className="text-xs opacity-70">Languages</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVerses.toLocaleString()}</p>
                <p className="text-xs opacity-70">Verses</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMB.toFixed(1)} MB</p>
                <p className="text-xs opacity-70">Used</p>
              </div>
            </div>
          </div>
        )}

        {/* Offline Search */}
        {hasDownloads && (
          <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Search size={13} /> Search Offline Verses
            </h2>
            <div className="flex gap-2 mb-3">
              <select
                value={searchLang}
                onChange={e => { setSearchLang(e.target.value); setSearchResults([]); }}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white flex-1"
              >
                <option value="">Language…</option>
                {Object.values(downloadedMap).map(d => (
                  <option key={d.languageCode} value={d.languageCode}>
                    {BIBLE_PACKAGES.find(p => p.code === d.languageCode)?.flag} {d.languageName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search text…"
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 flex-1"
              />
              <Button size="sm" onClick={handleSearch} disabled={searching} className="bg-indigo-600 hover:bg-indigo-700">
                {searching ? <RefreshCw size={13} className="animate-spin" /> : 'Go'}
              </Button>
            </div>
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 max-h-72 overflow-y-auto">
                  {searchResults.map((v, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-indigo-600 mb-1">{v.reference}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{v.text}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bible Packages List */}
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Globe size={13} /> Available Translations
        </h2>

        <div className="space-y-3">
          {BIBLE_PACKAGES.map((pkg) => {
            const info = downloadedMap[pkg.code];
            const isDownloaded = !!info;
            const isCorrupt = !!corruptMap[pkg.code] && !isDownloaded;
            const state = downloadState[pkg.code];
            const isDownloading = !!state;
            const hasUpdate = !!updates[pkg.code];

            return (
              <motion.div
                key={pkg.code}
                layout
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl flex-shrink-0">{pkg.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{pkg.name}</p>
                      {pkg.nativeName !== pkg.name && (
                        <p className="text-xs text-gray-400">{pkg.nativeName}</p>
                      )}
                      {hasUpdate && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Update available
                        </span>
                      )}
                    </div>
                    {isDownloaded && info ? (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {info.verseCount?.toLocaleString()} verses · {(info.sizeKB / 1024).toFixed(1)} MB · v{info.version}
                      </p>
                    ) : isCorrupt ? (
                      <p className="text-xs text-red-400 mt-0.5">Incomplete — re-download required</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">~{pkg.estimatedMB} MB</p>
                    )}
                  </div>

                  {/* Action area */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDownloaded && !isDownloading && (
                      <>
                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                          <CheckCircle size={12} /> Saved
                        </span>
                        <button
                          onClick={() => handleDelete(pkg.code, pkg.name)}
                          className="p-1.5 rounded-full text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove from device"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}

                    {isCorrupt && !isDownloading && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                        <AlertCircle size={12} /> Incomplete
                      </span>
                    )}

                    {state?.status === 'error' && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> Failed
                      </span>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleDownload(pkg)}
                      disabled={isDownloading || !isOnline}
                      className={isDownloaded && !hasUpdate
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 text-xs'
                        : hasUpdate
                          ? 'bg-amber-500 hover:bg-amber-600 text-white text-xs'
                          : isCorrupt
                            ? 'bg-red-500 hover:bg-red-600 text-white text-xs'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white text-xs'
                      }
                    >
                      {isDownloading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : hasUpdate ? (
                        <><RefreshCw size={13} /><span className="ml-1">Update</span></>
                      ) : isDownloaded ? (
                        <><RefreshCw size={13} /><span className="ml-1">Re-download</span></>
                      ) : isCorrupt ? (
                        <><RefreshCw size={13} /><span className="ml-1">Fix</span></>
                      ) : (
                        <><Download size={13} /><span className="ml-1">Download</span></>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <AnimatePresence>
                  {isDownloading && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span>{state.status === 'storing' ? 'Saving to device…' : state.status === 'done' ? 'Complete!' : 'Downloading…'}</span>
                          <span>{state.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-indigo-500"
                            animate={{ width: `${state.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {!user && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-amber-800 font-medium">Sign in to download Bible translations</p>
            <p className="text-xs text-amber-600 mt-1">Your downloads are saved to this device.</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Translations stored locally on your device. Remove anytime to free space.
        </p>
      </div>
    </div>
  );
}