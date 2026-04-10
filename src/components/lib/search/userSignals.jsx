import { base44 } from '@/api/base44Client';

export async function getUserSearchSignals(me) {
  if (!me?.id) return null;

  const signals = {
    preferredTranslationId: null,
    topBooks: [],
    downloadedKeysSet: new Set(),
    recentQueriesSet: new Set(),
  };

  try {
    const items = await base44.entities.OfflineItem.filter({ user_id: me.id }, null, 1500).catch(() => []);
    const translationCounts = {};
    for (const it of items || []) {
      if (it.type && it.key) signals.downloadedKeysSet.add(`${it.type}:${it.key}`);
      if (it.translation_id) translationCounts[it.translation_id] = (translationCounts[it.translation_id] || 0) + 1;
    }
    const preferred = Object.entries(translationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (preferred) signals.preferredTranslationId = preferred;
  } catch {}

  try {
    const hist = await base44.entities.SearchHistory.filter({ user_id: me.id }, '-created_date', 80).catch(() => []);
    for (const h of hist || []) {
      const q = String(h.query || "").toLowerCase().trim();
      if (q) signals.recentQueriesSet.add(q.split(" ").slice(0, 2).join(" "));
    }
  } catch {}

  return signals;
}