import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verseReference, verseText, userLanguage = 'en' } = await req.json();

    if (!verseReference || !verseText) {
      return Response.json({ error: 'Missing verse data' }, { status: 400 });
    }

    const langMap = {
      en: 'English',
      om: 'Afaan Oromoo',
      sw: 'Swahili',
      ar: 'Arabic',
      fr: 'French',
      am: 'Amharic',
      ti: 'Tigrinya'
    };

    const lang = langMap[userLanguage] || 'English';

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a short (2-3 sentences), inspiring daily reflection for this Bible verse. Make it personal and applicable to daily Christian life. The user prefers ${lang}.\n\nVerse: ${verseReference}\n"${verseText}"`,
      model: 'gemini_3_flash'
    });

    return Response.json({ 
      aiReflection: response,
      verseReference,
      verseText
    });
  } catch (error) {
    console.error('Daily digest generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});