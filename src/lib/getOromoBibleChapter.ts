import oromoBibles from '@/data/oromoBibles.json';

export function getOromoBibleChapter(language: string, bookId: string, chapter: number) {
  const bible = oromoBibles[language];
  if (!bible) return [];
  
  const book = bible.books[bookId];
  if (!book) return [];
  
  const chapterData = book[String(chapter)];
  if (!chapterData) return [];
  
  return chapterData;
}