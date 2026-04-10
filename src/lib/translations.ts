export type AppLanguage = "en" | "om";

type TranslationTree = Record<string, any>;

export const translations: Record<AppLanguage, TranslationTree> = {
  en: {
    common: {
      appName: "FaithLight AI Assistant",
      back: "Back",
      loading: "Loading...",
      search: "Search",
      searchPlaceholder: 'Search: faith, "born again", -fear, book:John',
      filters: "Filters",
      apply: "Apply",
      clear: "Clear",
      reset: "Reset",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      copy: "Copy",
      copied: "Copied",
      submit: "Submit",
      generate: "Generate",
      explain: "Explain",
      translate: "Translate",
      language: "Language",
      selectLanguage: "Select language",
      noResults: "No results found",
      tryAnotherSearch: "Try another keyword, verse, or search phrase.",
      examples: "Suggested searches",
      exampleSearchHint:
        'Use exact phrases with quotes, exclude words with -, and filter by book name.',
    },

    pages: {
      advancedBibleSearch: "Advanced Bible Search",
      sermonAssistant: "Sermon Assistant",
      bibleStructureOverview: "Bible Structure Overview",
    },

    nav: {
      advancedBibleSearch: "Advanced Bible Search",
      sermonAssistant: "Sermon Assistant",
      bibleStructureOverview: "Bible Structure Overview",
    },

    tabs: {
      translate: "Translate",
      explainScripture: "Explain Scripture",
      sermonOutline: "Sermon Outline",
      prayer: "Prayer",
    },

    fields: {
      sourceLanguage: "Source language",
      targetLanguage: "Target language",
      tone: "Tone",
      audience: "Audience",
      textToTranslate: "Text to translate",
      verseReference: "Verse reference",
      topic: "Topic",
      keyword: "Keyword",
    },

    options: {
      autoDetect: "Auto detect",
      formal: "Formal",
      simple: "Simple",
      powerful: "Powerful",
      pastoral: "Pastoral",
      youth: "Youth",
      adults: "Adults",
      church: "Church",
      children: "Children",
    },

    sermonAssistant: {
      heroTitle: "FaithLight AI Assistant",
      heroSubtitle:
        "Translate · Explain Scripture · Sermon Outline · Prayer",
      inputPlaceholder: "Enter text to translate...",
      explainPlaceholder: "Enter a Bible verse or passage to explain...",
      sermonPlaceholder: "Enter a topic, text, or verse for a sermon outline...",
      prayerPlaceholder: "Enter a need or prayer topic...",
      generateTranslation: "Translate Text",
      generateExplanation: "Explain Scripture",
      generateSermon: "Generate Sermon Outline",
      generatePrayer: "Generate Prayer",
    },

    advancedSearch: {
      title: "Advanced Bible Search",
      subtitle:
        'Search deeply across the Bible. Use phrases like "faith", -fear, book:John',
      placeholder:
        'Search: faith, "born again", -fear, book:John',
      searchButton: "Search",
      filterButton: "Filters",
      suggestedSearches: "Suggested searches",
      emptyTitle: "Search by verse, topic, or keyword to see results",
      emptyDescription:
        'Tip: use exact phrases in quotes and exclude words you do not want.',
      topicChips: [
        "Faith",
        "Love",
        "Hope",
        "Born Again",
        "Do not fear",
        "Grace",
        "Salvation",
        "Prayer",
      ],
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
          books: [
            "Genesis",
            "Exodus",
            "Leviticus",
            "Numbers",
            "Deuteronomy",
          ],
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
          books: [
            "Job",
            "Psalms",
            "Proverbs",
            "Ecclesiastes",
            "Song of Solomon",
          ],
        },
        {
          key: "majorProphets",
          title: "Major Prophets",
          countLabel: "5 books",
          range: "Isaiah – Daniel",
          description:
            "Longer prophetic books calling Israel back to God, with Messianic foreshadowing.",
          books: [
            "Isaiah",
            "Jeremiah",
            "Lamentations",
            "Ezekiel",
            "Daniel",
          ],
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
          key: "apocalypse",
          title: "Revelation",
          countLabel: "1 book",
          range: "Revelation",
          description:
            "A prophetic vision of Christ's victory, final judgment, and the new creation.",
          books: ["Revelation"],
        },
      ],
    },

    bibleBooks: {
      Genesis: "Genesis",
      Exodus: "Exodus",
      Leviticus: "Leviticus",
      Numbers: "Numbers",
      Deuteronomy: "Deuteronomy",
      Joshua: "Joshua",
      Judges: "Judges",
      Ruth: "Ruth",
      "1 Samuel": "1 Samuel",
      "2 Samuel": "2 Samuel",
      "1 Kings": "1 Kings",
      "2 Kings": "2 Kings",
      "1 Chronicles": "1 Chronicles",
      "2 Chronicles": "2 Chronicles",
      Ezra: "Ezra",
      Nehemiah: "Nehemiah",
      Esther: "Esther",
      Job: "Job",
      Psalms: "Psalms",
      Proverbs: "Proverbs",
      Ecclesiastes: "Ecclesiastes",
      "Song of Solomon": "Song of Solomon",
      Isaiah: "Isaiah",
      Jeremiah: "Jeremiah",
      Lamentations: "Lamentations",
      Ezekiel: "Ezekiel",
      Daniel: "Daniel",
      Hosea: "Hosea",
      Joel: "Joel",
      Amos: "Amos",
      Obadiah: "Obadiah",
      Jonah: "Jonah",
      Micah: "Micah",
      Nahum: "Nahum",
      Habakkuk: "Habakkuk",
      Zephaniah: "Zephaniah",
      Haggai: "Haggai",
      Zechariah: "Zechariah",
      Malachi: "Malachi",
      Matthew: "Matthew",
      Mark: "Mark",
      Luke: "Luke",
      John: "John",
      Acts: "Acts",
      Romans: "Romans",
      "1 Corinthians": "1 Corinthians",
      "2 Corinthians": "2 Corinthians",
      Galatians: "Galatians",
      Ephesians: "Ephesians",
      Philippians: "Philippians",
      Colossians: "Colossians",
      "1 Thessalonians": "1 Thessalonians",
      "2 Thessalonians": "2 Thessalonians",
      "1 Timothy": "1 Timothy",
      "2 Timothy": "2 Timothy",
      Titus: "Titus",
      Philemon: "Philemon",
      Hebrews: "Hebrews",
      James: "James",
      "1 Peter": "1 Peter",
      "2 Peter": "2 Peter",
      "1 John": "1 John",
      "2 John": "2 John",
      "3 John": "3 John",
      Jude: "Jude",
      Revelation: "Revelation",
    },
  },

  om: {
    common: {
      appName: "FaithLight AI Gargaaraa",
      back: "Duubatti",
      loading: "Fe'amaa jira...",
      search: "Barbaadi",
      searchPlaceholder: 'Barbaadi: amantii, "deebii lammaffaa", -sodaa, kitaaba:Yohannis',
      filters: "Calaltuu",
      apply: "Hojii irra oolchi",
      clear: "Haqi",
      reset: "Irra deebi'i",
      save: "Kuusi",
      cancel: "Dhiisi",
      close: "Cufi",
      copy: "Waraabi",
      copied: "Waraabameera",
      submit: "Ergi",
      generate: "Uumi",
      explain: "Ibsi",
      translate: "Hiiki",
      language: "Afaan",
      selectLanguage: "Afaan filadhu",
      noResults: "Bu'aan hin argamne",
      tryAnotherSearch: "Jecha, aayata, ykn gaalee biraa yaali.",
      examples: "Barbaacha gorfaman",
      exampleSearchHint:
        'Gaaleewwan sirrii mallattoo keessaa galchi, jechoota hin barbaadne ammoo - fayyadami.',
    },

    pages: {
      advancedBibleSearch: "Barbaacha Macaafa Qulqulluu Bal'aa",
      sermonAssistant: "Gargaaraa Lallabaa",
      bibleStructureOverview: "Ijaarsa Macaafa Qulqulluu",
    },

    nav: {
      advancedBibleSearch: "Barbaacha Macaafa Qulqulluu Bal'aa",
      sermonAssistant: "Gargaaraa Lallabaa",
      bibleStructureOverview: "Ijaarsa Macaafa Qulqulluu",
    },

    tabs: {
      translate: "Hiiki",
      explainScripture: "Caaffata Ibsi",
      sermonOutline: "Karoora Lallabaa",
      prayer: "Kadhannaa",
    },

    fields: {
      sourceLanguage: "Afaan irraa",
      targetLanguage: "Afaan itti",
      tone: "Akkaataa dubbii",
      audience: "Dhaggeeffattoota",
      textToTranslate: "Barruu hiikamu",
      verseReference: "Eeruu aayataa",
      topic: "Mata duree",
      keyword: "Jechoota barbaacha",
    },

    options: {
      autoDetect: "Ofumaan adda baasi",
      formal: "Kabajaa",
      simple: "Salphaa",
      powerful: "Humna-qabeessa",
      pastoral: "Tiksummaa",
      youth: "Dargaggoota",
      adults: "Gurguddoo",
      church: "Mana Kiristaanaa",
      children: "Ijoollee",
    },

    sermonAssistant: {
      heroTitle: "FaithLight AI Gargaaraa",
      heroSubtitle:
        "Hiika · Caaffata Ibsa · Karoora Lallabaa · Kadhannaa",
      inputPlaceholder: "Barruu hiikamu galchi...",
      explainPlaceholder: "Aayata ykn kutaa keessaa ibsamu galchi...",
      sermonPlaceholder:
        "Mata duree, barreeffama, ykn aayata lallabaaf galchi...",
      prayerPlaceholder: "Fedhii ykn mata duree kadhannaa galchi...",
      generateTranslation: "Barruu Hiiki",
      generateExplanation: "Caaffata Ibsi",
      generateSermon: "Karoora Lallabaa Uumi",
      generatePrayer: "Kadhannaa Uumi",
    },

    advancedSearch: {
      title: "Barbaacha Macaafa Qulqulluu Bal'aa",
      subtitle:
        'Hiika ykn jecha barbaadde Macaafa Qulqulluu keessaa barbaadi. Fakkeenyaaf "seentaa", -dura, kitaaba:Yohannis fayyadami.',
      placeholder:
        'Barbaadi: amantii, "deebii deebii\'ame", -haala guddaa, kitaaba:Yohannis',
      searchButton: "Barbaadi",
      filterButton: "Calaltoonni",
      suggestedSearches: "Barbaacha Ariifannoo",
      emptyTitle: "Jecha, seentaa, ykn hojii seensa barbaadhu galtee godhi",
      emptyDescription:
        'Gorsa: jechuun "dacha" itti fayyadami; jechuun keessaa baasuuuf ammoo - fayyadami.',
      topicChips: [
        "Amantii",
        "Jaalala",
        "Abdii",
        "Lammata Dhalachuu",
        "Hin Sodaatin",
        "Ayyaana",
        "Fayyina",
        "Kadhannaa",
      ],
    },

    churchFinder: {
      pageTitle: "Mana Raajjii Barbaadi",
      heroTitle: "Mana Raajjii Barbaadi",
      heroSubtitle: "Mana raajjii fi hawaasa amantii si bira jiru barbaadi",
      searchPlaceholder: "Maqaa, magaalaa, ykn mootummaa amantii irratti barbaadi...",
      searchButton: "Barbaadi",
      favorites: "Jaallatamoo",
      all: "Hunda",
      baptist: "Baptistii",
      catholic: "Katolikaa",
      lutheran: "Luteraanaa",
      methodist: "Methodistii",
      pentecostal: "Pheenxeqoostee",
      presbyterian: "Pireezbiiteriyaan",
      churchesFound: "Manneen raajjii argaman",
      list: "Tarree",
      map: "Kaartaa",
      noChurchesFound: "Manni raajjii hin argamne",
      tryAdjustingFilters: "Calaltuu ykn barbaacha kee jijjiiruun yaali",
    },

    bibleStructure: {
      pageTitle: "Ijaarsa Macaafa Qulqulluu",
      intro:
        "Kutaa guguddoo Macaafa Qulqulluu fi hojii isaanii seenaa Waaqayyoo fi Israa'el keessatti ibsu qajeelfama salphaa.",
      sections: [
        {
          key: "law",
          title: "Seera (Torah)",
          countLabel: "Kitaabota 5",
          range: "Uumamaa – Keessa Deebii",
          description:
            "Bu'uura hojii Waaqayyoo: uumama, kufaatii, abbootii amantii, Ba'uu, fi seera Museetti kenname.",
          books: [
            "Uumamaa",
            "Ba'uu",
            "Lewwota",
            "Lakkoobsa",
            "Keessa Deebii",
          ],
        },
        {
          key: "history",
          title: "Seenaa",
          countLabel: "Kitaabota 12",
          range: "Iyyaasuu – Asteer",
          description:
            "Seenaa Israa'el: Biyya Abdachiifamte seenuu, abbootii murtii, mootota, boojuu, fi deebi'uu.",
          books: [
            "Iyyaasuu",
            "Abbootii Murtii",
            "Ruut",
            "1 Saamu'eel",
            "2 Saamu'eel",
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
          books: [
            "Iyoob",
            "Faarfannaa",
            "Fakkeenya",
            "Lallaba Waaqayyoo",
            "Weedduu Solomoon",
          ],
        },
        {
          key: "majorProphets",
          title: "Raajota Gurguddoo",
          countLabel: "Kitaabota 5",
          range: "Isaayaas – Daani'eel",
          description:
            "Kitaabota raajii dheeraa Israa'el gara Waaqayyoo waaman, Masiihicha dursee agarsiisuudhaan.",
          books: [
            "Isaayaas",
            "Ermiyaas",
            "Faaruu Ermiyaas",
            "Hisqi'eel",
            "Daani'eel",
          ],
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
            "Naahoom",
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
            "Lallabni wangeelaa babal'achuu fi waldaan duraa Hafuura Qulqulluudhaan guddachuu.",
          books: ["Hojii Ergamootaa"],
        },
        {
          key: "paulineEpistles",
          title: "Ergaawwan Phaawuloos",
          countLabel: "Kitaabota 13",
          range: "Roomaa – Fileemoon",
          description:
            "Xalayaawwan Phaawuloos waldoota fi namootaaf barsiisa, sirreeffama, fi jajjabina kennan.",
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
          key: "apocalypse",
          title: "Mul'ata",
          countLabel: "Kitaaba 1",
          range: "Mul'ata",
          description:
            "Mul'ata raajii injifannoo Kiristoos, murtii dhumaa, fi uumama haaraa ibsu.",
          books: ["Mul'ata"],
        },
      ],
    },

    bibleBooks: {
      Genesis: "Uumamaa",
      Exodus: "Ba'uu",
      Leviticus: "Lewwota",
      Numbers: "Lakkoobsa",
      Deuteronomy: "Keessa Deebii",
      Joshua: "Iyyaasuu",
      Judges: "Abbootii Murtii",
      Ruth: "Ruut",
      "1 Samuel": "1 Saamu'eel",
      "2 Samuel": "2 Saamu'eel",
      "1 Kings": "1 Moototaa",
      "2 Kings": "2 Moototaa",
      "1 Chronicles": "1 Seenaa Bara",
      "2 Chronicles": "2 Seenaa Bara",
      Ezra: "Izraa",
      Nehemiah: "Nahimiyaa",
      Esther: "Asteer",
      Job: "Iyoob",
      Psalms: "Faarfannaa",
      Proverbs: "Fakkeenya",
      Ecclesiastes: "Lallaba Waaqayyoo",
      "Song of Solomon": "Weedduu Solomoon",
      Isaiah: "Isaayaas",
      Jeremiah: "Ermiyaas",
      Lamentations: "Faaruu Ermiyaas",
      Ezekiel: "Hisqi'eel",
      Daniel: "Daani'eel",
      Hosea: "Hose'aa",
      Joel: "Yo'eel",
      Amos: "Aamoos",
      Obadiah: "Obaadiyaa",
      Jonah: "Yoonaas",
      Micah: "Miikiyaas",
      Nahum: "Naahoom",
      Habakkuk: "Habaaqquuq",
      Zephaniah: "Sefaaniyaa",
      Haggai: "Haggayi",
      Zechariah: "Zakariyaa",
      Malachi: "Milkiyaas",
      Matthew: "Maatewos",
      Mark: "Maarqos",
      Luke: "Luqaas",
      John: "Yohannis",
      Acts: "Hojii Ergamootaa",
      Romans: "Roomaa",
      "1 Corinthians": "1 Qorontos",
      "2 Corinthians": "2 Qorontos",
      Galatians: "Galaatiyaa",
      Ephesians: "Efesoon",
      Philippians: "Filiphoos",
      Colossians: "Qolosaayis",
      "1 Thessalonians": "1 Tasalonqee",
      "2 Thessalonians": "2 Tasalonqee",
      "1 Timothy": "1 Ximotewos",
      "2 Timothy": "2 Ximotewos",
      Titus: "Tiitoo",
      Philemon: "Fileemoon",
      Hebrews: "Ibrootaa",
      James: "Yaaqoob",
      "1 Peter": "1 Pheexiroos",
      "2 Peter": "2 Pheexiroos",
      "1 John": "1 Yohannis",
      "2 John": "2 Yohannis",
      "3 John": "3 Yohannis",
      Jude: "Yihudaa",
      Revelation: "Mul'ata",
    },
  },
};

/**
 * Safe translation getter.
 * Example:
 * t("om", "pages.sermonAssistant")
 */
export function t(
  language: AppLanguage,
  path: string,
  fallback?: string
): string {
  const value = path
    .split(".")
    .reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), translations[language]);

  if (typeof value === "string") return value;

  if (fallback) return fallback;

  const enValue = path
    .split(".")
    .reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), translations.en);

  return typeof enValue === "string" ? enValue : path;
}

/**
 * Get translated Bible book name by canonical English key.
 * Example:
 * getBookName("Genesis", "om") => "Uumamaa"
 */
export function getBookName(bookKey: string, language: AppLanguage): string {
  return translations[language]?.bibleBooks?.[bookKey] ||
    translations.en.bibleBooks?.[bookKey] ||
    bookKey;
}