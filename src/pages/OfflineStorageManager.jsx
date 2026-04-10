import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive, Download, Trash2, BookOpen, Star, BookMarked,
  Wifi, WifiOff, CheckCircle, RefreshCw, AlertCircle, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── IndexedDB helpers ───────────────────────────────────────────────────────
const DB_NAME = 'FaithLightOffline';
const DB_VERSION = 1;
const STORES = { chapters: 'bible_chapters', plans: 'reading_plans', notes: 'verse_notes' };

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORES.chapters)) {
        db.createObjectStore(STORES.chapters, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.plans)) {
        db.createObjectStore(STORES.plans, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.notes)) {
        db.createObjectStore(STORES.notes, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function dbClearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function estimateSizeKB(data) {
  return Math.round(JSON.stringify(data).length / 1024);
}

// ─── Sample bible chapters to cache ──────────────────────────────────────────
const SAMPLE_CHAPTERS = [
  { id: 'JHN-3', book: 'John', chapter: 3, label: 'John 3 — For God So Loved the World' },
  { id: 'PSA-23', book: 'Psalms', chapter: 23, label: 'Psalm 23 — The Lord is My Shepherd' },
  { id: 'PHP-4', book: 'Philippians', chapter: 4, label: 'Philippians 4 — Peace That Passes Understanding' },
  { id: 'ROM-8', book: 'Romans', chapter: 8, label: 'Romans 8 — More Than Conquerors' },
  { id: 'ISA-40', book: 'Isaiah', chapter: 40, label: 'Isaiah 40 — Soar on Wings Like Eagles' },
  { id: 'GEN-1', book: 'Genesis', chapter: 1, label: 'Genesis 1 — In the Beginning' },
];

const SAMPLE_PLANS = [
  { id: 'plan-7day-faith', title: '7-Day Faith Foundations', description: 'Build a foundation of faith in one week.', days: 7 },
  { id: 'plan-30day-prayer', title: '30-Day Prayer Journey', description: 'Deepen your prayer life over a month.', days: 30 },
  { id: 'plan-psalms', title: 'Through the Psalms', description: 'All 150 Psalms for peace and worship.', days: 30 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function OfflineStorageManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sections, setSections] = useState({ chapters: [], plans: [], notes: [] });
  const [loading, setLoading] = useState(true);
  const [caching, setCaching] = useState({});
  const [expanded, setExpanded] = useState({ chapters: true, plans: true, notes: true });
  const [storageEstimate, setStorageEstimate] = useState(null);

  // Network status
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Load from IndexedDB
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [chapters, plans, notes] = await Promise.all([
        dbGetAll(STORES.chapters),
        dbGetAll(STORES.plans),
        dbGetAll(STORES.notes),
      ]);
      setSections({ chapters, plans, notes });
    } catch (err) {
      toast.error('Could not load offline data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Storage estimate
  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(est => setStorageEstimate(est));
    }
  }, [sections]);

  // Cache a chapter
  const handleCacheChapter = async (ch) => {
    setCaching(c => ({ ...c, [ch.id]: true }));
    try {
      // Simulate fetching verse text (in production this calls bibleBrainAPI)
      const mockVerses = Array.from({ length: 20 }, (_, i) => ({
        verse: i + 1,
        text: `[Verse ${i + 1} of ${ch.label}] — This verse is now available offline for your faith journey.`,
      }));
      const item = { id: ch.id, book: ch.book, chapter: ch.chapter, label: ch.label, verses: mockVerses, cachedAt: new Date().toISOString(), sizeKB: estimateSizeKB(mockVerses) };
      await dbPut(STORES.chapters, item);
      await loadAll();
      toast.success(`${ch.label} cached!`);
    } catch {
      toast.error('Failed to cache chapter');
    } finally {
      setCaching(c => ({ ...c, [ch.id]: false }));
    }
  };

  // Cache a reading plan
  const handleCachePlan = async (plan) => {
    setCaching(c => ({ ...c, [plan.id]: true }));
    try {
      const item = { ...plan, cachedAt: new Date().toISOString(), sizeKB: estimateSizeKB(plan) };
      await dbPut(STORES.plans, item);
      await loadAll();
      toast.success(`"${plan.title}" saved offline!`);
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setCaching(c => ({ ...c, [plan.id]: false }));
    }
  };

  const handleDelete = async (storeName, id, label) => {
    if (!confirm(`Remove "${label}" from offline storage?`)) return;
    await dbDelete(storeName, id);
    await loadAll();
    toast.success('Removed from offline storage');
  };

  const handleClearAll = async () => {
    if (!confirm('Clear ALL offline data? This cannot be undone.')) return;
    await Promise.all([dbClearStore(STORES.chapters), dbClearStore(STORES.plans), dbClearStore(STORES.notes)]);
    await loadAll();
    toast.success('All offline data cleared');
  };

  const cachedChapterIds = new Set(sections.chapters.map(c => c.id));
  const cachedPlanIds = new Set(sections.plans.map(p => p.id));
  const totalItems = sections.chapters.length + sections.plans.length + sections.notes.length;
  const totalKB = [...sections.chapters, ...sections.plans, ...sections.notes].reduce((s, i) => s + (i.sizeKB || 1), 0);

  const toggle = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Offline Storage</h1>
          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Cache Bible chapters, reading plans & notes using IndexedDB — read without internet.</p>

        {/* Storage Stats */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={14} className="opacity-80" />
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Device Storage</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-xs opacity-70">Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{(totalKB / 1024).toFixed(1)} MB</p>
              <p className="text-xs opacity-70">Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{sections.notes.length}</p>
              <p className="text-xs opacity-70">Notes</p>
            </div>
          </div>
          {storageEstimate && (
            <div className="mt-3">
              <div className="flex justify-between text-xs opacity-70 mb-1">
                <span>IndexedDB Usage</span>
                <span>{Math.round((storageEstimate.usage || 0) / 1024 / 1024)} MB / {Math.round((storageEstimate.quota || 0) / 1024 / 1024)} MB</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 rounded-full"
                  style={{ width: `${Math.min(100, ((storageEstimate.usage || 0) / (storageEstimate.quota || 1)) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bible Chapters */}
        <SectionHeader
          icon={<BookOpen size={14} className="text-indigo-500" />}
          label="Bible Chapters"
          count={sections.chapters.length}
          expanded={expanded.chapters}
          onToggle={() => toggle('chapters')}
        />
        <AnimatePresence>
          {expanded.chapters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="space-y-2 pt-1">
                {SAMPLE_CHAPTERS.map(ch => {
                  const cached = cachedChapterIds.has(ch.id);
                  const busy = !!caching[ch.id];
                  return (
                    <div key={ch.id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{ch.label}</p>
                        {cached && <p className="text-xs text-green-600">✓ Available offline</p>}
                      </div>
                      {cached ? (
                        <button onClick={() => handleDelete(STORES.chapters, ch.id, ch.label)} className="p-1.5 text-red-300 hover:text-red-500 rounded-full hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <Button size="sm" onClick={() => handleCacheChapter(ch)} disabled={busy || !isOnline} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                          {busy ? <RefreshCw size={12} className="animate-spin" /> : <><Download size={12} /><span className="ml-1">Save</span></>}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading Plans */}
        <SectionHeader
          icon={<Star size={14} className="text-amber-500" />}
          label="Reading Plans"
          count={sections.plans.length}
          expanded={expanded.plans}
          onToggle={() => toggle('plans')}
        />
        <AnimatePresence>
          {expanded.plans && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="space-y-2 pt-1">
                {SAMPLE_PLANS.map(plan => {
                  const cached = cachedPlanIds.has(plan.id);
                  const busy = !!caching[plan.id];
                  return (
                    <div key={plan.id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{plan.title}</p>
                        <p className="text-xs text-gray-400">{plan.days} days · {plan.description}</p>
                        {cached && <p className="text-xs text-green-600">✓ Available offline</p>}
                      </div>
                      {cached ? (
                        <button onClick={() => handleDelete(STORES.plans, plan.id, plan.title)} className="p-1.5 text-red-300 hover:text-red-500 rounded-full hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <Button size="sm" onClick={() => handleCachePlan(plan)} disabled={busy || !isOnline} className="bg-amber-500 hover:bg-amber-600 text-xs">
                          {busy ? <RefreshCw size={12} className="animate-spin" /> : <><Download size={12} /><span className="ml-1">Save</span></>}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verse Notes */}
        <SectionHeader
          icon={<BookMarked size={14} className="text-purple-500" />}
          label="Verse Notes"
          count={sections.notes.length}
          expanded={expanded.notes}
          onToggle={() => toggle('notes')}
        />
        <AnimatePresence>
          {expanded.notes && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              {sections.notes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Notes you save in the Bible reader will appear here for offline access.</p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {sections.notes.map(note => (
                    <div key={note.id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{note.reference || 'Note'}</p>
                        <p className="text-xs text-gray-400 truncate">{note.noteText || note.text}</p>
                      </div>
                      <button onClick={() => handleDelete(STORES.notes, note.id, note.reference || 'Note')} className="p-1.5 text-red-300 hover:text-red-500 rounded-full hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear All */}
        {totalItems > 0 && (
          <div className="mt-4 text-center">
            <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-600 underline">
              Clear all offline data
            </button>
          </div>
        )}

        {!isOnline && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
            <WifiOff size={20} className="mx-auto mb-2 text-orange-400" />
            <p className="text-sm text-orange-800 font-medium">You're offline</p>
            <p className="text-xs text-orange-600 mt-1">Showing cached content. New downloads require internet.</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Stored locally in your browser's IndexedDB. Clear anytime to free space.
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label, count, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between mb-2 group"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">{label}</span>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
    </button>
  );
}