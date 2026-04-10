// Easter calculation using the Computus algorithm
export function calculateEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

/**
 * Language code mapping for dates and RTL support
 */
export const localeMap = {
  en: 'en-US',
  fr: 'fr-FR',
  sw: 'sw-KE',
  ar: 'ar-SA',
  ti: 'en-US',
  om: 'en-US'
};

export const isRTLLanguage = (langCode) => langCode === 'ar';

/**
 * Map UI language names to language codes
 */
export const languageCodeMap = {
  'English': 'en',
  'Français': 'fr',
  'Kiswahili': 'sw',
  'العربية': 'ar',
  'Tigrinya': 'ti',
  'Afaan Oromo': 'om'
};

export function getChristianHolidays(year = new Date().getFullYear()) {
  const easterDate = calculateEasterDate(year);
  
  // Calculate Easter-based holidays
  const goodFridayDate = new Date(easterDate);
  goodFridayDate.setDate(goodFridayDate.getDate() - 2);
  
  const palmSundayDate = new Date(easterDate);
  palmSundayDate.setDate(palmSundayDate.getDate() - 7);
  
  const ashWednesdayDate = new Date(easterDate);
  ashWednesdayDate.setDate(ashWednesdayDate.getDate() - 46);
  
  const pentecostDate = new Date(easterDate);
  pentecostDate.setDate(pentecostDate.getDate() + 49);
  
  const ascensionDate = new Date(easterDate);
  ascensionDate.setDate(ascensionDate.getDate() + 39);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  const holidays = [
    // Fixed Holidays
    {
      id: "new-year",
      title: {
        en: "New Year",
        fr: "Nouvel An",
        sw: "Mwaka Mpya",
        ar: "رأس السنة",
        ti: "ሓድሽ ዓመት",
        om: "Waggaa Haaraa"
      },
      description: {
        en: "The beginning of a new year, a time to renew faith and commitment to God.",
        fr: "Le début d'une nouvelle année, un moment de renouvellement de la foi et de l'engagement envers Dieu.",
        sw: "Mwanzo wa mwaka mpya, wakati wa kuburudisha imani na kujitolea kwa Mungu.",
        ar: "بداية سنة جديدة، وقت تجديد الإيمان والالتزام بالله.",
        ti: "ምጅ ሓድሽ ዓመት፣ እዋን ከሮ የምንብረቖ ሓይሎ ከሪፈልና ኣመሪሩ ወተሓተትናን።",
        om: "Jalqaba waggaa haaraa, yeroo ni'achisuufi waldaa Waaqaa waliin milkaawiina."
      },
      date: `${year}-01-01`,
      type: "fixed",
      category: "major",
      verse: {
        reference: "2 Corinthians 5:17",
        text: "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."
      },
      greeting: {
        en: "Happy New Year! May this year be filled with God's blessings, grace, and spiritual growth.",
        fr: "Bonne Année ! Que cette année soit remplie des bénédictions, de la grâce et de la croissance spirituelle de Dieu.",
        sw: "Karani ya Mwaka Mpya! Makala hii yawe na baraka, neema, na ongezeko la kiroho la Mungu.",
        ar: "كل عام وأنتم بألف خير! أن تكون هذه السنة مليئة بنعم الله وتطوره الروحي.",
        ti: "ነፍሳት ሓድሽ ዓመት! ሰናይ ምድላዋ ሓይሎ ከሪ ምስ ምቕ ሰላም ይብል።",
        om: "Gaarii Waggaa Haaraa! Waggaa kana Waaqaa eebbaa, midhaan, fi guddina kiroohaa keessaa haa guutamu."
      },
      reflection: {
        en: "As we begin a new year, let us reflect on God's faithfulness and commit ourselves to walking closer with Him. Each day is a gift and an opportunity to grow in grace.",
        fr: "En commençant une nouvelle année, réfléchissons à la fidélité de Dieu et engageons-nous à marcher plus près de Lui. Chaque jour est un don et une occasion de croître en grâce.",
        sw: "Habari mpya ya mwaka, tufikiri juu ya uaminifu wa Mungu na tujitoee kwa kwenda karibu naye. Kila siku ni zawadi na furaha ya kuongeza katika neema.",
        ar: "عندما نبدأ سنة جديدة، دعونا نفكر في أمانة الله والتزم بالمشي معه. كل يوم هو هدية وفرصة لننمو في النعم.",
        ti: "ሓድሽ ዓመት ክህልውን ድዋን፣ ነገደ ሐይሎ ክተሓተተና ወምግባር ተወሳኽ።",
        om: "Yeroo waggaa haaraa jalqabnu, sodaachifuu waldaa Waaqaa irraa sagalee keenyaa kanaa jiidha. Guyyaan guyyaan kennaa fi carraaqaa gidduu itti fufuu."
      },
      prayer: {
        en: "Lord, thank You for a new year. Help me to live with renewed purpose and dedication to You.",
        fr: "Seigneur, merci pour une nouvelle année. Aide-moi à vivre avec un objectif renouvelé et un dévouement envers Toi.",
        sw: "Mungu, asante kwa mwaka mpya. Nisaidie kuishi na kusudi jipya na kujitoea kwako.",
        ar: "يا رب، شكراً على سنة جديدة. ساعدني على العيش بهدف متجدد والتزام بك.",
        ti: "ኣምላክ ምስግግር ሓድሽ ዓመት ምስሂብ። ተወሳኽ ዓቦይ ከሊ ስሚ ሓይልካ።",
        om: "Waaqayoo, galatomaa waggaa haaraa. Na gargaar jiidha koo haaraa fi waldaa keessa jiraachuu."
      }
    },
    {
      id: "epiphany",
      title: {
        en: "Epiphany",
        fr: "Épiphanie",
        sw: "Epifania",
        ar: "الدنح",
        ti: "ገብጽ ሓጡር",
        om: "Fakkeessuu Kiristoos"
      },
      description: {
        en: "Celebrates the manifestation of Christ to the Gentiles, represented by the visit of the Magi.",
        fr: "Célèbre la manifestation du Christ aux nations, représentée par la visite des Mages.",
        sw: "Inadhimisha dhihirisho la Kristo kwa wasilamu, wakilishwa na mgeni wa Waajinga.",
        ar: "يحتفل بظهور المسيح للأمم، ممثلة بزيارة المجوس.",
        ti: "ገብጽ ክርስቶስ ንሓጡር ይሰምዓል።",
        om: "Fakkeessuu Kiristoos gara sabaa waraa jidha, kan jajjabuu Magii keessaan."
      },
      date: `${year}-01-06`,
      type: "fixed",
      category: "major",
      verse: {
        reference: "Matthew 2:11",
        text: "And when they had come into the house, they saw the young Child with Mary His mother, and fell down and worshipped Him."
      },
      greeting: {
        en: "Blessed Epiphany! Let us celebrate the revelation of Christ to all people.",
        fr: "Heureuse Épiphanie ! Célébrons la révélation du Christ à tous les peuples.",
        sw: "Epifania Takatifu! Tundu tufahamu wadhihirisho la Kristo kwa wanadamu wote.",
        ar: "دنح مبارك! دعونا نحتفل بإعلان المسيح لجميع الشعوب.",
        ti: "ሂግ ግበጽ! ግብጽ ክርስቶስ ንምልክት ምንግሪ።",
        om: "Heensuu Fakkeessuu! Haa ceeleena dhihirisho Kiristoos gara sabaa hundaa."
      },
      reflection: {
        en: "The Magi journeyed far to see the newborn Christ. Their story reminds us that seekers of truth will find Him. May we also journey toward the light of Christ with steadfast faith.",
        fr: "Les Mages ont voyagé loin pour voir le Christ nouveau-né. Leur histoire nous rappelle que ceux qui cherchent la vérité le trouveront. Puissions-nous aussi cheminer vers la lumière du Christ avec une foi inébranlable.",
        sw: "Waajinga walifanya safari ndefu kuona Kristo mchanga. Historia yao inatufikiri kuwa wanaotafuta ukweli watampata. Tuweze kusafiri kuelekea nuru ya Kristo na imani thabiti.",
        ar: "سافر المجوس بعيداً لرؤية المسيح الوليد. قصتهم تذكرنا أن الباحثين عن الحقيقة سيجدونه. فلننسر نحو نور المسيح بإيمان ثابت.",
        ti: "ማጊ ዩ ኣወሲኖም ትሕት ክሪስቶስ ኣዲቅ። ታሪኦም ነገደ ለገድ ሓልዮ ሳድ አይከወን።",
        om: "Magii yeedduu fagoo deeman akka gara Kiristoos hanjaajjaatti. Seentaan isaanii nu yaadadhaa biraatiin rakkoo ni argatu. Nu illee karaa nura Kiristoos waliin waldaa jajjaa jedhu."
      },
      prayer: {
        en: "Guide us, O Christ, that we too might recognize Your light and follow where it leads.",
        fr: "Guide-nous, ô Christ, pour que nous reconnaissions aussi Ta lumière et la suivions.",
        sw: "Tujongee, Kristo, ili pia tulee kuona nuru yako na kufuata mahali inakokwenda.",
        ar: "أرشدنا يا مسيح، لننا نعترف بنورك ونتبعه.",
        ti: "ስውር ነፍሳትነ ክርስቶስ ሕብሪ ንሕብሪ ሌሊታን።",
        om: "Nu kaasaa Kiristoos, akka nu illee yaa keessan eegnu fi karaa inaa duute."
      }
    },
    {
      id: "christmas",
      title: {
        en: "Christmas",
        fr: "Noël",
        sw: "Krismasi",
        ar: "الميلاد",
        ti: "ተልለታ ሲ",
        om: "Gidda Kiristoos"
      },
      description: {
        en: "Celebrates the birth of Jesus Christ, the Savior of the world.",
        fr: "Célèbre la naissance de Jésus-Christ, le Sauveur du monde.",
        sw: "Inaadhimisha kuzaliwa kwa Yesu Kristo, Mwokozi wa ulimwengu.",
        ar: "يحتفل بميلاد يسوع المسيح، مخلص العالم.",
        ti: "ተልለታ ሲ ክርስቶስ፣ ምድዳ ዓለም።",
        om: "Gidda Yesuus Kiristoos, Fayyisaa Addunyaa."
      },
      date: `${year}-12-25`,
      type: "fixed",
      category: "major",
      verse: {
        reference: "Luke 2:11",
        text: "For unto you is born this day in the city of David a Savior, who is Christ the Lord."
      },
      greeting: {
        en: "Merry Christmas! May the birth of Jesus fill your home with peace, love, and joy.",
        fr: "Joyeux Noël ! Que la naissance de Jésus remplisse votre maison de paix, d'amour et de joie.",
        sw: "Karamu ya Krismasi! Kuzaliwa kwa Yesu kumzaze nyumba yako amani, upendo, na furaha.",
        ar: "عيد ميلاد مسرور! جعل ميلاد يسوع بيتك مليئاً بالسلام والحب والفرح.",
        ti: "ስዋ ተልለታ ሲ! ተልለታ ሲ ክርስቶስ ከተማ ዓለም ምድዳ።",
        om: "Giddoo Kiristoos Halleluyaa! Gidda Yesuus eegumsa keessaa gidda fi jaalala haa caalu."
      },
      reflection: {
        en: "On Christmas, we celebrate God's greatest gift—the incarnation of His love in Jesus Christ. This season invites us to embrace the love, peace, and joy that His birth brings to all humanity.",
        fr: "À Noël, nous célébrons le plus grand cadeau de Dieu—l'incarnation de Son amour en Jésus-Christ. Cette saison nous invite à embrasser l'amour, la paix et la joie que Sa naissance apporte à toute l'humanité.",
        sw: "Saa ya Krismasi, tunaadhimisha zawadi kubwa ya Mungu—jamaa ya upendo wake kwa Yesu Kristo. Msimu huu tunakumbuka upendo, amani, na furaha inayoleta kuzaliwa kwake.",
        ar: "في عيد الميلاد، نحتفل بأعظم هدية من الله—تجسد حبه في يسوع المسيح. هذا الموسم يدعونا لاحتضان الحب والسلام والفرح الذي يحضره ميلاده.",
        ti: "ስአ ተልለታ ሲ መላእ ሰንዳ ሀገር ይዘርዝር። ምድዳ ትንሳኤ ሲ ለሕብረ ሰብ።",
        om: "Yeroo Giddaa Kiristoos, giddaa lammii Waaqaa—jamaa upendo isaa Yesuus Kiristoos keessaa tuqunee. Misiinni kun nu yaadadhaa upendo, nagaa, fi facaasuu gidda isaa nuta.keessaa."
      },
      prayer: {
        en: "Thank You, Father, for sending Your Son. Help us to share His love and light with all we meet.",
        fr: "Merci, Père, d'avoir envoyé Votre Fils. Aidez-nous à partager Son amour et Sa lumière avec tous ceux que nous rencontrons.",
        sw: "Asante, Baba, kwa kumtuma Mwanao. Tusaidie kugawana upendo wake na nuru yake na kila mmoja tunaokutana.",
        ar: "شكراً أيها الآب على إرسال ابنك. ساعدنا على نشر حبه ونوره مع كل من نلتقي به.",
        ti: "ምስግግር አባ ሲ ልኢ። ስወሕዱ ሞቅ ሲ ወአሌ ታሪካ።",
        om: "Galata Abbaa, maarsa Ilma keessan. Nu gargaar jiidha upendo isaa fi ifaa gara sabaa hunda tuqanan."
      }
    },
    
    // Advent (First Sunday of Advent - 4 Sundays before Christmas)
    {
      id: "advent",
      title: {
        en: "Advent Begins",
        fr: "L'Avent Commence",
        sw: "Fiesta ya Kusubiri Inanza",
        ar: "بداية موسم التوقع",
        ti: "ሐይቁ ክርስታ ሐዩ",
        om: "Jiidha Jira Jalqaba"
      },
      description: {
        en: "A season of preparation and expectation leading to the celebration of Christ's birth.",
        fr: "Une saison de préparation et d'attente menant à la célébration de la naissance du Christ.",
        sw: "Msimu wa kuandaa na kusubiri inalofika selebreshan ya kuzaliwa kwa Kristo.",
        ar: "موسم للإعداد والتوقع يؤدي إلى الاحتفال بميلاد المسيح.",
        ti: "እዋን ስጥዒ ወመጽሓሕ ሲ ተልለታ።",
        om: "Yeroo jidha itti jiidha Yesuus Kiristoos."
      },
      date: (() => {
        const advent = new Date(year, 11, 25);
        while (advent.getDay() !== 0) {
          advent.setDate(advent.getDate() - 1);
        }
        advent.setDate(advent.getDate() - 21);
        return advent.toISOString().split('T')[0];
      })(),
      type: "moving",
      category: "major",
      verse: {
        reference: "Luke 21:28",
        text: "Now when these things begin to happen, look up and lift up your heads, because your redemption draws near."
      },
      greeting: {
        en: "Blessed Advent! Let us prepare our hearts to welcome the coming of Christ.",
        fr: "Heureusement Avent ! Préparons nos cœurs à accueillir la venue du Christ.",
        sw: "Fiesta salama! Tuandae mioyo yetu kuvikumbuka kuja kwa Kristo.",
        ar: "موسم توقع مبارك! دعونا نحضر قلوبنا لاستقبال قدوم المسيح.",
        ti: "ሐይቁ ክርስታ! ስጥዒ ነፍስ ተወሳኽ ወሲ።",
        om: "Jiidha Yeroo Jira! Jechuunis raaree keenyaa karaa Kiristoos jira."
      },
      reflection: {
        en: "Advent is a season of waiting and preparation. As we anticipate Christ's birth, let us quiet our hearts and prepare room for Him, both spiritually and in our daily lives.",
        fr: "L'Avent est une saison d'attente et de préparation. Alors que nous attendons la naissance du Christ, calmez nos cœurs et préparons place pour Lui, spirituellement et dans notre vie quotidienne.",
        sw: "Msimu ni wa kusubiri na kuandaa. Habari mpya tunakasubiri kuzaliwa kwa Kristo, tukae mioyo yetu na kuandaa jengo lake, kwa kiroho na katika maisha yetu ya kila siku.",
        ar: "موسم التوقع هو فترة انتظار والإعداد. بينما نتوقع ميلاد المسيح، دعونا نهدئ قلوبنا ونحضر مكاناً له، روحياً وفي حياتنا اليومية.",
        ti: "ደብር ይርአ ሲ ዓሊ ሒሳዊ።",
        om: "Yeroo jidha jiidha keessati jiidhaa. Habaa Yesuus Kiristoos jalqabu, raaree keenyaa quudhaa jiidha jira."
      },
      prayer: {
        en: "Lord Jesus, as we wait for Your coming, help us to be watchful, prayerful, and ready to receive You.",
        fr: "Seigneur Jésus, en attendant Votre venue, aidez-nous à être vigilants, prayerful et prêts à Vous recevoir.",
        sw: "Mungu Yesu, nisubiri kuja kwako, tusaidie kua wazimu, waomba, na kuwa tayari kuvikubali.",
        ar: "يا يسوع الرب، بينما ننتظر قدومك، ساعدنا على أن نكون يقظين، متوسلين، وجاهزين لاستقبالك.",
        ti: "ምጅ ክርስቶስ ምስሰብዮ ወአሌ ሓይቁ።",
        om: "Yesuus Waaqayoo, yeroo Yesuus jiidha jira, nu gargaar jiidha mirga jirdhan, kadhannaa keessaa, fi jira."
      }
    },
    
    // Easter-based Holidays
    {
      id: "ash-wednesday",
      title: {
        en: "Ash Wednesday",
        fr: "Mercredi des Cendres",
        sw: "Ijumaa ya Kutokuwa na Mfano",
        ar: "أربعاء الرماد",
        ti: "ሮብ ውኢላ",
        om: "Jiidha Ubba"
      },
      description: {
        en: "The beginning of Lent, a season of repentance, prayer, and spiritual reflection before Easter.",
        fr: "Le début du Carême, une saison de repentance, de prière et de réflexion spirituelle avant Pâques.",
        sw: "Mwanzo wa Mfano, msimu wa kuburi, dua, na tafakari ya kiroho kabla ya Pasaka.",
        ar: "بداية الصوم، موسم التوبة والصلاة والتأمل الروحي قبل عيد القيامة.",
        ti: "ጃውት ሙሉኣት ኢኪ።",
        om: "Jalqaba Fuudhaa, yeroo hubannaa, kadhannaa, ifi oga kiroohaa dura Pasaka."
      },
      date: formatDate(ashWednesdayDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "Joel 2:12-13",
        text: "Now, therefore, says the Lord, Turn to Me with all your heart, with fasting, with weeping, and with mourning."
      },
      greeting: {
        en: "Blessed Ash Wednesday! Let us turn to God with sincere hearts during this holy season of Lent.",
        fr: "Heureux Mercredi des Cendres ! Tournons-nous vers Dieu avec sincérité pendant cette saison sainte du Carême.",
        sw: "Ijumaa nzuri ya Kutokuwa! Tugeuke Mungu kwa moyo asili katika msimu huu mtakatifu wa Mfano.",
        ar: "أربعاء الرماد المبارك! لنتوب إلى الله بقلوب صادقة خلال هذا الموسم المقدس من الصوم.",
        ti: "ሮብ ውኢላ! ሙዋ ደመናን ሕቦ።",
        om: "Jiidha Ubba! Tuweldu Waaqaatti raaree guutuu fuudhaa yeroo kana."
      },
      reflection: {
        en: "Ash Wednesday marks the beginning of Lent, a 40-day journey of spiritual renewal. It calls us to examine our hearts and draw closer to God through prayer, fasting, and acts of service.",
        fr: "Le Mercredi des Cendres marque le début du Carême, un voyage de 40 jours de renouvellement spirituel. Il nous appelle à examiner nos cœurs et à nous rapprocher de Dieu par la prière, le jeûne et les actes de service.",
        sw: "Ijumaa ya Kutokuwa ni mwanzo wa Mfano, safrari ya siku 40 ya kuburudisha kiroho. Inatupa kuchunguza mioyo yetu na tukribike Mungu kupitia dua, fuudhaa, na matendo ya huduma.",
        ar: "يوم الأربعاء الرماد يشير إلى بداية الصوم، رحلة 40 يوماً من التجديد الروحي. إنه يدعونا إلى فحص قلوبنا والاقتراب من الله من خلال الصلاة والصيام وأعمال الخدمة.",
        ti: "ሮብ ውኢላ ጃውተ ፃገ 40 ይውር። ኢ ሕብሪ ነፍስ ወምስጋና።",
        om: "Ijumaa Ubba jalqaba Fuudhaa, safrari guyyaa 40 kuburudisha kiroohaa. Inutu raaree keenyaa yaa'a jiruu fi Waaqaatti tulqabina dubbisuu, fuudhaa, fi hojji gargaarsaa."
      },
      prayer: {
        en: "Grant me, O Lord, a humble and contrite heart during this season of Lent. Help me to grow in faith and love.",
        fr: "Accordez-moi, Seigneur, un cœur humble et repentant pendant cette saison du Carême. Aidez-moi à grandir en foi et en amour.",
        sw: "Nipe, Baba, moyo nyinyi na wa dhambi katika msimu huu wa Mfano. Nisaidie kuongeza imani na upendo.",
        ar: "امنحني يا رب قلباً متواضعاً وتائباً خلال هذا الموسم من الصوم. ساعدني على النمو في الإيمان والحب.",
        ti: "ሕብሪ ነፍስ ክብር ወአሌ ከውሪ ወካሊ።",
        om: "Naa kenna Waaqayoo raaree gad haa'aa fi hubannaa yeroo Fuudhaa kana. Na gargaar jiidha guddina waldaa ifi jaalaa."
      }
    },
    {
      id: "palm-sunday",
      title: {
        en: "Palm Sunday",
        fr: "Dimanche des Rameaux",
        sw: "Jumapili ya Palma",
        ar: "أحد الشعانين",
        ti: "ሰንበት ንቃስ",
        om: "Dilbata Murlii"
      },
      description: {
        en: "Celebrates Jesus's triumphal entry into Jerusalem, welcomed by crowds waving palm branches.",
        fr: "Célèbre l'entrée triomphale de Jésus à Jérusalem, accueillie par des foules agitant des branches de palmier.",
        sw: "Inadhimisha kuingia kwa ajabu kwa Yesu Yerusalemu, upokea zaidi ukutana zinawavua matawi ya palma.",
        ar: "يحتفل بدخول يسوع المنتصر إلى القدس، والترحيب به من قبل الحشود التي تلوح بسعف النخيل.",
        ti: "ሰንበት ምልክት ስ ምድዳ ምግባር።",
        om: "Gidda jidicha Yesuus Yerusalemitti, dhaabbate sammuu murlli."
      },
      date: formatDate(palmSundayDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "Matthew 21:9",
        text: "Then the multitudes who went before and those who followed cried out, saying: Hosanna to the Son of David!"
      },
      greeting: {
        en: "Blessed Palm Sunday! Let us welcome the King with humble hearts and joyful praise.",
        fr: "Heureux Dimanche des Rameaux ! Accueillons le Roi avec des cœurs humbles et des louanges joyeuses.",
        sw: "Jumapili nzuri ya Palma! Tunukubali Mfalme kwa moyo nyinyi na kumusifu kwa furaha.",
        ar: "أحد الشعانين المبارك! لنستقبل الملك بقلوب متواضعة وتسبيح فرح.",
        ti: "ሰንበት ምልክት! ስወዕሩ ስልጣ ክብር ውማዕከላ።",
        om: "Dilbata Murlii! Tuweldu Mootichaa raaree nyinyi ifi faaruu."
      },
      reflection: {
        en: "Palm Sunday reminds us of the crowds who welcomed Jesus with joy and praise. Like them, we celebrate His kingship and look forward to the salvation He brings.",
        fr: "Le Dimanche des Rameaux nous rappelle les foules qui ont accueilli Jésus avec joie et louanges. Comme eux, nous célébrons Sa royauté et anticipons le salut qu'Il apporte.",
        sw: "Jumapili ya Palma inatufanyia kumbuka ukutana walikuvikubali Yesu na furaha na kumsifu. Kama sisi, tunakasifu ufalme wake na tukangojea okombezi wake.",
        ar: "يوم أحد الشعانين يذكرنا بالحشود التي استقبلت يسوع بفرح وتسبيح. مثلهم، نحتفل بملكوته وننتظر الخلاص الذي يحضره.",
        ti: "ሰንበት ምልክት! ናይ ምድዳ ሙቅ ትገብር።",
        om: "Dilbata Murlii nus yaadadhaa sammuu Yesuusa kabalmee kana fudhaa ifi faaruu. Akka isaan, tuweldu mooticha ifi abdii fayyisaa isaa."
      },
      prayer: {
        en: "Hosanna! Help us to welcome You into our hearts and lives with the same joy and devotion.",
        fr: "Hosanna ! Aidez-nous à Vous accueillir dans nos cœurs et notre vie avec la même joie et le dévouement.",
        sw: "Hosana! Tusaidie kukuvikubali ndani ya mioyo yetu na maisha yetu kwa furaha na wajibu sawa.",
        ar: "هوشعنا! ساعدنا على استقبالك في قلوبنا وحياتنا بنفس الفرح والتفاني.",
        ti: "ሰንበት! ንስወሕድ ንምድዳ ምሕደራ።",
        om: "Hosana! Nu gargaar jiidha sikara raaree keenyaa ifi maalla keenyaa fudhaa ifi waldaa."
      }
    },
    {
      id: "good-friday",
      title: {
        en: "Good Friday",
        fr: "Vendredi Saint",
        sw: "Ijumaa Nzuri",
        ar: "الجمعة الحزينة",
        ti: "ጃምዓ ንቅስ",
        om: "Knamn Salphaa"
      },
      description: {
        en: "Commemorates the crucifixion of Jesus Christ and His sacrifice for the salvation of humanity.",
        fr: "Commémore la crucifixion de Jésus-Christ et son sacrifice pour le salut de l'humanité.",
        sw: "Inakamatanisha msalaba wa Yesu Kristo na dhabihu yake kwa okombezi wa wanadamu.",
        ar: "يحيي ذكرى صلب يسوع المسيح وتضحيته من أجل خلاص البشرية.",
        ti: "ምቅስ ክርስቶስ ውስሚ።",
        om: "Ijumaa Diggaa Yesuus Kiristoos ifi midhaa isaa fayyisaa namaatiif."
      },
      date: formatDate(goodFridayDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "John 3:16",
        text: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life."
      },
      greeting: {
        en: "Blessed Good Friday. Today we remember Christ's sacrifice and His unfailing love for us.",
        fr: "Heureusement Vendredi Saint. Aujourd'hui, nous nous souvenons du sacrifice du Christ et de son amour indéfectible pour nous.",
        sw: "Ijumaa Nzuri. Leo tunakumbuka dhabihu ya Kristo na upendo wake usiokamatika kwa sisi.",
        ar: "الجمعة الحزينة المباركة. اليوم نتذكر تضحية المسيح وحبه الدائم لنا.",
        ti: "ጃምዓ ንቅስ! ዘቅንያ ሲ ይሰምዓል።",
        om: "Kamen Salphaa! Leo tuweldu midhaa ifi jaalaa Kiristoos."
      },
      reflection: {
        en: "On Good Friday, we contemplate the depth of Christ's love demonstrated through His sacrifice. His suffering and death opened the way to redemption and eternal hope for all believers.",
        fr: "Le Vendredi Saint, nous contemplons la profondeur de l'amour du Christ démontré par son sacrifice. Sa souffrance et sa mort ont ouvert la voie à la rédemption et à l'espoir éternel pour tous les croyants.",
        sw: "Saa ya Ijumaa Nzuri, tunafikiria kina juu ya upendo wa Kristo ulioonyeshwa kwa dhabihu yake. Utesiko wake na kifo chake kufungua njia kwa ukombezi na abdii daima kwa wote wanaamini.",
        ar: "في الجمعة الحزينة، نتأمل في عمق حب المسيح المُظهر من خلال تضحيته. آلامه وموته فتح الطريق للفداء والرجاء الأبدي لجميع المؤمنين.",
        ti: "ጃምዓ ንቅስ! ሞቅ ሲ ሰሪር።",
        om: "Ijumaa Diggaa, tuweldu jaalaa gidduu Kiristoos godha midhaa. Ulissaa ifi duuti seenuuf karaa fayyisaa ifi abdii hamma duudhuma."
      },
      prayer: {
        en: "Jesus, I am grateful for Your sacrifice. Help me to live a life worthy of Your love and redemption.",
        fr: "Jésus, je suis reconnaissant de Votre sacrifice. Aidez-moi à vivre une vie digne de Votre amour et de Votre rédemption.",
        sw: "Yesu, nakosonya dhabihu yako. Nisaidie kuishi maisha yenye thamani ya upendo wako na okombezi.",
        ar: "يسوع، أنا ممتن لتضحيتك. ساعدني على العيش بحياة تليق بحبك وفدائك.",
        ti: "ሲ ምስግግር ሞቅ ከዳስ።",
        om: "Yesuus galata midhaa kee. Nu gargaar jiidha maallaa thamina jaalaa ifi fayyisaa kee."
      }
    },
    {
      id: "easter",
      title: {
        en: "Easter Sunday",
        fr: "Dimanche de Pâques",
        sw: "Jumapili ya Pasaka",
        ar: "عيد القيامة",
        ti: "ሰንበት ትንሳኤ",
        om: "Dilbata Gidda Siiqqaa"
      },
      description: {
        en: "Celebrates the resurrection of Jesus Christ, the foundation of Christian faith and hope.",
        fr: "Célèbre la résurrection de Jésus-Christ, fondement de la foi et de l'espérance chrétiennes.",
        sw: "Inadhimisha ufufuo wa Yesu Kristo, msingi wa imani na tumaini la Kikristo.",
        ar: "يحتفل بقيامة يسوع المسيح، أساس الإيمان والرجاء المسيحي.",
        ti: "ትንሳኤ ክርስቶስ ዝዝክር እዩ፣ መሰረት እምነትን ተስፋን ክርስትና።",
        om: "Du'aa ka'uu Yesuus Kiristoos kan kabaju, bu'uura amantii fi abdii Kiristaanaa."
      },
      date: formatDate(easterDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "Matthew 28:5-6",
        text: "The angel said to the women, Do not be afraid; for I know that you are looking for Jesus who has been crucified. He is not here; for He has been raised."
      },
      greeting: {
        en: "Happy Easter! Christ is risen. May His resurrection renew your faith, hope, and joy.",
        fr: "Joyeuses Pâques ! Le Christ est ressuscité. Que Sa résurrection renouvelle votre foi, votre espérance et votre joie.",
        sw: "Pasaka nzuri! Kristo ameufufuo. Kufu wake kuburudishe imani, tumaini, na furaha yako.",
        ar: "عيد قيامة سعيد! المسيح قام. جعل قيامته تجدد إيمانك ورجاءك وفرحك.",
        ti: "ሰንበት ትንሳኤ! ክርስቶስ ፅገሞ! ትንሳኤ ወሚሳ ይህልወና።",
        om: "Pasaka Gaarii! Kiristoos Fi'e! Du'aa isaa guddina waldaa, abdii, ifi facaasuu kee."
      },
      reflection: {
        en: "Easter is the triumph of life over death, light over darkness, and hope over despair. Christ's resurrection assures us that He has conquered sin and death, and offers us new life.",
        fr: "Pâques est le triomphe de la vie sur la mort, de la lumière sur les ténèbres et de l'espérance sur le désespoir. La résurrection du Christ nous assure qu'Il a vaincu le péché et la mort, et nous offre une nouvelle vie.",
        sw: "Pasaka ni ushindi wa maisha juu ya kifo, nuru juu ya giza, na tumaini juu ya kutokuwa na tumaini. Ufufuo wa Kristo tunakuhakikishia kuwa Yesu ameshindwa dhambi na kifo, nakutupa maisha mapya.",
        ar: "عيد الفصح هو انتصار الحياة على الموت والنور على الظلام والرجاء على اليأس. قيامة المسيح تؤكد لنا أنه انتصر على الخطيئة والموت وعرضنا حياة جديدة.",
        ti: "ሰንበት ትንሳኤ! ንትንሳኤ ትጽገም ሙጅ ሂኩ።",
        om: "Pasaka ushindi maallaa, ifaa ayyaanaa, abdii tikka. Du'aa Kiristoos nu huukuu kuichuu doga ifi duuti, akkasumas maallaa haaraa nuta."
      },
      prayer: {
        en: "Risen Lord, thank You for Your victory over death. Fill our hearts with the joy and hope of Your resurrection.",
        fr: "Seigneur ressuscité, merci de Votre victoire sur la mort. Remplissez nos cœurs de la joie et de l'espérance de Votre résurrection.",
        sw: "Baba wa ufufuo, asante kwa ushindi wako juu ya kifo. Jaza mioyo yetu na furaha na tumaini ya Ufufuo wako.",
        ar: "يا رب القيامة، شكراً لانتصارك على الموت. امأ قلوبنا بفرح وأمل قيامتك.",
        ti: "ሲ ውሰድ! ምስግግር ማዕረግ ሞት።",
        om: "Waaqayoo Du'aached-Fi'ee, galata ushindi du'aa juu ya kifo. Mioyo keenyaa guutaa facaasuu ifi abdii du'aa isaa."
      }
    },
    {
      id: "ascension",
      title: {
        en: "Ascension Day",
        fr: "Jour de l'Ascension",
        sw: "Siku ya Kuinuka",
        ar: "عيد الصعود",
        ti: "ሰንበት ፅግሞ",
        om: "Guyyaa Ol-ol'aa"
      },
      description: {
        en: "Celebrates Jesus's ascension into heaven 40 days after His resurrection.",
        fr: "Célèbre l'ascension de Jésus au ciel 40 jours après Sa résurrection.",
        sw: "Inadhimisha inuka ya Yesu angani siku 40 baada ya Ufufuo wake.",
        ar: "يحتفل بصعود يسوع إلى السماء بعد 40 يوماً من قيامته.",
        ti: "ሰንበት ፅግሞ ሲ ወሰማይ።",
        om: "Guyyaa Ol-ol'aa Yesuus Samii ol'e guyyaa 40 booddee Du'aa isaa."
      },
      date: formatDate(ascensionDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "Acts 1:9-10",
        text: "Now when He had spoken these things, while they watched, He was taken up, and a cloud received Him out of their sight."
      },
      greeting: {
        en: "Blessed Ascension Day! Let us rejoice that Christ has ascended to the Father's right hand.",
        fr: "Bonne Fête de l'Ascension ! Réjouissons-nous que le Christ soit monté à la droite du Père.",
        sw: "Siku nzuri ya Kuinuka! Tufarahe kuwa Kristo ameifika kwa kufa mkono wa Baba.",
        ar: "يوم الصعود المبارك! لنفرح لأن المسيح صعد إلى يمين الآب.",
        ti: "ሰንበት ፅግሞ! ክርስቶስ ከላይ።",
        om: "Guyyaa Ol-ol'aa! Tuweldu kuwa Kiristoos ol'e gara mirgaa Abbaa."
      },
      reflection: {
        en: "The Ascension celebrates Christ's return to the Father's side, preparing the way for the coming of the Holy Spirit. It reminds us that Christ is with God and intercedes for us.",
        fr: "L'Ascension célèbre le retour du Christ auprès du Père, préparant la voie à la venue du Saint-Esprit. Elle nous rappelle que le Christ est avec Dieu et intercède pour nous.",
        sw: "Inuka inakasifu kurudi kwa Kristo upande wa Baba, kuandaa njia kwa kuja kwa Roho Takatifu. Inatufanyia kumbuka kuwa Kristo yuko kwa Mungu ifikara kwa ajili yetu.",
        ar: "يحتفل الصعود بعودة المسيح إلى جانب الآب، تاهياً الطريق لقدوم الروح القدس. إنها تذكرنا أن المسيح مع الله ويتوسل عنا.",
        ti: "ሰንበት ፅግሞ! ክርስቶስ ወአባ።",
        om: "Ol-ol'aa du'aa Kiristoos karaa Abbaa mirgaa, jida kaarsa Roohaa Takattisiif. Nus yaadadhaa Kiristoos Waaqaa waliin dha ifi kadhannaa keenyaa."
      },
      prayer: {
        en: "Ascended Lord, help us to fix our eyes on heavenly things and to live in the power of Your Holy Spirit.",
        fr: "Seigneur ascensionné, aidez-nous à fixer nos yeux sur les choses célestes et à vivre dans la puissance de Votre Saint-Esprit.",
        sw: "Mungu wa Inuka, tusaidie kubaki macho yetu juu ya kitu cha Samii na kuishi katika nguvu ya Roho Takatifu wako.",
        ar: "يا رب الصعود، ساعدنا على تثبيت أنظارنا على الأشياء السماوية والعيش بقوة روحك القدس.",
        ti: "ሲ ወላይ! ስወይሪ በምድር።",
        om: "Waaqayoo Ol-ol'aa, nu gargaar jiidha ija keenyaa samii irratti, jiraachuu poowwaa Roohaa Takattisiif."
      }
    },
    {
      id: "pentecost",
      title: {
        en: "Pentecost",
        fr: "Pentecôte",
        sw: "Pentekosti",
        ar: "عيد الخمسين",
        ti: "ሰንበት ንቅዳሰ",
        om: "Paanjisima"
      },
      description: {
        en: "Celebrates the gift of the Holy Spirit to the apostles and the birth of the Church.",
        fr: "Célèbre le don du Saint-Esprit aux apôtres et la naissance de l'Église.",
        sw: "Inadhimisha zawadi ya Roho Takatifu kwa wayapostolo na mazaliwa ya Kanisa.",
        ar: "يحتفل بهدية الروح القدس للرسل وميلاد الكنيسة.",
        ti: "ንቅዳሰ ሮህ ተቅድስ እምንገደ ተእምተይ।",
        om: "Paanjisima kebiina Roohaa Takattisa fi jalqaba Mana Waaqaa."
      },
      date: formatDate(pentecostDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "Acts 2:4",
        text: "And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them utterance."
      },
      greeting: {
        en: "Blessed Pentecost! May the Holy Spirit fill you with strength, wisdom, and peace.",
        fr: "Heureuse Pentecôte ! Que le Saint-Esprit vous remplisse de force, de sagesse et de paix.",
        sw: "Pentekosti takatifu! Roho Takatifu akukamate nguvu, akili, na amani.",
        ar: "عيد الخمسين المبارك! يا الروح القدس ملأك بالقوة والحكمة والسلام.",
        ti: "ሰንበት ንቅዳሰ! ሮህ ተቅድስ ይሞላን ጥብቅነት።",
        om: "Paanjisima! Roohaa Takattisa si guutaa poowwaa, adaa, ifi naaaggaa."
      },
      reflection: {
        en: "Pentecost marks the birth of the Church and the gift of the Holy Spirit to believers. It empowers us to proclaim the gospel and live as Christ's witnesses in the world.",
        fr: "La Pentecôte marque la naissance de l'Église et le don du Saint-Esprit aux croyants. Elle nous habilite à proclamer l'Évangile et à vivre en tant que témoins du Christ dans le monde.",
        sw: "Pentekosti inakamatanisha mazaliwa ya Kanisa na zawadi ya Roho Takatifu kwa wanaamini. Inatupa nguvu kupongeza Injili na kuishi kama shahidi wa Kristo ulimwengu.",
        ar: "تحتفل عيد الخمسين بميلاد الكنيسة وهدية الروح القدس للمؤمنين. وهي تمكننا من التبشير بالإنجيل والعيش كشهود لالمسيح في العالم.",
        ti: "ሰንበት ንቅዳሰ ዝ ማዕከላ ሮህ ተቅድስ ለሞሕቃለይ።",
        om: "Paanjisima jalqaba Mana Waaqaa ifi kebiina Roohaa Takattisa gara wananiidhaa. Nus poowwaa kadhannaa Evangelii ifi jiiraachuu mul'ata Kiristoos ulimwenguta."
      },
      prayer: {
        en: "Holy Spirit, fill me with Your presence. Guide me, strengthen me, and help me to bear witness to Christ's love.",
        fr: "Saint-Esprit, remplissez-moi de Votre présence. Guidez-moi, renforcez-moi et aidez-moi à témoigner de l'amour du Christ.",
        sw: "Roho Takatifu, nikamate uwepo wako. Ninong'oneze, ninigize nguvu, na nisaidie kumuumba shahidi wa upendo wa Kristo.",
        ar: "روح القدس، املأني بحضورك. أرشدني وقويني وساعدني على الشهادة لحب المسيح.",
        ti: "ሮህ ተቅድስ ብዝነዊ! ሙሊ ነፍስ ወሂስን።",
        om: "Roohaa Takattisa, si guutaa jira keessan. Na kaasaa, na jabeedha, na gargaara jiidha mul'ata jaalaa Kiristoos."
      }
      },
      // Additional major Christian holidays
      {
      id: "good-friday",
      title: {
        en: "Good Friday",
        fr: "Vendredi Saint",
        sw: "Ijumaa Kuu",
        ar: "الجمعة العظيمة",
        ti: "ዓርቢ ቅዱስ",
        om: "Jimaata Guddaa"
      },
      description: {
        en: "Commemorates the crucifixion and sacrifice of Jesus Christ.",
        fr: "Commémore la crucifixion et le sacrifice de Jésus-Christ.",
        sw: "Inaadhimisha kusulubiwa na dhabihu ya Yesu Kristo.",
        ar: "يحيي ذكرى صلب يسوع المسيح وتضحيته.",
        ti: "ስቅለትን መስዋእትን ክርስቶስ ይዝክር።",
        om: "Fannoo fi aarsaa Yesuus Kiristoos ni yaadata."
      },
      date: formatDate(goodFridayDate),
      type: "moving",
      category: "major",
      verse: {
        reference: "John 3:16",
        text: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life."
      },
      greeting: {
        en: "Blessed Good Friday. Today we remember Christ's sacrifice and His unfailing love for us.",
        fr: "Heureusement Vendredi Saint. Aujourd'hui, nous nous souvenons du sacrifice du Christ et de son amour indéfectible pour nous.",
        sw: "Ijumaa Nzuri. Leo tunakumbuka dhabihu ya Kristo na upendo wake usiokamatika kwa sisi.",
        ar: "الجمعة الحزينة المباركة. اليوم نتذكر تضحية المسيح وحبه الدائم لنا.",
        ti: "ጃምዓ ንቅስ! ዘቅንያ ሲ ይሰምዓል።",
        om: "Kamen Salphaa! Leo tuweldu midhaa ifi jaalaa Kiristoos."
      },
      reflection: {
        en: "On Good Friday, we contemplate the depth of Christ's love demonstrated through His sacrifice. His suffering and death opened the way to redemption and eternal hope for all believers.",
        fr: "Le Vendredi Saint, nous contemplons la profondeur de l'amour du Christ démontré par son sacrifice. Sa souffrance et sa mort ont ouvert la voie à la rédemption et à l'espoir éternel pour tous les croyants.",
        sw: "Saa ya Ijumaa Nzuri, tunafikiria kina juu ya upendo wa Kristo ulioonyeshwa kwa dhabihu yake. Utesiko wake na kifo chake kufungua njia kwa ukombezi na abdii daima kwa wote wanaamini.",
        ar: "في الجمعة الحزينة، نتأمل في عمق حب المسيح المُظهر من خلال تضحيته. آلامه وموته فتح الطريق للفداء والرجاء الأبدي لجميع المؤمنين.",
        ti: "ጃምዓ ንቅስ! ሞቅ ሲ ሰሪር።",
        om: "Ijumaa Diggaa, tuweldu jaalaa gidduu Kiristoos godha midhaa. Ulissaa ifi duuti seenuuf karaa fayyisaa ifi abdii hamma duudhuma."
      },
      prayer: {
        en: "Jesus, I am grateful for Your sacrifice. Help me to live a life worthy of Your love and redemption.",
        fr: "Jésus, je suis reconnaissant de Votre sacrifice. Aidez-moi à vivre une vie digne de Votre amour et de Votre rédemption.",
        sw: "Yesu, nakosonya dhabihu yako. Nisaidie kuishi maisha yenye thamani ya upendo wako na okombezi.",
        ar: "يسوع، أنا ممتن لتضحيتك. ساعدني على العيش بحياة تليق بحبك وفدائك.",
        ti: "ሲ ምስግግር ሞቅ ከዳስ።",
        om: "Yesuus galata midhaa kee. Nu gargaar jiidha maallaa thamina jaalaa ifi fayyisaa kee."
      }
      },
      ];
  
  return holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getHolidayById(id, year = new Date().getFullYear()) {
  const holidays = getChristianHolidays(year);
  return holidays.find(h => h.id === id);
}

/**
 * Format date in selected language
 */
export function formatHolidayDate(dateString, langCode = 'en') {
  const date = new Date(dateString + 'T00:00:00');
  const locale = localeMap[langCode] || 'en-US';
  
  return date.toLocaleDateString(locale, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function getUpcomingHolidays(count = 3) {
  const year = new Date().getFullYear();
  const holidays = getChristianHolidays(year);
  const today = new Date().toISOString().split('T')[0];
  
  return holidays
    .filter(h => h.date >= today)
    .slice(0, count);
}