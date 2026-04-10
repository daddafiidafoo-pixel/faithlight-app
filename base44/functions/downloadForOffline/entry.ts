import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content_type, content_id, title } = await req.json();

    if (!content_type || !content_id) {
      return Response.json({ error: 'Missing content_type or content_id' }, { status: 400 });
    }

    // Record the download
    const record = await base44.asServiceRole.entities.OfflineDownload.create({
      user_id: user.id,
      content_id: content_id,
      content_type: content_type,
      title: title,
      size_mb: estimateSize(content_type),
      status: 'completed'
    });

    return Response.json({
      success: true,
      download_id: record.id
    });
  } catch (error) {
    console.error('Download error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function estimateSize(contentType) {
  const sizes = {
    'plans': 2.5,    // Study plan ~2.5MB
    'lessons': 5,    // Lesson ~5MB
    'audio': 50,     // Audio file ~50MB
    'bible': 15      // Bible version ~15MB
  };
  return sizes[contentType] || 1;
}