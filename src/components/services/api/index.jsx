/**
 * Unified Service Layer — barrel export
 * Import from here instead of calling base44 entities directly.
 *
 * Example:
 *   import { fetchVerses, saveHighlight } from '@/components/services/api';
 *   import { askBibleQuestion } from '@/components/services/api';
 */

export * from './bibleService';
export * from './audioService';
export * from './aiBibleService';
export * from './prayerService';
export * from './supportService';
export * from './settingsService';
export * from './translationService';
export * from './apiContract';