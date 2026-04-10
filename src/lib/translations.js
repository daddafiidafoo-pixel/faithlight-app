// Standardized Afaan Oromoo + English translations
// Use consistently across entire app

export const translations = {
  en: {
    common: {
      read: "Read",
      listen: "Listen",
      share: "Share",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      continue: "Continue",
      download: "Download",
      downloaded: "Downloaded",
      downloading: "Downloading...",
      offlineMode: "Offline Mode",
    },

    nav: {
      home: "Home",
      bible: "Bible",
      plans: "Reading Plans",
      journal: "Journal",
      highlights: "Highlights",
      settings: "Settings",
    },

    about: {
      title: "About FaithLight",
      subtitle: "Bible-centered learning for a global community",
      missionTitle: "Our Mission",
      missionBody: "FaithLight helps believers understand the Bible clearly and grow in their faith with confidence",
      featuresTitle: "What You Can Do",
      aiPromiseTitle: "Responsible AI Promise",
    },

    bible: {
      oldTestament: "Old Testament",
      newTestament: "New Testament",
      chapter: "Chapter",
      verse: "Verse",
      next: "Next",
      previous: "Previous",
    },

    journal: {
      title: "Prayer Journal",
      addNote: "Write your thoughts",
      noEntries: "No entries yet",
      mood: "Mood",
      tags: "Tags",
    },

    highlights: {
      title: "My Highlights",
      noHighlights: "No highlights yet",
    },

    plans: {
      title: "Reading Plans",
      startPlan: "Start Plan",
      continuePlan: "Continue",
      completed: "Completed",
      day: "Day",
    },

    quiz: {
      title: "Bible Quiz",
      start: "Start",
      score: "Score",
      correct: "Correct",
      wrong: "Wrong",
      retry: "Try Again",
    },

    share: {
      title: "Share",
      copy: "Copy full verse",
      image: "Create image",
      shareNow: "Share now",
    },

    audio: {
      download: "Download audio",
      playingOffline: "Playing from offline",
    },

    notifications: {
      title: "Notifications",
      enable: "Enable notifications",
      time: "Choose time",
    },

    ai: {
      prayerCoach: "Prayer Coach",
      suggestion: "Prayer suggestion",
      generate: "Generate reflection",
      save: "Save to journal",
    },
  },

  om: {
    common: {
      read: "Dubbisi",
      listen: "Dhaggeeffadhu",
      share: "Qoodi",
      save: "Kuusi",
      cancel: "Dhiisi",
      delete: "Haqi",
      edit: "Fooyyessi",
      continue: "Itti fufi",
      download: "Buufadhu",
      downloaded: "Buufameera",
      downloading: "Buufamaa jira...",
      offlineMode: "Haala Offline",
    },

    nav: {
      home: "Mana",
      bible: "Macaafa Qulqulluu",
      plans: "Karoora Dubbisaa",
      journal: "Galmee Kadhannaa",
      highlights: "Mallattoo",
      settings: "Qindaa'ina",
    },

    about: {
      title: "Waa'ee FaithLight",
      subtitle: "Barumsa Macaafa Qulqulluu irratti hundaa'e hawaasa addunyaatiif",
      missionTitle: "Ergama Keenyaa",
      missionBody: "FaithLight amantoota Macaafa Qulqulluu sirriitti akka hubatan, amantii isaanii keessatti akka jabaatan, fi ofitti amanamummaan akka barsiisaniif ni gargaara",
      featuresTitle: "Waan Ati Gochuu Dandeessu",
      aiPromiseTitle: "Waadaa AI Itti Gaafatamummaa",
    },

    bible: {
      oldTestament: "Kakuu Moofaa",
      newTestament: "Kakuu Haaraa",
      chapter: "Boqonnaa",
      verse: "Lakkoofsa",
      next: "Itti aanuu",
      previous: "Durii",
    },

    journal: {
      title: "Galmee Kadhannaa",
      addNote: "Yaada kee barreessi",
      noEntries: "Galmeen hin jiru",
      mood: "Miira",
      tags: "Mallattoolee",
    },

    highlights: {
      title: "Mallattoolee Koo",
      noHighlights: "Mallattoon hin jiru",
    },

    plans: {
      title: "Karoora Dubbisaa",
      startPlan: "Karoora jalqabi",
      continuePlan: "Itti fufi",
      completed: "Xumurame",
      day: "Guyyaa",
    },

    quiz: {
      title: "Qormaata Macaafa Qulqulluu",
      start: "Jalqabi",
      score: "Bu'aa",
      correct: "Sirrii",
      wrong: "Dogoggora",
      retry: "Irra deebi'i",
    },

    share: {
      title: "Qoodi",
      copy: "Barreeffama guutuu kopi godhi",
      image: "Suuraa uumi",
      shareNow: "Amma qoodi",
    },

    audio: {
      download: "Sagalee buufadhu",
      playingOffline: "Offline irraa taphachaa jira",
    },

    notifications: {
      title: "Beeksisa",
      enable: "Beeksisa eeyyami",
      time: "Yeroo filadhu",
    },

    ai: {
      prayerCoach: "Gorsa Kadhannaa",
      suggestion: "Yaada kadhannaa",
      generate: "Yaada haaromsii",
      save: "Galmee keessatti kuusi",
    },
  },
};

// Global translator helper
export function t(lang, path) {
  if (!path || typeof path !== 'string') return path || '';
  const keys = path.split(".");
  let result = translations[lang];

  for (const key of keys) {
    result = result?.[key];
  }

  return result || path;
}