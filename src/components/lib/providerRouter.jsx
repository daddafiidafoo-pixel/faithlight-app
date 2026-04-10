/**
 * ProviderRouter
 * Single entry point for all Bible text + audio.
 * Reads from a catalog fetched via getBibleCatalog backend function.
 * 
 * Usage:
 *   import ProviderRouter from '@/components/lib/providerRouter';
 *   const verses = await ProviderRouter.getText({ versionId: 'en_web', bookId: 'JHN', chapter: 3 });
 *   const audio  = await ProviderRouter.getAudio({ versionId: 'en_web', bookId: 'JHN', chapter: 3 });
 *   const langs  = await ProviderRouter.listLanguages();
 *   const vers   = await ProviderRouter.listVersions('en');
 */

import { base44 } from '@/api/base44Client';

// ── Catalog cache ────────────────────────────────────────────────────────────
let _catalog = null;
let _catalogFetchedAt = 0;
const CATALOG_TTL_MS = 30 * 60 * 1000; // 30 min

async function getCatalog() {
  if (_catalog && Date.now() - _catalogFetchedAt < CATALOG_TTL_MS) return _catalog;
  try {
    const res = await base44.functions.invoke('getBibleCatalog');
    _catalog = res?.data ?? null;
    _catalogFetchedAt = Date.now();
  } catch (e) {
    console.warn('ProviderRouter: getCatalog failed, using cached or null', e);
  }
  return _catalog;
}

/** Get version metadata from catalog */
async function getVersionMeta(versionId) {
  const catalog = await getCatalog();
  return catalog?.versions?.find(v => v.id === versionId) ?? null;
}

// ── BibleBrain provider ──────────────────────────────────────────────────────
const BibleBrainProvider = {
  async getText({ filesetId, bookId, chapter }) {
    if (!filesetId) return null;
    try {
      const res = await base44.functions.invoke('bibleBrainProxy', {
        action: 'text',
        versionId: filesetId,
        book: bookId,
        chapter: String(chapter),
      });
      const verses = res?.data?.data?.verses;
      if (!verses?.length) return null;
      return verses;
    } catch (e) {
      console.warn('BibleBrainProvider.getText error:', e);
      return null;
    }
  },

  async getAudio({ filesetId, bookId, chapter }) {
    if (!filesetId) return null;
    try {
      const res = await base44.functions.invoke('bibleBrainProxy', {
        action: 'audio',
        versionId: filesetId,
        book: bookId,
        chapter: String(chapter),
      });
      return res?.data?.data?.audio ?? null;
    } catch (e) {
      console.warn('BibleBrainProvider.getAudio error:', e);
      return null;
    }
  },
};

// ── Offline / local JSON provider ────────────────────────────────────────────
const OfflineProvider = {
  async getText({ versionId, bookId, chapter }) {
    try {
      const { getChapterOffline } = await import('@/components/lib/offlineBibleManager');
      const data = await getChapterOffline(versionId, bookId, chapter);
      return data?.verses ?? null;
    } catch {
      return null;
    }
  },
};

// ── Unified ProviderRouter ───────────────────────────────────────────────────
const ProviderRouter = {

  /** Get verse text array for a version/book/chapter */
  async getText({ versionId, bookId, chapter }) {
    // 1. Try offline first
    const offline = await OfflineProvider.getText({ versionId, bookId, chapter });
    if (offline?.length) return offline;

    // 2. Try BibleBrain
    const meta = await getVersionMeta(versionId);
    if (meta?.provider === 'biblebrain' && meta.textFilesetId) {
      const verses = await BibleBrainProvider.getText({
        filesetId: meta.textFilesetId,
        bookId,
        chapter,
      });
      if (verses?.length) return verses;
    }

    return null;
  },

  /** Get audio URL for a version/book/chapter. Returns { url, duration, codec } or null */
  async getAudio({ versionId, bookId, chapter }) {
    const meta = await getVersionMeta(versionId);
    if (!meta?.hasAudio || !meta.audioFilesetId) return null;

    return BibleBrainProvider.getAudio({
      filesetId: meta.audioFilesetId,
      bookId,
      chapter,
    });
  },

  /** List all languages from the catalog */
  async listLanguages() {
    const catalog = await getCatalog();
    return catalog?.languages ?? [];
  },

  /** List all versions for a language code */
  async listVersions(langCode) {
    const catalog = await getCatalog();
    return (catalog?.versions ?? []).filter(v => v.language === langCode);
  },

  /** Get default version ID for a language */
  async getDefaultVersion(langCode) {
    const catalog = await getCatalog();
    const versions = (catalog?.versions ?? []).filter(v => v.language === langCode);
    return versions.find(v => v.isDefault) ?? versions[0] ?? null;
  },

  /** Get metadata for a specific version */
  async getVersionMeta(versionId) { return getVersionMeta(versionId); },

  /** Force refresh the catalog */
  clearCatalogCache() {
    _catalog = null;
    _catalogFetchedAt = 0;
  },
};

// Also export individual helpers for legacy compatibility
export function getVersionMeta_sync(versionId) {
  // Returns null if catalog not loaded; use async getVersionMeta instead
  return _catalog?.versions?.find(v => v.id === versionId) ?? null;
}

export function listLanguageVersions(langCode) {
  return (_catalog?.versions ?? []).filter(v => v.language === langCode);
}

export function isVersionConfigured(versionId) {
  const meta = getVersionMeta_sync(versionId);
  return !!(meta?.hasText || meta?.hasAudio);
}

/** Gate A: returns true only if the version is licensed for offline download */
export function isOfflineAllowed(versionId) {
  const meta = getVersionMeta_sync(versionId);
  return meta?.offlineAllowed === true;
}

/** Returns a user-friendly reason string if offline is blocked, null if allowed */
export function offlineBlockedReason(versionId) {
  const meta = getVersionMeta_sync(versionId);
  if (!meta) return 'Version not found.';
  if (meta.offlineAllowed === true) return null;
  const license = meta.license ?? 'unknown';
  if (license === 'fcbh-streaming-only')
    return 'This version is licensed for streaming only and cannot be downloaded for offline use.';
  if (license === 'copyrighted')
    return 'This version is copyrighted. Offline download is not permitted.';
  return 'Offline download is not available for this version.';
}

export { ProviderRouter };
/** Legacy export — kept for backward compatibility */
export function getAvailabilityMessage(versionId, mediaType) {
  const meta = getVersionMeta_sync(versionId);
  if (!meta) return 'Version not found';
  if (mediaType === 'audio' && !meta.hasAudio) return 'Audio for this version coming soon';
  if (mediaType === 'text' && !meta.hasText) return 'Text for this version coming soon';
  return null; // Available
}

export default ProviderRouter;