/**
 * Oromo Localization Helper
 * Single source of truth for all Afaan Oromoo UI strings
 * 
 * CRITICAL RULE: Never use Bible verse text from this file
 * Bible verses come ONLY from Bible Brain or licensed Oromo Bible dataset
 */

import oromoStrings from '@/locales/om.json';

/**
 * Get a translation string by key path
 * e.g., getOromoString('home.verseOfDay')
 * 
 * Falls back to English if key is missing (with console warning)
 */
export function getOromoString(keyPath, defaultFallback = null) {
  const keys = keyPath.split('.');
  let value = oromoStrings;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      console.warn(`[OromoLocales] Missing translation key: ${keyPath}`);
      return defaultFallback || keyPath;
    }
  }

  return value || defaultFallback || keyPath;
}

/**
 * Get entire section of translations
 * e.g., getOromoSection('bible') returns all bible.* strings
 */
export function getOromoSection(section) {
  return oromoStrings[section] || {};
}

/**
 * Format greeting based on time of day
 */
export function getOromoGreeting() {
  const hour = new Date().getHours();
  const greetings = getOromoSection('common')?.greetings || {};

  if (hour >= 5 && hour < 12) return getOromoString('home.greetings.morning');
  if (hour >= 12 && hour < 17) return getOromoString('home.greetings.afternoon');
  return getOromoString('home.greetings.evening');
}

/**
 * Check if a translation key exists
 */
export function hasOromoString(keyPath) {
  const keys = keyPath.split('.');
  let value = oromoStrings;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Export raw strings for direct reference
 */
export const OROMO = oromoStrings;

export default oromoStrings;