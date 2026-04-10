import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event_id, session_id } = await req.json();

    const event = await base44.entities.LiveRoom.read(event_id);
    if (event.host_id !== user.id && !event.cohost_ids?.includes(user.id)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all chat messages for this session as source material
    const messages = await base44.entities.LiveRoomChat.filter({ room_id: event_id });

    const chatLog = messages
      .filter(m => !m.is_deleted)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(m => {
        const time = new Date(m.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `[${time}] ${m.user_name}: ${m.message}`;
      })
      .join('\n');

    if (!chatLog) {
      return Response.json({ transcript: '(No chat messages found for this session.)' });
    }

    const prompt = `You are a transcript editor. Below is the live chat log from a session titled "${event.title}".

Please reformat this into a clean, readable session transcript with the following structure:
1. A brief session summary (2-3 sentences)
2. Key discussion points or topics covered
3. The full cleaned-up chat log with timestamps

Chat log:
${chatLog}

Format the output as plain text, suitable for download.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });

    // Store transcript on the EventRecording record if available
    const recordings = await base44.entities.EventRecording.filter({ event_id, session_id }).catch(() => []);
    if (recordings.length > 0) {
      await base44.entities.EventRecording.update(recordings[recordings.length - 1].id, {
        status: 'ready',
      });
    }

    return Response.json({ transcript: result });
  } catch (error) {
    console.error('generateSessionTranscript error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});