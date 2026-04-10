import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language = 'en' } = await req.json();

    // Fetch all prayer journal entries for this user
    const entries = await base44.entities.PrayerJournalEntry.filter({
      userEmail: user.email,
    });

    if (entries.length === 0) {
      return Response.json({
        success: false,
        message: 'No entries found',
      });
    }

    // Prepare entries text
    const entriesText = entries
      .map((e) => `${e.title} (${e.mood}): ${e.content}`)
      .join('\n\n');

    const systemPrompts = {
      en: `You are a compassionate spiritual counselor. Write a warm, encouraging summary of someone's spiritual journey based on their prayer journal entries. Focus on:
- Growth and themes in their faith
- Emotional patterns and how they're seeking God
- Encouragement and affirmation
- Gentle insights about their spiritual development

Keep the tone personal, uplifting, and spiritually mature. Write in 2-3 paragraphs.`,

      om: `Ati gargaaraa amantii kan jaalala qaba. Seenaa amantii nama kan jiidha barreessaa. Waan adda addaa jecha:
- Guddinaa amantii
- Akkaataa isaan Waaqayyoon barbaaduu
- Midhaa fi abbaa gaariin
- Hubannoo amantii

Seenaa salphinaa fi midhaa barreessi. Paragraphoota 2-3 barreessi.`,

      am: `አንተ ደህንነተ ስሪት ምጣሴ ነዎ። ሰላም ሰላም ጻፊ። ይምረጡ፡
- የእምነት እድገት
- በእግዚአብሔር መፈለግ
- ተስፋ እና ክብር
- ምናልባትም ጠብ

ወደ ተስፋ እና ተስፋ ይጻፉ። 2-3 አንቀጾች።`,
    };

    const prompt = `${systemPrompts[language] || systemPrompts.en}

Prayer Journal Entries:
${entriesText}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
    });

    return Response.json({
      success: true,
      summary: response,
      entryCount: entries.length,
    });
  } catch (error) {
    console.error('Prayer journal summary error:', error);
    return Response.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    );
  }
});