/**
 * BibleDownloadService
 * Handles fetching a translation package from the backend,
 * streaming progress, and storing to IndexedDB (bibleDB).
 */
import { insertVerses, saveMeta, saveDailySchedule, deleteTranslation } from './bibleDB';

export const BIBLE_PACKAGES = [
  { code: 'en', name: 'English',        nativeName: 'English',     flag: '🇬🇧', estimatedMB: 3.5 },
  { code: 'om', name: 'Afaan Oromoo',   nativeName: 'Afaan Oromoo',flag: '🇪🇹', estimatedMB: 3.2 },
  { code: 'am', name: 'Amharic',        nativeName: 'አማርኛ',        flag: '🇪🇹', estimatedMB: 3.8 },
  { code: 'ti', name: 'Tigrinya',       nativeName: 'ትግርኛ',        flag: '🇪🇷', estimatedMB: 3.6 },
  { code: 'sw', name: 'Kiswahili',      nativeName: 'Kiswahili',   flag: '🇹🇿', estimatedMB: 3.1 },
  { code: 'fr', name: 'Français',       nativeName: 'Français',    flag: '🇫🇷', estimatedMB: 3.3 },
  { code: 'ar', name: 'Arabic',         nativeName: 'العربية',      flag: '🇸🇦', estimatedMB: 4.2 },
];

/**
 * Download a Bible translation and store to IndexedDB.
 * @param {string} languageCode
 * @param {Function} onProgress - called with 0–100 progress value
 * @param {Function} invokeFunction - base44.functions.invoke
 */
export async function downloadTranslation(languageCode, onProgress, invokeFunction) {
  onProgress(5);

  // Fetch the translation package from backend
  const res = await invokeFunction('offlineVerseDownload', {
    languageCode,
    bookCode: 'ALL'
  });

  if (!res.data?.success) {
    throw new Error(res.data?.error || 'Download failed');
  }

  onProgress(40);

  const { verses, schedule, verseCount, sizeKB, version } = res.data;

  // Validate — reject empty or near-empty packs
  if (!verses || verses.length === 0) {
    throw new Error('No verses returned from server. Please seed Bible data first.');
  }
  if (verses.length < 10) {
    throw new Error(`Only ${verses.length} verses returned — Bible data is incomplete. Please contact support.`);
  }
  // Spot-check: ensure verses have actual text content
  const sampleVerse = verses[0];
  if (!sampleVerse?.text || sampleVerse.text.trim().length === 0) {
    throw new Error('Downloaded Bible verses have empty text. Data may be corrupt.');
  }

  // Batch-insert into IndexedDB in chunks of 500 for performance
  const CHUNK = 500;
  const total = verses.length;
  let inserted = 0;

  for (let i = 0; i < total; i += CHUNK) {
    await insertVerses(verses.slice(i, i + CHUNK));
    inserted += Math.min(CHUNK, total - i);
    const pct = 40 + Math.round((inserted / total) * 50);
    onProgress(pct);
  }

  // Save daily schedule if provided
  if (schedule?.length) {
    await saveDailySchedule(schedule);
  }

  onProgress(95);

  // Save metadata — only after successful insert + real verse count
  const pkg = BIBLE_PACKAGES.find(p => p.code === languageCode);
  const realSizeKB = sizeKB || Math.round(JSON.stringify(verses).length / 1024);
  await saveMeta(languageCode, {
    languageName: pkg?.name || languageCode,
    nativeName: pkg?.nativeName || languageCode,
    flag: pkg?.flag || '📖',
    verseCount: inserted,
    sizeKB: realSizeKB,
    version: version || '1.0',
    downloadedAt: new Date().toISOString(),
  });

  onProgress(100);
  return { verseCount: inserted, sizeKB: realSizeKB };
}

export async function removeTranslation(languageCode) {
  await deleteTranslation(languageCode);
}