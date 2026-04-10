import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// YouTube streaming manager - handles RTMP ingestion and video management
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, sermonTitle, description, isPublic } = await req.json();

    if (action === 'create_broadcast') {
      // Get YouTube credentials from environment
      const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
      const youtubeRefreshToken = Deno.env.get('YOUTUBE_REFRESH_TOKEN');

      if (!youtubeApiKey || !youtubeRefreshToken) {
        console.error('YouTube credentials not configured');
        return Response.json(
          { error: 'YouTube streaming not configured. Please set up OAuth in settings.' },
          { status: 400 }
        );
      }

      // Get fresh access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('YOUTUBE_CLIENT_ID'),
          client_secret: Deno.env.get('YOUTUBE_CLIENT_SECRET'),
          refresh_token: youtubeRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Failed to refresh YouTube token:', await tokenResponse.text());
        return Response.json({ error: 'Failed to authenticate with YouTube' }, { status: 401 });
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Create live broadcast
      const broadcastResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&key=' + youtubeApiKey,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              title: sermonTitle || 'Live Sermon',
              description: description || '',
              scheduledStartTime: new Date().toISOString(),
            },
            status: {
              privacyStatus: isPublic ? 'public' : 'private',
            },
            contentDetails: {
              enableAutoStart: true,
              enableAutoStop: true,
              recordFromStart: true,
              monitorStream: {
                enableMonitoring: true,
              },
            },
          }),
        }
      );

      if (!broadcastResponse.ok) {
        const error = await broadcastResponse.text();
        console.error('YouTube broadcast creation failed:', error);
        return Response.json({ error: 'Failed to create YouTube broadcast' }, { status: 500 });
      }

      const broadcast = await broadcastResponse.json();

      // Create live stream (ingestion point)
      const streamResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn&key=' + youtubeApiKey,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              title: sermonTitle + ' - Stream',
              description: 'RTMP ingestion stream for sermon',
            },
            cdn: {
              format: '720p',
              ingestionType: 'rtmp',
            },
          }),
        }
      );

      if (!streamResponse.ok) {
        console.error('YouTube stream creation failed:', await streamResponse.text());
        return Response.json({ error: 'Failed to create ingestion stream' }, { status: 500 });
      }

      const stream = await streamResponse.json();

      // Bind stream to broadcast
      const bindResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcast.id}&streamId=${stream.id}&part=contentDetails&key=${youtubeApiKey}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!bindResponse.ok) {
        console.error('Failed to bind stream:', await bindResponse.text());
        return Response.json({ error: 'Failed to bind stream to broadcast' }, { status: 500 });
      }

      // Save to archive
      await base44.asServiceRole.entities.SermonArchive.create({
        title: sermonTitle || 'Live Sermon',
        description: description || '',
        recorded_date: new Date().toISOString(),
        status: 'recording',
        streaming_platform: 'youtube',
        platform_video_id: broadcast.id,
        platform_url: `https://youtube.com/watch?v=${broadcast.id}`,
        is_public: isPublic,
        duration_seconds: 0,
      });

      // Return RTMP credentials
      const ingestUrl = stream.cdn.ingestionInfo.ingestionAddress;
      const streamKey = stream.cdn.ingestionInfo.streamName;

      console.log(`YouTube broadcast created: ${broadcast.id}`);
      return Response.json({
        broadcastId: broadcast.id,
        streamId: stream.id,
        rtmpUrl: ingestUrl,
        streamKey: streamKey,
        videoUrl: `https://youtube.com/watch?v=${broadcast.id}`,
      });
    }

    if (action === 'end_broadcast') {
      const { broadcastId } = await req.json();
      const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
      const youtubeRefreshToken = Deno.env.get('YOUTUBE_REFRESH_TOKEN');

      // Get fresh token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('YOUTUBE_CLIENT_ID'),
          client_secret: Deno.env.get('YOUTUBE_CLIENT_SECRET'),
          refresh_token: youtubeRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Transition to complete state
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?id=${broadcastId}&broadcastStatus=complete&part=status&key=${youtubeApiKey}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to end broadcast:', await response.text());
        return Response.json({ error: 'Failed to end broadcast' }, { status: 500 });
      }

      console.log(`YouTube broadcast ended: ${broadcastId}`);
      return Response.json({ success: true, broadcastId });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('YouTube streaming error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});