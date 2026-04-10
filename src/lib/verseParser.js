// Parse Bible verse references like "John 3:16", "Genesis 1:1-3", "Romans 8"

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians',
  '2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James',
  '1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

const OLD_TESTAMENT = BIBLE_BOOKS.slice(0, 39);
const NEW_TESTAMENT = BIBLE_BOOKS.slice(39);

export function parseVerseReference(query) {
  if (!query.trim()) return null;
  
  // Try to match "John 3:16" or "John 3:16-18" pattern
  const match = query.match(/^([0-3]?\s*)?([A-Za-z\s]+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/);
  if (!match) return null;
  
  let book = match[2].trim();
  const chapter = parseInt(match[3], 10);
  const startVerse = match[4] ? parseInt(match[4], 10) : undefined;
  const endVerse = match[5] ? parseInt(match[5], 10) : startVerse;
  
  // Normalize book name (case insensitive)
  const bookObj = BIBLE_BOOKS.find(b => b.toLowerCase() === book.toLowerCase());
  if (!bookObj) return null;
  book = bookObj;
  
  return { book, chapter, startVerse, endVerse, isExact: true };
}

export function getTestament(book) {
  if (OLD_TESTAMENT.includes(book)) return 'OT';
  if (NEW_TESTAMENT.includes(book)) return 'NT';
  return null;
}

export function getBookSection(book) {
  const sectionMap = {
    'Pentateuch': ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
    'Historical': ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'],
    'Wisdom': ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'],
    'Major Prophets': ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'],
    'Minor Prophets': ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'],
    'Gospels': ['Matthew', 'Mark', 'Luke', 'John'],
    'Acts': ['Acts'],
    'Pauline Epistles': ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'],
    'Hebrews & James': ['Hebrews', 'James'],
    'Johannine & Jude': ['1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'],
    'Revelation': ['Revelation']
  };
  
  for (const [section, books] of Object.entries(sectionMap)) {
    if (books.includes(book)) return section;
  }
  return null;
}

export { OLD_TESTAMENT, NEW_TESTAMENT, BIBLE_BOOKS };