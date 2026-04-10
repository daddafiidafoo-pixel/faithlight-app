import { base44 } from '@/api/base44Client';

// Fallback verses in case database is empty
const FALLBACK_VERSES = [
  {
    id: "jer-29-11",
    reference: "Jeremiah 29:11",
    translations: {
      en: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
      om: "Ani karoora isin irratti qabu nan beeka, jedhu Waaqayyo; karoora nagaa isiniif kennuuf malee badii miti, abdii fi mootummaa gara fuulduraa isiniif kennuuf.",
      am: "እኔ ለእናንተ ያሰብሁትን አሳብ አውቃለሁ፤ ይላል ጌታ፤ የሰላም አሳብ እንጂ የክፉ አይደለም፥ ተስፋና ወደፊት ለመስጠት።",
      es: "Porque yo sé los planes que tengo para ustedes, declara el Señor, planes de bienestar y no de calamidad, para darles un futuro y una esperanza.",
      fr: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
      ar: "لأني عرفت الأفكار التي أنا مفتكر بها عنكم، يقول الرب، أفكار سلام لا شر، لأعطيكم آخرة ورجاء."
    }
  },
  {
    id: "ps-23-1",
    reference: "Psalm 23:1",
    translations: {
      en: "The LORD is my shepherd, I lack nothing.",
      om: "Waaqayyo midhaan koo dha; waan kamuu na gaafattu hin qabu.",
      am: "ጌታ ዘብአን ነው፣ ምንም ነገር አልነፃ አልሆንም።",
      es: "El Señor es mi pastor, nada me falta.",
      fr: "L'Éternel est mon berger: je ne manquerai de rien.",
      ar: "الرب راعي فلا ينقصني شيء."
    }
  },
  {
    id: "rom-8-28",
    reference: "Romans 8:28",
    translations: {
      en: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      om: "Warra Waaqayyoon jaallatan hundumaaf Waaqayyo wantoota hundumaa keessatti gaarii isaanii irratti hojjechuu isaa ni beekna.",
      am: "እግዚአብሔርን ለሚወዱት ሁሉ ነገር ለበጎ እንደሚሰራ እናውቃለን።",
      es: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.",
      fr: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu.",
      ar: "ونحن نعلم أن الله يعمل جميع الأشياء معا لخير الذين يحبونه."
    }
  }
];

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function fetchDailyVerse(language = 'en') {
  try {
    const today = getTodayDateString();
    
    // Query for today's verse assignment
    const results = await base44.entities.DailyVerseAssignment.filter(
      { date: today },
      undefined,
      1
    );

    if (results.length > 0) {
      const assignment = results[0];
      return {
        id: assignment.verseId,
        reference: assignment.reference,
        text: assignment.translations?.[language] || assignment.translations?.en || '',
        date: today
      };
    }

    // Fallback: use day-of-year rotation
    const startOfYear = new Date(today.split('-')[0], 0, 0);
    const diff = new Date(today).getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const fallbackVerse = FALLBACK_VERSES[dayOfYear % FALLBACK_VERSES.length];
    return {
      id: fallbackVerse.id,
      reference: fallbackVerse.reference,
      text: fallbackVerse.translations[language] || fallbackVerse.translations.en,
      date: today
    };
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    
    // Ultimate fallback
    const fallbackVerse = FALLBACK_VERSES[0];
    return {
      id: fallbackVerse.id,
      reference: fallbackVerse.reference,
      text: fallbackVerse.translations[language] || fallbackVerse.translations.en,
      date: getTodayDateString()
    };
  }
}