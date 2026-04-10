import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_ids } = await req.json();
    if (!item_ids?.length) return Response.json({ updated: [] });

    const updated = [];

    for (const id of item_ids) {
      try {
        const items = await base44.asServiceRole.entities.OfflineItem.filter({ _id: id, user_id: user.id });
        const item = items?.[0];
        if (!item) continue;

        // Mark as re-downloading
        await base44.asServiceRole.entities.OfflineItem.update(id, {
          status: 'downloading',
          progress: 0,
        });

        // Get latest version timestamp
        let newVersion = new Date().toISOString();
        if (item.type === 'lesson') {
          const lesson = await base44.asServiceRole.entities.Lesson.filter({ _id: item.key }, '-updated_date', 1);
          newVersion = lesson?.[0]?.updated_date || newVersion;
        } else if (item.type === 'course') {
          const course = await base44.asServiceRole.entities.Course.filter({ _id: item.key }, '-updated_date', 1);
          newVersion = course?.[0]?.updated_date || newVersion;
        } else if (item.type === 'text_chapter') {
          const chapter = await base44.asServiceRole.entities.BibleTextChapter.filter({ _id: item.key }, '-updated_date', 1);
          newVersion = chapter?.[0]?.updated_date || newVersion;
        }

        await base44.asServiceRole.entities.OfflineItem.update(id, {
          status: 'ready',
          version: newVersion,
          progress: 100,
        });

        updated.push(id);
      } catch (err) {
        console.error(`Update failed for ${id}:`, err.message);
        await base44.asServiceRole.entities.OfflineItem.update(id, { status: 'failed' }).catch(() => {});
      }
    }

    return Response.json({ updated });
  } catch (error) {
    console.error('runOfflineUpdates error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});