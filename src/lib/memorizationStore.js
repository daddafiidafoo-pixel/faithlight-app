/**
 * Spaced Repetition Memorization Store
 * Each card: { id, reference, text, bookName, interval, easeFactor, nextReview, repetitions, addedAt }
 * Algorithm: SM-2 simplified
 */
const KEY = 'fl_memorization_deck';

export function loadDeck() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function saveDeck(deck) {
  localStorage.setItem(KEY, JSON.stringify(deck));
}

export function addToDeck(verse) {
  const deck = loadDeck();
  if (deck.find(c => c.reference === verse.reference)) return deck; // already exists
  deck.unshift({
    id: `mem_${Date.now()}`,
    reference: verse.reference,
    text: verse.text,
    bookName: verse.bookName || '',
    interval: 1,       // days until next review
    easeFactor: 2.5,   // SM-2 ease factor
    repetitions: 0,
    nextReview: new Date().toISOString(),
    addedAt: new Date().toISOString(),
    lastScore: null,
  });
  saveDeck(deck);
  return deck;
}

export function removeFromDeck(reference) {
  const deck = loadDeck().filter(c => c.reference !== reference);
  saveDeck(deck);
  return deck;
}

/**
 * Update card after review
 * quality: 0 (fail) | 1 (hard) | 2 (ok) | 3 (easy)
 */
export function reviewCard(reference, quality) {
  const deck = loadDeck();
  const card = deck.find(c => c.reference === reference);
  if (!card) return deck;

  let { interval, easeFactor, repetitions } = card;

  if (quality < 1) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);

    // Update ease factor (SM-2)
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  Object.assign(card, { interval, easeFactor, repetitions, nextReview: nextReview.toISOString(), lastScore: quality });
  saveDeck(deck);
  return deck;
}

export function getDueCards() {
  const now = new Date();
  return loadDeck().filter(c => new Date(c.nextReview) <= now);
}

export function getDeckStats() {
  const deck = loadDeck();
  const due = getDueCards().length;
  return { total: deck.length, due, learned: deck.filter(c => c.repetitions >= 3).length };
}