/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { verse, text } = await req.json();

    if (!verse || !text) {
      return Response.json(
        { error: 'Missing verse or text parameter' },
        { status: 400 }
      );
    }

    // Use InvokeLLM integration to generate reflection
    const response = await fetch('https://api.base44.dev/integrations/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY') || ''}`
      },
      body: JSON.stringify({
        integration: 'Core',
        function: 'InvokeLLM',
        payload: {
          prompt: `Write a short Christian devotional reflection for this Bible verse.
Keep it encouraging, clear, and faithful to Scripture.
Length: 2 to 4 sentences.
Avoid denomination-specific claims.

Verse: ${verse}
Text: "${text}"

Write only the reflection, no other text.`,
          response_json_schema: {
            type: 'object',
            properties: {
              devotional: { type: 'string' }
            }
          }
        }
      })
    });

    if (!response.ok) {
      console.error('Integration call failed:', response.status);
      return Response.json(
        { devotional: 'Take time to meditate on this verse and how it applies to your life today.' },
        { status: 200 }
      );
    }

    const result = await response.json();
    
    return Response.json({
      devotional: result.devotional || 'Take time to meditate on this verse and how it applies to your life today.'
    });
  } catch (error) {
    console.error('Error generating devotional:', error);
    return Response.json(
      { devotional: 'Take time to meditate on this verse and how it applies to your life today.' },
      { status: 200 }
    );
  }
});