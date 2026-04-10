// ── Bible Book Master List (canonical) ────────────────────────────────────────
export const BIBLE_BOOKS = [
  { name: "Genesis", testament: "OT", category: "Law" },
  { name: "Exodus", testament: "OT", category: "Law" },
  { name: "Leviticus", testament: "OT", category: "Law" },
  { name: "Numbers", testament: "OT", category: "Law" },
  { name: "Deuteronomy", testament: "OT", category: "Law" },
  { name: "Joshua", testament: "OT", category: "History" },
  { name: "Judges", testament: "OT", category: "History" },
  { name: "Ruth", testament: "OT", category: "History" },
  { name: "1 Samuel", testament: "OT", category: "History" },
  { name: "2 Samuel", testament: "OT", category: "History" },
  { name: "1 Kings", testament: "OT", category: "History" },
  { name: "2 Kings", testament: "OT", category: "History" },
  { name: "1 Chronicles", testament: "OT", category: "History" },
  { name: "2 Chronicles", testament: "OT", category: "History" },
  { name: "Ezra", testament: "OT", category: "History" },
  { name: "Nehemiah", testament: "OT", category: "History" },
  { name: "Esther", testament: "OT", category: "History" },
  { name: "Job", testament: "OT", category: "Poetry" },
  { name: "Psalms", testament: "OT", category: "Poetry" },
  { name: "Proverbs", testament: "OT", category: "Poetry" },
  { name: "Ecclesiastes", testament: "OT", category: "Poetry" },
  { name: "Song of Solomon", testament: "OT", category: "Poetry" },
  { name: "Isaiah", testament: "OT", category: "Major Prophets" },
  { name: "Jeremiah", testament: "OT", category: "Major Prophets" },
  { name: "Lamentations", testament: "OT", category: "Major Prophets" },
  { name: "Ezekiel", testament: "OT", category: "Major Prophets" },
  { name: "Daniel", testament: "OT", category: "Major Prophets" },
  { name: "Hosea", testament: "OT", category: "Minor Prophets" },
  { name: "Joel", testament: "OT", category: "Minor Prophets" },
  { name: "Amos", testament: "OT", category: "Minor Prophets" },
  { name: "Obadiah", testament: "OT", category: "Minor Prophets" },
  { name: "Jonah", testament: "OT", category: "Minor Prophets" },
  { name: "Micah", testament: "OT", category: "Minor Prophets" },
  { name: "Nahum", testament: "OT", category: "Minor Prophets" },
  { name: "Habakkuk", testament: "OT", category: "Minor Prophets" },
  { name: "Zephaniah", testament: "OT", category: "Minor Prophets" },
  { name: "Haggai", testament: "OT", category: "Minor Prophets" },
  { name: "Zechariah", testament: "OT", category: "Minor Prophets" },
  { name: "Malachi", testament: "OT", category: "Minor Prophets" },
  { name: "Matthew", testament: "NT", category: "Gospels" },
  { name: "Mark", testament: "NT", category: "Gospels" },
  { name: "Luke", testament: "NT", category: "Gospels" },
  { name: "John", testament: "NT", category: "Gospels" },
  { name: "Acts", testament: "NT", category: "NT History" },
  { name: "Romans", testament: "NT", category: "Pauline Epistles" },
  { name: "1 Corinthians", testament: "NT", category: "Pauline Epistles" },
  { name: "2 Corinthians", testament: "NT", category: "Pauline Epistles" },
  { name: "Galatians", testament: "NT", category: "Pauline Epistles" },
  { name: "Ephesians", testament: "NT", category: "Pauline Epistles" },
  { name: "Philippians", testament: "NT", category: "Pauline Epistles" },
  { name: "Colossians", testament: "NT", category: "Pauline Epistles" },
  { name: "1 Thessalonians", testament: "NT", category: "Pauline Epistles" },
  { name: "2 Thessalonians", testament: "NT", category: "Pauline Epistles" },
  { name: "1 Timothy", testament: "NT", category: "Pauline Epistles" },
  { name: "2 Timothy", testament: "NT", category: "Pauline Epistles" },
  { name: "Titus", testament: "NT", category: "Pauline Epistles" },
  { name: "Philemon", testament: "NT", category: "Pauline Epistles" },
  { name: "Hebrews", testament: "NT", category: "General Epistles" },
  { name: "James", testament: "NT", category: "General Epistles" },
  { name: "1 Peter", testament: "NT", category: "General Epistles" },
  { name: "2 Peter", testament: "NT", category: "General Epistles" },
  { name: "1 John", testament: "NT", category: "General Epistles" },
  { name: "2 John", testament: "NT", category: "General Epistles" },
  { name: "3 John", testament: "NT", category: "General Epistles" },
  { name: "Jude", testament: "NT", category: "General Epistles" },
  { name: "Revelation", testament: "NT", category: "Prophecy" },
];

