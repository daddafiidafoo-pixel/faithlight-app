import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BIBLE_BOOKS = [{"id":1,"testament":"old","key":"genesis","chapters":50,"name":{"en":"Genesis","om":"Seera Uumamaa","am":"ኦሪት ዘፍጥረት","ar":"التكوين","sw":"Mwanzo","fr":"Genèse"}},{"id":2,"testament":"old","key":"exodus","chapters":40,"name":{"en":"Exodus","om":"Ba'uu","am":"ኦሪት ዘጸአት","ar":"الخروج","sw":"Kutoka","fr":"Exode"}},{"id":3,"testament":"old","key":"leviticus","chapters":27,"name":{"en":"Leviticus","om":"Lewwota","am":"ኦሪት ዘሌዋውያን","ar":"اللاويين","sw":"Mambo ya Walawi","fr":"Lévitique"}},{"id":4,"testament":"old","key":"numbers","chapters":36,"name":{"en":"Numbers","om":"Lakkoobsa","am":"ኦሪት ዘኍልቍ","ar":"العدد","sw":"Hesabu","fr":"Nombres"}},{"id":5,"testament":"old","key":"deuteronomy","chapters":34,"name":{"en":"Deuteronomy","om":"Keessa Deebii","am":"ኦሪት ዘዳግም","ar":"التثنية","sw":"Kumbukumbu la Torati","fr":"Deutéronome"}},{"id":6,"testament":"old","key":"joshua","chapters":24,"name":{"en":"Joshua","om":"Iyyaasuu","am":"ኢያሱ","ar":"يشوع","sw":"Yoshua","fr":"Josué"}},{"id":7,"testament":"old","key":"judges","chapters":21,"name":{"en":"Judges","om":"Abbootii Murtii","am":"መሳፍንት","ar":"القضاة","sw":"Waamuzi","fr":"Juges"}},{"id":8,"testament":"old","key":"ruth","chapters":4,"name":{"en":"Ruth","om":"Ruut","am":"ሩት","ar":"راعوث","sw":"Ruthu","fr":"Ruth"}},{"id":9,"testament":"old","key":"1-samuel","chapters":31,"name":{"en":"1 Samuel","om":"1 Saamu'eel","am":"1 ሳሙኤል","ar":"صموئيل الأول","sw":"1 Samweli","fr":"1 Samuel"}},{"id":10,"testament":"old","key":"2-samuel","chapters":24,"name":{"en":"2 Samuel","om":"2 Saamu'eel","am":"2 ሳሙኤል","ar":"صموئيل الثاني","sw":"2 Samweli","fr":"2 Samuel"}},{"id":11,"testament":"old","key":"1-kings","chapters":22,"name":{"en":"1 Kings","om":"1 Mootota","am":"1 ነገሥት","ar":"الملوك الأول","sw":"1 Wafalme","fr":"1 Rois"}},{"id":12,"testament":"old","key":"2-kings","chapters":25,"name":{"en":"2 Kings","om":"2 Mootota","am":"2 ነገሥት","ar":"الملوك الثاني","sw":"2 Wafalme","fr":"2 Rois"}},{"id":13,"testament":"old","key":"1-chronicles","chapters":29,"name":{"en":"1 Chronicles","om":"1 Seenaa Baraa","am":"1 ዜና መዋዕል","ar":"أخبار الأيام الأول","sw":"1 Mambo ya Nyakati","fr":"1 Chroniques"}},{"id":14,"testament":"old","key":"2-chronicles","chapters":36,"name":{"en":"2 Chronicles","om":"2 Seenaa Baraa","am":"2 ዜና መዋዕል","ar":"أخبار الأيام الثاني","sw":"2 Mambo ya Nyakati","fr":"2 Chroniques"}},{"id":15,"testament":"old","key":"ezra","chapters":10,"name":{"en":"Ezra","om":"Izraa","am":"ዕዝራ","ar":"عزرا","sw":"Ezra","fr":"Esdras"}},{"id":16,"testament":"old","key":"nehemiah","chapters":13,"name":{"en":"Nehemiah","om":"Nehimiiyaa","am":"ነህምያ","ar":"نحميا","sw":"Nehemia","fr":"Néhémie"}},{"id":17,"testament":"old","key":"esther","chapters":10,"name":{"en":"Esther","om":"Asteer","am":"አስቴር","ar":"أستير","sw":"Esta","fr":"Esther"}},{"id":18,"testament":"old","key":"job","chapters":42,"name":{"en":"Job","om":"Iyoob","am":"ኢዮብ","ar":"أيوب","sw":"Ayubu","fr":"Job"}},{"id":19,"testament":"old","key":"psalms","chapters":150,"name":{"en":"Psalms","om":"Faarfannaa","am":"መዝሙረ ዳዊት","ar":"المزامير","sw":"Zaburi","fr":"Psaumes"}},{"id":20,"testament":"old","key":"proverbs","chapters":31,"name":{"en":"Proverbs","om":"Fakkeenya","am":"ምሳሌ","ar":"الأمثال","sw":"Mithali","fr":"Proverbes"}},{"id":21,"testament":"old","key":"ecclesiastes","chapters":12,"name":{"en":"Ecclesiastes","om":"Lallaba","am":"መክብብ","ar":"الجامعة","sw":"Mhubiri","fr":"Ecclésiaste"}},{"id":22,"testament":"old","key":"song-of-solomon","chapters":8,"name":{"en":"Song of Solomon","om":"Weedduu Solomoon","am":"መኃልየ መኃልይ","ar":"نشيد الأنشاد","sw":"Wimbo Ulio Bora","fr":"Cantique des Cantiques"}},{"id":23,"testament":"old","key":"isaiah","chapters":66,"name":{"en":"Isaiah","om":"Isaayyaas","am":"ኢሳይያስ","ar":"إشعياء","sw":"Isaya","fr":"Ésaïe"}},{"id":24,"testament":"old","key":"jeremiah","chapters":52,"name":{"en":"Jeremiah","om":"Ermiyaas","am":"ኤርምያስ","ar":"إرميا","sw":"Yeremia","fr":"Jérémie"}},{"id":25,"testament":"old","key":"lamentations","chapters":5,"name":{"en":"Lamentations","om":"Bo'icha Ermiyaas","am":"ሰቆቃወ ኤርምያስ","ar":"مراثي إرميا","sw":"Maombolezo","fr":"Lamentations"}},{"id":26,"testament":"old","key":"ezekiel","chapters":48,"name":{"en":"Ezekiel","om":"Hisqi'eel","am":"ሕዝቅኤል","ar":"حزقيال","sw":"Ezekieli","fr":"Ézéchiel"}},{"id":27,"testament":"old","key":"daniel","chapters":12,"name":{"en":"Daniel","om":"Daani'eel","am":"ዳንኤል","ar":"دانيال","sw":"Danieli","fr":"Daniel"}},{"id":28,"testament":"old","key":"hosea","chapters":14,"name":{"en":"Hosea","om":"Hoose'aa","am":"ሆሴዕ","ar":"هوشع","sw":"Hosea","fr":"Osée"}},{"id":29,"testament":"old","key":"joel","chapters":3,"name":{"en":"Joel","om":"Yo'el","am":"ኢዮኤል","ar":"يوئيل","sw":"Yoeli","fr":"Joël"}},{"id":30,"testament":"old","key":"amos","chapters":9,"name":{"en":"Amos","om":"Aamoos","am":"አሞጽ","ar":"عاموس","sw":"Amosi","fr":"Amos"}},{"id":31,"testament":"old","key":"obadiah","chapters":1,"name":{"en":"Obadiah","om":"Obaadiyaa","am":"አብድዩ","ar":"عوبديا","sw":"Obadia","fr":"Abdias"}},{"id":32,"testament":"old","key":"jonah","chapters":4,"name":{"en":"Jonah","om":"Yoonaas","am":"ዮናስ","ar":"يونان","sw":"Yona","fr":"Jonas"}},{"id":33,"testament":"old","key":"micah","chapters":7,"name":{"en":"Micah","om":"Miikiyaas","am":"ሚክያስ","ar":"ميخا","sw":"Mika","fr":"Michée"}},{"id":34,"testament":"old","key":"nahum","chapters":3,"name":{"en":"Nahum","om":"Naahoom","am":"ናሆም","ar":"ناحوم","sw":"Nahumu","fr":"Nahum"}},{"id":35,"testament":"old","key":"habakkuk","chapters":3,"name":{"en":"Habakkuk","om":"Habaquuq","am":"ዕንባቆም","ar":"حبقوق","sw":"Habakuki","fr":"Habacuc"}},{"id":36,"testament":"old","key":"zephaniah","chapters":3,"name":{"en":"Zephaniah","om":"Sefaaniyaa","am":"ሶፖንያስ","ar":"صفنيا","sw":"Sefania","fr":"Sophonie"}},{"id":37,"testament":"old","key":"haggai","chapters":2,"name":{"en":"Haggai","om":"Hagayi","am":"ሐጌ","ar":"حجي","sw":"Hagai","fr":"Aggée"}},{"id":38,"testament":"old","key":"zechariah","chapters":14,"name":{"en":"Zechariah","om":"Zakariyaas","am":"ዘካርያስ","ar":"زكريا","sw":"Zekaria","fr":"Zacharie"}},{"id":39,"testament":"old","key":"malachi","chapters":4,"name":{"en":"Malachi","om":"Malaaki","am":"ሚልክያስ","ar":"ملاخي","sw":"Malaki","fr":"Malachie"}},{"id":40,"testament":"new","key":"matthew","chapters":28,"name":{"en":"Matthew","om":"Maatewos","am":"ማቴዎስ","ar":"متى","sw":"Mathayo","fr":"Matthieu"}},{"id":41,"testament":"new","key":"mark","chapters":16,"name":{"en":"Mark","om":"Maarqoos","am":"ማርቆስ","ar":"مرقس","sw":"Marko","fr":"Marc"}},{"id":42,"testament":"new","key":"luke","chapters":24,"name":{"en":"Luke","om":"Luqaas","am":"ሉቃስ","ar":"لوقا","sw":"Luka","fr":"Luc"}},{"id":43,"testament":"new","key":"john","chapters":21,"name":{"en":"John","om":"Yohaannis","am":"ዮሐንስ","ar":"يوحنا","sw":"Yohana","fr":"Jean"}},{"id":44,"testament":"new","key":"acts","chapters":28,"name":{"en":"Acts","om":"Hojii Ergamootaa","am":"የሐዋርያት ሥራ","ar":"أعمال الرسل","sw":"Matendo ya Mitume","fr":"Actes"}},{"id":45,"testament":"new","key":"romans","chapters":16,"name":{"en":"Romans","om":"Roomaa","am":"ሮሜ","ar":"رومية","sw":"Warumi","fr":"Romains"}},{"id":46,"testament":"new","key":"1-corinthians","chapters":16,"name":{"en":"1 Corinthians","om":"1 Qorontos","am":"1 ቆሮንቶስ","ar":"كورنثوس الأولى","sw":"1 Wakorintho","fr":"1 Corinthiens"}},{"id":47,"testament":"new","key":"2-corinthians","chapters":13,"name":{"en":"2 Corinthians","om":"2 Qorontos","am":"2 ቆሮንቶስ","ar":"كورنثوس الثانية","sw":"2 Wakorintho","fr":"2 Corinthiens"}},{"id":48,"testament":"new","key":"galatians","chapters":6,"name":{"en":"Galatians","om":"Galaatiyaa","am":"ገላትያ","ar":"غلاطية","sw":"Wagalatia","fr":"Galates"}},{"id":49,"testament":"new","key":"ephesians","chapters":6,"name":{"en":"Ephesians","om":"Efesoon","am":"ኤፌሶን","ar":"أفسس","sw":"Waefeso","fr":"Éphésiens"}},{"id":50,"testament":"new","key":"philippians","chapters":4,"name":{"en":"Philippians","om":"Filiphisiyuus","am":"ፊልጵስዩስ","ar":"فيلبي","sw":"Wafilipi","fr":"Philippiens"}},{"id":51,"testament":"new","key":"colossians","chapters":4,"name":{"en":"Colossians","om":"Qolosaayis","am":"ቆላስይስ","ar":"كولوسي","sw":"Wakolosai","fr":"Colossiens"}},{"id":52,"testament":"new","key":"1-thessalonians","chapters":5,"name":{"en":"1 Thessalonians","om":"1 Tasalonqee","am":"1 ተሰሎንቄ","ar":"تسالونيكي الأولى","sw":"1 Wathesalonike","fr":"1 Thessaloniciens"}},{"id":53,"testament":"new","key":"2-thessalonians","chapters":3,"name":{"en":"2 Thessalonians","om":"2 Tasalonqee","am":"2 ተሰሎንቄ","ar":"تسالونيكي الثانية","sw":"2 Wathesalonike","fr":"2 Thessaloniciens"}},{"id":54,"testament":"new","key":"1-timothy","chapters":6,"name":{"en":"1 Timothy","om":"1 Ximotewos","am":"1 ጢሞቴዎስ","ar":"تيموثاوس الأولى","sw":"1 Timotheo","fr":"1 Timothée"}},{"id":55,"testament":"new","key":"2-timothy","chapters":4,"name":{"en":"2 Timothy","om":"2 Ximotewos","am":"2 ጢሞቴዎስ","ar":"تيموثاوس الثانية","sw":"2 Timotheo","fr":"2 Timothée"}},{"id":56,"testament":"new","key":"titus","chapters":3,"name":{"en":"Titus","om":"Tiitoos","am":"ቲቶ","ar":"تيطس","sw":"Tito","fr":"Tite"}},{"id":57,"testament":"new","key":"philemon","chapters":1,"name":{"en":"Philemon","om":"Filemoon","am":"ፊልሞና","ar":"فليمون","sw":"Filemoni","fr":"Philémon"}},{"id":58,"testament":"new","key":"hebrews","chapters":13,"name":{"en":"Hebrews","om":"Ibroota","am":"ዕብራውያን","ar":"العبرانيين","sw":"Waebrania","fr":"Hébreux"}},{"id":59,"testament":"new","key":"james","chapters":5,"name":{"en":"James","om":"Yaaqoob","am":"ያዕቆብ","ar":"يعقوب","sw":"Yakobo","fr":"Jacques"}},{"id":60,"testament":"new","key":"1-peter","chapters":5,"name":{"en":"1 Peter","om":"1 Phexiroos","am":"1 ጴጥሮስ","ar":"بطرس الأولى","sw":"1 Petro","fr":"1 Pierre"}},{"id":61,"testament":"new","key":"2-peter","chapters":3,"name":{"en":"2 Peter","om":"2 Phexiroos","am":"2 ጴጥሮስ","ar":"بطرس الثانية","sw":"2 Petro","fr":"2 Pierre"}},{"id":62,"testament":"new","key":"1-john","chapters":5,"name":{"en":"1 John","om":"1 Yohaannis","am":"1 ዮሐንስ","ar":"يوحنا الأولى","sw":"1 Yohana","fr":"1 Jean"}},{"id":63,"testament":"new","key":"2-john","chapters":1,"name":{"en":"2 John","om":"2 Yohaannis","am":"2 ዮሐንስ","ar":"يوحنا الثانية","sw":"2 Yohana","fr":"2 Jean"}},{"id":64,"testament":"new","key":"3-john","chapters":1,"name":{"en":"3 John","om":"3 Yohaannis","am":"3 ዮሐንስ","ar":"يوحنا الثالثة","sw":"3 Yohana","fr":"3 Jean"}},{"id":65,"testament":"new","key":"jude","chapters":1,"name":{"en":"Jude","om":"Yihudaa","am":"ይሁዳ","ar":"يهوذا","sw":"Yuda","fr":"Jude"}},{"id":66,"testament":"new","key":"revelation","chapters":22,"name":{"en":"Revelation","om":"Mul'ata Yohaannis","am":"ራእይ ዮሐንስ","ar":"الرؤيا","sw":"Ufunuo","fr":"Apocalypse"}}];

