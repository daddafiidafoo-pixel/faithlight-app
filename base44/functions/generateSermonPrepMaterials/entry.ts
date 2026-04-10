import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic, scripturePassage, teachingType = 'sermon', difficulty = 'intermediate' } = body;

    if (!topic && !scripturePassage) {
      return Response.json(
        { error: 'Please provide either a topic or scripture passage' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert theological educator and sermon preparation specialist. Generate comprehensive teaching materials for a ${difficulty} level ${teachingType} based on the following:

Topic: ${topic || 'Based on Scripture'}
Scripture Passage: ${scripturePassage || topic}

Please provide a detailed response in the following JSON format (return ONLY valid JSON, no markdown):
{
  "title": "Catchy, memorable title for the ${teachingType}",
  "outline": [
    {
      "point": "Main point 1",
      "subPoints": ["Sub-point 1a", "Sub-point 1b"],
      "supportingVerse": "Scripture reference"
    },
    {
      "point": "Main point 2",
      "subPoints": ["Sub-point 2a", "Sub-point 2b"],
      "supportingVerse": "Scripture reference"
    },
    {
      "point": "Main point 3",
      "subPoints": ["Sub-point 3a", "Sub-point 3b"],
      "supportingVerse": "Scripture reference"
    }
  ],
  "keyPoints": [
    "Central theological truth",
    "Practical takeaway",
    "Spiritual challenge",
    "Call to action"
  ],
  "applicationIdeas": [
    {
      "area": "Personal Life",
      "suggestions": ["How listeners can apply this personally", "Reflection question"]
    },
    {
      "area": "Family/Relationships",
      "suggestions": ["Family-focused application", "Discussion starter"]
    },
    {
      "area": "Church/Community",
      "suggestions": ["How the church can live this out", "Community challenge"]
    }
  ],
  "illustrations": [
    {
      "title": "Real-life story or analogy",
      "description": "A compelling illustration that makes the point relatable",
      "whenToUse": "How to transition into this illustration in the ${teachingType}"
    },
    {
      "title": "Historical or Biblical example",
      "description": "An example from Scripture or history",
      "whenToUse": "How to transition into this illustration"
    }
  ],
  "discussionQuestions": [
    "Question that provokes reflection",
    "Question that connects to listeners' experiences",
    "Question that challenges action"
  ],
  "openingHook": "A compelling opening statement or question to grab attention",
  "closingChallenge": "A memorable closing statement that motivates action",
  "estimatedTime": "Approximate preparation and delivery time"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          outline: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                point: { type: 'string' },
                subPoints: { type: 'array', items: { type: 'string' } },
                supportingVerse: { type: 'string' }
              }
            }
          },
          keyPoints: { type: 'array', items: { type: 'string' } },
          applicationIdeas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                suggestions: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          illustrations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                whenToUse: { type: 'string' }
              }
            }
          },
          discussionQuestions: { type: 'array', items: { type: 'string' } },
          openingHook: { type: 'string' },
          closingChallenge: { type: 'string' },
          estimatedTime: { type: 'string' }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    console.error('Error generating sermon prep materials:', error);
    return Response.json(
      { error: 'Failed to generate materials. Please try again.' },
      { status: 500 }
    );
  }
});