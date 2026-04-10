export function applyPersonalizationBoost(result, signals) {
  if (!signals) return 0;
  let boost = 0;

  if (signals.preferredTranslationId && result.translationId) {
    if (result.translationId === signals.preferredTranslationId) boost += 20;
  }
  if (signals.topBooks?.length && result.book) {
    if (signals.topBooks.includes(result.book)) boost += 15;
  }
  if (signals.topCourseCategories?.length && result.category) {
    if (signals.topCourseCategories.includes(result.category)) boost += 10;
  }
  if (signals.downloadedKeysSet && result.key) {
    if (signals.downloadedKeysSet.has(`${result.type}:${result.key}`)) boost += 8;
  }
  if (signals.recentQueries && result.title) {
    const titleLower = result.title.toLowerCase();
    if (signals.recentQueries.some(q => titleLower.includes(q.toLowerCase()))) boost += 5;
  }

  return boost;
}