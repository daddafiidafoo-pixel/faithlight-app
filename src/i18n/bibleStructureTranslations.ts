export type BibleStructureLanguage =
  | "en"
  | "om"
  | "am"
  | "fr"
  | "sw"
  | "ar"
  | "ti";

export type BibleStructureSection = {
  key:
    | "law"
    | "history"
    | "poetry"
    | "majorProphets"
    | "minorProphets"
    | "gospels"
    | "acts"
    | "paulineEpistles"
    | "generalEpistles"
    | "revelation";
  title: string;
  countLabel: string;
  range: string;
  description: string;
  books: string[];
};

export type BibleStructureContent = {
  pageTitle: string;
  intro: string;
  sections: BibleStructureSection[];
};

export const bibleStructureTranslations: Record<
  BibleStructureLanguage,
  {
    pages: {
      bibleStructureOverview: string;
    };
    common: {
      selectLanguage: string;
    };
    bibleStructure: BibleStructureContent;
  }
> = {
  en: {
    pages: {
      bibleStructureOverview: "Bible Structure Overview",
    },
    common: {
      selectLanguage: "Select language",
    },
    bibleStructure: {
      pageTitle: "Bible Structure Overview",
      intro:
        "A simple guide to the major sections of the Bible and their purpose in the story of God and Israel.",
      sections: [
        {
          key: "law",
          title: "Law (Torah)",
          countLabel: "5 books",
          range: "Genesis – Deuteronomy",
          description:
            "God's foundations: creation, the fall, the patriarchs, the Exodus, and the Law given to Moses.",
          books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
        },
        {
          key: "history",
          title: "History",
          countLabel: "12 books",
          range: "Joshua – Esther",
          description:
            "Israel's story: entering the Promised Land, the judges, the kings, exile, and return.",
          books: [
            "Joshua",
            "Judges",
            "Ruth",
            "1 Samuel",
            "2 Samuel",
            "1 Kings",
            "2 Kings",
            "1 Chronicles",
            "2 Chronicles",
            "Ezra",
            "Nehemiah",
            "Esther",
          ],
        },
        {
          key: "poetry",
          title: "Poetry & Wisdom",
          countLabel: "5 books",
          range: "Job – Song of Solomon",
          description:
            "Worship, suffering, wisdom for daily life, and the beauty of love.",
          books: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"],
        },
        {
          key: "majorProphets",
          title: "Major Prophets",
          countLabel: "5 books",
          range: "Isaiah – Daniel",
          description:
            "Longer prophetic books calling Israel back to God, with Messianic foreshadowing.",
          books: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"],
        },
        {
          key: "minorProphets",
          title: "Minor Prophets",
          countLabel: "12 books",
          range: "Hosea – Malachi",
          description:
            'Shorter prophetic books — "minor" in length, not importance.',
          books: [
            "Hosea",
            "Joel",
            "Amos",
            "Obadiah",
            "Jonah",
            "Micah",
            "Nahum",
            "Habakkuk",
            "Zephaniah",
            "Haggai",
            "Zechariah",
            "Malachi",
          ],
        },
        {
          key: "gospels",
          title: "Gospels",
          countLabel: "4 books",
          range: "Matthew – John",
          description:
            "The life, teachings, death, and resurrection of Jesus Christ.",
          books: ["Matthew", "Mark", "Luke", "John"],
        },
        {
          key: "acts",
          title: "Acts",
          countLabel: "1 book",
          range: "Acts",
          description:
            "The spread of the gospel and the growth of the early church through the Holy Spirit.",
          books: ["Acts"],
        },
        {
          key: "paulineEpistles",
          title: "Pauline Epistles",
          countLabel: "13 books",
          range: "Romans – Philemon",
          description:
            "Letters from Paul to churches and individuals for doctrine, correction, and encouragement.",
          books: [
            "Romans",
            "1 Corinthians",
            "2 Corinthians",
            "Galatians",
            "Ephesians",
            "Philippians",
            "Colossians",
            "1 Thessalonians",
            "2 Thessalonians",
            "1 Timothy",
            "2 Timothy",
            "Titus",
            "Philemon",
          ],
        },
        {
          key: "generalEpistles",
          title: "General Epistles",
          countLabel: "8 books",
          range: "Hebrews – Jude",
          description:
            "Letters to believers with instruction, endurance, faith, and holy living.",
          books: [
            "Hebrews",
            "James",
            "1 Peter",
            "2 Peter",
            "1 John",
            "2 John",
            "3 John",
            "Jude",
          ],
        },
        {
          key: "revelation",
          title: "Revelation",
          countLabel: "1 book",
          range: "Revelation",
          description:
            "A prophetic vision of Christ's victory, final judgment, and the new creation.",
          books: ["Revelation"],
        },
      ],
    },
  },

  om: {
    pages: {
      bibleStructureOverview: "Ijaarsa Macaafa Qulqulluu",
    },
    common: {
      selectLanguage: "Afaan filadhu",
    },
    bibleStructure: {
      pageTitle: "Ijaarsa Macaafa Qulqulluu",
      intro:
        "Kutaa guguddoo Macaafa Qulqulluu fi hojii isaanii seenaa Waaqayyoo keessatti hubachuuf qajeelfama salphaa.",
      sections: [
        {
          key: "law",
          title: "Seera (Torah)",
          countLabel: "Kitaabota 5",
          range: "Uumamaa – Keessa Deebii",
          description:
            "Bu'uura hojii Waaqayyoo: uumama, kufaatii, abbootii amantii, Ba'uu, fi seera Museetti kenname.",
          books: ["Uumamaa", "Ba'uu", "Lewwota", "Lakkoobsa", "Keessa Deebii"],
        },
        {
          key: "history",
          title: "Seenaa",
          countLabel: "Kitaabota 12",
          range: "Iyyaasuu – Asteer",
          description:
            "Seenaa Israa'el: biyya abdachiifamte seenuu, abbootii murtii, mootota, boojuu, fi deebi'uu.",
          books: [
            "Iyyaasuu",
            "Abbootii Murtii",
            "Ruut",
            "1 Saamu'el",
            "2 Saamu'el",
            "1 Moototaa",
            "2 Moototaa",
            "1 Seenaa Bara",
            "2 Seenaa Bara",
            "Izraa",
            "Nahimiyaa",
            "Asteer",
          ],
        },
        {
          key: "poetry",
          title: "Walaloo fi Ogummaa",
          countLabel: "Kitaabota 5",
          range: "Iyoob – Weedduu Solomoon",
          description:
            "Waaqeffannaa, dhiphina, ogummaa jireenya guyyaa guyyaa, fi bareedina jaalalaa.",
          books: ["Iyoob", "Faarfannaa", "Fakkeenya", "Lallaba", "Weedduu Solomoon"],
        },
        {
          key: "majorProphets",
          title: "Raajota Gurguddoo",
          countLabel: "Kitaabota 5",
          range: "Isaayaas – Daani'el",
          description:
            "Kitaabota raajii dheeraa Israa'el gara Waaqayyoo waaman, Masiihicha dursee agarsiisuudhaan.",
          books: ["Isaayaas", "Ermiyaas", "Faaruu Ermiyaas", "Hisqi'eel", "Daani'el"],
        },
        {
          key: "minorProphets",
          title: "Raajota Xixiqqoo",
          countLabel: "Kitaabota 12",
          range: "Hose'aa – Milkiyaas",
          description:
            'Kitaabota raajii gabaabaa — "xixiqqoo" dheerinaan malee barbaachisummaa miti.',
          books: [
            "Hose'aa",
            "Yo'eel",
            "Aamoos",
            "Obaadiyaa",
            "Yoonaas",
            "Miikiyaas",
            "Naahuum",
            "Habaaqquuq",
            "Sefaaniyaa",
            "Haggayi",
            "Zakariyaa",
            "Milkiyaas",
          ],
        },
        {
          key: "gospels",
          title: "Wangeelota",
          countLabel: "Kitaabota 4",
          range: "Maatewos – Yohannis",
          description:
            "Jireenya, barsiisa, du'a, fi du'aa ka'uu Yesuus Kiristoos.",
          books: ["Maatewos", "Maarqos", "Luqaas", "Yohannis"],
        },
        {
          key: "acts",
          title: "Hojii Ergamootaa",
          countLabel: "Kitaaba 1",
          range: "Hojii Ergamootaa",
          description:
            "Wangeelli babal'achuu fi waldaan duraa Hafuura Qulqulluudhaan guddachuu.",
          books: ["Hojii Ergamootaa"],
        },
        {
          key: "paulineEpistles",
          title: "Ergaawwan Phaawuloos",
          countLabel: "Kitaabota 13",
          range: "Roomaa – Fileemoon",
          description:
            "Xalayaawwan Phaawuloos waldootaa fi namootaaf barsiisa, sirreeffama, fi jajjabina kennan.",
          books: [
            "Roomaa",
            "1 Qorontos",
            "2 Qorontos",
            "Galaatiyaa",
            "Efesoon",
            "Filiphoos",
            "Qolosaayis",
            "1 Tasalonqee",
            "2 Tasalonqee",
            "1 Ximotewos",
            "2 Ximotewos",
            "Tiitoo",
            "Fileemoon",
          ],
        },
        {
          key: "generalEpistles",
          title: "Ergaawwan Waliigalaa",
          countLabel: "Kitaabota 8",
          range: "Ibrootaa – Yihudaa",
          description:
            "Xalayaawwan amantootaaf barsiisa, obsaa, amantii, fi jireenya qulqulluu irratti xiyyeeffatan.",
          books: [
            "Ibrootaa",
            "Yaaqoob",
            "1 Pheexiroos",
            "2 Pheexiroos",
            "1 Yohannis",
            "2 Yohannis",
            "3 Yohannis",
            "Yihudaa",
          ],
        },
        {
          key: "revelation",
          title: "Mul'ata",
          countLabel: "Kitaaba 1",
          range: "Mul'ata",
          description:
            "Mul'ata raajii injifannoo Kiristoos, murtii dhumaa, fi uumama haaraa ibsu.",
          books: ["Mul'ata"],
        },
      ],
    },
  },

  am: {
    pages: {
      bibleStructureOverview: "የመጽሐፍ ቅዱስ አወቃቀር",
    },
    common: {
      selectLanguage: "ቋንቋ ይምረጡ",
    },
    bibleStructure: {
      pageTitle: "የመጽሐፍ ቅዱስ አወቃቀር",
      intro:
        "የመጽሐፍ ቅዱስን ዋና ዋና ክፍሎችና በእግዚአብሔር ታሪክ ያላቸውን ሚና ለመረዳት ቀላል መመሪያ።",
      sections: [
        {
          key: "law",
          title: "ሕግ (ቶራ)",
          countLabel: "5 መጻሕፍት",
          range: "ዘፍጥረት – ዘዳግም",
          description:
            "የእግዚአብሔር መሠረቶች፡ ፍጥረት፣ ውድቀት፣ አባቶች፣ ግብፅ መውጣት፣ እና ለሙሴ የተሰጠው ሕግ።",
          books: ["ዘፍጥረት", "ዘጸአት", "ዘሌዋውያን", "ዘኍልቍ", "ዘዳግም"],
        },
        {
          key: "history",
          title: "ታሪክ",
          countLabel: "12 መጻሕፍት",
          range: "ኢያሱ – አስቴር",
          description:
            "የእስራኤል ታሪክ፡ ወደ ተስፋይቱ ምድር መግባት፣ መሳፍንት፣ ነገሥታት፣ ምርኮ፣ እና መመለስ።",
          books: [
            "ኢያሱ",
            "መሳፍንት",
            "ሩት",
            "1 ሳሙኤል",
            "2 ሳሙኤል",
            "1 ነገሥት",
            "2 ነገሥት",
            "1 ዜና መዋዕል",
            "2 ዜና መዋዕል",
            "ዕዝራ",
            "ነህምያ",
            "አስቴር",
          ],
        },
        {
          key: "poetry",
          title: "ግጥምና ጥበብ",
          countLabel: "5 መጻሕፍት",
          range: "ኢዮብ – መኃልየ መኃልይ",
          description:
            "አምልኮ፣ መከራ፣ ለዕለት ተዕለት ሕይወት ጥበብ፣ እና የፍቅር ውበት።",
          books: ["ኢዮብ", "መዝሙር", "ምሳሌ", "መክብብ", "መኃልየ መኃልይ"],
        },
        {
          key: "majorProphets",
          title: "ዐበይት ነቢያት",
          countLabel: "5 መጻሕፍት",
          range: "ኢሳይያስ – ዳንኤል",
          description:
            "ረዘም ያሉ የትንቢት መጻሕፍት፣ እስራኤልን ወደ እግዚአብሔር የሚመልሱ እና ስለ መሲሑ ጥላ የሚያሳዩ።",
          books: ["ኢሳይያስ", "ኤርምያስ", "ሰቆቃወ ኤርምያስ", "ሕዝቅኤል", "ዳንኤል"],
        },
        {
          key: "minorProphets",
          title: "ንኡስ ነቢያት",
          countLabel: "12 መጻሕፍት",
          range: "ሆሴዕ – ሚልክያስ",
          description:
            "አጭር የትንቢት መጻሕፍት — 'ንኡስ' በርዝመት እንጂ በአስፈላጊነት አይደለም።",
          books: [
            "ሆሴዕ",
            "ኢዮኤል",
            "አሞጽ",
            "አብድዩ",
            "ዮናስ",
            "ሚክያስ",
            "ናሆም",
            "ዕንባቆም",
            "ሶፎንያስ",
            "ሐጌ",
            "ዘካርያስ",
            "ሚልክያስ",
          ],
        },
        {
          key: "gospels",
          title: "ወንጌላት",
          countLabel: "4 መጻሕፍት",
          range: "ማቴዎስ – ዮሐንስ",
          description:
            "የኢየሱስ ክርስቶስ ሕይወት፣ ትምህርት፣ ሞት፣ እና ትንሣኤ።",
          books: ["ማቴዎስ", "ማርቆስ", "ሉቃስ", "ዮሐንስ"],
        },
        {
          key: "acts",
          title: "ሐዋርያት ሥራ",
          countLabel: "1 መጽሐፍ",
          range: "ሐዋርያት ሥራ",
          description:
            "ወንጌል እንዴት እንደተስፋፋ እና ቀደምት ቤተ ክርስቲያን በመንፈስ ቅዱስ እንዴት እንደደገፈች።",
          books: ["ሐዋርያት ሥራ"],
        },
        {
          key: "paulineEpistles",
          title: "የጳውሎስ መልእክቶች",
          countLabel: "13 መጻሕፍት",
          range: "ሮሜ – ፊልሞና",
          description:
            "ጳውሎስ ለቤተ ክርስቲያናትና ለግለሰቦች የጻፋቸው መልእክቶች፣ ለትምህርት፣ ለማረም፣ እና ለማበረታታት።",
          books: [
            "ሮሜ",
            "1 ቆሮንቶስ",
            "2 ቆሮንቶስ",
            "ገላትያ",
            "ኤፌሶን",
            "ፊልጵስዩስ",
            "ቆላስይስ",
            "1 ተሰሎንቄ",
            "2 ተሰሎንቄ",
            "1 ጢሞቴዎስ",
            "2 ጢሞቴዎስ",
            "ቲቶ",
            "ፊልሞና",
          ],
        },
        {
          key: "generalEpistles",
          title: "ጠቅላላ መልእክቶች",
          countLabel: "8 መጻሕፍት",
          range: "ዕብራውያን – ይሁዳ",
          description:
            "ለአማኞች የተጻፉ መልእክቶች፣ ትምህርት፣ ጽናት፣ እምነት፣ እና ቅዱስ ኑሮን የሚያስተምሩ።",
          books: [
            "ዕብራውያን",
            "ያዕቆብ",
            "1 ጴጥሮስ",
            "2 ጴጥሮስ",
            "1 ዮሐንስ",
            "2 ዮሐንስ",
            "3 ዮሐንስ",
            "ይሁዳ",
          ],
        },
        {
          key: "revelation",
          title: "ራእይ",
          countLabel: "1 መጽሐፍ",
          range: "ራእይ",
          description:
            "ስለ ክርስቶስ ድል፣ የመጨረሻ ፍርድ፣ እና አዲስ ፍጥረት የሚናገር ትንቢታዊ ራእይ።",
          books: ["ራእይ"],
        },
      ],
    },
  },

  fr: {
    pages: {
      bibleStructureOverview: "Structure de la Bible",
    },
    common: {
      selectLanguage: "Choisir la langue",
    },
    bibleStructure: {
      pageTitle: "Structure de la Bible",
      intro:
        "Un guide simple des grandes sections de la Bible et de leur rôle dans l'histoire de Dieu.",
      sections: [
        {
          key: "law",
          title: "Loi (Torah)",
          countLabel: "5 livres",
          range: "Genèse – Deutéronome",
          description:
            "Les fondements de Dieu : la création, la chute, les patriarches, l'Exode et la Loi donnée à Moïse.",
          books: ["Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome"],
        },
        {
          key: "history",
          title: "Histoire",
          countLabel: "12 livres",
          range: "Josué – Esther",
          description:
            "L'histoire d'Israël : entrée dans la Terre promise, juges, rois, exil et retour.",
          books: [
            "Josué",
            "Juges",
            "Ruth",
            "1 Samuel",
            "2 Samuel",
            "1 Rois",
            "2 Rois",
            "1 Chroniques",
            "2 Chroniques",
            "Esdras",
            "Néhémie",
            "Esther",
          ],
        },
        {
          key: "poetry",
          title: "Poésie et Sagesse",
          countLabel: "5 livres",
          range: "Job – Cantique des Cantiques",
          description:
            "L'adoration, la souffrance, la sagesse pour la vie quotidienne et la beauté de l'amour.",
          books: ["Job", "Psaumes", "Proverbes", "Ecclésiaste", "Cantique des Cantiques"],
        },
        {
          key: "majorProphets",
          title: "Grands Prophètes",
          countLabel: "5 livres",
          range: "Ésaïe – Daniel",
          description:
            "Des livres prophétiques plus longs appelant Israël à revenir à Dieu et annonçant le Messie.",
          books: ["Ésaïe", "Jérémie", "Lamentations", "Ézéchiel", "Daniel"],
        },
        {
          key: "minorProphets",
          title: "Petits Prophètes",
          countLabel: "12 livres",
          range: "Osée – Malachie",
          description:
            "Des livres prophétiques plus courts — « petits » par leur longueur, non par leur importance.",
          books: [
            "Osée",
            "Joël",
            "Amos",
            "Abdias",
            "Jonas",
            "Michée",
            "Nahum",
            "Habacuc",
            "Sophonie",
            "Aggée",
            "Zacharie",
            "Malachie",
          ],
        },
        {
          key: "gospels",
          title: "Évangiles",
          countLabel: "4 livres",
          range: "Matthieu – Jean",
          description:
            "La vie, les enseignements, la mort et la résurrection de Jésus-Christ.",
          books: ["Matthieu", "Marc", "Luc", "Jean"],
        },
        {
          key: "acts",
          title: "Actes",
          countLabel: "1 livre",
          range: "Actes",
          description:
            "La propagation de l'Évangile et la croissance de l'Église primitive par le Saint-Esprit.",
          books: ["Actes"],
        },
        {
          key: "paulineEpistles",
          title: "Épîtres de Paul",
          countLabel: "13 livres",
          range: "Romains – Philémon",
          description:
            "Des lettres de Paul aux Églises et à des personnes pour l'enseignement, la correction et l'encouragement.",
          books: [
            "Romains",
            "1 Corinthiens",
            "2 Corinthiens",
            "Galates",
            "Éphésiens",
            "Philippiens",
            "Colossiens",
            "1 Thessaloniciens",
            "2 Thessaloniciens",
            "1 Timothée",
            "2 Timothée",
            "Tite",
            "Philémon",
          ],
        },
        {
          key: "generalEpistles",
          title: "Épîtres générales",
          countLabel: "8 livres",
          range: "Hébreux – Jude",
          description:
            "Des lettres adressées aux croyants, avec des instructions sur la foi, l'endurance et la vie sainte.",
          books: [
            "Hébreux",
            "Jacques",
            "1 Pierre",
            "2 Pierre",
            "1 Jean",
            "2 Jean",
            "3 Jean",
            "Jude",
          ],
        },
        {
          key: "revelation",
          title: "Apocalypse",
          countLabel: "1 livre",
          range: "Apocalypse",
          description:
            "Une vision prophétique de la victoire du Christ, du jugement final et de la nouvelle création.",
          books: ["Apocalypse"],
        },
      ],
    },
  },

  sw: {
    pages: {
      bibleStructureOverview: "Muundo wa Biblia",
    },
    common: {
      selectLanguage: "Chagua lugha",
    },
    bibleStructure: {
      pageTitle: "Muundo wa Biblia",
      intro:
        "Mwongozo rahisi wa sehemu kuu za Biblia na nafasi yake katika mpango wa Mungu.",
      sections: [
        {
          key: "law",
          title: "Sheria (Torati)",
          countLabel: "Vitabu 5",
          range: "Mwanzo – Kumbukumbu la Torati",
          description:
            "Misingi ya Mungu: uumbaji, kuanguka, mababu, Kutoka, na Sheria aliyopewa Musa.",
          books: ["Mwanzo", "Kutoka", "Walawi", "Hesabu", "Kumbukumbu la Torati"],
        },
        {
          key: "history",
          title: "Historia",
          countLabel: "Vitabu 12",
          range: "Yoshua – Esta",
          description:
            "Historia ya Israeli: kuingia katika Nchi ya Ahadi, waamuzi, wafalme, uhamisho, na kurudi.",
          books: [
            "Yoshua",
            "Waamuzi",
            "Ruthu",
            "1 Samweli",
            "2 Samweli",
            "1 Wafalme",
            "2 Wafalme",
            "1 Mambo ya Nyakati",
            "2 Mambo ya Nyakati",
            "Ezra",
            "Nehemia",
            "Esta",
          ],
        },
        {
          key: "poetry",
          title: "Mashairi na Hekima",
          countLabel: "Vitabu 5",
          range: "Ayubu – Wimbo Ulio Bora",
          description:
            "Ibada, mateso, hekima kwa maisha ya kila siku, na uzuri wa upendo.",
          books: ["Ayubu", "Zaburi", "Mithali", "Mhubiri", "Wimbo Ulio Bora"],
        },
        {
          key: "majorProphets",
          title: "Manabii Wakuu",
          countLabel: "Vitabu 5",
          range: "Isaya – Danieli",
          description:
            "Vitabu virefu vya unabii vinavyoiita Israeli kumrudia Mungu na kuonyesha ujio wa Masihi.",
          books: ["Isaya", "Yeremia", "Maombolezo", "Ezekieli", "Danieli"],
        },
        {
          key: "minorProphets",
          title: "Manabii Wadogo",
          countLabel: "Vitabu 12",
          range: "Hosea – Malaki",
          description:
            'Vitabu vifupi vya unabii — "wadogo" kwa urefu, si kwa umuhimu.',
          books: [
            "Hosea",
            "Yoeli",
            "Amosi",
            "Obadia",
            "Yona",
            "Mika",
            "Nahumu",
            "Habakuki",
            "Sefania",
            "Hagai",
            "Zekaria",
            "Malaki",
          ],
        },
        {
          key: "gospels",
          title: "Injili",
          countLabel: "Vitabu 4",
          range: "Mathayo – Yohana",
          description:
            "Maisha, mafundisho, kifo, na ufufuo wa Yesu Kristo.",
          books: ["Mathayo", "Marko", "Luka", "Yohana"],
        },
        {
          key: "acts",
          title: "Matendo ya Mitume",
          countLabel: "Kitabu 1",
          range: "Matendo ya Mitume",
          description:
            "Kuenea kwa Injili na kukua kwa kanisa la kwanza kwa njia ya Roho Mtakatifu.",
          books: ["Matendo ya Mitume"],
        },
        {
          key: "paulineEpistles",
          title: "Nyaraka za Paulo",
          countLabel: "Vitabu 13",
          range: "Warumi – Filemoni",
          description:
            "Barua za Paulo kwa makanisa na watu binafsi kwa ajili ya mafundisho, maonyo, na kutiwa moyo.",
          books: [
            "Warumi",
            "1 Wakorintho",
            "2 Wakorintho",
            "Wagalatia",
            "Waefeso",
            "Wafilipi",
            "Wakolosai",
            "1 Wathesalonike",
            "2 Wathesalonike",
            "1 Timotheo",
            "2 Timotheo",
            "Tito",
            "Filemoni",
          ],
        },
        {
          key: "generalEpistles",
          title: "Nyaraka za Jumla",
          countLabel: "Vitabu 8",
          range: "Waebrania – Yuda",
          description:
            "Barua kwa waamini zenye mafundisho kuhusu imani, uvumilivu, na maisha matakatifu.",
          books: [
            "Waebrania",
            "Yakobo",
            "1 Petro",
            "2 Petro",
            "1 Yohana",
            "2 Yohana",
            "3 Yohana",
            "Yuda",
          ],
        },
        {
          key: "revelation",
          title: "Ufunuo",
          countLabel: "Kitabu 1",
          range: "Ufunuo",
          description:
            "Maono ya kinabii kuhusu ushindi wa Kristo, hukumu ya mwisho, na uumbaji mpya.",
          books: ["Ufunuo"],
        },
      ],
    },
  },

  ar: {
    pages: {
      bibleStructureOverview: "هيكل الكتاب المقدس",
    },
    common: {
      selectLanguage: "اختر اللغة",
    },
    bibleStructure: {
      pageTitle: "هيكل الكتاب المقدس",
      intro:
        "دليل مبسط لأقسام الكتاب المقدس الرئيسية ودورها في قصة الله.",
      sections: [
        {
          key: "law",
          title: "الناموس (التوراة)",
          countLabel: "5 أسفار",
          range: "التكوين – التثنية",
          description:
            "أساسات عمل الله: الخلق، السقوط، الآباء، الخروج، والناموس الذي أُعطي لموسى.",
          books: ["التكوين", "الخروج", "اللاويين", "العدد", "التثنية"],
        },
        {
          key: "history",
          title: "التاريخ",
          countLabel: "12 سفرًا",
          range: "يشوع – أستير",
          description:
            "قصة إسرائيل: دخول أرض الموعد، القضاة، الملوك، السبي، ثم الرجوع.",
          books: [
            "يشوع",
            "القضاة",
            "راعوث",
            "1 صموئيل",
            "2 صموئيل",
            "1 الملوك",
            "2 الملوك",
            "1 أخبار الأيام",
            "2 أخبار الأيام",
            "عزرا",
            "نحميا",
            "أستير",
          ],
        },
        {
          key: "poetry",
          title: "الشعر والحكمة",
          countLabel: "5 أسفار",
          range: "أيوب – نشيد الأنشاد",
          description:
            "العبادة، الألم، الحكمة للحياة اليومية، وجمال المحبة.",
          books: ["أيوب", "المزامير", "الأمثال", "الجامعة", "نشيد الأنشاد"],
        },
        {
          key: "majorProphets",
          title: "الأنبياء الكبار",
          countLabel: "5 أسفار",
          range: "إشعياء – دانيال",
          description:
            "أسفار نبوية أطول تدعو إسرائيل للرجوع إلى الله وتلمّح إلى المسيح.",
          books: ["إشعياء", "إرميا", "مراثي إرميا", "حزقيال", "دانيال"],
        },
        {
          key: "minorProphets",
          title: "الأنبياء الصغار",
          countLabel: "12 سفرًا",
          range: "هوشع – ملاخي",
          description:
            "أسفار نبوية أقصر — سُمّيت «صغارًا» من حيث الطول لا من حيث الأهمية.",
          books: [
            "هوشع",
            "يوئيل",
            "عاموس",
            "عوبديا",
            "يونان",
            "ميخا",
            "ناحوم",
            "حبقوق",
            "صفنيا",
            "حجي",
            "زكريا",
            "ملاخي",
          ],
        },
        {
          key: "gospels",
          title: "الأناجيل",
          countLabel: "4 أسفار",
          range: "متى – يوحنا",
          description:
            "حياة يسوع المسيح وتعاليمه وموته وقيامته.",
          books: ["متى", "مرقس", "لوقا", "يوحنا"],
        },
        {
          key: "acts",
          title: "أعمال الرسل",
          countLabel: "سفر واحد",
          range: "أعمال الرسل",
          description:
            "انتشار الإنجيل ونمو الكنيسة الأولى بقوة الروح القدس.",
          books: ["أعمال الرسل"],
        },
        {
          key: "paulineEpistles",
          title: "رسائل بولس",
          countLabel: "13 سفرًا",
          range: "رومية – فليمون",
          description:
            "رسائل كتبها بولس إلى الكنائس والأفراد للتعليم والتصحيح والتشجيع.",
          books: [
            "رومية",
            "1 كورنثوس",
            "2 كورنثوس",
            "غلاطية",
            "أفسس",
            "فيلبي",
            "كولوسي",
            "1 تسالونيكي",
            "2 تسالونيكي",
            "1 تيموثاوس",
            "2 تيموثاوس",
            "تيطس",
            "فليمون",
          ],
        },
        {
          key: "generalEpistles",
          title: "الرسائل العامة",
          countLabel: "8 أسفار",
          range: "العبرانيين – يهوذا",
          description:
            "رسائل للمؤمنين تتناول التعليم والثبات والإيمان والحياة المقدسة.",
          books: [
            "العبرانيين",
            "يعقوب",
            "1 بطرس",
            "2 بطرس",
            "1 يوحنا",
            "2 يوحنا",
            "3 يوحنا",
            "يهوذا",
          ],
        },
        {
          key: "revelation",
          title: "الرؤيا",
          countLabel: "سفر واحد",
          range: "الرؤيا",
          description:
            "رؤيا نبوية عن انتصار المسيح والدينونة الأخيرة والخليقة الجديدة.",
          books: ["الرؤيا"],
        },
      ],
    },
  },

  ti: {
    pages: {
      bibleStructureOverview: "ኣወቃቕራ መጽሓፍ ቅዱስ",
    },
    common: {
      selectLanguage: "ቋንቋ ምረጽ",
    },
    bibleStructure: {
      pageTitle: "ኣወቃቕራ መጽሓፍ ቅዱስ",
      intro:
        "ንዓበይቲ ክፍልታት መጽሓፍ ቅዱስን ስራሖምን ንምርዳእ ቀሊል መምርሒ።",
      sections: [
        {
          key: "law",
          title: "ሕጊ (ኦሪት)",
          countLabel: "5 መጻሕፍቲ",
          range: "ዘፍጥረት – ዘዳግም",
          description:
            "መሰረታት ስራሕ ኣምላኽ፡ ፍጥረት፣ ውድቀት፣ ኣቦታት፣ ምውጻእ፣ እቲ ንሙሴ ዝተዋህበ ሕጊ።",
          books: ["ዘፍጥረት", "ዘጸአት", "ዘሌዋውያን", "ዘኍልቍ", "ዘዳግም"],
        },
        {
          key: "history",
          title: "ታሪኽ",
          countLabel: "12 መጻሕፍቲ",
          range: "ኢያሱ – ኣስቴር",
          description:
            "ታሪኽ እስራኤል፡ ናብ ምድሪ ተስፋ ምእታው፣ መሳፍንቲ፣ ነገስታት፣ ምርኮ፣ ምምላስ።",
          books: [
            "ኢያሱ",
            "መሳፍንቲ",
            "ሩት",
            "1 ሳሙኤል",
            "2 ሳሙኤል",
            "1 ነገስት",
            "2 ነገስት",
            "1 ዜና መዋዕል",
            "2 ዜና መዋዕል",
            "ዕዝራ",
            "ነህምያ",
            "ኣስቴር",
          ],
        },
        {
          key: "poetry",
          title: "ግጥምን ጥበብን",
          countLabel: "5 መጻሕፍቲ",
          range: "ኢዮብ – መኃልየ መኃልይ",
          description:
            "ኣምልኾ፣ መከራ፣ ንዕለታዊ ህይወት ዝጠቅም ጥበብ፣ ከምኡውን ጽባቐ ፍቕሪ።",
          books: ["ኢዮብ", "መዝሙር", "ምሳሌ", "መክብብ", "መኃልየ መኃልይ"],
        },
        {
          key: "majorProphets",
          title: "ዓበይቲ ነቢያት",
          countLabel: "5 መጻሕፍቲ",
          range: "ኢሳይያስ – ዳንኤል",
          description:
            "ነዋሕቲ መጻሕፍቲ ትንቢት፣ እስራኤል ናብ ኣምላኽ ክትምለስ ዝጽውዑ እና ንመሲሕ ዝጠቕሱ።",
          books: ["ኢሳይያስ", "ኤርምያስ", "ሰቆቃወ ኤርምያስ", "ሕዝቅኤል", "ዳንኤል"],
        },
        {
          key: "minorProphets",
          title: "ንኣሽቱ ነቢያት",
          countLabel: "12 መጻሕፍቲ",
          range: "ሆሴእ – ሚልክያስ",
          description:
            "ሓጸርቲ መጻሕፍቲ ትንቢት — \"ንኣሽቱ\" ብርዝመት እምበር ብኣገዳስነት ኣይኮኑን።",
          books: [
            "ሆሴእ",
            "ዮኤል",
            "ኣሞጽ",
            "ኣብድዩ",
            "ዮናስ",
            "ሚክያስ",
            "ናሆም",
            "ኣንባቆም",
            "ሶፎንያስ",
            "ሐጌ",
            "ዘካርያስ",
            "ሚልክያስ",
          ],
        },
        {
          key: "gospels",
          title: "ወንጌላት",
          countLabel: "4 መጻሕፍቲ",
          range: "ማቴዎስ – ዮሃንስ",
          description:
            "ህይወት፣ ትምህርቲ፣ ሞት፣ ከምኡውን ትንሳኤ የሱስ ክርስቶስ።",
          books: ["ማቴዎስ", "ማርቆስ", "ሉቃስ", "ዮሃንስ"],
        },
        {
          key: "acts",
          title: "ግብሪ ሃዋርያት",
          countLabel: "1 መጽሓፍ",
          range: "ግብሪ ሃዋርያት",
          description:
            "ወንጌል ከመይ ከም ዝተዘርግሐ እና ቀዳመይቲ ቤተ ክርስቲያን ብመንፈስ ቅዱስ ከመይ ከም ዝዓበየት።",
          books: ["ግብሪ ሃዋርያት"],
        },
        {
          key: "paulineEpistles",
          title: "መልእኽታት ጳውሎስ",
          countLabel: "13 መጻሕፍቲ",
          range: "ሮሜ – ፊልሞና",
          description:
            "ጳውሎስ ናብ ኣብያተ ክርስቲያናትን ውልቀ ሰባትን ዝጸሓፎም መልእኽታት ምእንቲ ትምህርቲ፣ ምእራም፣ እና ምትብባዕ።",
          books: [
            "ሮሜ",
            "1 ቆሮንቶስ",
            "2 ቆሮንቶስ",
            "ገላትያ",
            "ኤፌሶን",
            "ፊልጵስዩስ",
            "ቆላስይስ",
            "1 ተሰሎንቄ",
            "2 ተሰሎንቄ",
            "1 ጢሞቴዎስ",
            "2 ጢሞቴዎስ",
            "ቲቶ",
            "ፊልሞና",
          ],
        },
        {
          key: "generalEpistles",
          title: "ሓፈሻዊ መልእኽታት",
          countLabel: "8 መጻሕፍቲ",
          range: "ዕብራውያን – ይሁዳ",
          description:
            "ናብ ኣመንቲ ዝተጻሕፉ መልእኽታት፣ ትምህርቲ፣ ጽንዓት፣ እምነት፣ እና ቅዱስ ናብራ ዝምልከቱ።",
          books: [
            "ዕብራውያን",
            "ያእቆብ",
            "1 ጴጥሮስ",
            "2 ጴጥሮስ",
            "1 ዮሃንስ",
            "2 ዮሃንስ",
            "3 ዮሃንስ",
            "ይሁዳ",
          ],
        },
        {
          key: "revelation",
          title: "ራእይ",
          countLabel: "1 መጽሓፍ",
          range: "ራእይ",
          description:
            "ንዓወት ክርስቶስ፣ መወዳእታ ፍርዲ፣ እና ሓድሽ ፍጥረት ዝገልጽ ትንቢታዊ ራእይ።",
          books: ["ራእይ"],
        },
      ],
    },
  },
};

export const bibleStructureLanguages = [
  { code: "en", label: "English" },
  { code: "om", label: "Afaan Oromoo" },
  { code: "am", label: "አማርኛ" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "ar", label: "العربية" },
  { code: "ti", label: "ትግርኛ" },
] as const;