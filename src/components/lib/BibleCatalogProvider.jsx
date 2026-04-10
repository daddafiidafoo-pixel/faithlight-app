/**
 * Bible Catalog Provider
 * Routes requests to appropriate provider based on catalog configuration
 */

import { base44 } from '@/api/base44Client';

let catalogCache = null;

/**
 * Get the Bible catalog (with caching)
 */
export async function getCatalog() {
  if (catalogCache) return catalogCache;

  try {
    const response = await base44.functions.invoke('getBibleCatalog');
    catalogCache = response.data;
    return catalogCache;
  } catch (error) {
    console.error('Failed to fetch catalog:', error);
    // Return minimal default
    return { languages: [], versions: [] };
  }
}

/**
 * Get all languages from catalog
 */
export async function getLanguages() {
  const catalog = await getCatalog();
  return catalog.languages || [];
}

/**
 * Get versions for a specific language
 */
export async function getVersionsForLanguage(languageCode) {
  const catalog = await getCatalog();
  return catalog.versions?.filter(v => v.language === languageCode) || [];
}

/**
 * Get a specific version by ID
 */
export async function getVersion(versionId) {
  const catalog = await getCatalog();
  return catalog.versions?.find(v => v.id === versionId);
}

/**
 * Get the default version for a language
 */
export async function getDefaultVersionForLanguage(languageCode) {
  const versions = await getVersionsForLanguage(languageCode);
  return versions.find(v => v.isDefault) || versions[0];
}

/**
 * Route chapter fetch to correct provider
 */
export async function getChapter(versionId, book, chapter) {
  const version = await getVersion(versionId);
  if (!version) throw new Error(`Version not found: ${versionId}`);

  // Route based on provider
  if (version.provider === 'biblebrain') {
    return fetchFromBibleBrain(version.providerId || versionId, book, chapter);
  }

  if (version.provider === 'local') {
    return fetchFromLocal(versionId, book, chapter);
  }

  throw new Error(`Unknown provider: ${version.provider}`);
}

/**
 * Fetch from Bible Brain via backend proxy
 */
async function fetchFromBibleBrain(providerId, book, chapter) {
  try {
    const response = await base44.functions.invoke('bibleBrainProxy', {
      versionId: providerId,
      book,
      chapter,
    });

    return response?.data?.data || null;
  } catch (error) {
    console.error('Bible Brain fetch error:', error);
    return null;
  }
}

/**
 * Fetch from local storage (offline or bundled)
 */
async function fetchFromLocal(versionId, book, chapter) {
  try {
    // Try offline storage first
    const { getChapterOffline } = await import('@/components/lib/offlineBibleManager');
    const offlineChapter = await getChapterOffline(versionId, book, chapter);
    
    if (offlineChapter?.verses) {
      return { verses: offlineChapter.verses };
    }

    // Could also fetch from bundled JSON here if needed
    return null;
  } catch (error) {
    console.error('Local fetch error:', error);
    return null;
  }
}

/**
 * Check if version supports audio
 */
export async function supportsAudio(versionId) {
  const version = await getVersion(versionId);
  return version?.hasAudio || false;
}

/**
 * Check if version can be downloaded offline
 */
export async function canDownloadOffline(versionId) {
  const version = await getVersion(versionId);
  return version?.offlineAvailable || false;
}

/**
 * Get audio provider for version
 */
export async function getAudioProvider(versionId) {
  const version = await getVersion(versionId);
  return version?.audioProvider;
}

/**
 * Invalidate cache (use after catalog updates)
 */
export function invalidateCatalogCache() {
  catalogCache = null;
}