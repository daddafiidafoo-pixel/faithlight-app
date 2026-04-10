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
      return Response.json({ error: 'Forbidden: Only host can start recording' }, { status: 403 });
    }

    if (!event.recording_enabled) {
      return Response.json({ error: 'Recording not enabled for this event' }, { status: 400 });
    }

    const agoraAppId = Deno.env.get('AGORA_APP_ID');
    const agoraSecret = Deno.env.get('AGORA_RECORDING_SECRET');

    // Step 1: Acquire resource
    const acquireRes = await fetch('https://api.agora.io/v1/apps/' + agoraAppId + '/cloud_recording/acquire', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(agoraAppId + ':' + agoraSecret),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cname: event.channel_id,
        uid: '0', // recording service UID
        clientRequest: {}
      })
    });

    const acquireData = await acquireRes.json();
    if (!acquireData.resourceId) {
      throw new Error('Failed to acquire Agora resource: ' + JSON.stringify(acquireData));
    }

    // Step 2: Start recording
    const startRes = await fetch('https://api.agora.io/v1/apps/' + agoraAppId + '/cloud_recording/resourceid/' + acquireData.resourceId + '/start', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(agoraAppId + ':' + agoraSecret),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cname: event.channel_id,
        uid: '0',
        clientRequest: {
          recordingConfig: {
            channelType: event.type === 'audio_stage' ? 0 : 1, // 0=communication, 1=broadcast
            streamTypes: 2, // audio + video
            audioProfile: 1,
            videoStreamType: 0,
            recordingFileRidingfolderAccessToken: ''
          },
          storageConfig: {
            vendor: 1, // Alibaba Cloud
            region: 1, // US
            bucket: Deno.env.get('AGORA_BUCKET'),
            accessKey: Deno.env.get('AGORA_ACCESS_KEY'),
            secretKey: Deno.env.get('AGORA_SECRET_KEY')
          }
        }
      })
    });

    const startData = await startRes.json();
    if (!startData.sid) {
      throw new Error('Failed to start recording: ' + JSON.stringify(startData));
    }

    // Create recording record
    const recording = await base44.entities.EventRecording.create({
      event_id,
      session_id,
      provider: 'agora',
      resource_id: acquireData.resourceId,
      sid: startData.sid,
      status: 'recording'
    });

    return Response.json({ recording });
  } catch (error) {
    console.error('startAgoraRecording error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});