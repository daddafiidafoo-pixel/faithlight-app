/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const LANGUAGE_MAP = {
  en: "English",
  om: "Afaan Oromoo",
  am: "Amharic",
  ti: "Tigrinya",
  es: "Spanish",
  fr: "French",
  ar: "Arabic"
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const base44 = createClientFromRequest(req);

  try {
    const { text, reference, targetLanguage, verseId } = await req.json();

    if (!text || !reference || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, reference, targetLanguage' }),
        { status: 400 }
      );
    }

    const targetLanguageName = LANGUAGE_MAP[targetLanguage] || 'English';

    const prompt = `Translate this Bible verse into ${targetLanguageName}.
Keep the meaning reverent and natural for Christian readers.
Do not add commentary or explanation.
Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "text": "translated text here",
  "reference": "${reference}"
}

Verse to translate:
"${text}"
Reference: ${reference}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          text: { type: "string" },
          reference: { type: "string" }
        },
        required: ["text", "reference"]
      }
    });

    const translated = response;

    // Cache translation in database if verseId provided
    if (verseId) {
      try {
        const existingVerse = await base44.asServiceRole.entities.DailyVerse.filter(
          { id: verseId },
          undefined,
          1
        );

        if (existingVerse.length > 0) {
          const verse = existingVerse[0];
          const translations = verse.translations || {};
          translations[targetLanguage] = {
            text: translated.text,
            reference: translated.reference,
            isAutoTranslated: true
          };

          await base44.asServiceRole.entities.DailyVerse.update(verse.id, {
            translations
          });
        }
      } catch (dbError) {
        console.warn('Failed to cache translation:', dbError.message);
      }
    }

    return new Response(
      JSON.stringify({
        text: translated.text,
        reference: translated.reference,
        isAutoTranslated: true
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: 'Translation failed', details: error.message }),
      { status: 500 }
    );
  }
});