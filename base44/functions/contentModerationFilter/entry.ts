import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-Powered Content Moderation Filter
 * 
 * Analyzes community content for:
 * 1. Hate speech, harassment, discrimination
 * 2. Doctrinal concerns & misinformation
 * 3. Spam, off-topic content
 * 4. Cultural insensitivity
 * 5. Safety concerns
 * 
 * Respects global inclusivity & theological balance
 */

const MODERATION_CONFIG = {
  DOCTRINAL_KEYWORDS: {
    prosperity_gospel: ['financial blessing', 'money gospel', 'wealth transfer', 'guaranteed prosperity'],
    extreme_eschatology: ['rapture 2024', 'end times 2024', 'jesus returning', 'final days soon'],
    denominational_attacks: ['catholics are wrong', 'mormons false', 'these churches evil', 'only true church'],
    spiritual_abuse_red_flags: ['give everything', 'surrender all money', 'only church knows', 'never question'],
    healing_promises: ['guaranteed healing', 'faith alone cures', 'no medicine needed', 'will definitely heal']
  },
  OFFENSIVE_KEYWORDS: {
    hate_speech: ['explicit slurs and derogatory terms - omitted for sensitivity'],
    harassment: ['i will find you', 'doxxing threats', 'swarm attack'],
    violence: ['hurt you', 'kill', 'physically attack'],
    sexual_content: ['explicit sexual content omitted for sensitivity']
  },
  CULTURAL_INSENSITIVITY: {
    stereotypes: ['all x are', 'those people always', 'everyone knows x'],
    colonialism: ['primitive faith', 'backwards culture', 'uncivilized beliefs'],
    dismissive_language: ['you dont understand', 'your culture is wrong']
  },
  MISINFORMATION: {
    health_false_claims: ['cure cancer with prayer alone', 'vaccines cause harm'],
    conspiracy: ['new world order', 'illuminati controlling'],
    false_theology: ['jesus never existed', 'bible is man-made conspiracy']
  }
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { content, contentType, contentId, authorId, authorName, language = 'en' } = payload;

    if (!content || !contentType || !authorId) {
      return Response.json(
        { error: 'content, contentType, and authorId required' },
        { status: 400 }
      );
    }

    // Run moderation analysis
    const moderationResult = await analyzeContent(
      content,
      contentType,
      language,
      base44
    );

    // If issues detected, create FlaggedContent entry
    if (moderationResult.flagged) {
      try {
        await base44.asServiceRole.entities.FlaggedContent.create({
          content_type: contentType,
          content_id: contentId || `${contentType}_${Date.now()}`,
          content_preview: content.substring(0, 500),
          author_id: authorId,
          author_name: authorName,
          flagging_method: 'ai_filter',
          ai_confidence: moderationResult.confidence,
          ai_categories: moderationResult.categories,
          priority: moderationResult.severity === 'critical' ? 'critical' : moderationResult.severity === 'high' ? 'high' : 'medium',
          status: 'pending_review',
          context_data: {
            language,
            timestamp: new Date().toISOString()
          }
        });

        // Check user's violation history for escalation
        const userSafetyProfile = await base44.asServiceRole.entities.UserSafetyProfile.filter(
          { user_id: authorId },
          '-created_date',
          1
        );

        if (userSafetyProfile?.length > 0) {
          const profile = userSafetyProfile[0];
          const isRepeatViolator = profile.recent_violations?.length > 2;

          // Auto-escalate for repeat violators
          if (isRepeatViolator && moderationResult.severity !== 'low') {
            return Response.json({
              flagged: true,
              categories: moderationResult.categories,
              severity: moderationResult.severity,
              confidence: moderationResult.confidence,
              autoEscalated: true,
              recommendedAction: 'warning_or_mute',
              reason: 'Repeat violation detected'
            });
          }
        }
      } catch (err) {
        console.error('Error creating FlaggedContent:', err);
      }
    }

    return Response.json(moderationResult);

  } catch (error) {
    console.error('Content Moderation Error:', error);
    return Response.json(
      { error: 'Moderation check failed', details: error.message },
      { status: 500 }
    );
  }
});

