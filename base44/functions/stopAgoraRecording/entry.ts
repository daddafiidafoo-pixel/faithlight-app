import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, session_id } = await req.json();

    // Verify user is host
    const event = await base44.entities.LiveRoom.read(event_id);
    if (event.host_id !== user.id && !event.cohost_ids?.includes(user.id)) {
      return Response.json({ error: 'Forbidden: Only host can stop recording' }, { status: 403 });
    }

    // Get recording record
    const recordings = await base44.entities.EventRecording.filter({
      event_id,
      session_id,
      status: 'recording'
    });

    if (recordings.length === 0) {
      return Response.json({ error: 'No active recording found' }, { status: 404 });
    }

    const recording = recordings[0];
    const agoraAppId = Deno.env.get('AGORA_APP_ID');
    const agoraSecret = Deno.env.get('AGORA_RECORDING_SECRET');

    // Stop recording
    const stopRes = await fetch(
      'https://api.agora.io/v1/apps/' + agoraAppId + '/cloud_recording/resourceid/' + recording.resource_id + '/sid/' + recording.sid + '/stop',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(agoraAppId + ':' + agoraSecret),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cname: event.channel_id,
          uid: '0',
          clientRequest: {}
        })
      }
    );

    const stopData = await stopRes.json();
    if (!stopData.sid) {
      throw new Error('Failed to stop recording: ' + JSON.stringify(stopData));
    }

    // Update recording status to processing
    await base44.entities.EventRecording.update(recording.id, {
      status: 'processing'
    });

    return Response.json({ success: true, message: 'Recording stopped, processing started' });
  } catch (error) {
    console.error('stopAgoraRecording error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});