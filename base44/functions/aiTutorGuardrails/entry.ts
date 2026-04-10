import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI Bible Tutor Guardrails & Safety System
 * Ensures responses are Scripture-centered, humble, and pastoral
 * Detects crisis indicators and redirects appropriately
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

    const { userQuery, aiResponse, userSpiritualLevel = 1 } = payload;

    if (!userQuery || !aiResponse) {
      return Response.json(
        { error: 'userQuery and aiResponse required' },
        { status: 400 }
      );
    }

    // Crisis detection patterns
    const crisisPatterns = [
      /hurt.*myself|self.*harm|suicide|end.*life|better.*dead|give.*up/i,
      /want.*die|no.*point|hopeless|despair|can't.*go.*on/i,
      /abuse|assault|danger|emergency|help.*now/i,
      /eating.*disorder|bulimia|anorexia|purge/i,
      /addiction|overdose|drug|alcohol.*abuse/i
    ];

    const isCrisis = crisisPatterns.some(pattern => 
      pattern.test(userQuery) || pattern.test(aiResponse)
    );

    if (isCrisis) {
      return Response.json({
        safe: false,
        isCrisis: true,
        modifiedResponse: `I care about your wellbeing. What you're expressing sounds serious, and I'm an AI—I can't provide the help you truly need right now.

**Please reach out to someone who can help:**

🕊 **National Suicide Prevention Lifeline** (US): 988
📞 **Crisis Text Line**: Text HOME to 741741
🌍 **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

**In your community:**
- Your pastor or church leader
- A trusted counselor or therapist
- A family member or friend

You matter. Your life has value. Please reach out to someone today. 💙`,
        flaggedForReview: true,
        crisisIndicators: true
      });
    }

    // Extremist/doctrinal concern detection
    const extremistPatterns = [
      /only.*truth|exclusive.*revelation|modern.*prophet/i,
      /deny.*trinity|reject.*resurrection|false.*doctrine/i,
      /isolation.*church|leave.*congregation|distrust.*leaders/i,
      /end.*times.*2025|rapture.*this.*year|mark.*beast/i,
      /financial.*sacrifice|give.*all.*money|cult.*like/i
    ];

    const hasExtremistConcern = extremistPatterns.some(pattern =>
      pattern.test(userQuery) || pattern.test(aiResponse)
    );

    if (hasExtremistConcern) {
      return Response.json({
        safe: false,
        isCrisis: false,
        hasExtremistConcern: true,
        modifiedResponse: `This is a topic where Christians hold different perspectives. Rather than me claiming authority, I'd encourage you to:

1. **Read Scripture carefully** – Consider the full context of relevant passages
2. **Consult trusted leaders** – Your pastor or church can help discern this
3. **Study church history** – See how the Church has understood this over centuries
4. **Be humble** – God's Word is infinite; we all see partially

I'm here to help you study, not to declare doctrinal authority. What specific Scripture passage would you like to explore together?`,
        flaggedForReview: true
      });
    }

    // Political/cultural issues
    const politicalPatterns = [
      /vote.*for|support.*politician|party.*correct|political.*side/i,
      /election.*matters.*faith|political.*alignment|god.*supports/i
    ];

    const hasPoliticalConcern = politicalPatterns.some(pattern =>
      pattern.test(userQuery)
    );

    if (hasPoliticalConcern) {
      return Response.json({
        safe: false,
        isCrisis: false,
        hasPoliticalConcern: true,
        modifiedResponse: `This is a question many Christians ask, and Christians hold sincere differences here.

The Bible speaks to principles of justice, mercy, and love—but how those apply to specific politics varies.

**Rather than me taking a side, I'd encourage:**
- Reading Scripture on justice, humility, and loving your neighbor
- Discussing with Christians you respect who may disagree with you
- Praying for wisdom as you discern your own conviction
- Recognizing that faithful Christians can vote differently

What biblical principle would you like to explore more deeply?`,
        flaggedForReview: true
      });
    }

    // Medical/legal advice detection
    const medicalLegalPatterns = [
      /diagnose|treat.*condition|medicine|surgery|dosage/i,
      /take.*prescription|stop.*medication|cure.*disease/i,
      /lawsuit|legal.*advice|attorney|court.*case/i
    ];

    const hasMedicalLegalConcern = medicalLegalPatterns.some(pattern =>
      pattern.test(userQuery)
    );

    if (hasMedicalLegalConcern) {
      return Response.json({
        safe: false,
        isCrisis: false,
        hasMedicalLegalConcern: true,
        modifiedResponse: `I'm an AI tutor for Scripture—not a medical or legal professional. For these important questions, please consult:

🏥 **Medical**: Your doctor or healthcare provider
⚖️ **Legal**: A licensed attorney
🧑‍⚕️ **Mental Health**: A counselor or therapist

**What I can help with:**
- Biblical perspectives on suffering, healing, or justice
- Scripture passages about trusting God in difficult times
- How your faith informs your decisions

What aspect of your faith journey can I support?`,
        flaggedForReview: true
      });
    }

    // Level-based response validation
    if (userSpiritualLevel === 1) {
      // Check for overly complex theological language
      const complexTerms = [
        'pneumatology', 'eschatology', 'soteriology', 'exegesis',
        'hermeneutics', 'christology', 'ecclesiology', 'theodicy'
      ];
      const hasComplexLanguage = complexTerms.some(term =>
        aiResponse.toLowerCase().includes(term)
      );

      if (hasComplexLanguage) {
        return Response.json({
          safe: true,
          isCrisis: false,
          complexity: 'too_high',
          suggestion: 'Consider simplifying theological terminology for Level 1 believers. Use everyday language and relatable examples.',
          flaggedForReview: true
        });
      }
    }

    // If all checks pass
    return Response.json({
      safe: true,
      isCrisis: false,
      modifiedResponse: aiResponse,
      guardrailsApplied: false,
      userLevel: userSpiritualLevel
    });

  } catch (error) {
    console.error('Tutor Guardrails Error:', error);
    return Response.json(
      { error: 'Guardrails check failed', details: error.message },
      { status: 500 }
    );
  }
});