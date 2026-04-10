/**
 * generateBibleTemplates
 * Admin-only. Returns all metadata template files as a single JSON package:
 *   - translations.json
 *   - bible_books_en.json
 *   - bible_books_om.json
 *   - bible_books_am.json
 *   - verse_of_day.json (365 day scaffold)
 *   - blank_verse_template (structure reference)
 *
 * Call from admin dashboard or test tool. Returns JSON you can save locally.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BOOKS = [
  { book_key:'genesis',book_order:1,testament:'old',chapters_count:50,en:'Genesis',om:'Uumama',am:'ዘፍጥረት',en_abbr:'Gen',om_abbr:'Uma',am_abbr:'ዘፍ' },
  { book_key:'exodus',book_order:2,testament:'old',chapters_count:40,en:'Exodus',om:"Ba'uu",am:'ዘጸአት',en_abbr:'Exod',om_abbr:'Bau',am_abbr:'ዘጸ' },
  { book_key:'leviticus',book_order:3,testament:'old',chapters_count:27,en:'Leviticus',om:'Lewwota',am:'ዘሌዋውያን',en_abbr:'Lev',om_abbr:'Lew',am_abbr:'ዘሌ' },
  { book_key:'numbers',book_order:4,testament:'old',chapters_count:36,en:'Numbers',om:'Lakkoobsa',am:'ዘኍልቍ',en_abbr:'Num',om_abbr:'Lak',am_abbr:'ዘኍ' },
  { book_key:'deuteronomy',book_order:5,testament:'old',chapters_count:34,en:'Deuteronomy',om:'Keessa Deebii Seeraa',am:'ዘዳግም',en_abbr:'Deut',om_abbr:'KDS',am_abbr:'ዘዳ' },
  { book_key:'joshua',book_order:6,testament:'old',chapters_count:24,en:'Joshua',om:'Iyyaasuu',am:'ኢያሱ',en_abbr:'Josh',om_abbr:'Iya',am_abbr:'ኢያ' },
  { book_key:'judges',book_order:7,testament:'old',chapters_count:21,en:'Judges',om:'Abbootii Murtii',am:'መሳፍንት',en_abbr:'Judg',om_abbr:'Abm',am_abbr:'መሳ' },
  { book_key:'ruth',book_order:8,testament:'old',chapters_count:4,en:'Ruth',om:'Ruut',am:'ሩት',en_abbr:'Ruth',om_abbr:'Rut',am_abbr:'ሩት' },
  { book_key:'1samuel',book_order:9,testament:'old',chapters_count:31,en:'1 Samuel',om:"1 Saamu'el",am:'1 ሳሙኤል',en_abbr:'1Sam',om_abbr:'1Sam',am_abbr:'1ሳሙ' },
  { book_key:'2samuel',book_order:10,testament:'old',chapters_count:24,en:'2 Samuel',om:"2 Saamu'el",am:'2 ሳሙኤል',en_abbr:'2Sam',om_abbr:'2Sam',am_abbr:'2ሳሙ' },
  { book_key:'1kings',book_order:11,testament:'old',chapters_count:22,en:'1 Kings',om:'1 Moototaa',am:'1 ነገሥት',en_abbr:'1Kgs',om_abbr:'1Mot',am_abbr:'1ነገ' },
  { book_key:'2kings',book_order:12,testament:'old',chapters_count:25,en:'2 Kings',om:'2 Moototaa',am:'2 ነገሥት',en_abbr:'2Kgs',om_abbr:'2Mot',am_abbr:'2ነገ' },
  { book_key:'1chronicles',book_order:13,testament:'old',chapters_count:29,en:'1 Chronicles',om:'1 Seenaa Bara',am:'1 ዜና መዋዕል',en_abbr:'1Chr',om_abbr:'1Sen',am_abbr:'1ዜና' },
  { book_key:'2chronicles',book_order:14,testament:'old',chapters_count:36,en:'2 Chronicles',om:'2 Seenaa Bara',am:'2 ዜና መዋዕል',en_abbr:'2Chr',om_abbr:'2Sen',am_abbr:'2ዜና' },
  { book_key:'ezra',book_order:15,testament:'old',chapters_count:10,en:'Ezra',om:'Izraa',am:'ዕዝራ',en_abbr:'Ezra',om_abbr:'Izr',am_abbr:'ዕዝ' },
  { book_key:'nehemiah',book_order:16,testament:'old',chapters_count:13,en:'Nehemiah',om:'Nahimiyaa',am:'ነህምያ',en_abbr:'Neh',om_abbr:'Nah',am_abbr:'ነህ' },
  { book_key:'esther',book_order:17,testament:'old',chapters_count:10,en:'Esther',om:'Estheer',am:'አስቴር',en_abbr:'Esth',om_abbr:'Est',am_abbr:'አስ' },
  { book_key:'job',book_order:18,testament:'old',chapters_count:42,en:'Job',om:'Iyoob',am:'ኢዮብ',en_abbr:'Job',om_abbr:'Iyo',am_abbr:'ኢዮ' },
  { book_key:'psalms',book_order:19,testament:'old',chapters_count:150,en:'Psalms',om:'Faarfannaa',am:'መዝሙር',en_abbr:'Ps',om_abbr:'Far',am_abbr:'መዝ' },
  { book_key:'proverbs',book_order:20,testament:'old',chapters_count:31,en:'Proverbs',om:'Fakkeenya',am:'ምሳሌ',en_abbr:'Prov',om_abbr:'Fak',am_abbr:'ምሳ' },
  { book_key:'ecclesiastes',book_order:21,testament:'old',chapters_count:12,en:'Ecclesiastes',om:'Lallabaa',am:'መክብብ',en_abbr:'Eccl',om_abbr:'Lal',am_abbr:'መክ' },
  { book_key:'songofsolomon',book_order:22,testament:'old',chapters_count:8,en:'Song of Solomon',om:'Faarfannaa Solomoon',am:'መኃልየ መኃልይ',en_abbr:'Song',om_abbr:'Fas',am_abbr:'መኃ' },
  { book_key:'isaiah',book_order:23,testament:'old',chapters_count:66,en:'Isaiah',om:'Isaayaas',am:'ኢሳይያስ',en_abbr:'Isa',om_abbr:'Isa',am_abbr:'ኢሳ' },
  { book_key:'jeremiah',book_order:24,testament:'old',chapters_count:52,en:'Jeremiah',om:'Ermiyaas',am:'ኤርምያስ',en_abbr:'Jer',om_abbr:'Erm',am_abbr:'ኤር' },
  { book_key:'lamentations',book_order:25,testament:'old',chapters_count:5,en:'Lamentations',om:"Waa'ee Boo'ichaa",am:'ሰቆቃወ ኤርምያስ',en_abbr:'Lam',om_abbr:'Boo',am_abbr:'ሰቆ' },
  { book_key:'ezekiel',book_order:26,testament:'old',chapters_count:48,en:'Ezekiel',om:"Hisqi'el",am:'ሕዝቅኤል',en_abbr:'Ezek',om_abbr:'His',am_abbr:'ሕዝ' },
  { book_key:'daniel',book_order:27,testament:'old',chapters_count:12,en:'Daniel',om:"Daani'el",am:'ዳንኤል',en_abbr:'Dan',om_abbr:'Dan',am_abbr:'ዳን' },
  { book_key:'hosea',book_order:28,testament:'old',chapters_count:14,en:'Hosea',om:"Hoose'aa",am:'ሆሴዕ',en_abbr:'Hos',om_abbr:'Hos',am_abbr:'ሆሴ' },
  { book_key:'joel',book_order:29,testament:'old',chapters_count:3,en:'Joel',om:"Yo'el",am:'ኢዮኤል',en_abbr:'Joel',om_abbr:'Yoe',am_abbr:'ኢዮኤ' },
  { book_key:'amos',book_order:30,testament:'old',chapters_count:9,en:'Amos',om:'Aamoos',am:'አሞጽ',en_abbr:'Amos',om_abbr:'Aam',am_abbr:'አሞ' },
  { book_key:'obadiah',book_order:31,testament:'old',chapters_count:1,en:'Obadiah',om:'Abdiiyaas',am:'አብድዩ',en_abbr:'Obad',om_abbr:'Abd',am_abbr:'አብድ' },
  { book_key:'jonah',book_order:32,testament:'old',chapters_count:4,en:'Jonah',om:'Yoonaas',am:'ዮናስ',en_abbr:'Jonah',om_abbr:'Yoo',am_abbr:'ዮና' },
  { book_key:'micah',book_order:33,testament:'old',chapters_count:7,en:'Micah',om:'Miikiyaas',am:'ሚክያስ',en_abbr:'Mic',om_abbr:'Mii',am_abbr:'ሚክ' },
  { book_key:'nahum',book_order:34,testament:'old',chapters_count:3,en:'Nahum',om:'Naahoom',am:'ናሆም',en_abbr:'Nah',om_abbr:'Naa',am_abbr:'ናሆ' },
  { book_key:'habakkuk',book_order:35,testament:'old',chapters_count:3,en:'Habakkuk',om:'Anbaaquum',am:'ዕንባቆም',en_abbr:'Hab',om_abbr:'Anb',am_abbr:'ዕንባ' },
  { book_key:'zephaniah',book_order:36,testament:'old',chapters_count:3,en:'Zephaniah',om:'Sefaaniyaa',am:'ሶፎንያስ',en_abbr:'Zeph',om_abbr:'Sef',am_abbr:'ሶፎ' },
  { book_key:'haggai',book_order:37,testament:'old',chapters_count:2,en:'Haggai',om:'Haggay',am:'ሐጌ',en_abbr:'Hag',om_abbr:'Hag',am_abbr:'ሐጌ' },
  { book_key:'zechariah',book_order:38,testament:'old',chapters_count:14,en:'Zechariah',om:'Zakariyaas',am:'ዘካርያስ',en_abbr:'Zech',om_abbr:'Zak',am_abbr:'ዘካ' },
  { book_key:'malachi',book_order:39,testament:'old',chapters_count:4,en:'Malachi',om:'Milkiyaas',am:'ሚልክያስ',en_abbr:'Mal',om_abbr:'Mil',am_abbr:'ሚል' },
  { book_key:'matthew',book_order:40,testament:'new',chapters_count:28,en:'Matthew',om:'Maatewos',am:'ማቴዎስ',en_abbr:'Matt',om_abbr:'Mat',am_abbr:'ማቴ' },
  { book_key:'mark',book_order:41,testament:'new',chapters_count:16,en:'Mark',om:'Maarqos',am:'ማርቆስ',en_abbr:'Mark',om_abbr:'Mar',am_abbr:'ማር' },
  { book_key:'luke',book_order:42,testament:'new',chapters_count:24,en:'Luke',om:'Luqaas',am:'ሉቃስ',en_abbr:'Luke',om_abbr:'Luq',am_abbr:'ሉቃ' },
  { book_key:'john',book_order:43,testament:'new',chapters_count:21,en:'John',om:'Yohaannis',am:'ዮሐንስ',en_abbr:'John',om_abbr:'Yoh',am_abbr:'ዮሐ' },
  { book_key:'acts',book_order:44,testament:'new',chapters_count:28,en:'Acts',om:'Hojii Ergamootaa',am:'የሐዋርያት ሥራ',en_abbr:'Acts',om_abbr:'Hoe',am_abbr:'ሐዋ' },
  { book_key:'romans',book_order:45,testament:'new',chapters_count:16,en:'Romans',om:'Roomaa',am:'ሮሜ',en_abbr:'Rom',om_abbr:'Roo',am_abbr:'ሮሜ' },
  { book_key:'1corinthians',book_order:46,testament:'new',chapters_count:16,en:'1 Corinthians',om:'1 Qorontos',am:'1 ቆሮንቶስ',en_abbr:'1Cor',om_abbr:'1Qor',am_abbr:'1ቆሮ' },
  { book_key:'2corinthians',book_order:47,testament:'new',chapters_count:13,en:'2 Corinthians',om:'2 Qorontos',am:'2 ቆሮንቶስ',en_abbr:'2Cor',om_abbr:'2Qor',am_abbr:'2ቆሮ' },
  { book_key:'galatians',book_order:48,testament:'new',chapters_count:6,en:'Galatians',om:'Galaatiyaa',am:'ገላትያ',en_abbr:'Gal',om_abbr:'Gal',am_abbr:'ገላ' },
  { book_key:'ephesians',book_order:49,testament:'new',chapters_count:6,en:'Ephesians',om:'Efesoon',am:'ኤፌሶን',en_abbr:'Eph',om_abbr:'Efe',am_abbr:'ኤፌ' },
  { book_key:'philippians',book_order:50,testament:'new',chapters_count:4,en:'Philippians',om:'Filiphisiyuus',am:'ፊልጵስዩስ',en_abbr:'Phil',om_abbr:'Fil',am_abbr:'ፊል' },
  { book_key:'colossians',book_order:51,testament:'new',chapters_count:4,en:'Colossians',om:'Qolossoos',am:'ቈላስይስ',en_abbr:'Col',om_abbr:'Qol',am_abbr:'ቈላ' },
  { book_key:'1thessalonians',book_order:52,testament:'new',chapters_count:5,en:'1 Thessalonians',om:'1 Tasalonqee',am:'1 ተሰሎንቄ',en_abbr:'1Thess',om_abbr:'1Tas',am_abbr:'1ተሰ' },
  { book_key:'2thessalonians',book_order:53,testament:'new',chapters_count:3,en:'2 Thessalonians',om:'2 Tasalonqee',am:'2 ተሰሎንቄ',en_abbr:'2Thess',om_abbr:'2Tas',am_abbr:'2ተሰ' },
  { book_key:'1timothy',book_order:54,testament:'new',chapters_count:6,en:'1 Timothy',om:'1 Ximotewos',am:'1 ጢሞቴዎስ',en_abbr:'1Tim',om_abbr:'1Xim',am_abbr:'1ጢሞ' },
  { book_key:'2timothy',book_order:55,testament:'new',chapters_count:4,en:'2 Timothy',om:'2 Ximotewos',am:'2 ጢሞቴዎስ',en_abbr:'2Tim',om_abbr:'2Xim',am_abbr:'2ጢሞ' },
  { book_key:'titus',book_order:56,testament:'new',chapters_count:3,en:'Titus',om:'Tiitoo',am:'ቲቶ',en_abbr:'Titus',om_abbr:'Tii',am_abbr:'ቲቶ' },
  { book_key:'philemon',book_order:57,testament:'new',chapters_count:1,en:'Philemon',om:'Filemoon',am:'ፊልሞና',en_abbr:'Phlm',om_abbr:'Film',am_abbr:'ፊልሞ' },
  { book_key:'hebrews',book_order:58,testament:'new',chapters_count:13,en:'Hebrews',om:'Ibroota',am:'ዕብራውያን',en_abbr:'Heb',om_abbr:'Ibr',am_abbr:'ዕብ' },
  { book_key:'james',book_order:59,testament:'new',chapters_count:5,en:'James',om:'Yaaqoob',am:'ያዕቆብ',en_abbr:'Jas',om_abbr:'Yaq',am_abbr:'ያዕ' },
  { book_key:'1peter',book_order:60,testament:'new',chapters_count:5,en:'1 Peter',om:'1 Phexiros',am:'1 ጴጥሮስ',en_abbr:'1Pet',om_abbr:'1Phe',am_abbr:'1ጴጥ' },
  { book_key:'2peter',book_order:61,testament:'new',chapters_count:3,en:'2 Peter',om:'2 Phexiros',am:'2 ጴጥሮስ',en_abbr:'2Pet',om_abbr:'2Phe',am_abbr:'2ጴጥ' },
  { book_key:'1john',book_order:62,testament:'new',chapters_count:5,en:'1 John',om:'1 Yohaannis',am:'1 ዮሐንስ',en_abbr:'1John',om_abbr:'1Yoh',am_abbr:'1ዮሐ' },
  { book_key:'2john',book_order:63,testament:'new',chapters_count:1,en:'2 John',om:'2 Yohaannis',am:'2 ዮሐንስ',en_abbr:'2John',om_abbr:'2Yoh',am_abbr:'2ዮሐ' },
  { book_key:'3john',book_order:64,testament:'new',chapters_count:1,en:'3 John',om:'3 Yohaannis',am:'3 ዮሐንስ',en_abbr:'3John',om_abbr:'3Yoh',am_abbr:'3ዮሐ' },
  { book_key:'jude',book_order:65,testament:'new',chapters_count:1,en:'Jude',om:'Yihudaa',am:'ይሁዳ',en_abbr:'Jude',om_abbr:'Yih',am_abbr:'ይሁ' },
  { book_key:'revelation',book_order:66,testament:'new',chapters_count:22,en:'Revelation',om:"Mul'ata",am:'ራእይ',en_abbr:'Rev',om_abbr:'Mul',am_abbr:'ራእ' },
];

const LANG_CONFIG = {
  en: { translation_code: 'english_bible',  name_key: 'en', abbr_key: 'en_abbr' },
  om: { translation_code: 'oromo_bible',    name_key: 'om', abbr_key: 'om_abbr' },
  am: { translation_code: 'amharic_bible',  name_key: 'am', abbr_key: 'am_abbr' },
};

// Generate verse_of_day scaffold for all 365 days
function generateVerseOfDay() {
  // Curated selection cycling through well-known verses
  const REFS = [
    { book_key:'john',    chapter:3,  verse:16 },
    { book_key:'psalms',  chapter:23, verse:1  },
    { book_key:'proverbs',chapter:3,  verse:5  },
    { book_key:'isaiah',  chapter:40, verse:31 },
    { book_key:'jeremiah',chapter:29, verse:11 },
    { book_key:'romans',  chapter:8,  verse:28 },
    { book_key:'philippians',chapter:4,verse:13},
    { book_key:'james',   chapter:1,  verse:17 },
    { book_key:'psalms',  chapter:46, verse:1  },
    { book_key:'matthew', chapter:5,  verse:3  },
    { book_key:'psalms',  chapter:119,verse:105},
    { book_key:'romans',  chapter:12, verse:2  },
    { book_key:'galatians',chapter:5, verse:22 },
    { book_key:'1john',   chapter:4,  verse:19 },
    { book_key:'hebrews', chapter:11, verse:1  },
    { book_key:'luke',    chapter:6,  verse:27 },
    { book_key:'ephesians',chapter:2, verse:8  },
    { book_key:'matthew', chapter:22, verse:37 },
    { book_key:'psalms',  chapter:1,  verse:1  },
    { book_key:'proverbs',chapter:1,  verse:7  },
    { book_key:'john',    chapter:14, verse:6  },
    { book_key:'romans',  chapter:3,  verse:23 },
    { book_key:'isaiah',  chapter:53, verse:5  },
    { book_key:'revelation',chapter:21,verse:4 },
    { book_key:'colossians',chapter:3,verse:2  },
    { book_key:'2timothy',chapter:3,  verse:16 },
    { book_key:'acts',    chapter:1,  verse:8  },
    { book_key:'genesis', chapter:1,  verse:1  },
  ];

  const days = [];
  const months = [31,28,31,30,31,30,31,31,30,31,30,31];
  let refIdx = 0;

  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= months[m - 1]; d++) {
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const ref = REFS[refIdx % REFS.length];
      days.push({ day_key: `${mm}-${dd}`, ...ref, note: '' });
      refIdx++;
    }
  }
  return days;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // translations.json
    const translations = [
      { language_code:'en', translation_code:'english_bible',  translation_name:'English Bible',       is_active:true, is_public_domain:true,  notes:'Map to public-domain source e.g. WEB or ASV' },
      { language_code:'om', translation_code:'oromo_bible',    translation_name:'Afaan Oromoo Bible',   is_active:true, is_public_domain:false, notes:'Add licensed or public-domain text later' },
      { language_code:'am', translation_code:'amharic_bible',  translation_name:'Amharic Bible',        is_active:true, is_public_domain:false, notes:'Add licensed or public-domain text later' },
    ];

    // bible_books per language
    const bibleBooks = {};
    for (const [lang, cfg] of Object.entries(LANG_CONFIG)) {
      bibleBooks[`bible_books_${lang}`] = BOOKS.map(b => ({
        translation_code: cfg.translation_code,
        language_code: lang,
        book_key: b.book_key,
        book_name: b[cfg.name_key],
        book_order: b.book_order,
        testament: b.testament,
        chapters_count: b.chapters_count,
        abbreviation: b[cfg.abbr_key],
      }));
    }

    // blank verse template (one per book per language — chapter 1, verse 1 only)
    const blankVerseTemplates = {};
    for (const [lang, cfg] of Object.entries(LANG_CONFIG)) {
      blankVerseTemplates[lang] = BOOKS.map(b => ({
        _filename: `bible_verses_${lang}_${b.book_key}.json`,
        translation_code: cfg.translation_code,
        language_code: lang,
        book_key: b.book_key,
        book_name: b[cfg.name_key],
        book_order: b.book_order,
        testament: b.testament,
        chapters_count: b.chapters_count,
        verses: [
          { verse_id:`${lang}-${b.book_key}-1-1`, chapter:1, verse:1, text:'', paragraph_break_before:false, heading:null }
        ]
      }));
    }

    const payload = {
      generated_at: new Date().toISOString(),
      files: {
        'translations.json': translations,
        'bible_books_en.json': bibleBooks['bible_books_en'],
        'bible_books_om.json': bibleBooks['bible_books_om'],
        'bible_books_am.json': bibleBooks['bible_books_am'],
        'verse_of_day.json': generateVerseOfDay(),
        'blank_verse_templates': {
          description: '198 blank verse file shells (66 books × 3 languages). Each entry shows the _filename to save as and the starter structure.',
          en: blankVerseTemplates['en'],
          om: blankVerseTemplates['om'],
          am: blankVerseTemplates['am'],
        }
      },
      stats: {
        translations: translations.length,
        books_per_language: BOOKS.length,
        total_book_records: BOOKS.length * 3,
        verse_of_day_entries: 365,
        blank_verse_files: BOOKS.length * 3,
      }
    };

    console.log('[generateBibleTemplates] Generated package:', payload.stats);
    return Response.json(payload);

  } catch (error) {
    console.error('[generateBibleTemplates] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});