/**
 * Page-specific refresh handlers for pull-to-refresh consistency
 */

export async function refreshHomePage({ reloadVerse, reloadReflection }) {
  await Promise.allSettled([
    reloadVerse?.(),
    reloadReflection?.(),
  ]);
}

export async function refreshBibleReader({ reloadChapter }) {
  await Promise.allSettled([
    reloadChapter?.(),
  ]);
}

export async function refreshAudioBible({ reloadAudio }) {
  await Promise.allSettled([
    reloadAudio?.(),
  ]);
}

export async function refreshAIStudy({ reloadHistory }) {
  await Promise.allSettled([
    reloadHistory?.(),
  ]);
}

export async function refreshSermonBuilder({ reloadSavedSermons }) {
  await Promise.allSettled([
    reloadSavedSermons?.(),
  ]);
}