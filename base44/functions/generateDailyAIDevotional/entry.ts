import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const OROMO_MASTER_PROMPT = `
You are writing Christian devotional content in clear, natural Oromo for Ethiopian believers.

Rules:
- Use simple, respectful, natural Oromo.
- Do not mix English words into Oromo.
- Do not translate word-for-word from English.
- Use these exact terms consistently:
  God = Waaqayyoo
  Jesus Christ = Yesus Kiristoos
  Holy Spirit = Hafuura Qulqulluu
  Bible verse = Caqasa Macaafa Qulqulluu
  Grace = Ayyaana
  Faith = Amantii
  Salvation = Fayyina
  Explanation = Ibsa
  Reflection = Yaada keessaa
  Prayer = Kadhannaa

Always return content structured as:
- title: short Oromo title
- explanation: starts with "Ibsa" content
- reflection_question: starts with "Yaada keessaa" content
- prayer: starts with "Kadhannaa" content
- share_text: short Oromo sharing text
`;

function isWeakOromo(text) {
  if (!text || typeof text !== 'string') return true;
  const banned = ['Reflection', 'Prayer', 'grace', '(grace)', '(faith)', 'Explanation', 'Bible Verse', 'Bible verse'];
  if (banned.some(item => text.includes(item))) return true;
  if (/\b(grace|reflection|prayer|salvation|worship|blessing|forgiveness|mercy|faith|scripture)\b/i.test(text)) return true;
  if (/[A-Za-z]{3,}\s*\(/.test(text)) return true;
  if (/([A-Za-z]+ ){5,}/.test(text)) return true;
  return false;
}

// Sample verses to rotate through
const VERSES = [
  { ref: 'Philippians 4:6', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
];

const THEMES = ['peace', 'hope', 'trust', 'prayer', 'strength', 'wisdom', 'grace', 'faith', 'love', 'encouragement'];

function getVerseForDate(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  return VERSES[dayOfYear % VERSES.length];
}

function getThemeForDate(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  return THEMES[dayOfYear % THEMES.length];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { date, language = 'en' } = await req.json();

    console.log(`[generateDailyAIDevotional] date=${date} lang=${language}`);

    // Parse date
    const devotionDate = new Date(date);
    const dateStr = devotionDate.toISOString().split('T')[0];

    // Check if devotion already exists (language-keyed cache)
    const cacheDate = language !== 'en' ? `${dateStr}_${language}` : dateStr;
    const existing = await base44.asServiceRole.entities.DailyAIDevotional.filter({ date: cacheDate });
    if (existing.length > 0) {
      console.log(`[generateDailyAIDevotional] devotion already exists for ${cacheDate}`);
      return Response.json({ success: true, devotion: existing[0] });
    }

    // Get verse and theme for this date
    const verse = getVerseForDate(devotionDate);
    const theme = getThemeForDate(devotionDate);

    const devotionalSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        explanation: { type: 'string' },
        reflection_question: { type: 'string' },
        prayer: { type: 'string' },
        share_text: { type: 'string' },
      },
      required: ['title', 'explanation', 'reflection_question', 'prayer', 'share_text'],
    };

    const englishPrompt = `Create a short daily Christian devotion based on this Bible verse.

Verse reference: ${verse.ref}
Verse text: ${verse.text}

Return JSON with keys: title, explanation, reflection_question, prayer, share_text.
- Explanation: 2-4 sentences, warm and encouraging.
- Reflection question: 1 sentence starting with "What" or "How".
- Prayer: 1-3 sentences.
- Share text: under 100 chars.`;

    // Step 1: Generate English base
    const englishBase = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: englishPrompt,
      response_json_schema: devotionalSchema,
    });

    let aiResponse = englishBase;

    // Step 2: For Oromo — translate with master prompt, fallback to English if weak
    if (language === 'om') {
      const oromoPrompt = `${OROMO_MASTER_PROMPT}

Create a daily devotion from this meaning (do NOT translate word-for-word):
${JSON.stringify(englishBase, null, 2)}`;

      const oromoResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: oromoPrompt,
        response_json_schema: devotionalSchema,
      });

      const weak = isWeakOromo(oromoResponse.explanation) || isWeakOromo(oromoResponse.prayer);
      if (weak) {
        console.warn('[generateDailyAIDevotional] Oromo quality check failed — using English fallback');
      } else {
        aiResponse = oromoResponse;
      }
    }

    // Save devotion (keyed by date + language)
    const devotion = await base44.asServiceRole.entities.DailyAIDevotional.create({
      date: cacheDate,
      verseReference: verse.ref,
      verseText: verse.text,
      title: aiResponse.title,
      explanation: aiResponse.explanation,
      reflectionQuestion: aiResponse.reflection_question,
      prayer: aiResponse.prayer,
      theme,
      shareText: aiResponse.share_text,
      isPublished: true,
    });

    console.log(`[generateDailyAIDevotional] success: ${dateStr}`);

    return Response.json({
      success: true,
      devotion,
    });
  } catch (error) {
    console.error('[generateDailyAIDevotional] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});