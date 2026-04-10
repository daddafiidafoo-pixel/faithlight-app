import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_ids } = await req.json();
    if (!item_ids?.length) return Response.json({ candidates: [] });

    // Fetch all offline items
    const items = await base44.asServiceRole.entities.OfflineItem.filter({ user_id: user.id });
    const targetItems = items.filter(i => item_ids.includes(i.id));

    const candidates = [];

    for (const item of targetItems) {
      let latestVersion = null;

      try {
        if (item.type === 'lesson') {
          const lesson = await base44.asServiceRole.entities.Lesson.filter({ _id: item.key }, '-updated_date', 1);
          latestVersion = lesson?.[0]?.updated_date;
        } else if (item.type === 'course') {
          const course = await base44.asServiceRole.entities.Course.filter({ _id: item.key }, '-updated_date', 1);
          latestVersion = course?.[0]?.updated_date;
        } else if (item.type === 'text_chapter') {
          const chapter = await base44.asServiceRole.entities.BibleTextChapter.filter({ _id: item.key }, '-updated_date', 1);
          latestVersion = chapter?.[0]?.updated_date;
        }

        if (latestVersion && latestVersion !== item.version) {
          candidates.push({
            id: item.id,
            title: item.title || item.key,
            type: item.type,
            current_version: item.version,
            latest_version: latestVersion,
          });
        }
      } catch (err) {
        console.error(`Version check failed for ${item.key}:`, err.message);
      }
    }

    return Response.json({ candidates });
  } catch (error) {
    console.error('checkOfflineUpdates error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});