const BIBLE_ABBREVIATIONS = [{"bookKey":"genesis","abbreviation":{"en":"Gen","om":"Uma","am":"ዘፍ","ar":"تك","sw":"Mwa","fr":"Gn"}},{"bookKey":"exodus","abbreviation":{"en":"Exod","om":"Bau","am":"ዘጸ","ar":"خر","sw":"Kut","fr":"Ex"}},{"bookKey":"leviticus","abbreviation":{"en":"Lev","om":"Lew","am":"ዘሌ","ar":"لا","sw":"Wal","fr":"Lv"}},{"bookKey":"numbers","abbreviation":{"en":"Num","om":"Lak","am":"ዘኍ","ar":"عد","sw":"Hes","fr":"Nb"}},{"bookKey":"deuteronomy","abbreviation":{"en":"Deut","om":"Kee","am":"ዘዳ","ar":"تث","sw":"Kum","fr":"Dt"}},{"bookKey":"joshua","abbreviation":{"en":"Josh","om":"Iyy","am":"ኢያ","ar":"يش","sw":"Yos","fr":"Jos"}},{"bookKey":"judges","abbreviation":{"en":"Judg","om":"Abb","am":"መሳ","ar":"قض","sw":"Waa","fr":"Jg"}},{"bookKey":"ruth","abbreviation":{"en":"Ruth","om":"Ruu","am":"ሩት","ar":"را","sw":"Rut","fr":"Rt"}},{"bookKey":"1-samuel","abbreviation":{"en":"1Sam","om":"1Sa","am":"1ሳ","ar":"1صم","sw":"1Sam","fr":"1S"}},{"bookKey":"2-samuel","abbreviation":{"en":"2Sam","om":"2Sa","am":"2ሳ","ar":"2صم","sw":"2Sam","fr":"2S"}},{"bookKey":"1-kings","abbreviation":{"en":"1Kgs","om":"1Mo","am":"1ነ","ar":"1مل","sw":"1Waf","fr":"1R"}},{"bookKey":"2-kings","abbreviation":{"en":"2Kgs","om":"2Mo","am":"2ነ","ar":"2مل","sw":"2Waf","fr":"2R"}},{"bookKey":"1-chronicles","abbreviation":{"en":"1Chr","om":"1Se","am":"1ዜ","ar":"1أخ","sw":"1Mam","fr":"1Ch"}},{"bookKey":"2-chronicles","abbreviation":{"en":"2Chr","om":"2Se","am":"2ዜ","ar":"2أخ","sw":"2Mam","fr":"2Ch"}},{"bookKey":"ezra","abbreviation":{"en":"Ezra","om":"Izr","am":"ዕዝ","ar":"عز","sw":"Ezr","fr":"Esd"}},{"bookKey":"nehemiah","abbreviation":{"en":"Neh","om":"Neh","am":"ነህ","ar":"نح","sw":"Neh","fr":"Né"}},{"bookKey":"esther","abbreviation":{"en":"Esth","om":"Ast","am":"አስ","ar":"است","sw":"Est","fr":"Est"}},{"bookKey":"job","abbreviation":{"en":"Job","om":"Iyo","am":"ኢዮ","ar":"أي","sw":"Ayu","fr":"Jb"}},{"bookKey":"psalms","abbreviation":{"en":"Ps","om":"Far","am":"መዝ","ar":"مز","sw":"Zab","fr":"Ps"}},{"bookKey":"proverbs","abbreviation":{"en":"Prov","om":"Fak","am":"ምሳ","ar":"أم","sw":"Mit","fr":"Pr"}},{"bookKey":"ecclesiastes","abbreviation":{"en":"Eccl","om":"Lal","am":"መክ","ar":"جا","sw":"Mhu","fr":"Ec"}},{"bookKey":"song-of-solomon","abbreviation":{"en":"Song","om":"Wed","am":"መኃ","ar":"نش","sw":"Wim","fr":"Ct"}},{"bookKey":"isaiah","abbreviation":{"en":"Isa","om":"Isa","am":"ኢሳ","ar":"اش","sw":"Isa","fr":"Es"}},{"bookKey":"jeremiah","abbreviation":{"en":"Jer","om":"Erm","am":"ኤር","ar":"إر","sw":"Yer","fr":"Jr"}},{"bookKey":"lamentations","abbreviation":{"en":"Lam","om":"Boo","am":"ሰቆ","ar":"مرا","sw":"Mao","fr":"Lm"}},{"bookKey":"ezekiel","abbreviation":{"en":"Ezek","om":"His","am":"ሕዝ","ar":"حز","sw":"Eze","fr":"Ez"}},{"bookKey":"daniel","abbreviation":{"en":"Dan","om":"Daa","am":"ዳን","ar":"دا","sw":"Dan","fr":"Dn"}},{"bookKey":"hosea","abbreviation":{"en":"Hos","om":"Hoo","am":"ሆሴ","ar":"هو","sw":"Hos","fr":"Os"}},{"bookKey":"joel","abbreviation":{"en":"Joel","om":"Yoe","am":"ኢዮ","ar":"يو","sw":"Yoe","fr":"Jl"}},{"bookKey":"amos","abbreviation":{"en":"Amos","om":"Aam","am":"አሞ","ar":"عا","sw":"Amo","fr":"Am"}},{"bookKey":"obadiah","abbreviation":{"en":"Obad","om":"Oba","am":"አብ","ar":"عو","sw":"Oba","fr":"Ab"}},{"bookKey":"jonah","abbreviation":{"en":"Jonah","om":"Yoo","am":"ዮና","ar":"يون","sw":"Yon","fr":"Jon"}},{"bookKey":"micah","abbreviation":{"en":"Mic","om":"Mii","am":"ሚክ","ar":"مي","sw":"Mik","fr":"Mi"}},{"bookKey":"nahum","abbreviation":{"en":"Nah","om":"Naa","am":"ናሆ","ar":"نا","sw":"Nah","fr":"Na"}},{"bookKey":"habakkuk","abbreviation":{"en":"Hab","om":"Hab","am":"ዕንባ","ar":"حب","sw":"Hab","fr":"Ha"}},{"bookKey":"zephaniah","abbreviation":{"en":"Zeph","om":"Sef","am":"ሶፍ","ar":"صف","sw":"Sef","fr":"Sop"}},{"bookKey":"haggai","abbreviation":{"en":"Hag","om":"Hag","am":"ሐጌ","ar":"حج","sw":"Hag","fr":"Ag"}},{"bookKey":"zechariah","abbreviation":{"en":"Zech","om":"Zak","am":"ዘካ","ar":"زك","sw":"Zek","fr":"Za"}},{"bookKey":"malachi","abbreviation":{"en":"Mal","om":"Mal","am":"ሚል","ar":"ملا","sw":"Mal","fr":"Ml"}},{"bookKey":"matthew","abbreviation":{"en":"Matt","om":"Mat","am":"ማቴ","ar":"مت","sw":"Mat","fr":"Mt"}},{"bookKey":"mark","abbreviation":{"en":"Mark","om":"Mar","am":"ማር","ar":"مر","sw":"Mar","fr":"Mc"}},{"bookKey":"luke","abbreviation":{"en":"Luke","om":"Luq","am":"ሉቃ","ar":"لو","sw":"Luk","fr":"Lc"}},{"bookKey":"john","abbreviation":{"en":"Jn","om":"Yoh","am":"ዮሐ","ar":"يو","sw":"Yoh","fr":"Jn"}},{"bookKey":"acts","abbreviation":{"en":"Acts","om":"Hoj","am":"የሐ","ar":"أع","sw":"Mat","fr":"Ac"}},{"bookKey":"romans","abbreviation":{"en":"Rom","om":"Roo","am":"ሮሜ","ar":"رو","sw":"War","fr":"Rm"}},{"bookKey":"1-corinthians","abbreviation":{"en":"1Cor","om":"1Qo","am":"1ቆ","ar":"1كو","sw":"1Wak","fr":"1Co"}},{"bookKey":"2-corinthians","abbreviation":{"en":"2Cor","om":"2Qo","am":"2ቆ","ar":"2كو","sw":"2Wak","fr":"2Co"}},{"bookKey":"galatians","abbreviation":{"en":"Gal","om":"Gal","am":"ገላ","ar":"غل","sw":"Wag","fr":"Ga"}},{"bookKey":"ephesians","abbreviation":{"en":"Eph","om":"Efe","am":"ኤፌ","ar":"أف","sw":"Wae","fr":"Ep"}},{"bookKey":"philippians","abbreviation":{"en":"Phil","om":"Fil","am":"ፊል","ar":"في","sw":"Waf","fr":"Ph"}},{"bookKey":"colossians","abbreviation":{"en":"Col","om":"Qol","am":"ቆላ","ar":"كو","sw":"Wak","fr":"Col"}},{"bookKey":"1-thessalonians","abbreviation":{"en":"1Thess","om":"1Ta","am":"1ተ","ar":"1تس","sw":"1Wat","fr":"1Th"}},{"bookKey":"2-thessalonians","abbreviation":{"en":"2Thess","om":"2Ta","am":"2ተ","ar":"2تس","sw":"2Wat","fr":"2Th"}},{"bookKey":"1-timothy","abbreviation":{"en":"1Tim","om":"1Xi","am":"1ጢ","ar":"1تي","sw":"1Tim","fr":"1Tm"}},{"bookKey":"2-timothy","abbreviation":{"en":"2Tim","om":"2Xi","am":"2ጢ","ar":"2تي","sw":"2Tim","fr":"2Tm"}},{"bookKey":"titus","abbreviation":{"en":"Titus","om":"Tii","am":"ቲቶ","ar":"تي","sw":"Tit","fr":"Tt"}},{"bookKey":"philemon","abbreviation":{"en":"Phlm","om":"Fil","am":"ፊል","ar":"فل","sw":"Fil","fr":"Phm"}},{"bookKey":"hebrews","abbreviation":{"en":"Heb","om":"Ibr","am":"ዕብራ","ar":"عب","sw":"Wae","fr":"He"}},{"bookKey":"james","abbreviation":{"en":"Jas","om":"Yaa","am":"ያዕ","ar":"يع","sw":"Yak","fr":"Jc"}},{"bookKey":"1-peter","abbreviation":{"en":"1Pet","om":"1Ph","am":"1ጴ","ar":"1بط","sw":"1Pet","fr":"1P"}},{"bookKey":"2-peter","abbreviation":{"en":"2Pet","om":"2Ph","am":"2ጴ","ar":"2بط","sw":"2Pet","fr":"2P"}},{"bookKey":"1-john","abbreviation":{"en":"1Jn","om":"1Yoh","am":"1ዮሐ","ar":"1يو","sw":"1Yoh","fr":"1Jn"}},{"bookKey":"2-john","abbreviation":{"en":"2Jn","om":"2Yoh","am":"2ዮሐ","ar":"2يو","sw":"2Yoh","fr":"2Jn"}},{"bookKey":"3-john","abbreviation":{"en":"3Jn","om":"3Yoh","am":"3ዮሐ","ar":"3يو","sw":"3Yoh","fr":"3Jn"}},{"bookKey":"jude","abbreviation":{"en":"Jude","om":"Yih","am":"ይሁ","ar":"يه","sw":"Yud","fr":"Jude"}},{"bookKey":"revelation","abbreviation":{"en":"Rev","om":"Mul","am":"ራእ","ar":"رؤ","sw":"Ufu","fr":"Ap"}}];

