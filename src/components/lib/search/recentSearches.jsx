import { base44 } from '@/api/base44Client';

export async function getRecentSearches(me, limit = 10) {
  if (!me?.id) return [];
  try {
    const rows = await base44.entities.SearchHistory.filter(
      { user_id: me.id }, '-created_date', 50
    ).catch(() => []);
    const seen = new Set();
    const out = [];
    for (const r of rows || []) {
      const q = String(r.query || "").trim();
      if (!q || seen.has(q.toLowerCase())) continue;
      seen.add(q.toLowerCase());
      out.push(q);
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

export async function logSearch(me, query) {
  if (!me?.id || !query?.trim()) return;
  try {
    await base44.entities.SearchHistory.create({
      user_id: me.id,
      query: query.trim(),
    });
  } catch {}
}

export async function clearSearchHistory(me) {
  if (!me?.id) return;
  try {
    const rows = await base44.entities.SearchHistory.filter({ user_id: me.id }, null, 500).catch(() => []);
    for (const r of rows || []) {
      try { await base44.entities.SearchHistory.delete(r.id); } catch {}
    }
  } catch {}
}