/**
 * seedBibleBookMetadata
 * Admin-only. Seeds BibleTranslation + BibleBook records for en, om, am.
 * Safe to re-run — skips existing records by translation_code + book_key.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TRANSLATIONS = [
  { language_code: 'en', translation_code: 'english_bible', translation_name: 'English Bible', is_active: true, is_public_domain: true, notes: 'Map to a public-domain source e.g. WEB or ASV' },
  { language_code: 'om', translation_code: 'oromo_bible', translation_name: 'Afaan Oromoo Bible', is_active: true, is_public_domain: false, notes: 'Add licensed or public-domain text later' },
  { language_code: 'am', translation_code: 'amharic_bible', translation_name: 'Amharic Bible', is_active: true, is_public_domain: false, notes: 'Add licensed or public-domain text later' },
];

const BOOKS_EN = [
  { book_key:'genesis',book_name:'Genesis',book_order:1,testament:'old',chapters_count:50,abbreviation:'Gen' },
  { book_key:'exodus',book_name:'Exodus',book_order:2,testament:'old',chapters_count:40,abbreviation:'Exod' },
  { book_key:'leviticus',book_name:'Leviticus',book_order:3,testament:'old',chapters_count:27,abbreviation:'Lev' },
  { book_key:'numbers',book_name:'Numbers',book_order:4,testament:'old',chapters_count:36,abbreviation:'Num' },
  { book_key:'deuteronomy',book_name:'Deuteronomy',book_order:5,testament:'old',chapters_count:34,abbreviation:'Deut' },
  { book_key:'joshua',book_name:'Joshua',book_order:6,testament:'old',chapters_count:24,abbreviation:'Josh' },
  { book_key:'judges',book_name:'Judges',book_order:7,testament:'old',chapters_count:21,abbreviation:'Judg' },
  { book_key:'ruth',book_name:'Ruth',book_order:8,testament:'old',chapters_count:4,abbreviation:'Ruth' },
  { book_key:'1samuel',book_name:'1 Samuel',book_order:9,testament:'old',chapters_count:31,abbreviation:'1Sam' },
  { book_key:'2samuel',book_name:'2 Samuel',book_order:10,testament:'old',chapters_count:24,abbreviation:'2Sam' },
  { book_key:'1kings',book_name:'1 Kings',book_order:11,testament:'old',chapters_count:22,abbreviation:'1Kgs' },
  { book_key:'2kings',book_name:'2 Kings',book_order:12,testament:'old',chapters_count:25,abbreviation:'2Kgs' },
  { book_key:'1chronicles',book_name:'1 Chronicles',book_order:13,testament:'old',chapters_count:29,abbreviation:'1Chr' },
  { book_key:'2chronicles',book_name:'2 Chronicles',book_order:14,testament:'old',chapters_count:36,abbreviation:'2Chr' },
  { book_key:'ezra',book_name:'Ezra',book_order:15,testament:'old',chapters_count:10,abbreviation:'Ezra' },
  { book_key:'nehemiah',book_name:'Nehemiah',book_order:16,testament:'old',chapters_count:13,abbreviation:'Neh' },
  { book_key:'esther',book_name:'Esther',book_order:17,testament:'old',chapters_count:10,abbreviation:'Esth' },
  { book_key:'job',book_name:'Job',book_order:18,testament:'old',chapters_count:42,abbreviation:'Job' },
  { book_key:'psalms',book_name:'Psalms',book_order:19,testament:'old',chapters_count:150,abbreviation:'Ps' },
  { book_key:'proverbs',book_name:'Proverbs',book_order:20,testament:'old',chapters_count:31,abbreviation:'Prov' },
  { book_key:'ecclesiastes',book_name:'Ecclesiastes',book_order:21,testament:'old',chapters_count:12,abbreviation:'Eccl' },
  { book_key:'songofsolomon',book_name:'Song of Solomon',book_order:22,testament:'old',chapters_count:8,abbreviation:'Song' },
  { book_key:'isaiah',book_name:'Isaiah',book_order:23,testament:'old',chapters_count:66,abbreviation:'Isa' },
  { book_key:'jeremiah',book_name:'Jeremiah',book_order:24,testament:'old',chapters_count:52,abbreviation:'Jer' },
  { book_key:'lamentations',book_name:'Lamentations',book_order:25,testament:'old',chapters_count:5,abbreviation:'Lam' },
  { book_key:'ezekiel',book_name:'Ezekiel',book_order:26,testament:'old',chapters_count:48,abbreviation:'Ezek' },
  { book_key:'daniel',book_name:'Daniel',book_order:27,testament:'old',chapters_count:12,abbreviation:'Dan' },
  { book_key:'hosea',book_name:'Hosea',book_order:28,testament:'old',chapters_count:14,abbreviation:'Hos' },
  { book_key:'joel',book_name:'Joel',book_order:29,testament:'old',chapters_count:3,abbreviation:'Joel' },
  { book_key:'amos',book_name:'Amos',book_order:30,testament:'old',chapters_count:9,abbreviation:'Amos' },
  { book_key:'obadiah',book_name:'Obadiah',book_order:31,testament:'old',chapters_count:1,abbreviation:'Obad' },
  { book_key:'jonah',book_name:'Jonah',book_order:32,testament:'old',chapters_count:4,abbreviation:'Jonah' },
  { book_key:'micah',book_name:'Micah',book_order:33,testament:'old',chapters_count:7,abbreviation:'Mic' },
  { book_key:'nahum',book_name:'Nahum',book_order:34,testament:'old',chapters_count:3,abbreviation:'Nah' },
  { book_key:'habakkuk',book_name:'Habakkuk',book_order:35,testament:'old',chapters_count:3,abbreviation:'Hab' },
  { book_key:'zephaniah',book_name:'Zephaniah',book_order:36,testament:'old',chapters_count:3,abbreviation:'Zeph' },
  { book_key:'haggai',book_name:'Haggai',book_order:37,testament:'old',chapters_count:2,abbreviation:'Hag' },
  { book_key:'zechariah',book_name:'Zechariah',book_order:38,testament:'old',chapters_count:14,abbreviation:'Zech' },
  { book_key:'malachi',book_name:'Malachi',book_order:39,testament:'old',chapters_count:4,abbreviation:'Mal' },
  { book_key:'matthew',book_name:'Matthew',book_order:40,testament:'new',chapters_count:28,abbreviation:'Matt' },
  { book_key:'mark',book_name:'Mark',book_order:41,testament:'new',chapters_count:16,abbreviation:'Mark' },
  { book_key:'luke',book_name:'Luke',book_order:42,testament:'new',chapters_count:24,abbreviation:'Luke' },
  { book_key:'john',book_name:'John',book_order:43,testament:'new',chapters_count:21,abbreviation:'John' },
  { book_key:'acts',book_name:'Acts',book_order:44,testament:'new',chapters_count:28,abbreviation:'Acts' },
  { book_key:'romans',book_name:'Romans',book_order:45,testament:'new',chapters_count:16,abbreviation:'Rom' },
  { book_key:'1corinthians',book_name:'1 Corinthians',book_order:46,testament:'new',chapters_count:16,abbreviation:'1Cor' },
  { book_key:'2corinthians',book_name:'2 Corinthians',book_order:47,testament:'new',chapters_count:13,abbreviation:'2Cor' },
  { book_key:'galatians',book_name:'Galatians',book_order:48,testament:'new',chapters_count:6,abbreviation:'Gal' },
  { book_key:'ephesians',book_name:'Ephesians',book_order:49,testament:'new',chapters_count:6,abbreviation:'Eph' },
  { book_key:'philippians',book_name:'Philippians',book_order:50,testament:'new',chapters_count:4,abbreviation:'Phil' },
  { book_key:'colossians',book_name:'Colossians',book_order:51,testament:'new',chapters_count:4,abbreviation:'Col' },
  { book_key:'1thessalonians',book_name:'1 Thessalonians',book_order:52,testament:'new',chapters_count:5,abbreviation:'1Thess' },
  { book_key:'2thessalonians',book_name:'2 Thessalonians',book_order:53,testament:'new',chapters_count:3,abbreviation:'2Thess' },
  { book_key:'1timothy',book_name:'1 Timothy',book_order:54,testament:'new',chapters_count:6,abbreviation:'1Tim' },
  { book_key:'2timothy',book_name:'2 Timothy',book_order:55,testament:'new',chapters_count:4,abbreviation:'2Tim' },
  { book_key:'titus',book_name:'Titus',book_order:56,testament:'new',chapters_count:3,abbreviation:'Titus' },
  { book_key:'philemon',book_name:'Philemon',book_order:57,testament:'new',chapters_count:1,abbreviation:'Phlm' },
  { book_key:'hebrews',book_name:'Hebrews',book_order:58,testament:'new',chapters_count:13,abbreviation:'Heb' },
  { book_key:'james',book_name:'James',book_order:59,testament:'new',chapters_count:5,abbreviation:'Jas' },
  { book_key:'1peter',book_name:'1 Peter',book_order:60,testament:'new',chapters_count:5,abbreviation:'1Pet' },
  { book_key:'2peter',book_name:'2 Peter',book_order:61,testament:'new',chapters_count:3,abbreviation:'2Pet' },
  { book_key:'1john',book_name:'1 John',book_order:62,testament:'new',chapters_count:5,abbreviation:'1John' },
  { book_key:'2john',book_name:'2 John',book_order:63,testament:'new',chapters_count:1,abbreviation:'2John' },
  { book_key:'3john',book_name:'3 John',book_order:64,testament:'new',chapters_count:1,abbreviation:'3John' },
  { book_key:'jude',book_name:'Jude',book_order:65,testament:'new',chapters_count:1,abbreviation:'Jude' },
  { book_key:'revelation',book_name:'Revelation',book_order:66,testament:'new',chapters_count:22,abbreviation:'Rev' },
];

const BOOKS_OM = [
  { book_key:'genesis',book_name:"Uumama",book_order:1,testament:'old',chapters_count:50,abbreviation:'Uma' },
  { book_key:'exodus',book_name:"Ba'uu",book_order:2,testament:'old',chapters_count:40,abbreviation:'Bau' },
  { book_key:'leviticus',book_name:'Lewwota',book_order:3,testament:'old',chapters_count:27,abbreviation:'Lew' },
  { book_key:'numbers',book_name:'Lakkoobsa',book_order:4,testament:'old',chapters_count:36,abbreviation:'Lak' },
  { book_key:'deuteronomy',book_name:'Keessa Deebii Seeraa',book_order:5,testament:'old',chapters_count:34,abbreviation:'KDS' },
  { book_key:'joshua',book_name:'Iyyaasuu',book_order:6,testament:'old',chapters_count:24,abbreviation:'Iya' },
  { book_key:'judges',book_name:'Abbootii Murtii',book_order:7,testament:'old',chapters_count:21,abbreviation:'Abm' },
  { book_key:'ruth',book_name:'Ruut',book_order:8,testament:'old',chapters_count:4,abbreviation:'Rut' },
  { book_key:'1samuel',book_name:"1 Saamu'el",book_order:9,testament:'old',chapters_count:31,abbreviation:'1Sam' },
  { book_key:'2samuel',book_name:"2 Saamu'el",book_order:10,testament:'old',chapters_count:24,abbreviation:'2Sam' },
  { book_key:'1kings',book_name:'1 Moototaa',book_order:11,testament:'old',chapters_count:22,abbreviation:'1Mot' },
  { book_key:'2kings',book_name:'2 Moototaa',book_order:12,testament:'old',chapters_count:25,abbreviation:'2Mot' },
  { book_key:'1chronicles',book_name:'1 Seenaa Bara',book_order:13,testament:'old',chapters_count:29,abbreviation:'1Sen' },
  { book_key:'2chronicles',book_name:'2 Seenaa Bara',book_order:14,testament:'old',chapters_count:36,abbreviation:'2Sen' },
  { book_key:'ezra',book_name:'Izraa',book_order:15,testament:'old',chapters_count:10,abbreviation:'Izr' },
  { book_key:'nehemiah',book_name:'Nahimiyaa',book_order:16,testament:'old',chapters_count:13,abbreviation:'Nah' },
  { book_key:'esther',book_name:'Estheer',book_order:17,testament:'old',chapters_count:10,abbreviation:'Est' },
  { book_key:'job',book_name:'Iyoob',book_order:18,testament:'old',chapters_count:42,abbreviation:'Iyo' },
  { book_key:'psalms',book_name:'Faarfannaa',book_order:19,testament:'old',chapters_count:150,abbreviation:'Far' },
  { book_key:'proverbs',book_name:'Fakkeenya',book_order:20,testament:'old',chapters_count:31,abbreviation:'Fak' },
  { book_key:'ecclesiastes',book_name:'Lallabaa',book_order:21,testament:'old',chapters_count:12,abbreviation:'Lal' },
  { book_key:'songofsolomon',book_name:'Faarfannaa Solomoon',book_order:22,testament:'old',chapters_count:8,abbreviation:'Fas' },
  { book_key:'isaiah',book_name:'Isaayaas',book_order:23,testament:'old',chapters_count:66,abbreviation:'Isa' },
  { book_key:'jeremiah',book_name:'Ermiyaas',book_order:24,testament:'old',chapters_count:52,abbreviation:'Erm' },
  { book_key:'lamentations',book_name:"Waa'ee Boo'ichaa",book_order:25,testament:'old',chapters_count:5,abbreviation:'Boo' },
  { book_key:'ezekiel',book_name:"Hisqi'el",book_order:26,testament:'old',chapters_count:48,abbreviation:'His' },
  { book_key:'daniel',book_name:"Daani'el",book_order:27,testament:'old',chapters_count:12,abbreviation:'Dan' },
  { book_key:'hosea',book_name:"Hoose'aa",book_order:28,testament:'old',chapters_count:14,abbreviation:'Hos' },
  { book_key:'joel',book_name:"Yo'el",book_order:29,testament:'old',chapters_count:3,abbreviation:'Yoe' },
  { book_key:'amos',book_name:'Aamoos',book_order:30,testament:'old',chapters_count:9,abbreviation:'Aam' },
  { book_key:'obadiah',book_name:'Abdiiyaas',book_order:31,testament:'old',chapters_count:1,abbreviation:'Abd' },
  { book_key:'jonah',book_name:'Yoonaas',book_order:32,testament:'old',chapters_count:4,abbreviation:'Yoo' },
  { book_key:'micah',book_name:'Miikiyaas',book_order:33,testament:'old',chapters_count:7,abbreviation:'Mii' },
  { book_key:'nahum',book_name:'Naahoom',book_order:34,testament:'old',chapters_count:3,abbreviation:'Naa' },
  { book_key:'habakkuk',book_name:'Anbaaquum',book_order:35,testament:'old',chapters_count:3,abbreviation:'Anb' },
  { book_key:'zephaniah',book_name:'Sefaaniyaa',book_order:36,testament:'old',chapters_count:3,abbreviation:'Sef' },
  { book_key:'haggai',book_name:'Haggay',book_order:37,testament:'old',chapters_count:2,abbreviation:'Hag' },
  { book_key:'zechariah',book_name:'Zakariyaas',book_order:38,testament:'old',chapters_count:14,abbreviation:'Zak' },
  { book_key:'malachi',book_name:'Milkiyaas',book_order:39,testament:'old',chapters_count:4,abbreviation:'Mil' },
  { book_key:'matthew',book_name:'Maatewos',book_order:40,testament:'new',chapters_count:28,abbreviation:'Mat' },
  { book_key:'mark',book_name:'Maarqos',book_order:41,testament:'new',chapters_count:16,abbreviation:'Mar' },
  { book_key:'luke',book_name:'Luqaas',book_order:42,testament:'new',chapters_count:24,abbreviation:'Luq' },
  { book_key:'john',book_name:'Yohaannis',book_order:43,testament:'new',chapters_count:21,abbreviation:'Yoh' },
  { book_key:'acts',book_name:'Hojii Ergamootaa',book_order:44,testament:'new',chapters_count:28,abbreviation:'Hoe' },
  { book_key:'romans',book_name:'Roomaa',book_order:45,testament:'new',chapters_count:16,abbreviation:'Roo' },
  { book_key:'1corinthians',book_name:'1 Qorontos',book_order:46,testament:'new',chapters_count:16,abbreviation:'1Qor' },
  { book_key:'2corinthians',book_name:'2 Qorontos',book_order:47,testament:'new',chapters_count:13,abbreviation:'2Qor' },
  { book_key:'galatians',book_name:'Galaatiyaa',book_order:48,testament:'new',chapters_count:6,abbreviation:'Gal' },
  { book_key:'ephesians',book_name:'Efesoon',book_order:49,testament:'new',chapters_count:6,abbreviation:'Efe' },
  { book_key:'philippians',book_name:'Filiphisiyuus',book_order:50,testament:'new',chapters_count:4,abbreviation:'Fil' },
  { book_key:'colossians',book_name:'Qolossoos',book_order:51,testament:'new',chapters_count:4,abbreviation:'Qol' },
  { book_key:'1thessalonians',book_name:'1 Tasalonqee',book_order:52,testament:'new',chapters_count:5,abbreviation:'1Tas' },
  { book_key:'2thessalonians',book_name:'2 Tasalonqee',book_order:53,testament:'new',chapters_count:3,abbreviation:'2Tas' },
  { book_key:'1timothy',book_name:'1 Ximotewos',book_order:54,testament:'new',chapters_count:6,abbreviation:'1Xim' },
  { book_key:'2timothy',book_name:'2 Ximotewos',book_order:55,testament:'new',chapters_count:4,abbreviation:'2Xim' },
  { book_key:'titus',book_name:'Tiitoo',book_order:56,testament:'new',chapters_count:3,abbreviation:'Tii' },
  { book_key:'philemon',book_name:'Filemoon',book_order:57,testament:'new',chapters_count:1,abbreviation:'Film' },
  { book_key:'hebrews',book_name:'Ibroota',book_order:58,testament:'new',chapters_count:13,abbreviation:'Ibr' },
  { book_key:'james',book_name:'Yaaqoob',book_order:59,testament:'new',chapters_count:5,abbreviation:'Yaq' },
  { book_key:'1peter',book_name:'1 Phexiros',book_order:60,testament:'new',chapters_count:5,abbreviation:'1Phe' },
  { book_key:'2peter',book_name:'2 Phexiros',book_order:61,testament:'new',chapters_count:3,abbreviation:'2Phe' },
  { book_key:'1john',book_name:'1 Yohaannis',book_order:62,testament:'new',chapters_count:5,abbreviation:'1Yoh' },
  { book_key:'2john',book_name:'2 Yohaannis',book_order:63,testament:'new',chapters_count:1,abbreviation:'2Yoh' },
  { book_key:'3john',book_name:'3 Yohaannis',book_order:64,testament:'new',chapters_count:1,abbreviation:'3Yoh' },
  { book_key:'jude',book_name:'Yihudaa',book_order:65,testament:'new',chapters_count:1,abbreviation:'Yih' },
  { book_key:'revelation',book_name:"Mul'ata",book_order:66,testament:'new',chapters_count:22,abbreviation:'Mul' },
];

const BOOKS_AM = [
  { book_key:'genesis',book_name:'ዘፍጥረት',book_order:1,testament:'old',chapters_count:50,abbreviation:'ዘፍ' },
  { book_key:'exodus',book_name:'ዘጸአት',book_order:2,testament:'old',chapters_count:40,abbreviation:'ዘጸ' },
  { book_key:'leviticus',book_name:'ዘሌዋውያን',book_order:3,testament:'old',chapters_count:27,abbreviation:'ዘሌ' },
  { book_key:'numbers',book_name:'ዘኍልቍ',book_order:4,testament:'old',chapters_count:36,abbreviation:'ዘኍ' },
  { book_key:'deuteronomy',book_name:'ዘዳግም',book_order:5,testament:'old',chapters_count:34,abbreviation:'ዘዳ' },
  { book_key:'joshua',book_name:'ኢያሱ',book_order:6,testament:'old',chapters_count:24,abbreviation:'ኢያ' },
  { book_key:'judges',book_name:'መሳፍንት',book_order:7,testament:'old',chapters_count:21,abbreviation:'መሳ' },
  { book_key:'ruth',book_name:'ሩት',book_order:8,testament:'old',chapters_count:4,abbreviation:'ሩት' },
  { book_key:'1samuel',book_name:'1 ሳሙኤል',book_order:9,testament:'old',chapters_count:31,abbreviation:'1ሳሙ' },
  { book_key:'2samuel',book_name:'2 ሳሙኤል',book_order:10,testament:'old',chapters_count:24,abbreviation:'2ሳሙ' },
  { book_key:'1kings',book_name:'1 ነገሥት',book_order:11,testament:'old',chapters_count:22,abbreviation:'1ነገ' },
  { book_key:'2kings',book_name:'2 ነገሥት',book_order:12,testament:'old',chapters_count:25,abbreviation:'2ነገ' },
  { book_key:'1chronicles',book_name:'1 ዜና መዋዕል',book_order:13,testament:'old',chapters_count:29,abbreviation:'1ዜና' },
  { book_key:'2chronicles',book_name:'2 ዜና መዋዕል',book_order:14,testament:'old',chapters_count:36,abbreviation:'2ዜና' },
  { book_key:'ezra',book_name:'ዕዝራ',book_order:15,testament:'old',chapters_count:10,abbreviation:'ዕዝ' },
  { book_key:'nehemiah',book_name:'ነህምያ',book_order:16,testament:'old',chapters_count:13,abbreviation:'ነህ' },
  { book_key:'esther',book_name:'አስቴር',book_order:17,testament:'old',chapters_count:10,abbreviation:'አስ' },
  { book_key:'job',book_name:'ኢዮብ',book_order:18,testament:'old',chapters_count:42,abbreviation:'ኢዮ' },
  { book_key:'psalms',book_name:'መዝሙር',book_order:19,testament:'old',chapters_count:150,abbreviation:'መዝ' },
  { book_key:'proverbs',book_name:'ምሳሌ',book_order:20,testament:'old',chapters_count:31,abbreviation:'ምሳ' },
  { book_key:'ecclesiastes',book_name:'መክብብ',book_order:21,testament:'old',chapters_count:12,abbreviation:'መክ' },
  { book_key:'songofsolomon',book_name:'መኃልየ መኃልይ',book_order:22,testament:'old',chapters_count:8,abbreviation:'መኃ' },
  { book_key:'isaiah',book_name:'ኢሳይያስ',book_order:23,testament:'old',chapters_count:66,abbreviation:'ኢሳ' },
  { book_key:'jeremiah',book_name:'ኤርምያስ',book_order:24,testament:'old',chapters_count:52,abbreviation:'ኤር' },
  { book_key:'lamentations',book_name:'ሰቆቃወ ኤርምያስ',book_order:25,testament:'old',chapters_count:5,abbreviation:'ሰቆ' },
  { book_key:'ezekiel',book_name:'ሕዝቅኤል',book_order:26,testament:'old',chapters_count:48,abbreviation:'ሕዝ' },
  { book_key:'daniel',book_name:'ዳንኤል',book_order:27,testament:'old',chapters_count:12,abbreviation:'ዳን' },
  { book_key:'hosea',book_name:'ሆሴዕ',book_order:28,testament:'old',chapters_count:14,abbreviation:'ሆሴ' },
  { book_key:'joel',book_name:'ኢዮኤል',book_order:29,testament:'old',chapters_count:3,abbreviation:'ኢዮኤ' },
  { book_key:'amos',book_name:'አሞጽ',book_order:30,testament:'old',chapters_count:9,abbreviation:'አሞ' },
  { book_key:'obadiah',book_name:'አብድዩ',book_order:31,testament:'old',chapters_count:1,abbreviation:'አብድ' },
  { book_key:'jonah',book_name:'ዮናስ',book_order:32,testament:'old',chapters_count:4,abbreviation:'ዮና' },
  { book_key:'micah',book_name:'ሚክያስ',book_order:33,testament:'old',chapters_count:7,abbreviation:'ሚክ' },
  { book_key:'nahum',book_name:'ናሆም',book_order:34,testament:'old',chapters_count:3,abbreviation:'ናሆ' },
  { book_key:'habakkuk',book_name:'ዕንባቆም',book_order:35,testament:'old',chapters_count:3,abbreviation:'ዕንባ' },
  { book_key:'zephaniah',book_name:'ሶፎንያስ',book_order:36,testament:'old',chapters_count:3,abbreviation:'ሶፎ' },
  { book_key:'haggai',book_name:'ሐጌ',book_order:37,testament:'old',chapters_count:2,abbreviation:'ሐጌ' },
  { book_key:'zechariah',book_name:'ዘካርያስ',book_order:38,testament:'old',chapters_count:14,abbreviation:'ዘካ' },
  { book_key:'malachi',book_name:'ሚልክያስ',book_order:39,testament:'old',chapters_count:4,abbreviation:'ሚል' },
  { book_key:'matthew',book_name:'ማቴዎስ',book_order:40,testament:'new',chapters_count:28,abbreviation:'ማቴ' },
  { book_key:'mark',book_name:'ማርቆስ',book_order:41,testament:'new',chapters_count:16,abbreviation:'ማር' },
  { book_key:'luke',book_name:'ሉቃስ',book_order:42,testament:'new',chapters_count:24,abbreviation:'ሉቃ' },
  { book_key:'john',book_name:'ዮሐንስ',book_order:43,testament:'new',chapters_count:21,abbreviation:'ዮሐ' },
  { book_key:'acts',book_name:'የሐዋርያት ሥራ',book_order:44,testament:'new',chapters_count:28,abbreviation:'ሐዋ' },
  { book_key:'romans',book_name:'ሮሜ',book_order:45,testament:'new',chapters_count:16,abbreviation:'ሮሜ' },
  { book_key:'1corinthians',book_name:'1 ቆሮንቶስ',book_order:46,testament:'new',chapters_count:16,abbreviation:'1ቆሮ' },
  { book_key:'2corinthians',book_name:'2 ቆሮንቶስ',book_order:47,testament:'new',chapters_count:13,abbreviation:'2ቆሮ' },
  { book_key:'galatians',book_name:'ገላትያ',book_order:48,testament:'new',chapters_count:6,abbreviation:'ገላ' },
  { book_key:'ephesians',book_name:'ኤፌሶን',book_order:49,testament:'new',chapters_count:6,abbreviation:'ኤፌ' },
  { book_key:'philippians',book_name:'ፊልጵስዩስ',book_order:50,testament:'new',chapters_count:4,abbreviation:'ፊል' },
  { book_key:'colossians',book_name:'ቈላስይስ',book_order:51,testament:'new',chapters_count:4,abbreviation:'ቈላ' },
  { book_key:'1thessalonians',book_name:'1 ተሰሎንቄ',book_order:52,testament:'new',chapters_count:5,abbreviation:'1ተሰ' },
  { book_key:'2thessalonians',book_name:'2 ተሰሎንቄ',book_order:53,testament:'new',chapters_count:3,abbreviation:'2ተሰ' },
  { book_key:'1timothy',book_name:'1 ጢሞቴዎስ',book_order:54,testament:'new',chapters_count:6,abbreviation:'1ጢሞ' },
  { book_key:'2timothy',book_name:'2 ጢሞቴዎስ',book_order:55,testament:'new',chapters_count:4,abbreviation:'2ጢሞ' },
  { book_key:'titus',book_name:'ቲቶ',book_order:56,testament:'new',chapters_count:3,abbreviation:'ቲቶ' },
  { book_key:'philemon',book_name:'ፊልሞና',book_order:57,testament:'new',chapters_count:1,abbreviation:'ፊልሞ' },
  { book_key:'hebrews',book_name:'ዕብራውያን',book_order:58,testament:'new',chapters_count:13,abbreviation:'ዕብ' },
  { book_key:'james',book_name:'ያዕቆብ',book_order:59,testament:'new',chapters_count:5,abbreviation:'ያዕ' },
  { book_key:'1peter',book_name:'1 ጴጥሮስ',book_order:60,testament:'new',chapters_count:5,abbreviation:'1ጴጥ' },
  { book_key:'2peter',book_name:'2 ጴጥሮስ',book_order:61,testament:'new',chapters_count:3,abbreviation:'2ጴጥ' },
  { book_key:'1john',book_name:'1 ዮሐንስ',book_order:62,testament:'new',chapters_count:5,abbreviation:'1ዮሐ' },
  { book_key:'2john',book_name:'2 ዮሐንስ',book_order:63,testament:'new',chapters_count:1,abbreviation:'2ዮሐ' },
  { book_key:'3john',book_name:'3 ዮሐንስ',book_order:64,testament:'new',chapters_count:1,abbreviation:'3ዮሐ' },
  { book_key:'jude',book_name:'ይሁዳ',book_order:65,testament:'new',chapters_count:1,abbreviation:'ይሁ' },
  { book_key:'revelation',book_name:'ራእይ',book_order:66,testament:'new',chapters_count:22,abbreviation:'ራእ' },
];

// Map language datasets with their translation_code + language_code
const LANGUAGE_DATASETS = [
  { translation_code: 'english_bible', language_code: 'en', books: BOOKS_EN },
  { translation_code: 'oromo_bible',   language_code: 'om', books: BOOKS_OM },
  { translation_code: 'amharic_bible', language_code: 'am', books: BOOKS_AM },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = { translations: { inserted: 0, skipped: 0 }, books: { inserted: 0, skipped: 0 } };

    // ── SEED TRANSLATIONS ──────────────────────────────────────────────────────
    for (const t of TRANSLATIONS) {
      const existing = await base44.asServiceRole.entities.BibleTranslation.filter(
        { translation_code: t.translation_code }, 'translation_code', 1
      );
      if (existing && existing.length > 0) {
        results.translations.skipped++;
      } else {
        await base44.asServiceRole.entities.BibleTranslation.create(t);
        results.translations.inserted++;
      }
    }

    // ── SEED BOOKS ─────────────────────────────────────────────────────────────
    for (const { translation_code, language_code, books } of LANGUAGE_DATASETS) {
      // Fetch all existing books for this translation in one call
      const existing = await base44.asServiceRole.entities.BibleBook.filter(
        { translation_code }, 'book_order', 100
      );
      const existingKeys = new Set((existing || []).map(b => b.book_key));

      for (const book of books) {
        if (existingKeys.has(book.book_key)) {
          results.books.skipped++;
        } else {
          await base44.asServiceRole.entities.BibleBook.create({
            ...book,
            translation_code,
            language_code,
          });
          results.books.inserted++;
        }
      }
    }

    console.log('[seedBibleBookMetadata] Done:', results);
    return Response.json({
      success: true,
      message: `Seeded ${results.translations.inserted} translations (${results.translations.skipped} skipped), ${results.books.inserted} books (${results.books.skipped} skipped)`,
      results,
    });

  } catch (error) {
    console.error('[seedBibleBookMetadata] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});