/**
 * Parse and resolve a verse reference string to actual verse data.
 * Supports: "John 3:16", "Jn 3:16", "john3:16", "ዮሐ 3:16", etc.
 */

function parseVerseReference(input) {
  if (!input || typeof input !== 'string') return null;

  const cleaned = input.trim();

  // Pattern: "BookName/Abbrev chapter:verse" or "BookName/Abbrev chapter verse"
  const patterns = [
    /^([a-zA-Z0-9ዮሐሳሙኤነገሥፋየኢኤረድኪጊሰመኮጰቀበከከህሙገፈምስየቀተአየ\u0600-\u06FF]+)\s*(\d+)\s*[:.]?\s*(\d+)$/i,
    /^([a-zA-Z0-9ዮሐሳሙኤነገሥፋየኢኤረድኪጊሰመኮጰቀበከከህሙገፈምስየቀተአየ\u0600-\u06FF]+)\s*[:.]?\s*(\d+)\s*[:.]?\s*(\d+)$/i,
  ];

  let match;
  for (const pattern of patterns) {
    match = cleaned.match(pattern);
    if (match) break;
  }

  if (!match) return null;

  const bookInput = match[1].toLowerCase().trim();
  const chapter = parseInt(match[2], 10);
  const verse = parseInt(match[3], 10);

  if (isNaN(chapter) || isNaN(verse) || chapter < 1 || verse < 1) return null;

  // Find book by name or abbreviation
  const book = findBookByNameOrAbbrev(bookInput);
  if (!book) return null;

  if (chapter > book.chapters) return null;

  return {
    bookKey: book.key,
    bookId: book.id,
    chapter,
    verse,
  };
}

