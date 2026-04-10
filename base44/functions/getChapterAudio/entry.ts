import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OT_BOOKS = new Set([
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT',
  '1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH',
  'EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
  'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON',
  'MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
]);

// Non-Oromo languages: simple NT/OT fileset map
const STANDARD_FILESETS = {
  en: { nt: 'ENGKJVN2DA', ot: 'ENGKJVO2DA' },
  am: { nt: 'AMHEVGN2DA', ot: 'AMHEVGO2DA' },
  sw: { nt: 'SWAKJVN1DA', ot: 'SWAKJVO1DA' },
  ti: { nt: 'TIGKJVN1DA', ot: 'TIGKJVO1DA' },
};

// Full Oromo candidate chains
function getOromotCandidates(selectedLanguage, isOT) {
  const isEastern = selectedLanguage === 'hae' || selectedLanguage === 'om_eastern';

  if (isEastern) {
    if (isOT) {
      // HAE has no OT — go straight to GAZ
      return [
        { languageCode: 'gaz', filesetId: 'GAZBIBO1DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: true },
        { languageCode: 'gaz', filesetId: 'GAZBSEO1DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: true },
      ];
    }
    return [
      { languageCode: 'hae', filesetId: 'HAEBSEN2DA', label: 'Afaan Oromoo (Bahaa)',               isFallback: false },
      { languageCode: 'hae', filesetId: 'HAEBSEN2SA', label: 'Afaan Oromoo (Bahaa)',               isFallback: false },
      { languageCode: 'gaz', filesetId: 'GAZBIBN1DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: true  },
      { languageCode: 'gaz', filesetId: 'GAZBSEN2DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: true  },
    ];
  }

  // West Central / gaz / om
  if (isOT) {
    return [
      { languageCode: 'gaz', filesetId: 'GAZBIBO1DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: false },
      { languageCode: 'gaz', filesetId: 'GAZBSEO1DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: true  },
    ];
  }
  return [
    { languageCode: 'gaz', filesetId: 'GAZBIBN1DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: false },
    { languageCode: 'gaz', filesetId: 'GAZBSEN2DA', label: 'Afaan Oromoo (Lixaa Giddugaleessa)', isFallback: true  },
    { languageCode: 'hae', filesetId: 'HAEBSEN2DA', label: 'Afaan Oromoo (Bahaa)',               isFallback: true  },
    { languageCode: 'hae', filesetId: 'HAEBSEN2SA', label: 'Afaan Oromoo (Bahaa)',               isFallback: true  },
  ];
}

async function fetchAudioPath(filesetId, bookUpper, chapterNum, apiKey) {
  const url = `https://4.dbt.io/api/bibles/filesets/${filesetId}/${bookUpper}/${chapterNum}?v=4&key=${apiKey}`;
  console.log(`Trying fileset: ${filesetId} for ${bookUpper} ${chapterNum}`);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    console.warn(`Bible Brain ${res.status} for ${filesetId}`);
    return null;
  }
  const data = await res.json();
  return data?.data?.[0]?.path || null;
}

Deno.serve(async (req) => {
  try {
    const { bookCode, chapter, language = 'en' } = await req.json();

    if (!bookCode || !chapter) {
      return Response.json({ error: 'Missing bookCode or chapter' }, { status: 400 });
    }

    const apiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Audio service not configured' }, { status: 503 });
    }

    const bookUpper = bookCode.toUpperCase();
    const chapterNum = parseInt(chapter, 10);
    const isOT = OT_BOOKS.has(bookUpper);
    const isOromo = ['hae', 'om_eastern', 'gaz', 'om_west_central', 'om'].includes(language);

    // ── Oromo: coverage-first fallback chain ──
    if (isOromo) {
      const candidates = getOromotCandidates(language, isOT);

      for (const candidate of candidates) {
        const path = await fetchAudioPath(candidate.filesetId, bookUpper, chapterNum, apiKey);
        if (path) {
          console.log(`Audio resolved: ${candidate.filesetId} (fallback=${candidate.isFallback}) → ${path}`);
          return Response.json({
            url: path,
            bookCode: bookUpper,
            chapter: chapterNum,
            requestedLanguage: language,
            actualLanguage: candidate.languageCode,
            filesetId: candidate.filesetId,
            fallbackUsed: candidate.isFallback,
            fallbackNotice: candidate.isFallback
              ? {
                  en: `Audio for this section is playing from ${candidate.label}.`,
                  om: `Sagaleen kutaa kanaa irraa ${candidate.label} irraa taphatamaa jira.`,
                }
              : null,
          });
        }
      }

      console.warn(`No Oromo audio found for ${bookUpper} ${chapterNum} (language=${language})`);
      return Response.json({ error: 'No audio available for this chapter' }, { status: 404 });
    }

    // ── Standard languages ──
    const filesets = STANDARD_FILESETS[language] || STANDARD_FILESETS['en'];
    const filesetId = isOT ? filesets.ot : filesets.nt;

    if (!filesetId) {
      return Response.json({ error: 'No audio available for this chapter' }, { status: 404 });
    }

    const path = await fetchAudioPath(filesetId, bookUpper, chapterNum, apiKey);
    if (!path) {
      return Response.json({ error: 'No audio available for this chapter' }, { status: 404 });
    }

    console.log(`Audio OK: ${path}`);
    return Response.json({
      url: path,
      bookCode: bookUpper,
      chapter: chapterNum,
      requestedLanguage: language,
      actualLanguage: language,
      filesetId,
      fallbackUsed: false,
      fallbackNotice: null,
    });

  } catch (err) {
    console.error('getChapterAudio error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});