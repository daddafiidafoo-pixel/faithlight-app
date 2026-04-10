import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Agora Recording API helper
const agoraAPI = async (resourceId, path, method, body) => {
  const auth = btoa(`${Deno.env.get('AGORA_CUSTOMER_ID')}:${Deno.env.get('AGORA_CUSTOMER_SECRET')}`);
  const url = `https://api.agora.io/v1/apps/${Deno.env.get('AGORA_APP_ID')}/recordings/resource/${resourceId}${path}`;
  
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
    const { event_id, session_id, resource_id, ended_reason } = await req.json();

    // Stop recording
    await agoraAPI(resource_id, '/stop', 'POST', {
      cname: (await base44.entities.LiveRoom.read(event_id)).channel_id,
      uid: 0,
      clientRequest: {}
    });

    // Update session
    await base44.entities.EventSession.update(session_id, {
      ended_at: new Date().toISOString(),
      ended_reason: ended_reason || 'host_ended'
    });

    // Update recording status to processing
    const recording = await base44.entities.EventRecording.filter({
      event_id: event_id,
      session_id: session_id
    });

    if (recording.length > 0) {
      await base44.entities.EventRecording.update(recording[0].id, {
        status: 'processing'
      });
    }

    return Response.json({
      success: true,
      message: 'Recording stopped, processing started'
    });
  } catch (error) {
    console.error('Error stopping recording:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});