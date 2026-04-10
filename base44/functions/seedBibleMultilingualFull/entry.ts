import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Sample verses for each language — distributed across different books
    const sampleVerses = [
      // English - Genesis 1:1-2, Psalms 25:1-2, John 3:16
      { language_code: 'en', book_id: 'GEN', book_name: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heavens and the earth.', reference: 'Genesis 1:1' },
      { language_code: 'en', book_id: 'GEN', book_name: 'Genesis', chapter: 1, verse: 2, text: 'And the earth was formless and empty, and darkness covered the deep waters. And the Spirit of God was hovering over the surface of the waters.', reference: 'Genesis 1:2' },
      { language_code: 'en', book_id: 'PSA', book_name: 'Psalms', chapter: 25, verse: 1, text: 'To you, O Lord, I lift up my soul.', reference: 'Psalms 25:1' },
      { language_code: 'en', book_id: 'PSA', book_name: 'Psalms', chapter: 25, verse: 2, text: 'I trust in you, my God! Do not let me be disgraced, or let my enemies rejoice in my defeat.', reference: 'Psalms 25:2' },
      { language_code: 'en', book_id: 'JHN', book_name: 'John', chapter: 3, verse: 16, text: 'For God loved the world so much that he gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.', reference: 'John 3:16' },

      // Afaan Oromoo - Genesis 1:1-2, Psalms 25:1-2
      { language_code: 'om', book_id: 'GEN', book_name: 'Umuma', chapter: 1, verse: 1, text: 'Jalqabaan Waaqni samii fi lafaa uume.', reference: 'Umuma 1:1' },
      { language_code: 'om', book_id: 'GEN', book_name: 'Umuma', chapter: 1, verse: 2, text: 'Lafaan immoo waantoota waanaa ture, jiidha fi dullina isaa facaasa ture; hafuura Waaqaa garuu bishaanii irra firiira ture.', reference: 'Umuma 1:2' },
      { language_code: 'om', book_id: 'PSA', book_name: 'Faarfannaa', chapter: 25, verse: 1, text: 'Yaa Waaqayyoo, ani lubbuu koo sitti ol nan qaba.', reference: 'Faarfannaa 25:1' },
      { language_code: 'om', book_id: 'PSA', book_name: 'Faarfannaa', chapter: 25, verse: 2, text: 'Yaa Waaqaa koo, ani ammoo sinitti abdii nan qaba; akka ani na qaanaaf dhiibuudhaan cunqurfatun hin taʼin.', reference: 'Faarfannaa 25:2' },

      // Amharic - Genesis 1:1-2, Psalms 25:1-2
      { language_code: 'am', book_id: 'GEN', book_name: 'ተgenesis', chapter: 1, verse: 1, text: 'ታላቁ ርዕይት ግደይ፣ ሰማይና ምድር ነበር።', reference: 'ተGenesis 1:1' },
      { language_code: 'am', book_id: 'GEN', book_name: 'ተGenesis', chapter: 1, verse: 2, text: 'ምድር ዳዮች አልሞላት ሲሆን ጨለማ በከፊል ውሎ ነበር። የሙት ብርሃን ከገጾች ላይ ነበር።', reference: 'ተGenesis 1:2' },
      { language_code: 'am', book_id: 'PSA', book_name: 'መዝሙረ ዳዊት', chapter: 25, verse: 1, text: 'አቤቱ፥ ነፍሴን ወደ አንተ አነሣለሁ።', reference: 'መዝሙረ ዳዊት 25:1' },
      { language_code: 'am', book_id: 'PSA', book_name: 'መዝሙረ ዳዊት', chapter: 25, verse: 2, text: 'አንተ እግዚአብሔር ስለዚህ ምልካሟ ወደ ላይ አመርጋለሁ።', reference: 'መዝሙረ ዳዊት 25:2' },

      // Swahili - Genesis 1:1-2, Psalms 25:1-2
      { language_code: 'sw', book_id: 'GEN', book_name: 'Mwanzo', chapter: 1, verse: 1, text: 'Mwanzoni Mungu akaumbua mbingu na dunia.', reference: 'Mwanzo 1:1' },
      { language_code: 'sw', book_id: 'GEN', book_name: 'Mwanzo', chapter: 1, verse: 2, text: 'Na dunia ilikuwa isiyoumbwa na tupu, na giza lilikuwa juu ya kina cha maji; na Roho ya Mungu ilikuwa ikiingia juu ya uso wa maji.', reference: 'Mwanzo 1:2' },
      { language_code: 'sw', book_id: 'PSA', book_name: 'Zaburi', chapter: 25, verse: 1, text: 'Ee Bwana, nalifanya moyo wangu kwako.', reference: 'Zaburi 25:1' },
      { language_code: 'sw', book_id: 'PSA', book_name: 'Zaburi', chapter: 25, verse: 2, text: 'Ee Mungu wangu, naninuamini kwako, jihadhari nisije nikasiwa kwa aibu.', reference: 'Zaburi 25:2' },

      // French - Genesis 1:1-2, Psalms 25:1-2
      { language_code: 'fr', book_id: 'GEN', book_name: 'Genèse', chapter: 1, verse: 1, text: 'Au commencement, Dieu créa le ciel et la terre.', reference: 'Genèse 1:1' },
      { language_code: 'fr', book_id: 'GEN', book_name: 'Genèse', chapter: 1, verse: 2, text: 'La terre était informe et déserte, les ténèbres couvraient l\'abîme, et le souffle de Dieu se mouvait au-dessus des eaux.', reference: 'Genèse 1:2' },
      { language_code: 'fr', book_id: 'PSA', book_name: 'Psaume', chapter: 25, verse: 1, text: 'Vers toi, Éternel, j\'élève mon âme.', reference: 'Psaume 25:1' },
      { language_code: 'fr', book_id: 'PSA', book_name: 'Psaume', chapter: 25, verse: 2, text: 'Mon Dieu, j\'ai confiance en toi; que je ne sois pas confus, que mes ennemis ne se réjouissent pas sur moi.', reference: 'Psaume 25:2' },

      // Tigrinya - Genesis 1:1-2, Psalms 25:1-2
      { language_code: 'ti', book_id: 'GEN', book_name: 'መዝሞር', chapter: 1, verse: 1, text: 'ናይ መወዲእ ምስ ኣብ ሳማይ ከምኡ ድማ ምስ ምድሪ ሰርኣት።', reference: 'መዝሞር 1:1' },
      { language_code: 'ti', book_id: 'GEN', book_name: 'መዝሞር', chapter: 1, verse: 2, text: 'ምድሪ እንተ ሰጥየት ኣተወተትና ጫጫ ብላ ተመሊሳ ነይሮ።', reference: 'መዝሞር 1:2' },
      { language_code: 'ti', book_id: 'PSA', book_name: 'መዝሞር ዳዊት', chapter: 25, verse: 1, text: 'መንፊስ ናተይ ናትካ ሻተግ።', reference: 'መዝሞር ዳዊት 25:1' },
      { language_code: 'ti', book_id: 'PSA', book_name: 'መዝሞር ዳዊት', chapter: 25, verse: 2, text: 'ወለዲ ስዩመ ተአምንት ኣብካ።', reference: 'መዝሞር ዳዊት 25:2' },

      // Arabic - Genesis 1:1-2, Psalms 25:1-2
      { language_code: 'ar', book_id: 'GEN', book_name: 'تكوين', chapter: 1, verse: 1, text: 'في البدء خلق الله السموات والأرض.', reference: 'تكوين 1:1' },
      { language_code: 'ar', book_id: 'GEN', book_name: 'تكوين', chapter: 1, verse: 2, text: 'وكانت الأرض خراباً وخالية، وعلى وجه الغمر ظلمة، وروح الله يرف على وجه المياه.', reference: 'تكوين 1:2' },
      { language_code: 'ar', book_id: 'PSA', book_name: 'المزامير', chapter: 25, verse: 1, text: 'إليك يا رب أرفع نفسي.', reference: 'المزامير 25:1' },
      { language_code: 'ar', book_id: 'PSA', book_name: 'المزامير', chapter: 25, verse: 2, text: 'إلهي عليك توكلت فلا تخزني. لا يشمت بي أعدائي.', reference: 'المزامير 25:2' },
    ];

    // Create verses in the database
    const result = await base44.asServiceRole.entities.BibleVerseText.bulkCreate(sampleVerses);
    
    return Response.json({
      success: true,
      message: 'Seeded multilingual Bible verses',
      created: result.length,
      languages: ['en', 'om', 'am', 'sw', 'fr', 'ti', 'ar'],
      books: ['Genesis', 'Psalms'],
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});