// ============================================================
// FaithLight — Custom Date Formatter
// Uses reviewed, exact translations for each supported language.
// Never relies solely on browser locale for minority languages.
// ============================================================

export const customWeekdays = {
  om: ['Dilbata', 'Wiixata', 'Kibxata', 'Roobii', 'Kamisa', 'Jimaata', 'Sanbata'],
  am: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
  ti: ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ሓሙስ', 'ዓርቢ', 'ቀዳም'],
  sw: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export const customMonths = {
  om: [
    'Amajjii', 'Guraandhala', 'Bitootessa', 'Eebla', 'Caamsaa', 'Waxabajjii',
    'Adoolessa', 'Haagayya', 'Fulbaana', 'Onkoloolessa', 'Sadaasa', 'Muddee',
  ],
  am: [
    'ጃንዋሪ', 'ፌብሩዋሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
    'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር',
  ],
  ti: [
    'ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ',
    'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ',
  ],
  sw: [
    'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
    'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba',
  ],
  fr: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ],
  ar: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

/**
 * Format a date using custom reviewed dictionaries for each language.
 * Returns e.g. "Sanbata, Bitootessa 14" for Afaan Oromoo.
 */
export function formatLocalizedDate(date, lang) {
  const weekdays = customWeekdays[lang] || customWeekdays.en;
  const months = customMonths[lang] || customMonths.en;

  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();

  // Arabic: right-to-left natural order — day month, weekday
  if (lang === 'ar') {
    return `${weekday}، ${day} ${month}`;
  }

  return `${weekday}, ${month} ${day}`;
}

/**
 * Format just a month + day (e.g. for streak calendars, reminders).
 */
export function formatShortDate(date, lang) {
  const months = customMonths[lang] || customMonths.en;
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format just the weekday name.
 */
export function formatWeekday(date, lang) {
  const weekdays = customWeekdays[lang] || customWeekdays.en;
  return weekdays[date.getDay()];
}

/**
 * Format just the month name.
 */
export function formatMonth(date, lang) {
  const months = customMonths[lang] || customMonths.en;
  return months[date.getMonth()];
}