async function analyzeContent(content, contentType, language, base44) {
  const lowerContent = content.toLowerCase();
  const result = {
    flagged: false,
    categories: [],
    severity: 'low',
    confidence: 0,
    issues: []
  };

  // Check for doctrinal concerns
  for (const [category, keywords] of Object.entries(MODERATION_CONFIG.DOCTRINAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        result.flagged = true;
        result.categories.push('doctrinal_concern');
        result.issues.push(`Potential ${category} detected`);
        result.severity = 'high';
        result.confidence = Math.min(result.confidence + 0.15, 1);
      }
    }
  }

  // Check for offensive content
  for (const [category, keywords] of Object.entries(MODERATION_CONFIG.OFFENSIVE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        result.flagged = true;
        result.categories.push(category);
        result.severity = 'critical';
        result.confidence = Math.min(result.confidence + 0.3, 1);
        result.issues.push(`${category} detected`);
      }
    }
  }

  // Check for cultural insensitivity
  for (const [category, keywords] of Object.entries(MODERATION_CONFIG.CULTURAL_INSENSITIVITY)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        result.flagged = true;
        result.categories.push('cultural_insensitivity');
        result.issues.push(`Potential ${category} detected`);
        result.severity = 'medium';
        result.confidence = Math.min(result.confidence + 0.12, 1);
      }
    }
  }

  // Check for misinformation
  for (const [category, keywords] of Object.entries(MODERATION_CONFIG.MISINFORMATION)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        result.flagged = true;
        result.categories.push('misinformation');
        result.issues.push(`Potential ${category} detected`);
        result.severity = 'high';
        result.confidence = Math.min(result.confidence + 0.2, 1);
      }
    }
  }

  // Check for spam patterns
  const spamPatterns = [
    /\b(.+?)\b(?:\s+\1){4,}/gi, // Repetition
    /[A-Z]{10,}/g, // All caps long strings
    /(http|https):\/\/[^\s]+/g // Multiple links
  ];

  let linkCount = (content.match(/(http|https):\/\/[^\s]+/g) || []).length;
  if (linkCount > 3) {
    result.flagged = true;
    result.categories.push('spam');
    result.issues.push('Multiple links detected');
    result.severity = 'low';
  }

  // AI LLM analysis for nuanced issues
  if (!result.flagged || result.confidence < 0.6) {
    try {
      const llmAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this community ${contentType} for safety concerns:\n\n"${content.substring(0, 1000)}"\n\nCheck for:\n1. Hate speech or discrimination\n2. Harassment or threats\n3. Doctrinal extremism (prosperity gospel, date-setting, denominational attacks)\n4. Misinformation (health, conspiracy)\n5. Cultural insensitivity\n\nRespond with: flagged: true/false, categories: [], reason: ""`,
        response_json_schema: {
          type: 'object',
          properties: {
            flagged: { type: 'boolean' },
            categories: { type: 'array', items: { type: 'string' } },
            reason: { type: 'string' }
          }
        }
      });

      if (llmAnalysis.flagged) {
        result.flagged = true;
        result.categories = [...new Set([...result.categories, ...llmAnalysis.categories])];
        result.issues.push(llmAnalysis.reason);
        result.confidence = Math.max(result.confidence, 0.7);
        
        // Determine severity based on categories
        if (llmAnalysis.categories.includes('hate_speech') || llmAnalysis.categories.includes('harassment')) {
          result.severity = 'critical';
        } else if (llmAnalysis.categories.includes('doctrinal_concern') || llmAnalysis.categories.includes('misinformation')) {
          result.severity = 'high';
        }
      }
    } catch (err) {
      console.warn('LLM analysis failed, using keyword analysis:', err.message);
    }
  }

  return result;
}