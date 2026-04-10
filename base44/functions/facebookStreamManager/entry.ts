import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Facebook streaming manager - handles RTMP ingestion and video management
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, sermonTitle, description, pageId, isPublic } = await req.json();

    if (action === 'create_broadcast') {
      const facebookAccessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
      const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');

      if (!facebookAccessToken || !pageId) {
        console.error('Facebook credentials or page ID missing');
        return Response.json(
          { error: 'Facebook streaming not configured. Please connect your Facebook page.' },
          { status: 400 }
        );
      }

      // Create live video object
      const broadcastResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/live_videos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: sermonTitle || 'Live Sermon',
            description: description || '',
            access_token: facebookAccessToken,
            status: 'LIVE_NOW',
            privacy: isPublic ? 'PUBLIC' : 'SELF',
            allow_live_reactions: true,
            allow_live_comments: true,
          }),
        }
      );

      if (!broadcastResponse.ok) {
        const error = await broadcastResponse.text();
        console.error('Facebook broadcast creation failed:', error);
        return Response.json({ error: 'Failed to create Facebook broadcast' }, { status: 500 });
      }

      const broadcast = await broadcastResponse.json();
      const videoId = broadcast.id;

      // Get RTMP credentials
      const rtmpResponse = await fetch(
        `https://graph.facebook.com/v18.0/${videoId}?fields=ingest_streams&access_token=${facebookAccessToken}`
      );

      if (!rtmpResponse.ok) {
        console.error('Failed to get RTMP credentials:', await rtmpResponse.text());
        return Response.json({ error: 'Failed to get streaming credentials' }, { status: 500 });
      }

      const rtmpData = await rtmpResponse.json();
      const ingestStream = rtmpData.ingest_streams?.[0];

      if (!ingestStream) {
        console.error('No ingest stream available');
        return Response.json({ error: 'No ingest stream available' }, { status: 500 });
      }

      // Save to archive
      await base44.asServiceRole.entities.SermonArchive.create({
        title: sermonTitle || 'Live Sermon',
        description: description || '',
        recorded_date: new Date().toISOString(),
        status: 'recording',
        streaming_platform: 'facebook',
        platform_video_id: videoId,
        platform_url: `https://facebook.com/${videoId}`,
        is_public: isPublic,
        duration_seconds: 0,
      });

      console.log(`Facebook broadcast created: ${videoId}`);
      return Response.json({
        videoId: videoId,
        rtmpUrl: ingestStream.secure_stream_url,
        streamKey: ingestStream.stream_key,
        videoUrl: `https://facebook.com/${videoId}`,
      });
    }

    if (action === 'end_broadcast') {
      const { videoId } = await req.json();
      const facebookAccessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');

      // End the live video
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${videoId}?access_token=${facebookAccessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'LIVE_STOPPED',
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to end broadcast:', await response.text());
        return Response.json({ error: 'Failed to end broadcast' }, { status: 500 });
      }

      console.log(`Facebook broadcast ended: ${videoId}`);
      return Response.json({ success: true, videoId });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Facebook streaming error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});