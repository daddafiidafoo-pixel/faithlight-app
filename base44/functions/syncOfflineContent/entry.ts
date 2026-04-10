import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'sync_all') {
      // Get all offline downloads for user
      const downloads = await base44.asServiceRole.entities.OfflineDownload.filter({
        user_id: user.id
      });

      // Update timestamps to reflect sync
      const synced = [];
      for (const dl of downloads || []) {
        try {
          await base44.asServiceRole.entities.OfflineDownload.update(dl.id, {
            updated_date: new Date().toISOString()
          });
          synced.push(dl.id);
        } catch (err) {
          console.error(`Failed to sync ${dl.id}:`, err.message);
        }
      }

      return Response.json({
        success: true,
        synced_count: synced.length,
        synced_ids: synced
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Sync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});