const BOOK_MAP = Object.fromEntries(BIBLE_BOOKS.map(b => [b.name.toLowerCase(), b]));
const GOSPEL_NAMES = new Set(BIBLE_BOOKS.filter(b => b.category === "Gospels").map(b => b.name.toLowerCase()));
const OT_NAMES = new Set(BIBLE_BOOKS.filter(b => b.testament === "OT").map(b => b.name.toLowerCase()));
const NT_NAMES = new Set(BIBLE_BOOKS.filter(b => b.testament === "NT").map(b => b.name.toLowerCase()));

/**
 * Look up a book by name (case-insensitive). Returns the book object or null.
 */
export function lookupBook(name) {
  return BOOK_MAP[name?.toLowerCase?.()?.trim()] || null;
}

/**
 * Validate a single quiz question against the rule set.
 *
 * question shape:
 *   { question, options: string[], correctIndex: number, rule?: string }
 *
 * Rules (optional, applied when present):
 *   NOT_GOSPEL   — correct answer must NOT be a Gospel book; ≥3 options must be Gospel books
 *   NOT_IN_NT    — correct answer must be OT; ≥1 option must be OT
 *   IN_OT        — correct answer must be an OT book
 *   IN_NT        — correct answer must be an NT book
 *
 * Always validated:
 *   - All option book names that appear in BIBLE_BOOKS must exist (non-book-name options like categories are allowed)
 *   - correctIndex is within bounds
 *   - No duplicate options
 *
 * Returns { valid: boolean, reason?: string }
 */
export function validateQuizQuestion(question) {
  const { options, correctIndex, rule } = question;

  // Basic structural checks
  if (!Array.isArray(options) || options.length < 2) {
    return { valid: false, reason: "Insufficient options" };
  }
  if (correctIndex < 0 || correctIndex >= options.length) {
    return { valid: false, reason: "correctIndex out of bounds" };
  }

  // No duplicate options
  const deduped = new Set(options.map(o => o.toLowerCase().trim()));
  if (deduped.size !== options.length) {
    return { valid: false, reason: "Duplicate options detected" };
  }

  const correctOption = options[correctIndex].toLowerCase().trim();

  // Rule-based validation
  if (rule === "NOT_GOSPEL") {
    if (GOSPEL_NAMES.has(correctOption)) {
      return { valid: false, reason: "NOT_GOSPEL: correct answer must not be a Gospel" };
    }
    const gospelCount = options.filter(o => GOSPEL_NAMES.has(o.toLowerCase().trim())).length;
    if (gospelCount < 3) {
      return { valid: false, reason: "NOT_GOSPEL: requires ≥3 Gospel options" };
    }
  }

  if (rule === "NOT_IN_NT") {
    if (!OT_NAMES.has(correctOption)) {
      return { valid: false, reason: "NOT_IN_NT: correct answer must be an OT book" };
    }
    const otCount = options.filter(o => OT_NAMES.has(o.toLowerCase().trim())).length;
    if (otCount < 1) {
      return { valid: false, reason: "NOT_IN_NT: requires ≥1 OT option" };
    }
  }

  if (rule === "IN_OT") {
    if (!OT_NAMES.has(correctOption)) {
      return { valid: false, reason: "IN_OT: correct answer must be an OT book" };
    }
  }

  if (rule === "IN_NT") {
    if (!NT_NAMES.has(correctOption)) {
      return { valid: false, reason: "IN_NT: correct answer must be an NT book" };
    }
  }

  return { valid: true };
}

/**
 * Validate all questions in a quiz. Returns { valid, invalidQuestions }.
 * invalidQuestions is an array of { index, question, reason }.
 */
export function validateQuiz(questions) {
  const invalidQuestions = [];
  questions.forEach((q, i) => {
    const result = validateQuizQuestion(q);
    if (!result.valid) {
      invalidQuestions.push({ index: i, question: q, reason: result.reason });
    }
  });
  return { valid: invalidQuestions.length === 0, invalidQuestions };
}