function findBookByNameOrAbbrev(input) {
  const lower = input.toLowerCase();

  // Check key match
  let found = BIBLE_BOOKS.find((b) => b.key.toLowerCase() === lower);
  if (found) return found;

  // Check book names in all languages
  for (const book of BIBLE_BOOKS) {
    for (const lang in book.name) {
      if (book.name[lang].toLowerCase() === lower) {
        return book;
      }
    }
  }

  // Check abbreviations in all languages
  for (const abbr of BIBLE_ABBREVIATIONS) {
    for (const lang in abbr.abbreviation) {
      if (abbr.abbreviation[lang].toLowerCase() === lower) {
        const book = BIBLE_BOOKS.find((b) => b.key === abbr.bookKey);
        if (book) return book;
      }
    }
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const lang = url.searchParams.get('lang') || 'en';
    const version = url.searchParams.get('version') || 'web';

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = parseVerseReference(query);
    if (!parsed) {
      return new Response(JSON.stringify({ error: 'Invalid verse reference' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get book and abbreviation
    const book = BIBLE_BOOKS.find((b) => b.key === parsed.bookKey);
    const abbr = BIBLE_ABBREVIATIONS.find((a) => a.bookKey === parsed.bookKey);

    // Fetch verse from database
    const base44 = createClientFromRequest(req);
    const verses = await base44.asServiceRole.entities.BibleVerse.filter(
      {
        bookKey: parsed.bookKey,
        chapter: parsed.chapter,
        verse: parsed.verse,
        language: lang,
      },
      'verse',
      1
    );

    const verseData = verses?.[0];
    if (!verseData) {
      return new Response(JSON.stringify({ error: 'Verse not found in database' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        query,
        normalized: {
          bookKey: parsed.bookKey,
          chapter: parsed.chapter,
          verse: parsed.verse,
        },
        result: {
          bookId: book.id,
          bookName: book.name[lang] || book.name.en,
          abbreviation: abbr?.abbreviation[lang] || abbr?.abbreviation.en,
          chapter: parsed.chapter,
          verse: parsed.verse,
          language: lang,
          version,
          text: verseData.text,
          reference: `${abbr?.abbreviation[lang] || abbr?.abbreviation.en} ${parsed.chapter}:${parsed.verse}`,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[bibleReference] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});