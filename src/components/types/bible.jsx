export const BIBLE_PROVIDERS = ["local", "api", "audio"];

export function normalizeBibleReference(book, chapter) {
  return {
    book: String(book || "").trim(),
    chapter: Number(chapter || 1),
  };
}

export function normalizeBookId(book) {
  return String(book || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
}