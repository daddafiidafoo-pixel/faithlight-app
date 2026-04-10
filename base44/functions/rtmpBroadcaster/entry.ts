import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// RTMP broadcaster - manages streaming session and recording
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, platform, sermonTitle, description, pageId, isPublic } = await req.json();

    // Route to appropriate platform manager
    if (platform === 'youtube') {
      const response = await base44.asServiceRole.functions.invoke('youtubeStreamManager', {
        action,
        sermonTitle,
        description,
        isPublic,
      });
      return Response.json(response);
    }

    if (platform === 'facebook') {
      const response = await base44.asServiceRole.functions.invoke('facebookStreamManager', {
        action,
        sermonTitle,
        description,
        pageId,
        isPublic,
      });
      return Response.json(response);
    }

    if (action === 'record_session') {
      // Start recording locally via WebRTC/Agora
      const { sessionId, rtcToken } = await req.json();

      const sessionRecord = await base44.asServiceRole.entities.SermonArchive.create({
        title: sermonTitle || 'Recorded Sermon',
        description: description || '',
        recorded_date: new Date().toISOString(),
        status: 'recording',
        streaming_platform: 'internal',
        is_public: isPublic,
        duration_seconds: 0,
        recording_device_type: 'agora',
      });

      console.log(`Recording started for session ${sessionId}, archive ID: ${sessionRecord.id}`);
      return Response.json({
        archiveId: sessionRecord.id,
        recordingStarted: true,
      });
    }

    if (action === 'save_recording') {
      // Save recording and update archive
      const { archiveId, videoUrl, duration, fileSize } = await req.json();

      const updated = await base44.asServiceRole.entities.SermonArchive.update(archiveId, {
        status: 'processing',
        video_url: videoUrl,
        duration_seconds: duration,
        file_size_mb: fileSize / (1024 * 1024),
      });

      console.log(`Recording saved for archive ${archiveId}`);
      return Response.json({
        archiveId,
        status: 'processing',
        updated,
      });
    }

    if (action === 'finalize_archive') {
      // Mark archive as published
      const { archiveId } = await req.json();

      const updated = await base44.asServiceRole.entities.SermonArchive.update(archiveId, {
        status: 'published',
      });

      console.log(`Archive finalized: ${archiveId}`);
      return Response.json({
        archiveId,
        status: 'published',
        url: updated.video_url,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('RTMP broadcaster error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});