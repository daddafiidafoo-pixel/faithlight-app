import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { prayerRequest, language = 'en' } = body;

    const trimmedRequest = (prayerRequest || '').trim();
    if (!trimmedRequest) {
      return Response.json({ success: false, error: 'Prayer request cannot be empty' }, { status: 400 });
    }

    if (trimmedRequest.length > 1000) {
      return Response.json({ success: false, error: 'Prayer request is too long' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    console.log(`[prayerCoach] language=${language} request_length=${trimmedRequest.length}`);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate spiritual guide. Respond to this prayer request with exactly four sections.

PRAYER REQUEST:
${trimmedRequest}

Provide your response in this exact format with these four sections:

1. EXPLANATION: A compassionate reflection (2 sentences)
2. SCRIPTURE: One Bible verse reference only (e.g., "John 3:16")
3. REFLECTION: Scripture-based encouragement (2 sentences)
4. PRAYER: A guided prayer (3 sentences starting with "Lord" or "God")

Be warm, biblical, and supportive.`,
      response_json_schema: {
        type: 'object',
        properties: {
          explanation: { type: 'string' },
          scripture: { type: 'string' },
          reflection: { type: 'string' },
          prayer: { type: 'string' },
        },
        required: ['explanation', 'scripture', 'reflection', 'prayer'],
      },
    });

    if (!response || !response.data) {
      console.error('[prayerCoach] Invalid response shape:', response);
      return Response.json({ success: false, error: 'Prayer generation failed' }, { status: 500 });
    }

    const data = response.data;
    if (!data.explanation || !data.scripture || !data.reflection || !data.prayer) {
      console.error('[prayerCoach] Missing required fields in response');
      return Response.json({ success: false, error: 'Prayer generation incomplete' }, { status: 500 });
    }

    console.log('[prayerCoach] success - response generated');
    return Response.json({
      success: true,
      explanation: data.explanation.substring(0, 500),
      scripture: data.scripture.substring(0, 100),
      reflection: data.reflection.substring(0, 500),
      prayer: data.prayer.substring(0, 500),
    });
  } catch (error) {
    console.error('[prayerCoach] error:', error?.message || String(error));
    return Response.json({ success: false, error: 'Prayer generation failed' }, { status: 500 });
  }
});