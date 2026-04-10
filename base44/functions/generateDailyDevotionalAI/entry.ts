import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verses, language = 'en' } = await req.json();

    if (!verses || verses.length === 0) {
      return Response.json({ error: 'No verses provided' }, { status: 400 });
    }

    // Format verses for AI context
    const verseContext = verses
      .map(v => `${v.reference}: "${v.text}"`)
      .join('\n\n');

    // Language-specific prompts
    const prompts = {
      en: `Based on these Bible verses the user read today, create a personalized daily devotional with:
1. A brief reflection on the themes (2-3 sentences)
2. A personalized prayer based on the content (3-4 sentences)
3. One actionable spiritual insight for today

Verses read today:
${verseContext}

Format as JSON with keys: "reflection", "prayer", "insight"`,

      om: `Aayaalee armaan gadii user jedhee guyyaa kanaa dubbise irraa, deggere guyyaa keessaa:
1. Keessuma mata-duree ilaalcha gabaabaa (2-3 sentensaa)
2. Kadhaa namni isarraa kan shallagamee (3-4 sentensaa)
3. Hubannoo amantaa tokko gayyaa kanaa irratti hojiin ta'u

Aayaalee guyyaa kanaa dubbisanii:
${verseContext}

JSON akka JSON deegga: "reflection", "prayer", "insight"`,

      am: `ዛሬ ተጠቃሚው የነበበው በእነዚህ የመጽሐፍ ቅዱስ ጥቅሶች መሰረት, የግል ዕለታዊ ጾመ ሃይማኖት ስር:
1. ስለ ርዕሶች ቅጭት (2-3 ዓረፍተ ነገር)
2. ስለ ሌሎቹ ግለሰቡ ሰላይ (3-4 ዓረፍተ ነገር)
3. አንድ የስዊህመት ሙከራ ዛሬ በዚህ ቀን

ዛሬ የተነበበ ጥቅስ:
${verseContext}

JSON ከ JSON ይልካ: "reflection", "prayer", "insight"`
    };

    const selectedPrompt = prompts[language] || prompts.en;

    // Call AI to generate devotional
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: selectedPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reflection: { type: 'string' },
          prayer: { type: 'string' },
          insight: { type: 'string' }
        }
      }
    });

    // Save to prayer journal
    const journalEntry = await base44.entities.PrayerJournalEntry.create({
      userEmail: user.email,
      verseReference: verses.map(v => v.reference).join(', '),
      noteContent: `📖 Today's Devotional\n\n🤔 Reflection:\n${response.reflection}\n\n🙏 Prayer:\n${response.prayer}\n\n💡 Insight:\n${response.insight}`,
      mood: 'peaceful',
      tags: ['daily-devotional', 'ai-generated'],
      isPrivate: true,
      isFavorite: false
    });

    return Response.json({
      devotional: {
        reflection: response.reflection,
        prayer: response.prayer,
        insight: response.insight
      },
      journalEntry: {
        id: journalEntry.id,
        savedAt: journalEntry.created_date
      }
    });
  } catch (error) {
    console.error('Error generating devotional:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});