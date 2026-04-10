import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's downloads
    const downloads = await base44.entities.OfflineDownload.filter(
      { user_id: user.id },
      '-updated_date'
    );

    // Calculate storage
    let used = 0;
    downloads.forEach((dl) => {
      used += dl.size_mb || 0;
    });

    return Response.json({
      downloads: downloads.map((dl) => ({
        id: dl.id,
        title: dl.title,
        type: dl.content_type,
        size: dl.size_mb || 0,
      })),
      storage: { used, available: 500 },
    });
  } catch (error) {
    console.error('Get downloads error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});