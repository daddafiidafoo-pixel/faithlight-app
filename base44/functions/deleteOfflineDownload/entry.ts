import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content_type, content_id } = await req.json();

    // Delete the download record
    await base44.asServiceRole.entities.OfflineDownload.delete({
      user_id: user.id,
      content_type: content_type,
      content_id: content_id
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});