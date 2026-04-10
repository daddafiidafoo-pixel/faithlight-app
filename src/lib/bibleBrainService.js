/**
 * DEPRECATED: Use bibleService from services/bibleService.js instead
 * This wrapper kept for backwards compatibility during migration
 */
import { bibleService } from '@/services/bibleService';

export async function getVerse(reference) {
  return bibleService.getVerse(reference);
}

export async function getChapter(book, chapter) {
  return bibleService.getChapter(book, chapter);
}

export async function getVerseOfDay() {
  return bibleService.getVerseOfDay();
}