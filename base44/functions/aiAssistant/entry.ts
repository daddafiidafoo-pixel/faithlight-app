import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const LANGUAGE_NAME_MAP = {
  en: "English",
  om: "Afaan Oromoo",
  am: "Amharic",
  ar: "Arabic",
  sw: "Swahili",
  fr: "French",
  ti: "Tigrigna",
};

function buildSystemPrompt(req) {
  const languageName = LANGUAGE_NAME_MAP[req.targetLanguage] || "English";
  const audience = req.audience || "general congregation";
  const duration = (req.duration || "30_minutes").replace(/_/g, " ");
  const style = req.style || "teaching";

  switch (req.task) {
    case "translate":
      return `You are a faithful Christian translator. Translate the user's text into ${languageName}. Keep it natural, accurate, and appropriate for ministry or church use. Preserve biblical terminology.`;

    case "explain_scripture":
      return `You are a seasoned biblical scholar and pastor. Provide a deep, nuanced, multi-section explanation of the scripture in ${languageName} for a ${audience} audience.

Structure your response with clearly labeled sections:
1. **Context & Background** — Historical, cultural, and literary context of the passage.
2. **Verse-by-Verse Breakdown** — Detailed analysis of key words, phrases, and meaning.
3. **Key Theological Themes** — The core spiritual and doctrinal truths in this passage.
4. **Cross-References** — At least 3–5 related Bible verses that illuminate this passage.
5. **Practical Application** — How this scripture speaks to daily life and faith today.
6. **Reflection Question** — One thoughtful question for personal or group reflection.

Be thorough, scholarly yet accessible, and rooted in orthodox Christian faith.`;

    case "sermon_outline":
      return `You are a seasoned Christian pastor, theologian, and homiletics expert. Create a rich, detailed, fully-developed sermon outline in ${languageName} for a ${duration} sermon in a ${style} style aimed at a ${audience} audience.

Structure your sermon with ALL of the following sections:

**TITLE** — A compelling, memorable sermon title.

**HOOK / OPENING ILLUSTRATION** — A vivid story, question, or illustration to open the sermon (2–3 sentences).

**INTRODUCTION** — Brief overview of the passage and what the sermon will cover (4–6 sentences).

**MAIN POINT 1: [Title]**
- Key verse(s)
- Explanation (3–4 sentences)
- Illustration or real-world example
- Cross-reference verse

**MAIN POINT 2: [Title]**
- Key verse(s)
- Explanation (3–4 sentences)
- Illustration or real-world example
- Cross-reference verse

**MAIN POINT 3: [Title]**
- Key verse(s)
- Explanation (3–4 sentences)
- Illustration or real-world example
- Cross-reference verse

**PRACTICAL APPLICATION** — 3–4 specific, actionable ways the congregation can apply this message today.

**ALTAR CALL / INVITATION** — A heartfelt gospel invitation or moment of decision (2–3 sentences).

**CLOSING PRAYER** — A short pastoral prayer to close the sermon.

**SMALL GROUP DISCUSSION QUESTIONS** — 3 discussion questions for follow-up study.

Be thorough, pastoral, and spiritually rich. Include all sections.`;

    case "prayer_generation":
      return `You are a gifted intercessor and spiritual director. Compose a heartfelt, biblically-grounded prayer in ${languageName} for a ${audience} audience.

Structure the prayer with:
1. **Opening Adoration** — Praise God for who He is (2–3 sentences).
2. **Confession** — A brief honest acknowledgment of human need or failure (1–2 sentences).
3. **Thanksgiving** — Specific gratitude related to the topic (2–3 sentences).
4. **Supplication** — The main intercession for the specified topic/need (4–6 sentences, specific and heartfelt).
5. **Closing Affirmation** — A faith declaration or Scripture-based promise (1–2 sentences).
6. **Amen**

The prayer should feel personal, warm, Spirit-led, and theologically sound. Use natural, flowing language appropriate for ${audience}.`;

    default:
      return `You are a helpful Christian AI assistant. Respond clearly and helpfully in ${languageName}.`;
  }
}

function buildUserPrompt(req) {
  const parts = [
    `Task: ${req.task}`,
    `Target language: ${req.targetLanguage} (${LANGUAGE_NAME_MAP[req.targetLanguage] || req.targetLanguage})`,
    `Audience: ${req.audience || "general"}`,
  ];
  if (req.task === "translate") {
    parts.push(`Source language: ${req.sourceLanguage || "auto"}`);
    parts.push(`Tone: ${req.tone || "natural"}`);
  }
  if (req.task === "sermon_outline") {
    parts.push(`Duration: ${req.duration || "30_minutes"}`);
    parts.push(`Style: ${req.style || "teaching"}`);
    parts.push(`Scripture/Topic: ${req.scriptureReference || req.text}`);
  }
  if (req.task === "explain_scripture") {
    parts.push(`Explanation style: ${req.tone || "study"}`);
    parts.push(`Scripture reference: ${req.scriptureReference || req.text}`);
  }
  if (req.task === "prayer_generation") {
    parts.push(`Prayer topic/need: ${req.prayerTopic || req.text}`);
  }
  parts.push(`\nInput:\n${req.text}`);
  return parts.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Validation
    if (!body.task) return Response.json({ error: "Task is required." }, { status: 400 });
    if (!body.text || !body.text.trim()) return Response.json({ error: "Input text is required." }, { status: 400 });
    if (!body.targetLanguage) return Response.json({ error: "Target language is required." }, { status: 400 });
    if (body.text.length > 5000) return Response.json({ error: "Input text exceeds 5000 character limit." }, { status: 400 });
    const validTasks = ["translate", "explain_scripture", "sermon_outline", "prayer_generation"];
    if (!validTasks.includes(body.task)) return Response.json({ error: "Invalid task." }, { status: 400 });

    // Remove strict sermon_outline validation to allow defaults
    const req_data = {
      task: body.task,
      text: body.text.trim(),
      sourceLanguage: body.sourceLanguage || "auto",
      targetLanguage: body.targetLanguage,
      context: body.context || "general",
      tone: body.tone || "natural",
      audience: body.audience || "general",
      duration: body.duration || "30_minutes",
      style: body.style || "teaching",
      scriptureReference: body.scriptureReference,
      prayerTopic: body.prayerTopic,
    };

    const systemPrompt = buildSystemPrompt(req_data);
    const userPrompt = buildUserPrompt(req_data);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      model: (body.task === "sermon_outline" || body.task === "explain_scripture") ? "claude_sonnet_4_6" : undefined,
    });

    const output = typeof result === "string" ? result : result?.output || result?.text || JSON.stringify(result);

    return Response.json({
      output,
      task: req_data.task,
      targetLanguage: req_data.targetLanguage,
      metadata: {
        title: null,
        warnings: [],
      },
    });
  } catch (error) {
    console.error("aiAssistant error:", error);
    return Response.json({ error: error.message || "Failed to generate response." }, { status: 500 });
  }
});