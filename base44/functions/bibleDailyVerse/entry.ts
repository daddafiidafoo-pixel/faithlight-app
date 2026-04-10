import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const FALLBACK_VERSES = {
  en: { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.', theme: 'Strength' },
  om: { ref: 'Filiphisiyus 4:13', text: 'Isa na jabeessu Kristosiin waan hundumaa gochuu nan danda\'a.', theme: 'Humna' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const lang = body.lang || body.languageCode || 'en';

    const today = new Date().toISOString().slice(0, 10);
    let fallbackLanguage = null;

    // Step 1: Get today's verse reference
    const schedules = await base44.entities.DailyVerseSchedule.filter({
      scheduleDate: today
    });

    if (!schedules || schedules.length === 0) {
      const fallback = FALLBACK_VERSES[lang] || FALLBACK_VERSES.en;
      return Response.json({
        success: true,
        data: {
          reference: fallback.ref,
          text: fallback.text,
          theme: fallback.theme,
          language: lang
        },
        fallbackLanguage: 'built-in'
      });
    }

    const schedule = schedules[0];

    // Step 2: Get verse reference details
    const verseRefs = await base44.entities.BibleVerseRefs.filter({
      id: schedule.verseRefId
    });

    if (!verseRefs || verseRefs.length === 0) {
      const fallback = FALLBACK_VERSES[lang] || FALLBACK_VERSES.en;
      return Response.json({
        success: true,
        data: {
          reference: fallback.ref,
          text: fallback.text,
          theme: fallback.theme,
          language: lang
        },
        fallbackLanguage: 'built-in'
      });
    }

    const verseRef = verseRefs[0];

    // Step 3: Try to fetch verse text in requested language
    let verseTexts = await base44.entities.BibleVerseTexts.filter({
      verseRefId: schedule.verseRefId,
      languageCode: lang
    });

    if (!verseTexts || verseTexts.length === 0) {
      // Step 4: Fallback to English if not found
      if (lang !== 'en') {
        verseTexts = await base44.entities.BibleVerseTexts.filter({
          verseRefId: schedule.verseRefId,
          languageCode: 'en'
        });
        fallbackLanguage = 'en';
      }
    }

    // Step 5: Get book name in requested language
    let bookNames = await base44.entities.BibleBookNames.filter({
      bookCode: verseRef.bookCode,
      languageCode: lang
    });

    if (!bookNames || bookNames.length === 0) {
      // Fallback to English book name
      bookNames = await base44.entities.BibleBookNames.filter({
        bookCode: verseRef.bookCode,
        languageCode: 'en'
      });
    }

    const bookName = bookNames && bookNames.length > 0 ? bookNames[0].name : verseRef.bookCode;
    const reference = `${bookName} ${verseRef.chapter}:${verseRef.verse}`;

    if (!verseTexts || verseTexts.length === 0) {
      // Last resort: use hardcoded fallback
      const fallback = FALLBACK_VERSES[lang] || FALLBACK_VERSES.en;
      return Response.json({
        success: true,
        data: {
          reference: fallback.ref,
          text: fallback.text,
          theme: schedule.theme || 'Daily Reflection',
          language: fallbackLanguage || lang
        },
        fallbackLanguage: 'built-in'
      });
    }

    return Response.json({
      success: true,
      data: {
        reference,
        text: verseTexts[0].verseText,
        theme: schedule.theme || 'Daily Reflection',
        language: fallbackLanguage ? 'en' : lang
      },
      fallbackLanguage: fallbackLanguage
    });
  } catch (error) {
    console.error('Daily verse error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});