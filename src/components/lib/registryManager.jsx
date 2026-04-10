/**
 * Registry Manager
 * Handles fetching and managing pack registry and updates
 */

import { base44 } from '@/api/base44Client';
import {
  listInstalledPacks,
  upsertInstalledPack,
  removeInstalledPack,
} from '@/components/offline/offlineBibleDb';

/**
 * Get packs from registry via API
 */
export async function getRegistryPacks(languageCode = null, type = 'text') {
  try {
    const response = await base44.functions.invoke('bibles_registry', {
      lang: languageCode,
      type,
    });

    return response?.data?.packs || [];
  } catch (error) {
    console.error('Error fetching registry:', error);
    return [];
  }
}

/**
 * Check for updates for installed packs via API
 */
export async function checkForUpdates(installedPacks) {
  try {
    const response = await base44.functions.invoke('bibles_checkUpdates', {
      installed: installedPacks,
    });

    return response?.data?.updates || [];
  } catch (error) {
    console.error('Error checking updates:', error);
    return [];
  }
}

/**
 * Get installed packs from IndexedDB
 */
export async function getInstalledPacks() {
  try {
    return await listInstalledPacks();
  } catch (error) {
    console.error('Error getting installed packs:', error);
    return [];
  }
}

/**
 * Save installed pack to IndexedDB
 */
export async function saveInstalledPack(pack) {
  try {
    await upsertInstalledPack(pack);
  } catch (error) {
    console.error('Error saving installed pack:', error);
    throw error;
  }
}

/**
 * Delete installed pack from IndexedDB
 */
export async function deleteInstalledPack(packId) {
  try {
    await removeInstalledPack(packId);
  } catch (error) {
    console.error('Error deleting installed pack:', error);
    throw error;
  }
}

/**
 * Verify content hash (SHA256)
 */
export async function verifyContentHash(data, expectedHash) {
  try {
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}` === expectedHash;
  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}