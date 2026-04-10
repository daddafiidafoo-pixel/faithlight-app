/**
 * Verse Highlights — localStorage-based store
 * Each highlight: { id, reference, bookName, bookCode, chapter, verse, text, color, createdAt }
 */
const KEY = 'fl_verse_highlights';

export function loadHighlights() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function saveHighlight(highlight) {
  const all = loadHighlights();
  const existing = all.findIndex(h => h.reference === highlight.reference);
  if (existing >= 0) {
    all[existing] = { ...all[existing], ...highlight };
  } else {
    all.unshift({ ...highlight, id: `hl_${Date.now()}`, createdAt: new Date().toISOString() });
  }
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function removeHighlight(reference) {
  const all = loadHighlights().filter(h => h.reference !== reference);
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function getHighlightForVerse(reference) {
  return loadHighlights().find(h => h.reference === reference) || null;
}

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Yellow', bg: '#FEF08A', ring: '#EAB308' },
  { id: 'green',  label: 'Green',  bg: '#BBF7D0', ring: '#22C55E' },
  { id: 'blue',   label: 'Blue',   bg: '#BAE6FD', ring: '#0EA5E9' },
  { id: 'pink',   label: 'Pink',   bg: '#FBCFE8', ring: '#EC4899' },
];

export function getColorById(id) {
  return HIGHLIGHT_COLORS.find(c => c.id === id) || HIGHLIGHT_COLORS[0];
}