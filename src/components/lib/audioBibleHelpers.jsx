// Audio Bible Configuration for Oromo (GAZGAZ - Bible.is)
const audioBibleConfig = {
  audioBibles: {
    om: {
      languageCode: "om",
      languageName: "Afaan Oromoo",
      provider: "Bible.is",
      bibleId: "GAZGAZ",
      label: "Afaan Oromoo Audio Bible",
      supportsAudio: true,
      supportsText: true,
      defaultBookCode: "GEN",
      defaultChapter: 1
    }
  }
};

// Bible.is Book Code Mapping (66 books)
const bibleIsBookCodes = {
  bibleIsBookCodes: {
    "genesis": "GEN",
    "exodus": "EXO",
    "leviticus": "LEV",
    "numbers": "NUM",
    "deuteronomy": "DEU",
    "joshua": "JOS",
    "judges": "JDG",
    "ruth": "RUT",
    "1-samuel": "1SA",
    "2-samuel": "2SA",
    "1-kings": "1KI",
    "2-kings": "2KI",
    "1-chronicles": "1CH",
    "2-chronicles": "2CH",
    "ezra": "EZR",
    "nehemiah": "NEH",
    "esther": "EST",
    "job": "JOB",
    "psalms": "PSA",
    "proverbs": "PRO",
    "ecclesiastes": "ECC",
    "song-of-solomon": "SNG",
    "isaiah": "ISA",
    "jeremiah": "JER",
    "lamentations": "LAM",
    "ezekiel": "EZK",
    "daniel": "DAN",
    "hosea": "HOS",
    "joel": "JOL",
    "amos": "AMO",
    "obadiah": "OBA",
    "jonah": "JON",
    "micah": "MIC",
    "nahum": "NAM",
    "habakkuk": "HAB",
    "zephaniah": "ZEP",
    "haggai": "HAG",
    "zechariah": "ZEC",
    "malachi": "MAL",
    "matthew": "MAT",
    "mark": "MRK",
    "luke": "LUK",
    "john": "JHN",
    "acts": "ACT",
    "romans": "ROM",
    "1-corinthians": "1CO",
    "2-corinthians": "2CO",
    "galatians": "GAL",
    "ephesians": "EPH",
    "philippians": "PHP",
    "colossians": "COL",
    "1-thessalonians": "1TH",
    "2-thessalonians": "2TH",
    "1-timothy": "1TI",
    "2-timothy": "2TI",
    "titus": "TIT",
    "philemon": "PHM",
    "hebrews": "HEB",
    "james": "JAS",
    "1-peter": "1PE",
    "2-peter": "2PE",
    "1-john": "1JN",
    "2-john": "2JN",
    "3-john": "3JN",
    "jude": "JUD",
    "revelation": "REV"
  }
};

export function getAudioBibleConfig(language = "om") {
  return audioBibleConfig.audioBibles[language];
}

export function getBibleIsBookCode(bookKey) {
  return bibleIsBookCodes.bibleIsBookCodes[bookKey] || null;
}

export function buildBibleIsReference(bookKey, chapter) {
  const config = getAudioBibleConfig("om");
  const bookCode = getBibleIsBookCode(bookKey);

  if (!bookCode) {
    throw new Error(`Unknown Bible.is book code for bookKey: ${bookKey}`);
  }

  return {
    bibleId: config.bibleId,
    bookCode,
    chapter,
    languageCode: config.languageCode
  };
}

export function buildBibleIsLiveUrl(bookKey, chapter) {
  const { bibleId, bookCode } = buildBibleIsReference(bookKey, chapter);
  return `https://live.bible.is/bible/${bibleId}/${bookCode}/${chapter}`;
}