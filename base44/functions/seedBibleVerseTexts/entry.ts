import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const VERSE_TEXTS = [
      // Philippians 4:13
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'en', text: 'I can do all things through Christ who strengthens me.' },
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'om', text: 'Isa na jabeessu Kristosiin waan hundumaa gochuu nan danda\'a.' },
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'am', text: 'በክርስቶስ በኩል ሁሉንም ነገር ማድረግ እችላለሁ ይህም ሃይል ነው።' },
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'ti', text: 'ሁሉ ነገር ግርማ ክርስቶስን ብእ ሳ ዘሚቡኡ ግበር።' },
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'sw', text: 'Naweza kufanya kila kitu kupitia Kristo anayenipa nguvu.' },
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'fr', text: 'Je puis tout par celui qui me fortifie, savoir Christ.' },
      { bookCode: 'PHP', chapter: 4, verse: 13, lang: 'ar', text: 'أستطيع كل شيء في المسيح الذي يقويني.' },

      // Psalm 23:1
      { bookCode: 'PSA', chapter: 23, verse: 1, lang: 'en', text: 'The Lord is my shepherd, I lack nothing.' },
      { bookCode: 'PSA', chapter: 23, verse: 1, lang: 'om', text: 'Waaqni timuuga koo. Waan tokko iyyuu hin fedhiin.' },
      { bookCode: 'PSA', chapter: 23, verse: 1, lang: 'am', text: 'ጌታ ገዳዩ ነው። ምንም ነገር የማይጸጨነኝ።' },
      { bookCode: 'PSA', chapter: 23, verse: 1, lang: 'sw', text: 'Mungu ni mcheza wangu. Sitajifuta kilicho chote.' },
      { bookCode: 'PSA', chapter: 23, verse: 1, lang: 'fr', text: 'L\'Éternel est mon berger; je ne manquerai de rien.' },

      // John 3:16
      { bookCode: 'JHN', chapter: 3, verse: 16, lang: 'en', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
      { bookCode: 'JHN', chapter: 3, verse: 16, lang: 'om', text: 'Waan Waaqni addunyaa jabeesse yoo ta\'u, isa ilma isaa kan tokkee ergifte.' },

      // Romans 8:28
      { bookCode: 'ROM', chapter: 8, verse: 28, lang: 'en', text: 'And we know that in all things God works for the good of those who love him.' },

      // Proverbs 3:5
      { bookCode: 'PRV', chapter: 3, verse: 5, lang: 'en', text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },

      // Matthew 6:33
      { bookCode: 'MTT', chapter: 6, verse: 33, lang: 'en', text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },

      // 1 Peter 5:7
      { bookCode: '1PE', chapter: 5, verse: 7, lang: 'en', text: 'Cast all your anxiety on him because he cares for you.' }
    ];

    let created = 0;

    for (const text of VERSE_TEXTS) {
      // Find the verse ref ID
      const verseRefs = await base44.entities.BibleVerseRefs.filter({
        bookCode: text.bookCode,
        chapter: text.chapter,
        verse: text.verse
      });

      if (!verseRefs || verseRefs.length === 0) continue;

      const verseRefId = verseRefs[0].id;

      // Check if text already exists
      const existing = await base44.entities.BibleVerseTexts.filter({
        verseRefId: verseRefId,
        languageCode: text.lang
      });

      if (!existing || existing.length === 0) {
        await base44.entities.BibleVerseTexts.create({
          verseRefId,
          languageCode: text.lang,
          verseText: text.text
        });
        created++;
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} Bible verse texts`,
      total: VERSE_TEXTS.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});