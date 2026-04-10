import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'fl_audio_prefs';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function savePrefs(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadPrefs(), ...data }));
}

// Cache resolved audio URLs to avoid repeated API calls
const urlCache = {};

export function useAudioCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefsState] = useState(loadPrefs);

  useEffect(() => {
    base44.entities.AudioCatalog.list('priority', 50)
      .then(setCatalog)
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, []);

  const setPrefs = (updates) => {
    setPrefsState(prev => {
      const next = { ...prev, ...updates };
      savePrefs(next);
      return next;
    });
  };

  // All unique languages
  const languages = [...new Map(
    catalog.map(r => [r.language_code, { code: r.language_code, name: r.language_name }])
  ).values()];

  // Versions for a language (sorted by priority)
  const versionsForLang = (langCode) =>
    catalog.filter(r => r.language_code === langCode).sort((a, b) => a.priority - b.priority);

  // 3-layer fallback resolution
  const resolveEntry = (langCode, catalogId, backupLangCode = 'en') => {
    const exact = catalog.find(r => r.id === catalogId && r.has_audio);
    if (exact) return { entry: exact, fallbackUsed: null };

    const sameLang = versionsForLang(langCode).find(r => r.has_audio);
    if (sameLang) return { entry: sameLang, fallbackUsed: `version_switch:${sameLang.bible_name}` };

    if (backupLangCode && backupLangCode !== langCode) {
      const backup = catalog.find(r => r.language_code === backupLangCode && r.has_audio && r.is_default_for_language);
      if (backup) return { entry: backup, fallbackUsed: `lang_switch:${backup.language_name}` };
    }

    const english = catalog.find(r => r.language_code === 'en' && r.has_audio);
    if (english) return { entry: english, fallbackUsed: 'lang_switch:English' };

    return { entry: null, fallbackUsed: 'no_audio' };
  };

  // OT book IDs (Bible Brain standard)
  const OT_BOOKS = new Set([
    'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
    '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
    'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP',
    'HAG','ZEC','MAL',
  ]);

  // Resolve the correct fileset_id for a given entry + book (handles NT/OT split)
  const resolveFileset = (entry, book_id) => {
    if (!entry) return null;
    if (OT_BOOKS.has(book_id) && entry.fileset_id_audio_ot) return entry.fileset_id_audio_ot;
    return entry.fileset_id_audio;
  };

  // Fetch a chapter's stream URL from Bible Brain via backend function
  const getChapterUrl = useCallback(async (fileset_id, book_id, chapter) => {
    if (!fileset_id) return null;
    const cacheKey = `${fileset_id}:${book_id}:${chapter}`;
    if (urlCache[cacheKey]) return urlCache[cacheKey];

    const res = await base44.functions.invoke('bibleBrain', {
      action: 'chapter_url',
      fileset_id,
      book_id,
      chapter,
    });
    const url = res?.data?.url || null;
    if (url) urlCache[cacheKey] = url;
    return url;
  }, []);

  // Fetch verse timestamps for follow-along
  const getTimestamps = useCallback(async (fileset_id, book_id, chapter) => {
    if (!fileset_id) return [];
    const res = await base44.functions.invoke('bibleBrain', {
      action: 'timestamps',
      fileset_id,
      book_id,
      chapter,
    });
    return res?.data?.timestamps || [];
  }, []);

  return {
    catalog, loading, languages, versionsForLang, resolveEntry,
    getChapterUrl, getTimestamps,
    prefs, setPrefs,
  };
}