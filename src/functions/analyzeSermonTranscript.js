/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sermon_title, preacher_name, transcript } = await req.json();

    if (!sermon_title || !transcript) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Truncate transcript to reasonable length for AI processing
    const truncatedTranscript = transcript.substring(0, 8000);

    // Use AI to analyze the sermon
    const analysisPrompt = `Analyze this sermon transcript and provide a comprehensive analysis.

SERMON: "${sermon_title}"
${preacher_name ? `PREACHER: ${preacher_name}` : ''}

TRANSCRIPT:
${truncatedTranscript}

Please provide your response in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the sermon's main message",
  "main_theme": "The overarching theme or main topic",
  "key_takeaways": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "biblical_references": [
    {
      "reference": "Book Chapter:Verse",
      "book": "Book name",
      "context": "Brief explanation of how this was mentioned"
    }
  ],
  "personal_action_plan": [
    {
      "day": "Monday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    },
    {
      "day": "Tuesday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    },
    {
      "day": "Wednesday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    },
    {
      "day": "Thursday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    },
    {
      "day": "Friday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    },
    {
      "day": "Saturday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    },
    {
      "day": "Sunday",
      "action": "Specific action or reflection for this day",
      "scripture": "Related verse reference (optional)"
    }
  ]
}

Ensure the response is valid JSON that can be parsed.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          main_theme: { type: 'string' },
          key_takeaways: { type: 'array', items: { type: 'string' } },
          biblical_references: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
                book: { type: 'string' },
                context: { type: 'string' }
              }
            }
          },
          personal_action_plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'string' },
                action: { type: 'string' },
                scripture: { type: 'string' }
              }
            }
          }
        },
        required: ['summary', 'main_theme', 'key_takeaways', 'biblical_references', 'personal_action_plan']
      }
    });

    // Create record in database
    const record = await base44.entities.SermonTranscriptAnalysis.create({
      user_email: user.email,
      sermon_title,
      preacher_name: preacher_name || '',
      transcript,
      summary: analysis.summary,
      main_theme: analysis.main_theme,
      key_takeaways: analysis.key_takeaways,
      biblical_references: analysis.biblical_references,
      personal_action_plan: analysis.personal_action_plan
    });

    return Response.json(record);
  } catch (error) {
    console.error('Error analyzing sermon:', error);
    return Response.json(
      { error: error.message || 'Failed to analyze sermon' },
      { status: 500 }
    );
  }
});