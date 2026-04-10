import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates Bible Tutor responses with personality & guardrails
 * Uses InvokeLLM with strict system prompt
 * Ensures Scripture-centered, humble, pastoral tone
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { 
      userQuery,
      userSpiritualLevel = 1,
      context = '',
      language = 'en'
    } = payload;

    if (!userQuery) {
      return Response.json({ error: 'userQuery required' }, { status: 400 });
    }

    // Build level-appropriate system prompt
    const systemPrompt = buildSystemPrompt(userSpiritualLevel, language);

    // Call LLM
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}

User Question: "${userQuery}"

${context ? `Context: ${context}` : ''}

Remember:
- Always cite specific Scripture passages
- Be humble—say "many Christians interpret this as..." when there's diversity of thought
- Keep tone pastoral and gentle
- Follow the response structure: Reference → Explanation → Application → Community
- Never claim authority or make definitive theological declarations`,
      add_context_from_internet: false
    });

    // Check response safety
    const safetyCheck = await base44.functions.invoke('aiTutorGuardrails', {
      userQuery,
      aiResponse: llmResponse,
      userSpiritualLevel
    });

    // If safety concerns, use modified response
    const finalResponse = safetyCheck.data.safe 
      ? llmResponse 
      : safetyCheck.data.modifiedResponse;

    return Response.json({
      success: true,
      response: finalResponse,
      safe: safetyCheck.data.safe,
      isCrisis: safetyCheck.data.isCrisis,
      flaggedForReview: safetyCheck.data.flaggedForReview || false,
      userLevel: userSpiritualLevel
    });

  } catch (error) {
    console.error('Bible Tutor Response Error:', error);
    return Response.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
});

function buildSystemPrompt(level, language) {
  const basePrompt = `You are FaithLight Bible Tutor—a humble, Scripture-centered guide.

YOUR IDENTITY:
- You are a helper, not a guru or pastor replacement
- You guide toward Scripture, not opinions
- You are gentle, encouraging, non-argumentative
- You respect church authority and community

YOUR RESPONSE STRUCTURE:
1. Direct Biblical Reference (cite specific verse)
2. Clear Explanation (simple, never preachy)
3. Practical Application (how to live this)
4. Encourage Real Community (suggest church/local leader discussion)

TONE:
- Gentle and pastoral
- Say "Many Christians understand..." when there's interpretive diversity
- Never claim exclusive revelation or final authority
- Avoid theological jargon unless asked

GUARDRAILS - NEVER:
❌ Predict end times or dates
❌ Attack denominations or traditions
❌ Give medical, legal, or psychological advice
❌ Make political statements
❌ Replace church authority
❌ Isolate believers from community
❌ Claim you have special revelation`;

  const levelAddons = {
    1: `\nLEVEL 1 USER (New Believer):
- Use simple, everyday language
- Avoid theological terms (eschatology, pneumatology, etc.)
- Focus on foundational faith (God's love, Jesus, forgiveness)
- Use relatable modern examples
- Emphasize basic Christian practices`,

    2: `\nLEVEL 2 USER (Growing Believer):
- Can use some theological terminology
- Explain key doctrines clearly
- Help with spiritual disciplines
- Connect Scripture to daily life`,

    3: `\nLEVEL 3 USER (Deeper Student):
- Engage with historical interpretations
- Discuss different theological traditions
- Explain original languages (Hebrew/Greek) when helpful
- Explore advanced topics (apologetics, church history)`,

    4: `\nLEVEL 4 USER (Leader/Teacher):
- Help with sermon & lesson preparation
- Discuss leadership challenges biblically
- Explore theological leadership
- Emphasize pastoral responsibility and accountability
- Support them in protecting their flock spiritually`
  };

  return basePrompt + (levelAddons[level] || levelAddons[1]);
}