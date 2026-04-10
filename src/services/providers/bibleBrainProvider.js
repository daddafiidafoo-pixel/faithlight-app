import { base44 } from '@/api/base44Client';

/**
 * BibleBrain API Provider
 * Handles all raw API calls to BibleBrain
 */

export async function getBibleBrainVerse(reference) {
  try {
    const res = await base44.functions.invoke('bibleBrainAPI', {
      action: 'verse',
      reference,
    });
    return res.data?.verse;
  } catch (err) {
    console.error('BibleBrain verse error:', err);
    return null;
  }
}

export async function getBibleBrainChapter(book, chapter) {
  try {
    const res = await base44.functions.invoke('bibleBrainAPI', {
      action: 'chapter',
      book,
      chapter,
    });
    return res.data?.chapter;
  } catch (err) {
    console.error('BibleBrain chapter error:', err);
    return null;
  }
}

export async function getBibleBrainVerseOfDay() {
  try {
    const res = await base44.functions.invoke('bibleBrainAPI', {
      action: 'verseOfDay',
    });
    return res.data?.verse;
  } catch (err) {
    console.error('BibleBrain verse of day error:', err);
    return null;
  }
}

export async function searchBibleBrain(query) {
  try {
    const res = await base44.functions.invoke('bibleBrainAPI', {
      action: 'search',
      query,
    });
    return res.data?.results || [];
  } catch (err) {
    console.error('BibleBrain search error:', err);
    return [];
  }
}
