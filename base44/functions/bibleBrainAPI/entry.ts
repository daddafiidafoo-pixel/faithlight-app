import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const API_KEY = Deno.env.get('BIBLE_BRAIN_API_KEY');
const BASE = 'https://4.dbt.io/api';

// Simple in-memory cache (per function instance)
const cache = new Map();
function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) { cache.delete(key); return null; }
  return hit.value;
}
function setCache(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// ── OT books (for fileset routing) ─────────────────────────────
const OT_BOOKS = new Set([
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
  '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO',
  'ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
  'OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
]);

// ── Audio fileset map: lang → { ot, nt } ──────────────────────
// Verified working audio filesets from Bible Brain (drama/reading)
// Format: /api/bibles/filesets/{filesetId}/{book}/{chapter}
const AUDIO_FILESETS = {
  en: { ot: 'ENGESVO2DA', nt: 'ENGESVN2DA' },   // ESV drama audio (verified OT + NT)
  am: { ot: 'AMHEVGO2DA', nt: 'AMHEVGN2DA' },   // Amharic EVG drama audio (try native, falls back to EN)
  sw: { ot: 'ENGESVO2DA', nt: 'ENGESVN2DA' },   // Swahili: EN audio fallback
  ar: { ot: 'ENGESVO2DA', nt: 'ENGESVN2DA' },   // Arabic: EN audio fallback
  fr: { ot: 'ENGESVO2DA', nt: 'ENGESVN2DA' },   // French: EN audio fallback (FRALSG2DA unverified)
  om: { ot: 'ENGESVO2DA', nt: 'ENGESVN2DA' },   // Oromo: EN audio fallback
  ti: { ot: 'ENGESVO2DA', nt: 'ENGESVN2DA' },   // Tigrinya: EN audio fallback
};

// ── Text fileset map: lang → { ot, nt } ───────────────────────
// null = no native text available for this language (returns VERSE_NOT_AVAILABLE)
const FILESETS = {
  en: { ot: 'ENGKJVO_ET', nt: 'ENGKJVN_ET' },
  am: { ot: 'AMHEVG',     nt: 'AMHEVG'     },
  sw: { ot: null,         nt: null          }, // no verified Swahili text fileset
  ar: { ot: null,         nt: null          }, // no verified Arabic text fileset
  fr: { ot: null,         nt: null          }, // no verified French text fileset
  ti: { ot: null,         nt: null          },
  om: { ot: null,         nt: 'GAZGAZ'     }, // Oromo Bible (GAZGAZ = NT only; OT uses hardcoded fallbacks)
};

// Localized unavailable messages keyed by lang
const LANG_UNAVAILABLE = {
  en: 'Bible text is not available in this language yet.',
  om: 'Barreeffamni Macaafa Qulqulluu afaan kanaan ammatti hin jiru.',
  am: 'የመጽሐፍ ቅዱስ ጽሑፍ በዚህ ቋንቋ አሁን አይገኝም።',
  fr: "Le texte biblique n'est pas encore disponible dans cette langue.",
  sw: 'Maandishi ya Biblia hayapatikani kwa lugha hii kwa sasa.',
  ar: 'نص الكتاب المقدس غير متاح بهذه اللغة حالياً.',
  ti: 'Bible text is not available in Tigrinya yet.',
};

function getFileset(lang, book) {
  const pair = FILESETS[lang] || FILESETS.en;
  const isOT = OT_BOOKS.has((book || '').toUpperCase());
  return isOT ? pair.ot : pair.nt;
}

function unavailableResponse(lang, reference) {
  return {
    success: false,
    error: 'VERSE_NOT_AVAILABLE',
    message: LANG_UNAVAILABLE[lang] || LANG_UNAVAILABLE.en,
    language: lang,
    reference: reference || null,
  };
}

// ── Daily verse rotation ─────────────────────────────────────
const DAILY_VERSES = [
  { book: 'JHN', chapter: 3, verse: 16, reference: 'John 3:16' },
  { book: 'PSA', chapter: 23, verse: 1, reference: 'Psalm 23:1' },
  { book: 'PHP', chapter: 4, verse: 13, reference: 'Philippians 4:13' },
  { book: 'ROM', chapter: 8, verse: 28, reference: 'Romans 8:28' },
  { book: 'PRO', chapter: 3, verse: 5, reference: 'Proverbs 3:5' },
  { book: 'ISA', chapter: 40, verse: 31, reference: 'Isaiah 40:31' },
  { book: 'JER', chapter: 29, verse: 11, reference: 'Jeremiah 29:11' },
  { book: 'MAT', chapter: 6, verse: 33, reference: 'Matthew 6:33' },
  { book: 'HEB', chapter: 11, verse: 1, reference: 'Hebrews 11:1' },
  { book: 'ROM', chapter: 12, verse: 2, reference: 'Romans 12:2' },
  { book: 'GAL', chapter: 5, verse: 22, reference: 'Galatians 5:22' },
  { book: 'PSA', chapter: 46, verse: 1, reference: 'Psalm 46:1' },
  { book: 'MAT', chapter: 5, verse: 6, reference: 'Matthew 5:6' },
  { book: 'JHN', chapter: 14, verse: 6, reference: 'John 14:6' },
  { book: 'EPH', chapter: 2, verse: 8, reference: 'Ephesians 2:8' },
  { book: '1CO', chapter: 13, verse: 4, reference: '1 Corinthians 13:4' },
  { book: 'PSA', chapter: 119, verse: 105, reference: 'Psalm 119:105' },
  { book: 'JHN', chapter: 10, verse: 10, reference: 'John 10:10' },
  { book: 'PHP', chapter: 4, verse: 6, reference: 'Philippians 4:6' },
  { book: 'ISA', chapter: 41, verse: 10, reference: 'Isaiah 41:10' },
  { book: 'ROM', chapter: 5, verse: 8, reference: 'Romans 5:8' },
  { book: 'MAT', chapter: 11, verse: 28, reference: 'Matthew 11:28' },
  { book: 'JHN', chapter: 15, verse: 5, reference: 'John 15:5' },
  { book: 'PSA', chapter: 37, verse: 4, reference: 'Psalm 37:4' },
  { book: 'HEB', chapter: 4, verse: 16, reference: 'Hebrews 4:16' },
  { book: 'PRO', chapter: 31, verse: 25, reference: 'Proverbs 31:25' },
  { book: '2TI', chapter: 1, verse: 7, reference: '2 Timothy 1:7' },
  { book: 'EPH', chapter: 6, verse: 10, reference: 'Ephesians 6:10' },
  { book: 'LUK', chapter: 1, verse: 37, reference: 'Luke 1:37' },
  { book: 'REV', chapter: 21, verse: 4, reference: 'Revelation 21:4' },
];

const FALLBACKS = {
  am: {
    'John 3:16': 'እግዚአብሔር ዓለሙን እንዲህ ወደደ፤ የሚያምንበት ሁሉ ሳይጠፋ የዘለዓለም ሕይወት እንዲኖረው አንድያ ልጁን ሰጠ።',
    'Psalm 23:1': 'እግዚአብሔር እረኛዬ ነው፤ የሚጎድለኝ ነገር የለም።',
    'Philippians 4:13': 'በሚያበረታኝ በኢየሱስ ክርስቶስ ሁሉን ማድረግ እችላለሁ።',
    'Romans 8:28': 'እግዚአብሔርን ለሚወዱ፣ እቅዱን ተከትለው ለተጠሩት ሁሉ ነገር ለበጎ ይሠራልና እናውቃለን።',
    'Proverbs 3:5': 'በፍጹም ልብህ በእግዚአብሔር ታመን፤ በራስህ ማስተዋል አትደገፍ።',
    'Isaiah 40:31': 'እግዚአብሔርን ተስፋ ሚያደርጉ ግን እንደ ንሥር ክንፍ ያነሣሉ፤ ይሮጣሉ ነገር ግን አይደክሙም፤ ይሄዳሉ ነገር ግን አይዝሉም።',
    'Jeremiah 29:11': 'ለምትጠቅሙ ሃሳቦች አለኝ ላጎዳችሁ አይደለም ይላል እግዚአብሔር፤ ለወደፊቱ ተስፋ ሊሰጣችሁ ሃሳቦች አለኝ።',
    'Matthew 6:33': 'ነገር ግን አስቀድማችሁ የእግዚአብሔርን መንግሥት ፈልጉ፤ ሌላው ሁሉ ይጨመርላችኋል።',
    'Hebrews 11:1': 'እምነት ለሚተሰፋ ነገር እርግጥ መሆን ለማይታይ ነገር ማስረጃ ነው።',
    'Romans 12:2': 'ከዚህ ዓለም ጋር አትስማሙ፤ ነገር ግን ልካችሁ ታድሶ ምን ጥሩ፣ ምን ደስ የሚያሰኝ፣ ምን ፍጹም የሆነ የእግዚአብሔር ፈቃድ እንደሆነ ፈትሹ።',
    'Galatians 5:22': 'የመንፈስ ፍሬ ግን ፍቅር፣ ደስታ፣ ሰላም፣ ትዕግሥት፣ ቸርነት፣ ደግነት፣ እምነት ነው።',
    'Psalm 46:1': 'እግዚአብሔር መሸሸጊያችን ብርታታችን ነው፤ በችግር ጊዜ ዘወትር የሚገኝ እርዳታ ነው።',
    'Matthew 5:6': 'ጽድቅን ለሚራቡ ለሚጠሙ ብጹዓን ናቸው፤ እነሱ ይጠግባሉ።',
    'John 14:6': 'እኔ መንገድ፣ እውነት፣ ሕይወት ነኝ፤ ያለ እኔ ወደ አብ ማንም አይመጣም።',
    'Ephesians 2:8': 'በእምነት በጸጋ ድነዋልና፤ ይህም ከናንተ አይደለም የእግዚአብሔር ስጦታ ነው።',
    '1 Corinthians 13:4': 'ፍቅር ይታገሣል ፍቅር ያስብሃል፤ ፍቅር አይቀናም አይናጎርም አይታበይም።',
    'Psalm 119:105': 'ቃልህ ለእግሬ መብራት ለመንገዴ ብርሃን ነው።',
    'John 10:10': 'ሌባ የሚመጣው ሊሰርቅ፣ ሊያርድ፣ ሊያጠፋ ነው፤ እኔ ሕይወት እንዲኖራቸው የትርፍ ሕይወትም እንዲኖራቸው መጣሁ።',
    'Philippians 4:6': 'ስለ ምንም ነገር አትጨነቁ፤ ነገር ግን ስለ ሁሉ ነገር ምስጋናን ጨምሩ ጸሎቱ ለእግዚአብሔር ያስታውቁ።',
    'Isaiah 41:10': 'አትፍራ እኔ ከአንተ ጋር አለሁና፤ አትደንግጥ እኔ አምላክህ ነኝና፤ አጠነክርሃለሁ አዎን እረዳሃለሁ።',
    'Romans 5:8': 'እኛ ኃጢአተኞች ሳለን ክርስቶስ ስለ እኛ ሞቶ እግዚአብሔር ፍቅሩን ለእኛ ያሳያል።',
    'Matthew 11:28': 'ደካሞች ሸክም ያለባችሁ ሁሉ ወደ እኔ ኑ አሳርፋችኋለሁ።',
    'John 15:5': 'እኔ ወይን ተክሉ ናችሁ ቅርንጫፉ፤ የሚኖርብኝ እኔም በሱ የምኖር ብዙ ፍሬ ያፈራል።',
    'Psalm 37:4': 'በእግዚአብሔር ደስ ይበልህ ፤ የልብህን ፍላጎት ይሰጥሃል።',
    'Hebrews 4:16': 'ስለዚህ እርዳታ ለማግኘት ጸጋ ወደሚሰጥ ዙፋን በድፍረት እንቅረብ።',
    'Proverbs 31:25': 'ጥንካሬና ክብር ልብሷ ነው፤ ስለ ወደፊቱ ምቀኝነት ትስቃለች።',
    '2 Timothy 1:7': 'እግዚአብሔር የፍርሃት መንፈስ አልሰጠንም፤ ነገር ግን የኃይል፣ የፍቅር፣ ራስን መቆጣጠር መንፈስ ሰጠን።',
    'Ephesians 6:10': 'በጌታ በኃይሉ ብርታት ጠንክሩ።',
    'Luke 1:37': 'ለእግዚአብሔር የሚሳነው ምንም ነገር የለም።',
    'Revelation 21:4': 'ዕንባቸውን ሁሉ ያብሳቸዋል፤ ሞት ወደ ፊት አይኖርም፤ ሐዘን ዋይታ ሕማምም አይኖርም።',
  },
  en: {
    'John 3:16': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    'Psalm 23:1': 'The LORD is my shepherd; I shall not want.',
    'Philippians 4:13': 'I can do all things through him who strengthens me.',
    'Jeremiah 29:11': 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.',
    'Isaiah 40:31': 'But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    'Romans 8:28': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    'Proverbs 3:5': 'Trust in the LORD with all your heart, and do not lean on your own understanding.',
  },
  om: {
    'John 3:16': 'Waaqayyo addunyaa kana akkasitti jaallate, ilma isaa tokkicha kenneef, kan isa amanu hundinuu, badu otoo hin taane, jireenyaa bara baraa akka qabaatu.',
    'Psalm 23:1': 'Waaqayyo tiksee koo ti; ani homaa hin dhabu.',
    'Philippians 4:13': "Jabina gooftaan anaaf kennuun waan hundumaa gochuu nan danda'a.",
    'Romans 8:28': 'Kan Waaqayyoo jaallatan, kan fedhaa isaa irratti waamamaniif, waan hundi tokkummaadhaan gaariitti akka hojjetu ni beekna.',
    'Proverbs 3:5': "Waaqayyoo sammuukee hundaan amanuu irratti diriirfadhu, beekumsa ofii kee irratti hin irkatin.",
    'Isaiah 40:31': 'Kan Waaqayyoo eegan garuu humna haaraa argatu; gara samii akka garriitti ol gubbatu; fiigan hin dadhabu, deeman hin gaafatan.',
    'Jeremiah 29:11': 'Yaada isiniif qaba, jedha Waaqayyo. Yaada nagaa malee hamaa miti, yaada fuuldura fi abdii isiniif kennuudha.',
    'Matthew 6:33': "Mootummaa Waaqayyoo fi qajeelummaa isaa dursa barbaadaa; waan kaan hundi isiniif dabalama.",
    'Hebrews 11:1': 'Amantiin waan abdatame mirkaneessuu, kan hin mul\'anne dhugoomsuudha.',
    'Romans 12:2': "Waggaa kanaan wal hin fakkeessinaa; garuu sammuu haarawaa ta'uudhaan jijjiirramaa, fedhaa Waaqayyoo gaarii, fudhatamaa fi guutuu ta'e adda baasuuf.",
    'Galatians 5:22': "Akaakuun Hafuuraa garuu jaallata, gammachuu, nagaa, obsaa, gaariummaa, tolee, amantii.",
    'Psalm 46:1': 'Waaqayyo gargaaraa fi iddoo baqannaa keenya; yeroo rakkoo keessatti gargaaraa sirriitti argamuudha.',
    'Matthew 5:6': "Kan haqaaf beelofan fi dheebotantu gammada; isaan quufuu.",
    'John 14:6': "Ani karaa, dhugaa fi jireenya kootis; namni kamuu Abbaa biratti ana malee hin dhuftu.",
    'Ephesians 2:8': 'Amantiidhaan araarama argattaniittu; kuni kennaa Waaqayyoo, gochaa keessan irraa miti.',
    '1 Corinthians 13:4': 'Jaallanni obsaa dha, jaallanni gaariidha; jaallanni hin moonatu, hin dhaadatu, hin boonsifatu.',
    'Psalm 119:105': 'Dubbiin kee ifa miila kooti, ibsaa karaa kooti.',
    'John 10:10': "Bineensi hattuun dhufti; inni hatee, dhabamsiisee balleessuuf qofa dhufti. Ani fiixaan ba'insaa guutuu akka qabaniif dhufe.",
    'Philippians 4:6': "Waa'ee waan kamuu hin yaadda'inaa; garuu waan hundaa kadhannaa fi gaafannaa keessatti galata waliin Waaqayyoof ibsaa.",
    'Isaiah 41:10': "Sodaatin; ani siwaliin; gaddaatin; ani Waaqayyoo keetiidha; si jabeessa; si gargaara; harka mirga qajeelummaa koo sibarbaada.",
    'Romans 5:8': 'Garuu Waaqayyo jaallata isaa keenya akkas agarsiisa: ammallee nama cubbuu tannaan Kiristoos nu bakka bu\'e.',
    'Matthew 11:28': "Hundumtuu hojjetu fi gidirsamu ana bira dhufaa; ani isin boqochisaa.",
    'John 15:5': "Ani diroo dha, isin laafiidha. Kan ana keessa turuu fi ani immoo kan isaa keessa jiru akaakuu baay'ee fida; yoo ana irraa adda ta'attan homaa gochuu hin dandeessan.",
    'Psalm 37:4': "Waaqayyoo gammaduu kee ta'i; inni hawwii onnee kee siif kenna.",
    'Hebrews 4:16': "Yeroo barbaachisaatti araaramaa fi gargaarsa argachuuf, carraaqqii qabannaadhaan teessoo araaramaa haa dhiyaannu.",
    'Proverbs 31:25': "Humna fi miidhaginna uffata ishee; fuulduraa irra ni kolfiti.",
    '2 Timothy 1:7': "Waaqayyo hafuura sodaa keenya nuuf hin kenninii; garuu kan humna, jaallata fi of to'annoo nuuf kenne.",
    'Ephesians 6:10': "Dhuma dhuma irratti, Gooftaa keessatti fi humna cimina isaatti jabaadha.",
    'Luke 1:37': "Waan Waaqayyoof danda'amu hin jiru.",
    'Revelation 21:4': "Imimmaan hunda isaanii irraa ni haqxa; du'i hin jiraatu; gaddi fi iyyi fi dhukkubni hin jiraatu, waan duraanii darbe.",
  },
};

// ── Language registry (mirrors src/config/languages.js) ──────────────────
// preferredBibleIds: ordered fallback list per language
const LANG_REGISTRY = {
  en: { preferredBibleIds: ['ENGKJV', 'ENGESV', 'ENGWEB'], rtl: false, skipProbe: true },
  am: { preferredBibleIds: ['AMHEVG'], rtl: false, skipProbe: true },
  sw: { preferredBibleIds: ['SWHNEN', 'SWHULB', 'ENGKJV'], rtl: false },
  ar: { preferredBibleIds: ['ARBVDV', 'ARBSV', 'ENGKJV'], rtl: true },
  fr: { preferredBibleIds: ['FRALSG', 'FRASEG', 'ENGKJV'], rtl: false },
  ti: { preferredBibleIds: ['ENGKJV'], rtl: false },
  om: { preferredBibleIds: ['GAZGAZ'], rtl: false, skipProbe: true },
};

// Resolved Bible IDs (validated against API, cached per instance)
const resolvedBibleIds = {};

async function resolveBibleId(lang) {
  if (resolvedBibleIds[lang]) return resolvedBibleIds[lang];
  const config = LANG_REGISTRY[lang] || LANG_REGISTRY.en;

  // If this language has a known working Bible ID (skipProbe=true), use it directly
  if (config.skipProbe && config.preferredBibleIds.length > 0) {
    resolvedBibleIds[lang] = config.preferredBibleIds[0];
    console.log(`[bibleBrainAPI] using direct bibleId for lang=${lang} → ${resolvedBibleIds[lang]}`);
    return resolvedBibleIds[lang];
  }

  for (const bibleId of config.preferredBibleIds) {
    try {
      // Quick probe: fetch a known NT verse from this Bible
      const url = `${BASE}/bibles/${bibleId}/verses/JHN/3/16?v=4&key=${API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.length > 0) {
          resolvedBibleIds[lang] = bibleId;
          console.log(`[bibleBrainAPI] resolved lang=${lang} → bibleId=${bibleId}`);
          return bibleId;
        }
      }
    } catch (e) {
      console.warn(`[bibleBrainAPI] probe failed for bibleId=${bibleId}: ${e.message}`);
    }
  }
  // Last resort: English KJV always works
  resolvedBibleIds[lang] = 'ENGKJV';
  console.warn(`[bibleBrainAPI] no verified bibleId for lang=${lang}, falling back to ENGKJV`);
  return 'ENGKJV';
}

async function getBibleId(lang) {
  return resolveBibleId(lang);
}

// ── Core fetch: single verse ───────────────────────────────────
// Returns null if unavailable (do NOT silently swap to English)
async function fetchVerse(book, chapter, verse, lang = 'en') {
  // Hard stop: language has no text fileset
  const pair = FILESETS[lang];
  const isOT = OT_BOOKS.has((book || '').toUpperCase());
  const fileset = isOT ? pair?.ot : pair?.nt;
  if (!fileset && lang !== 'en') {
    console.log(`[bibleBrainAPI] fetchVerse: no fileset for lang=${lang}, returning null`);
    return null;
  }

  const bibleId = await getBibleId(lang);
  const cacheKey = `v:${lang}:${bibleId}:${book}:${chapter}:${verse}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${BASE}/bibles/${bibleId}/verses/${book}/${chapter}/${verse}?v=4&key=${API_KEY}&include_surrounding_chapters=false`;
  console.log(`[bibleBrainAPI] fetchVerse ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[bibleBrainAPI] fetchVerse HTTP ${res.status} book=${book} lang=${lang}`);
    return null;
  }
  const json = await res.json();
  const items = json?.data || [];
  if (!items.length) return null;

  // Sanity-check: if we expected non-English but got English Bible, treat as unavailable
  if (lang !== 'en' && bibleId.startsWith('ENG')) {
    console.warn(`[bibleBrainAPI] fetchVerse resolved to English bibleId for lang=${lang} — returning unavailable`);
    return null;
  }

  const text = items.map(v => v.verse_text).join(' ').trim();
  const result = { text, book, chapter, verse, bibleId, lang };
  setCache(cacheKey, result, 7 * 24 * 60 * 60 * 1000);
  return result;
}

// ── Core fetch: full chapter ─────────────────────────────────
// Returns null if unavailable — never silently falls to English
async function fetchChapter(book, chapter, lang = 'en') {
  const pair = FILESETS[lang];
  const isOTBook = OT_BOOKS.has((book || '').toUpperCase());
  const chFileset = isOTBook ? pair?.ot : pair?.nt;
  if (!chFileset && lang !== 'en') {
    console.log(`[bibleBrainAPI] fetchChapter: no fileset for lang=${lang}, returning null`);
    return null;
  }

  const bibleId = await getBibleId(lang);
  const cacheKey = `ch:${lang}:${bibleId}:${book}:${chapter}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${BASE}/bibles/${bibleId}/chapter/${book}/${chapter}?v=4&key=${API_KEY}`;
  console.log(`[bibleBrainAPI] fetchChapter ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[bibleBrainAPI] fetchChapter HTTP ${res.status} book=${book} ch=${chapter} lang=${lang}`);
    return null;
  }
  const json = await res.json();
  const items = json?.data || [];
  if (!items.length) return null;

  // Sanity-check: reject English fallback for non-English requests
  if (lang !== 'en' && bibleId.startsWith('ENG')) {
    console.warn(`[bibleBrainAPI] fetchChapter resolved to English bibleId for lang=${lang} — returning unavailable`);
    return null;
  }

  const verses = items.map(v => ({
    verse: v.verse_start || v.verse,
    text: v.verse_text?.trim() || '',
  }));
  const result = { book, chapter, verses, title: `${book} ${chapter}`, bibleId, lang };
  setCache(cacheKey, result, 7 * 24 * 60 * 60 * 1000);
  return result;
}

// ── Verse of the day ──────────────────────────────────────────
// For non-English: only return text if truly from the target language.
// Never silently serve English text as a non-English language result.
async function getVerseOfDay(lang = 'en') {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `votd:${lang}:${today}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const idx = (new Date().getDate() + new Date().getMonth()) % DAILY_VERSES.length;
  const ref = DAILY_VERSES[idx];

  const data = await fetchVerse(ref.book, ref.chapter, ref.verse, lang);

  const langFallbacks = FALLBACKS[lang] || FALLBACKS.en;
  const enFallbacks = FALLBACKS.en;

  let result;
  if (data) {
    result = {
      reference: ref.reference,
      text: data.text,
      book: ref.book,
      chapter: ref.chapter,
      verse: ref.verse,
      fromAPI: true,
      available: true,
    };
  } else if (langFallbacks[ref.reference]) {
    // Use language-specific fallback text if available
    result = {
      reference: ref.reference,
      text: langFallbacks[ref.reference],
      book: ref.book,
      chapter: ref.chapter,
      verse: ref.verse,
      fromAPI: false,
      available: true,
    };
  } else if (lang === 'en') {
    // English hardcoded fallback
    result = {
      reference: ref.reference,
      text: enFallbacks[ref.reference] || 'The LORD is my shepherd; I shall not want.',
      book: ref.book,
      chapter: ref.chapter,
      verse: ref.verse,
      fromAPI: false,
      available: true,
    };
  } else {
    // No text available at all
    result = {
      reference: ref.reference,
      text: null,
      book: ref.book,
      chapter: ref.chapter,
      verse: ref.verse,
      fromAPI: false,
      available: false,
      message: LANG_UNAVAILABLE[lang] || LANG_UNAVAILABLE.en,
    };
  }

  setCache(cacheKey, result, 24 * 60 * 60 * 1000);
  return result;
}

// ── Search ────────────────────────────────────────────────────
async function searchVerses(query, lang = 'en') {
  const bibleId = await getBibleId(lang);
  const cacheKey = `search:${lang}:${bibleId}:${query}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // Use the bible search endpoint with resolved bibleId
  const url = `${BASE}/search?query=${encodeURIComponent(query)}&bible_id=${bibleId}&v=4&key=${API_KEY}&limit=10`;
  console.log(`[bibleBrainAPI] search ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[bibleBrainAPI] search HTTP ${res.status}`);
    return [];
  }
  const json = await res.json();
  const results = (json?.data?.verses?.data || []).map(v => ({
    reference: `${v.book_name} ${v.chapter}:${v.verse_start}`,
    text: v.verse_text?.trim() || '',
    book: v.book_id,
    chapter: v.chapter,
    verse: v.verse_start,
  }));
  setCache(cacheKey, results, 7 * 24 * 60 * 60 * 1000);
  return results;
}

// ── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    if (!API_KEY) {
      console.error('[bibleBrainAPI] BIBLE_BRAIN_API_KEY not set!');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { action, book, chapter, verse, reference, query, translation } = body;
    // lang can be passed directly, or inferred from translation (a language code like 'om', 'en', or a bible_id)
    const KNOWN_LANGS = new Set(['en', 'om', 'am', 'sw', 'ar', 'fr', 'ti']);
    const lang = body.lang || (KNOWN_LANGS.has(translation) ? translation : 'en');

    // ── validateBibleId: probe whether a given bibleId works ────────────────
    if (action === 'validateBibleId') {
      const { bibleId } = body;
      if (!bibleId) return Response.json({ available: false, error: 'bibleId required' });
      try {
        const url = `${BASE}/bibles/${bibleId}/verses/JHN/3/16?v=4&key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return Response.json({ available: false, bibleId });
        const json = await res.json();
        const available = (json?.data?.length ?? 0) > 0;
        return Response.json({ available, bibleId, sampleText: available ? json.data[0]?.verse_text : null });
      } catch (e) {
        console.error(`[bibleBrainAPI] validateBibleId error: ${e.message}`);
        return Response.json({ available: false, bibleId, error: e.message });
      }
    }

    // ── validateLanguage: check all preferred IDs for a language ────────────
    if (action === 'validateLanguage') {
      const registry = {
        en: ['ENGKJV', 'ENGESV'],
        am: ['AMHEVG'],
        sw: ['SWHNEN'],
        ar: ['ARBVDV'],
        fr: ['FRALSG'],
        om: ['ORMWHM'],
        ti: [],
      };
      const preferred = registry[lang] || [];
      const results = [];
      for (const bibleId of preferred) {
        try {
          const url = `${BASE}/bibles/${bibleId}/verses/JHN/3/16?v=4&key=${API_KEY}`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            const available = (json?.data?.length ?? 0) > 0;
            results.push({ bibleId, available, text: available ? json.data[0]?.verse_text?.slice(0, 60) : null });
          } else {
            results.push({ bibleId, available: false, httpStatus: res.status });
          }
        } catch (e) {
          results.push({ bibleId, available: false, error: e.message });
        }
      }
      const bestId = results.find(r => r.available)?.bibleId || null;
      return Response.json({ lang, bestBibleId: bestId, results });
    }

    console.log(`[bibleBrainAPI] action=${action} lang=${lang}`);

    // verseOfDay
    if (action === 'verseOfDay') {
      const result = await getVerseOfDay(lang);
      return Response.json({ success: true, verse: result });
    }

    // single verse by reference e.g. "John 3:16" or book/chapter/verse
    if (action === 'verse') {
      let bk = book, ch = chapter, vs = verse, ref = reference;
      if (reference && !book) {
        const m = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (m) {
          ref = reference;
          bk = m[1].toUpperCase().replace(/\s+/g, '').slice(0, 3);
          ch = parseInt(m[2]);
          vs = parseInt(m[3]);
        }
      }
      if (!bk) return Response.json({ error: 'book required' }, { status: 400 });
      const data = await fetchVerse(bk, parseInt(ch), parseInt(vs), lang);
      if (!data) {
        // For English use inline fallback; for all others return unavailable
        if (lang === 'en') {
          const fullRef = ref || `${bk} ${ch}:${vs}`;
          return Response.json({
            success: true,
            verse: { reference: fullRef, text: FALLBACKS[fullRef] || 'Scripture unavailable', fromAPI: false },
          });
        }
        return Response.json(unavailableResponse(lang, ref || `${bk} ${ch}:${vs}`));
      }
      return Response.json({
        success: true,
        verse: { ...data, reference: ref || `${bk} ${ch}:${vs}` },
      });
    }

    // full chapter
    if (action === 'chapter') {
      if (!book || chapter === undefined) return Response.json({ error: 'book and chapter required' }, { status: 400 });
      const data = await fetchChapter(book, parseInt(chapter), lang);
      if (!data) {
        if (lang === 'en') {
          return Response.json({ success: true, chapter: { book, chapter, verses: [], title: `${book} ${chapter}` } });
        }
        return Response.json(unavailableResponse(lang, `${book} ${chapter}`));
      }
      return Response.json({ success: true, chapter: data });
    }

    // search
    if (action === 'search') {
      if (!query) return Response.json({ error: 'query required' }, { status: 400 });
      const results = await searchVerses(query, lang);
      return Response.json({ success: true, results });
    }

    // audioForVerse — returns a streaming audio URL for a given chapter
    // Bible Brain audio endpoint: /bibles/filesets/{filesetId}/{book}/{chapter}?v=4&key=...
    if (action === 'audioForVerse') {
      if (!book || chapter === undefined) {
        return Response.json({ error: 'book and chapter required' }, { status: 400 });
      }
      const isOT = OT_BOOKS.has((book || '').toUpperCase());
      const audioFilesets = AUDIO_FILESETS[lang] || AUDIO_FILESETS.en;
      const filesetId = isOT ? audioFilesets.ot : audioFilesets.nt;
      const cacheKey = `audio:${lang}:${filesetId}:${book}:${chapter}`;
      const cached = getCache(cacheKey);
      if (cached) return Response.json(cached);

      // Try language-specific audio first, then English fallback
      const tryFetch = async (fsId, isFallback) => {
        // Bible Brain fileset audio URL format
        const url = `${BASE}/bibles/filesets/${fsId}/${book}/${chapter}?v=4&key=${API_KEY}`;
        console.log(`[bibleBrainAPI] audioForVerse ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`[bibleBrainAPI] audio HTTP ${res.status} fileset=${fsId}`);
          return null;
        }
        const json = await res.json();
        const tracks = json?.data || [];
        if (!tracks.length) return null;
        const verseNum = parseInt(verse) || 1;
        const track = tracks.find(t => t.verse_start <= verseNum && t.verse_end >= verseNum) || tracks[0];
        if (!track?.path) return null;
        return { audioUrl: track.path, filesetId: fsId, fallback: isFallback };
      };

      try {
        let result = await tryFetch(filesetId, false);

        // Fall back to English audio if language-specific failed
        if (!result && lang !== 'en') {
          const enFilesets = AUDIO_FILESETS.en;
          const enFilesetId = isOT ? enFilesets.ot : enFilesets.nt;
          console.log(`[bibleBrainAPI] trying EN audio fallback fileset=${enFilesetId}`);
          result = await tryFetch(enFilesetId, true);
        }

        if (result) {
          setCache(cacheKey, result, 60 * 60 * 1000);
          return Response.json(result);
        }
        return Response.json({ audioUrl: null, filesetId, error: 'Audio not available' });
      } catch (e) {
        console.error(`[bibleBrainAPI] audioForVerse error: ${e.message}`);
        return Response.json({ audioUrl: null, error: e.message });
      }
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[bibleBrainAPI] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});