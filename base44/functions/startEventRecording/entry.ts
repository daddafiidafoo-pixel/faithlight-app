import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Agora Recording API helper
const agoraAPI = async (path, method, body) => {
  const auth = btoa(`${Deno.env.get('AGORA_CUSTOMER_ID')}:${Deno.env.get('AGORA_CUSTOMER_SECRET')}`);
  const url = `https://api.agora.io/v1/apps/${Deno.env.get('AGORA_APP_ID')}${path}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Agora API error: ${error}`);
  }

  return response.json();
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { event_id } = await req.json();

    // Get event
    const event = await base44.entities.LiveRoom.read(event_id);
    if (!event.recording_enabled) {
      return Response.json({ error: 'Recording not enabled' }, { status: 400 });
    }

    // Create session record
    const session = await base44.entities.EventSession.create({
      event_id: event_id,
      started_at: new Date().toISOString()
    });

    // Acquire resource
    const resource = await agoraAPI('/recordings/resource', 'POST', {
      cname: event.channel_id,
      uid: 0,
      clientRequest: {}
    });

    const resourceId = resource.resourceId;

    // Start recording
    const recording = await agoraAPI(`/recordings/resource/${resourceId}/start`, 'POST', {
      cname: event.channel_id,
      uid: 0,
      clientRequest: {
        recordingFileConfig: [{
          avFileType: ['m3u8', 'mp4']
        }],
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 2, // audio + video
          channelType: event.type === 'audio_stage' ? 0 : 1, // 0=communication, 1=broadcast
          videoStreamConfig: [{
            streamId: 0,
            decryption: {
              decryptionMode: 'aes-128-xts',
              decryptionKey: ''
            }
          }],
          extensionServiceConfig: [{
            errorHandlePolicy: 'output_when_codec_not_supported',
            serviceName: 'web_recorder_service',
            errorLog: ''
          }]
        }
      }
    });

    const sid = recording.sid;

    // Create recording record
    const recordingRecord = await base44.entities.EventRecording.create({
      event_id: event_id,
      session_id: session.id,
      provider: 'agora',
      status: 'recording',
      resource_id: resourceId,
      sid: sid
    });

    return Response.json({
      success: true,
      session_id: session.id,
      recording_id: recordingRecord.id,
      resource_id: resourceId,
      sid: sid
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});