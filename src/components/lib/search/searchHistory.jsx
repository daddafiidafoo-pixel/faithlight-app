import { base44 } from '@/api/base44Client';

export async function logSearchClick({ me, query, result }) {
  if (!me?.id) return;
  try {
    await base44.entities.SearchHistory.create({
      user_id: me.id,
      query,
      clicked_type: result.type,
      clicked_id: result.key || result.path,
      clicked_meta: {
        group: result.group,
        translationId: result.translationId || null,
        book: result.book || null,
      },
    });
  } catch {}
}