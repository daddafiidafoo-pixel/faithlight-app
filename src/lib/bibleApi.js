const VERSES = {
  en: {
    verse: "Rejoice in the Lord always; again I will say, rejoice.",
    reference: "Philippians 4:4",
    reflection: "Let joy and gratitude lead your heart today.",
  },
  fr: {
    verse: "Réjouissez-vous toujours dans le Seigneur; je le répète, réjouissez-vous.",
    reference: "Philippiens 4:4",
    reflection: "Que la joie et la gratitude guident votre cœur aujourd'hui.",
  },
  ar: {
    verse: "افرحوا في الرب كل حين، وأقول أيضًا افرحوا.",
    reference: "فيلبي 4:4",
    reflection: "ليقد الفرح والشكر قلبك اليوم.",
  },
  sw: {
    verse: "Furahini katika Bwana siku zote; tena nasema, furahini.",
    reference: "Wafilipi 4:4",
    reflection: "Acha furaha na shukrani ziongoze moyo wako leo.",
  },
  am: {
    verse: "በጌታ ሁልጊዜ ደስ ይበላችሁ፤ ደግሜ እላለሁ ደስ ይበላችሁ።",
    reference: "ፊልጵስዩስ 4:4",
    reflection: "ዛሬ ደስታና ምስጋና ልብህን ይምሩ።",
  },
  ti: {
    verse: "ኣብ ጐይታ ኩሉ ጊዜ ተሓጐሱ፤ ደጊመ እብል ኣለኹ፡ ተሓጐሱ።",
    reference: "ፊልጲ 4:4",
    reflection: "ሎሚ ሓጐስን ምስጋናን ንልብኻ ይመርሕዎ።",
  },
  om: {
    verse: "Yeroo hundumaa keessatti Gooftaa keessatti gammadaa; ammas nan jedhu, gammadaa.",
    reference: "Filipisiyuus 4:4",
    reflection: "Har'a gammachuun fi galanni garaa kee haa qajeelchan.",
  },
};

export async function getVerseOfDay(language = "en") {
  const safeLanguage = VERSES[language] ? language : "en";
  return {
    ...VERSES[safeLanguage],
    language: safeLanguage,
    date: new Date().toISOString().slice(0, 10),
  };
}

export async function getDailyVerse(language = "en") {
  return getVerseOfDay(language);
}

export async function getRandomVerse(language = "en") {
  return getVerseOfDay(language);
}