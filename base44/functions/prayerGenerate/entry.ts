import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { topic, language } = await req.json();
    if (!topic || !language) {
      return Response.json({ success: false, error: { code: "INVALID_INPUT", message: "Missing topic or language" } }, { status: 400 });
    }

    const systemPrompt = `You are the FaithLight Prayer Assistant.
Provide Christian prayer guidance that is compassionate, Scripture-aware, and pastorally gentle.
Never claim certainty about God's will. Do not shame the user.
If language is om, answer fully in Afaan Oromoo.
If language is en, answer fully in English.
Return a meaningful personal prayer the user can pray.`;

    // Generate prayer based on language
    const prayer = language === "om"
      ? `Yaa Waaqayyo, mata-duree kana irratti si kadhanna: ${topic}. Garaa keenya jabeessi, nu qajeelchi, nagaa fi abdii kee nuu kenni. Maqaa Yesuusiin, Ameen.`
      : `Dear God, I bring this topic before You: ${topic}. Strengthen my heart, guide my steps, and fill me with Your peace and hope. In Jesus' name, Amen.`;

    return Response.json({ success: true, data: { prayer, systemPromptUsed: systemPrompt } });
  } catch (error) {
    console.error('Prayer generation error:', error);
    return Response.json({ success: false, error: { code: "PRAYER_GENERATION_FAILED", message: "Could not generate prayer right now" } }, { status: 500 });
  }
});