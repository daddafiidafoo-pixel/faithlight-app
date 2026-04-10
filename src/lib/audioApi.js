export async function getChapterAudioUrl({ language, bookId, chapter }) {
  console.warn("Audio not yet configured for:", { language, bookId, chapter });
  return "";
}

export async function getVerseAudioUrl({ language, bookId, chapter, verse }) {
  console.warn("Verse audio not yet configured for:", { language, bookId, chapter, verse });
  return "";
}

export async function getAvailableAudioLanguages() {
  return ["en", "fr", "ar", "sw", "am", "ti", "om"];
}