// Generates assignment schedules for reading plans

const CHAPTER_COUNTS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
  Proverbs: 31, Ecclesiastes: 12, 'Song of Solomon': 8, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12,
  Hosea: 14, Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4,
  Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3, Haggai: 2,
  Zechariah: 14, Malachi: 4, Matthew: 28, Mark: 16, Luke: 24,
  John: 21, Acts: 28, Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13,
  Galatians: 6, Ephesians: 6, Philippians: 4, Colossians: 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
  Titus: 3, Philemon: 1, Hebrews: 13, James: 5, '1 Peter': 5,
  '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, Jude: 1, Revelation: 22,
};

const OT_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
];
const NT_BOOKS = [
  'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians',
  'Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians',
  '1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation'
];

export function getBooksForPlanType(planType, focusBooks = []) {
  if (planType === 'new_testament') return NT_BOOKS;
  if (planType === 'old_testament') return OT_BOOKS;
  if (planType === 'full_bible') return [...OT_BOOKS, ...NT_BOOKS];
  if (planType === 'book_focus') return focusBooks.length ? focusBooks : NT_BOOKS;
  if (planType === 'custom') return focusBooks.length ? focusBooks : NT_BOOKS;
  return NT_BOOKS;
}

export function getAllChapters(books) {
  const chapters = [];
  for (const book of books) {
    const count = CHAPTER_COUNTS[book] || 1;
    for (let ch = 1; ch <= count; ch++) {
      chapters.push({ book, chapter: ch });
    }
  }
  return chapters;
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function generateAssignments(planType, focusBooks, chaptersPerSession, frequency, startDate) {
  const books = getBooksForPlanType(planType, focusBooks);
  const allChapters = getAllChapters(books);
  const assignments = [];
  let sessionIndex = 0;
  let i = 0;
  const dayStep = frequency === 'weekly' ? 7 : 1;

  while (i < allChapters.length) {
    const sessionChapters = allChapters.slice(i, i + chaptersPerSession);
    const dueDate = addDays(startDate, sessionIndex * dayStep);
    assignments.push({
      session: sessionIndex + 1,
      due_date: dueDate,
      chapters: sessionChapters,
      completed: false,
      completed_at: null,
    });
    i += chaptersPerSession;
    sessionIndex++;
  }
  return assignments;
}

export function getTodaysAssignment(assignments = []) {
  const today = new Date().toISOString().split('T')[0];
  // First: exact due date match
  const exact = assignments.find(a => a.due_date === today && !a.completed);
  if (exact) return exact;
  // Fallback: oldest incomplete
  const overdue = assignments.filter(a => a.due_date <= today && !a.completed);
  return overdue.length ? overdue[overdue.length - 1] : null;
}

export function getNextAssignment(assignments = []) {
  const today = new Date().toISOString().split('T')[0];
  return assignments.find(a => a.due_date > today && !a.completed) || null;
}

export function CHAPTER_COUNTS_MAP() { return CHAPTER_COUNTS; }