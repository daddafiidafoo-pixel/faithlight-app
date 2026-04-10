export const SUPPORTED_LANGUAGES = ["en", "om", "am", "ar"];

export const LANGUAGE_META = {
  en: { label: "English", nativeLabel: "English", dir: "ltr" },
  om: { label: "Oromo", nativeLabel: "Afaan Oromoo", dir: "ltr" },
  am: { label: "Amharic", nativeLabel: "አማርኛ", dir: "ltr" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
};

export const translations = {
  en: {
    common: {
      appName: "FaithLight",
      read: "Read",
      listen: "Listen",
      share: "Share",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      update: "Update",
      continue: "Continue",
      close: "Close",
      search: "Search",
      next: "Next",
      previous: "Previous",
      loading: "Loading...",
      download: "Download",
      downloaded: "Downloaded",
      downloading: "Downloading...",
      offlineMode: "Offline Mode",
      language: "Language",
      chooseLanguage: "Choose Language",
      selectLanguage: "Select a language",
      reply: "Reply",
      send: "Send",
      bookmark: "Bookmark",
      hide: "Hide",
      show: "Show",
    },

    nav: {
      home: "Home",
      bible: "Bible",
      audio: "Audio Bible",
      plans: "Reading Plans",
      journal: "Prayer Journal",
      highlights: "My Highlights",
      quiz: "Quiz",
      notifications: "Notifications",
      settings: "Settings",
      about: "About",
    },

    about: {
      title: "About FaithLight",
      subtitle: "Bible-centered learning for a global community.",
      missionTitle: "Our Mission",
      missionBody:
        "FaithLight helps believers understand the Bible clearly, grow in faith, and learn with confidence through accessible and thoughtful tools.",
      featuresTitle: "What You Can Do",
      featuresBody:
        "Read Scripture, listen to audio Bible, follow reading plans, save prayer notes, highlight verses, take quizzes, and reflect more deeply.",
      aiPromiseTitle: "Responsible AI Promise",
      aiPromiseBody:
        "Our AI tools are designed to support Bible study and reflection. They do not replace prayer, pastoral care, the local church, or Scripture itself.",
      coreValuesTitle: "Core Values",
      value1: "Faith-centered learning",
      value2: "Accessible to all believers",
      value3: "Community-driven growth",
      value4: "Innovative tools for study",
      value5: "Integrity in all we do",
    },

    bible: {
      oldTestament: "Old Testament",
      newTestament: "New Testament",
      chapter: "Chapter",
      verse: "Verse",
      selectVerse: "Select verse",
      shareVerse: "Share Verse",
      highlight: "Highlight",
      addJournal: "Add Prayer Note",
      takeQuiz: "Take Quiz",
    },

    journal: {
      title: "Prayer Journal",
      overview: "Journal Overview",
      addEntry: "New Prayer Entry",
      editEntry: "Edit Entry",
      deleteEntry: "Delete Entry",
      notePlaceholder: "Write your prayer, reflection, or note...",
      noEntries: "No prayers yet. Tap the button above to add your first prayer.",
      noMatchFilters: "No entries match your filters.",
      mood: "Mood",
      tags: "Tags",
      linkedVerse: "Linked Verse",
      private: "Private",
      privateSpace: "Your private space to talk with God",
      prayerSaved: "Prayer saved 🙏",
      prayerUpdated: "Prayer updated",
      entryRemoved: "Entry removed",
      searchPlaceholder: "Search prayers...",
      total: "Total",
    },

    plans: {
      title: "Reading Plans",
      startPlan: "Start Plan",
      continuePlan: "Continue Plan",
      nextReading: "Next Reading",
      completed: "Completed",
      day: "Day",
      markComplete: "Mark as Complete",
      percentComplete: "Percent Complete",
    },

    highlights: {
      title: "My Highlights",
      noHighlights: "No highlights yet.",
      color: "Color",
      recent: "Recent",
      clearFilter: "Clear Filter",
    },

    quiz: {
      title: "Bible Quiz",
      start: "Start Quiz",
      score: "Score",
      correct: "Correct",
      wrong: "Wrong",
      retry: "Retry",
      leaderboard: "Leaderboard",
      level: "Level",
      points: "Points",
      streak: "Streak",
    },

    share: {
      title: "Share Verse",
      copy: "Copy Verse",
      image: "Generate Image",
      shareNow: "Share Now",
      copied: "Verse copied.",
      imageReady: "Image generated.",
      failed: "Action failed.",
    },

    audio: {
      title: "Audio Bible",
      download: "Download Chapter",
      notDownloaded: "Not Downloaded",
      downloaded: "Downloaded",
      downloading: "Downloading...",
      playOffline: "Play Offline",
      offlineReady: "Available offline.",
    },

    notifications: {
      title: "Notifications",
      enable: "Enable Daily Verse Reminder",
      time: "Reminder Time",
      test: "Send Test Notification",
      disabled: "Notifications disabled",
      enabled: "Notifications enabled",
    },

    ai: {
      prayerCoach: "Prayer Coach",
      suggestion: "Prayer Suggestion",
      generate: "Generate Again",
      saveToJournal: "Save to Journal",
      useThis: "Use this Prayer Point",
      disclaimer:
        "This tool is assistive and devotional. It does not replace Scripture, prayer, pastoral guidance, or the local church.",
    },

    bibleTranslations: {
      kjv: "King James Version",
      niv: "New International Version",
      esv: "English Standard Version",
      nasb: "New American Standard Bible",
      nlt: "New Living Translation",
      web: "World English Bible",
    },

    languageSelector: {
      label: "Language",
    },

    communityPrayerBoard: {
    title: "Prayer Board",
    subtitle: "Lift each other up in prayer",
    request: "Request",
    requestButton: "Request",
    emptyState: {
      title: "No prayer requests yet",
      subtitle: "Be the first to share a need",
    },
    emptyTitle: "No prayer requests yet",
    emptySubtitle: "Be the first to share a need",
      filterActive: "Active",
      filterAnswered: "Answered",
      prayerAnswered: "Prayer Answered",
      prayedCount: "prayed",
      prayingFor: "praying",
      filterByCategory: "Filter by Category",
      searchPlaceholder: "Search prayer requests...",
      prayerRequests: "Prayer Requests",
      markAnswered: "Mark Answered",
      beFirst: "Be the first to encourage",
      postAnonymously: "Post anonymously",
      posting: "Posting...",
      postButton: "Post Request",
      shareRequest: "Share a Prayer Request",
      titlePlaceholder: "What are you praying about?",
      bodyPlaceholder: "Share your request in detail...",
      addEncouragement: "Write encouragement...",
      replyPlaceholder: "Replying to {name}...",
      replyingTo: "Replying to",
      sendEncouragement: "Send encouragement",
      spiritualEncouragement: "Spiritual Encouragement",
      sendWordOfEncouragement: "Send a word of encouragement",
      typeMessage: "Type a message...",
      historyTitle: "My Prayer History",
      historyEmpty: "No prayers recorded yet",
      toastPrayed: "Prayer recorded 🙏",
      toastAnswered: "Marked as answered! 🎉",
      toastPosted: "Prayer request posted 🙏",
      toastSaved: "Saved to your library",
      toastUnsaved: "Removed from saved",
      toastMessageSent: "Message sent",
      toastEncouragementSent: "Encouragement sent 🙏",
      toastSignInRequired: "Please sign in to pray",
      toastFillFields: "Please fill in title and prayer",
      toastFailPost: "Could not post. Please try again.",
      toastFailUpdate: "Update failed. Please try again.",
      categories: {
        all: "All",
        health: "Health",
        family: "Family",
        faith: "Faith",
        work: "Work",
        relationships: "Relationships",
        gratitude: "Gratitude",
        other: "Other",
      },
    },
  },

  om: {
    common: {
      appName: "FaithLight",
      read: "Dubbisi",
      listen: "Dhaggeeffadhu",
      share: "Qoodi",
      save: "Kuusi",
      cancel: "Dhiisi",
      delete: "Haqi",
      edit: "Fooyyessi",
      update: "Haaromsi",
      continue: "Itti fufi",
      close: "Cufi",
      search: "Barbaadi",
      next: "Itti aanuu",
      previous: "Duraanii",
      loading: "Fe'amaa jira...",
      download: "Buufadhu",
      downloaded: "Buufameera",
      downloading: "Buufamaa jira...",
      offlineMode: "Haala Offline",
      language: "Afaan",
      chooseLanguage: "Afaan Fili",
      selectLanguage: "Afaan tokko fili",
      reply: "Deebisi",
      send: "Ergi",
      bookmark: "Mallattoo",
      hide: "Dhoksi",
      show: "Agarsiisi",
    },

    nav: {
      home: "Mana",
      bible: "Macaafa Qulqulluu",
      audio: "Macaafa Qulqulluu Sagalee",
      plans: "Karoora Dubbisaa",
      journal: "Galmee Kadhannaa",
      highlights: "Mallattoolee Koo",
      quiz: "Qormaata",
      notifications: "Beeksisa",
      settings: "Qindaa'ina",
      about: "Waa'ee",
    },

    about: {
      title: "Waa'ee FaithLight",
      subtitle: "Barumsa Macaafa Qulqulluu irratti hundaa'e hawaasa addunyaatiif.",
      missionTitle: "Ergama Keenyaa",
      missionBody:
        "FaithLight amantoota Macaafa Qulqulluu sirriitti akka hubatan, amantii isaanii keessatti akka jabaatan, fi ofitti amanamummaan akka baratan ni gargaara.",
      featuresTitle: "Waan Ati Gochuu Dandeessu",
      featuresBody:
        "Macaafa Qulqulluu dubbisuu, sagalee isaa dhaggeeffachuu, karoora dubbisaa hordofuu, yaada kadhannaa barreessuu, lakkoofsota mallatteessuu, qormaata fudhachuu, fi caalaatti irratti xiinxaluu dandeessa.",
      aiPromiseTitle: "Waadaa AI Itti Gaafatamummaa",
      aiPromiseBody:
        "Meeshaaleen AI keenya qo'annoo fi xiinxala Macaafa Qulqulluu keessatti gargaaruuf qophaa'an. Kadhannaa, tajaajila hafuuraa, waldaa keessaa barsiisa, yookaan Macaafa Qulqulluu bakka hin bu'an.",
      coreValuesTitle: "Qabiyyeewwan Ijoo",
      value1: "Barnoonni Amantii irratti hundaa'e",
      value2: "Amantoota hundaaf ni danda'ama",
      value3: "Guddina hawaasa irratti hundaa'e",
      value4: "Meeshaalee haaraa qo'annoof",
      value5: "Haqummaa hojii hundarratti",
    },

    bible: {
      oldTestament: "Kakuu Moofaa",
      newTestament: "Kakuu Haaraa",
      chapter: "Boqonnaa",
      verse: "Lakkoofsa",
      selectVerse: "Lakkoofsa fili",
      shareVerse: "Lakkoofsa qoodi",
      highlight: "Mallatteessi",
      addJournal: "Yaada Kadhannaa Dabaluu",
      takeQuiz: "Qormaata Fudhadhu",
    },

    journal: {
      title: "Galmee Kadhannaa",
      overview: "Walitti Qabamni Galmee",
      addEntry: "Galcha Kadhannaa Haaraa",
      editEntry: "Galmee Fooyyessuu",
      deleteEntry: "Galmee Haquu",
      notePlaceholder: "Kadhannaa kee, yaada kee, yookaan xiinxala kee barreessi...",
      noEntries: "Ammaaf kadhannaan hin jiru. Galmee kee jalqabuuf fuula olii ciqali.",
      noMatchFilters: "Callee kee wajjin walsimu hin jiru.",
      mood: "Miira",
      tags: "Mallattoolee",
      linkedVerse: "Lakkoofsa waliin walqabate",
      private: "Dhuunfaa",
      privateSpace: "Waaqayyoo wajjin haasa'uu bakka dhuunfaa kee",
      prayerSaved: "Kadhannaan kuufame 🙏",
      prayerUpdated: "Kadhannaan haaromfame",
      entryRemoved: "Galchichi haqame",
      searchPlaceholder: "Kadhannaa barbaadi...",
      total: "Waliigala",
    },

    plans: {
      title: "Karoora Dubbisaa",
      startPlan: "Karoora Jalqabi",
      continuePlan: "Itti Fufi",
      nextReading: "Dubbisa Itti Aanu",
      completed: "Xumurameera",
      day: "Guyyaa",
      markComplete: "Akka xumurame mallatteessi",
      percentComplete: "Hammam xumurame",
    },

    highlights: {
      title: "Mallattoolee Koo",
      noHighlights: "Ammaaf mallattoon hin jiru.",
      color: "Halluu",
      recent: "Kan Dhihoo",
      clearFilter: "Callee qulqulleessi",
    },

    quiz: {
      title: "Qormaata Macaafa Qulqulluu",
      start: "Qormaata Jalqabi",
      score: "Bu'aa",
      correct: "Sirrii",
      wrong: "Dogoggora",
      retry: "Irra deebi'i",
      leaderboard: "Tarree Dorgommii",
      level: "Sadarkaa",
      points: "Qabxii",
      streak: "Walitti aansuu",
    },

    share: {
      title: "Lakkoofsa Qoodi",
      copy: "Lakkoofsa kopi godhi",
      image: "Suuraa Uumi",
      shareNow: "Amma Qoodi",
      copied: "Lakkoofsi kopi godhameera.",
      imageReady: "Suuraan qophaa'eera.",
      failed: "Dalagaan hin milkoofne.",
    },

    audio: {
      title: "Macaafa Qulqulluu Sagalee",
      download: "Boqonnaa Buufadhu",
      notDownloaded: "Hin buufamne",
      downloaded: "Buufameera",
      downloading: "Buufamaa jira...",
      playOffline: "Offline irraa taphadhu",
      offlineReady: "Offline irratti qophaa'eera.",
    },

    notifications: {
      title: "Beeksisa",
      enable: "Yaadachiisa Lakkoofsa Guyyaa eeyyami",
      time: "Yeroo Yaadachiisaa",
      test: "Beeksisa Qorannoo Ergi",
      disabled: "Beeksisni cufameera",
      enabled: "Beeksisni banuun jira",
    },

    ai: {
      prayerCoach: "Gorsa Kadhannaa",
      suggestion: "Yaada Kadhannaa",
      generate: "Irra deebi'ii uumi",
      saveToJournal: "Galmee keessatti kuusi",
      useThis: "Yaada kana fayyadami",
      disclaimer:
        "Meeshaan kun gargaaruuf qofa. Macaafa Qulqulluu, kadhannaa, gorsa tajaajilaa, yookaan waldaa bakka hin bu'u.",
    },

    bibleTranslations: {
      kjv: "Hiikkaa King James",
      niv: "Hiikkaa New International",
      esv: "Hiikkaa English Standard",
      nasb: "Hiikkaa New American Standard",
      nlt: "Hiikkaa New Living",
      web: "Hiikkaa World English",
      amhaafo: "Macaafa Qulqulluu Afaan Oromoo",
    },

    languageSelector: {
      label: "Afaan",
    },

    communityPrayerBoard: {
      title: "Gabatee Kadhannaa",
      subtitle: "Kadhannaadhaan wal jajjabeessaa",
      request: "Gaaffii",
      requestButton: "Gaaffii",
      emptyState: {
        title: "Ammaaf gaaffiin kadhannaa hin jiru",
        subtitle: "Ati jalqaba fedhii kee qoodi",
      },
      emptyTitle: "Ammaaf gaaffiin kadhannaa hin jiru",
      emptySubtitle: "Ati jalqaba fedhii kee qoodi",
      filterActive: "Hojjachaa jiru",
      filterAnswered: "Deebii argame",
      prayerAnswered: "Kadhannaan Deebi'e",
      prayedCount: "kadhatan",
      prayingFor: "kadhachaa jiru",
      filterByCategory: "Mala Garaagaraatiin Callessutu",
      searchPlaceholder: "Gaaffii kadhannaa barbaadi...",
      prayerRequests: "Gaaffii Kadhannaa",
      markAnswered: "Akka deebii argateetti mallatteessi",
      beFirst: "Jajjabeessaa ta'i jalqaba",
      postAnonymously: "Maqaa malee galmaa'i",
      posting: "Galmeessaa jira...",
      postButton: "Gaaffii Galmaa'i",
      shareRequest: "Gaaffii Kadhannaa Qoodi",
      titlePlaceholder: "Maal irratti kadhataa jirta?",
      bodyPlaceholder: "Gaaffii kee bal'inaan ibsi...",
      addEncouragement: "Jajjabeessaa barreessi...",
      replyPlaceholder: "{name} deebisaa...",
      replyingTo: "Deebisaa jira",
      sendEncouragement: "Jajjabeessaa ergi",
      spiritualEncouragement: "Jajjabeessaa Hafuuraa",
      sendWordOfEncouragement: "Jajjabeessaa ergi",
      typeMessage: "Ergaa barreessi...",
      historyTitle: "Seenaa Kadhannaa Koo",
      historyEmpty: "Kadhannaan ammaaf galmaa'ame hin jiru",
      toastPrayed: "Kadhannaan galmaa'e 🙏",
      toastAnswered: "Deebii argateetti mallataa'e! 🎉",
      toastPosted: "Gaaffiin kadhannaa galmaa'e 🙏",
      toastSaved: "Maktabaa kee keessatti kuufame",
      toastUnsaved: "Kuufamaa keessaa baqe",
      toastMessageSent: "Ergaan erggame",
      toastEncouragementSent: "Jajjabeessaan erggame 🙏",
      toastSignInRequired: "Kadhaachuuf seeni",
      toastFillFields: "Maaloo mata duree fi kadhannaa guuti",
      toastFailPost: "Galmaa'uu hin dandeenye. Irra deebi'i yaali.",
      toastFailUpdate: "Haaromsuun hin milkoofne. Irra deebi'i yaali.",
      categories: {
        all: "Hunda",
        health: "Fayyaa",
        family: "Maatii",
        faith: "Amantii",
        work: "Hojii",
        relationships: "Hariiroo",
        gratitude: "Galata",
        other: "Kan Biraa",
      },
    },
  },

  am: {
    common: {
      appName: "FaithLight",
      read: "አንብብ",
      listen: "አዳምጥ",
      share: "አጋራ",
      save: "አስቀምጥ",
      cancel: "ሰርዝ",
      delete: "አጥፋ",
      edit: "አርትዕ",
      update: "አዘምን",
      continue: "ቀጥል",
      close: "ዝጋ",
      search: "ፈልግ",
      next: "ቀጣይ",
      previous: "ቀዳሚ",
      loading: "በመጫን ላይ...",
      download: "አውርድ",
      downloaded: "ወርዷል",
      downloading: "በማውረድ ላይ...",
      offlineMode: "ከመስመር ውጭ ሁኔታ",
      language: "ቋንቋ",
      chooseLanguage: "ቋንቋ ምረጥ",
      selectLanguage: "ቋንቋ ይምረጡ",
      reply: "ምላሽ",
      send: "ላክ",
      bookmark: "ዕልባት",
      hide: "ደብቅ",
      show: "አሳይ",
    },

    nav: {
      home: "መነሻ",
      bible: "መጽሐፍ ቅዱስ",
      audio: "የድምፅ መጽሐፍ ቅዱስ",
      plans: "የንባብ ዕቅዶች",
      journal: "የጸሎት ማስታወሻ",
      highlights: "የእኔ ማስመረቂያዎች",
      quiz: "ጥያቄ",
      notifications: "ማሳወቂያዎች",
      settings: "ቅንብሮች",
      about: "ስለ መተግበሪያው",
    },

    about: {
      title: "ስለ FaithLight",
      subtitle: "ለዓለም አቀፍ ማህበረሰብ በመጽሐፍ ቅዱስ ላይ የተመሰረተ ትምህርት።",
      missionTitle: "ተልእኳችን",
      missionBody:
        "FaithLight አማኞች መጽሐፍ ቅዱስን በግልጽ እንዲረዱ፣ በእምነታቸው እንዲጸኑ፣ እና በእምነት እንዲማሩ ይረዳል።",
      featuresTitle: "ማድረግ የምትችሉት",
      featuresBody:
        "መጽሐፍ ቅዱስን ማንበብ፣ የድምፅ መጽሐፍ ቅዱስን ማዳመጥ፣ የንባብ ዕቅዶችን መከታተል፣ የጸሎት ማስታወሻ መያዝ፣ ቁጥሮችን ማስመረቅ፣ ጥያቄዎችን መፍታት እና በጥልቀት መንበርከክ።",
      aiPromiseTitle: "ኃላፊነት ያለው የAI ቃል ኪዳን",
      aiPromiseBody:
        "የእኛ AI መሣሪያዎች የመጽሐፍ ቅዱስ ጥናትን እና መንፈሳዊ እንቅስቃሴን ለመደገፍ ተዘጋጅተዋል። ጸሎትን፣ እረኝነትን፣ ቤተ ክርስቲያንን ወይም መጽሐፍ ቅዱስን አይተካም።",
    },

    bible: {
      oldTestament: "ብሉይ ኪዳን",
      newTestament: "አዲስ ኪዳን",
      chapter: "ምዕራፍ",
      verse: "ቁጥር",
      selectVerse: "ቁጥር ይምረጡ",
      shareVerse: "ቁጥሩን አጋሩ",
      highlight: "አስመርቅ",
      addJournal: "የጸሎት ማስታወሻ ጨምር",
      takeQuiz: "ጥያቄ ፍታ",
    },

    journal: {
      title: "የጸሎት ማስታወሻ",
      overview: "የማስታወሻ አጠቃላይ እይታ",
      addEntry: "ማስታወሻ ጨምር",
      editEntry: "ማስታወሻ አርትዕ",
      deleteEntry: "ማስታወሻ አጥፋ",
      notePlaceholder: "ጸሎትህን፣ ሐሳብህን ወይም እይታህን ጻፍ...",
      noEntries: "እስካሁን ምንም ማስታወሻ የለም።",
      mood: "ስሜት",
      tags: "መለያዎች",
      linkedVerse: "የተገናኘ ቁጥር",
      private: "የግል",
    },

    plans: {
      title: "የንባብ ዕቅዶች",
      startPlan: "ዕቅድ ጀምር",
      continuePlan: "ቀጥል",
      nextReading: "ቀጣዩ ንባብ",
      completed: "ተጠናቋል",
      day: "ቀን",
      markComplete: "እንደተጠናቀቀ አመልክት",
      percentComplete: "የተጠናቀቀው መጠን",
    },

    highlights: {
      title: "የእኔ ማስመረቂያዎች",
      noHighlights: "እስካሁን ማስመረቂያ የለም።",
      color: "ቀለም",
      recent: "ቅርብ ጊዜ",
      clearFilter: "ማጣሪያ አጥፋ",
    },

    quiz: {
      title: "የመጽሐፍ ቅዱስ ጥያቄ",
      start: "ጥያቄ ጀምር",
      score: "ውጤት",
      correct: "ትክክል",
      wrong: "ስህተት",
      retry: "እንደገና ሞክር",
      leaderboard: "መሪ ሰሌዳ",
      level: "ደረጃ",
      points: "ነጥብ",
      streak: "ተከታታይ ስኬት",
    },

    share: {
      title: "ቁጥር አጋራ",
      copy: "ቁጥሩን ቅዳ",
      image: "ምስል ፍጠር",
      shareNow: "አሁን አጋራ",
      copied: "ቁጥሩ ተቀድቷል።",
      imageReady: "ምስሉ ተዘጋጅቷል።",
      failed: "እርምጃው አልተሳካም።",
    },

    audio: {
      title: "የድምፅ መጽሐፍ ቅዱስ",
      download: "ምዕራፍ አውርድ",
      notDownloaded: "አልወረደም",
      downloaded: "ወርዷል",
      downloading: "በማውረድ ላይ...",
      playOffline: "ከመስመር ውጭ አጫውት",
      offlineReady: "ለከመስመር ውጭ አጠቃቀም ዝግጁ ነው።",
    },

    notifications: {
      title: "ማሳወቂያዎች",
      enable: "የዕለቱን ቁጥር ማሳሰቢያ አንቃ",
      time: "የማሳሰቢያ ሰዓት",
      test: "የሙከራ ማሳወቂያ ላክ",
      disabled: "ማሳወቂያዎች ተሰናክለዋል",
      enabled: "ማሳወቂያዎች ነቅተዋል",
    },

    ai: {
      prayerCoach: "የጸሎት አማካሪ",
      suggestion: "የጸሎት ጥቆማ",
      generate: "እንደገና ፍጠር",
      saveToJournal: "ወደ ማስታወሻ አስቀምጥ",
      useThis: "ይህን የጸሎት ነጥብ ተጠቀም",
      disclaimer:
        "ይህ መሣሪያ ለእገዛ እና ለመንፈሳዊ እንቅስቃሴ ብቻ ነው። መጽሐፍ ቅዱስን፣ ጸሎትን፣ እረኝነትን ወይም ቤተ ክርስቲያንን አይተካም።",
    },

    bibleTranslations: {
      kjv: "ኪንግ ጄምስ ትርጉም",
      niv: "አዲስ ዓለም አቀፍ ትርጉም",
      esv: "እንግሊዝኛ መደበኛ ትርጉም",
      nasb: "አዲስ አሜሪካ መደበኛ መጽሐፍ ቅዱስ",
      nlt: "አዲስ ሕይወት ትርጉም",
      web: "የዓለም እንግሊዝኛ መጽሐፍ ቅዱስ",
      amharic: "የአማርኛ መጽሐፍ ቅዱስ",
    },

    languageSelector: {
      label: "ቋንቋ",
    },

    communityPrayerBoard: {
      title: "የጸሎት ሰሌዳ",
      subtitle: "በጸሎት እርስ በርሳችሁ ደግፉ",
      request: "ጥያቄ",
      requestButton: "ጥያቄ",
      emptyState: {
        title: "እስካሁን ምንም የጸሎት ጥያቄ የለም",
        subtitle: "የመጀመሪያ ሆነህ ፍላጎትህን አጋራ",
      },
      emptyTitle: "እስካሁን ምንም የጸሎት ጥያቄ የለም",
      emptySubtitle: "የመጀመሪያ ሆነህ ፍላጎትህን አጋራ",
      filterActive: "ንቁ",
      filterAnswered: "ተመልሷል",
      prayerAnswered: "ጸሎት ተሰምቷል",
      prayedCount: "ጸለዩ",
      prayingFor: "እየጸለዩ",
      filterByCategory: "በምድብ ማጣሪያ",
      searchPlaceholder: "የጸሎት ጥያቄዎችን ፈልግ...",
      prayerRequests: "የጸሎት ጥያቄዎች",
      markAnswered: "እንደተሰማ አመልክት",
      beFirst: "የመጀመሪያ ሁን",
      postAnonymously: "ሳይታወቅ ለጥፍ",
      posting: "በመለጠፍ ላይ...",
      postButton: "ጥያቄ ለጥፍ",
      shareRequest: "የጸሎት ጥያቄ አጋራ",
      titlePlaceholder: "ስለ ምን እየጸለዩ ነው?",
      bodyPlaceholder: "ጥያቄህን በዝርዝር አጋራ...",
      addEncouragement: "ማበረታቻ ጻፍ...",
      replyPlaceholder: "{name} እየመለሱ ነው...",
      replyingTo: "እየመለሱ ነው",
      sendEncouragement: "ማበረታቻ ላክ",
      spiritualEncouragement: "መንፈሳዊ ማበረታቻ",
      sendWordOfEncouragement: "የማበረታቻ ቃል ላክ",
      typeMessage: "መልእክት ጻፍ...",
      historyTitle: "የጸሎቴ ታሪክ",
      historyEmpty: "እስካሁን ምንም ጸሎት አልተመዘገበም",
      toastPrayed: "ጸሎት ተመዝግቧል 🙏",
      toastAnswered: "እንደተሰማ ተምልክቷል! 🎉",
      toastPosted: "የጸሎት ጥያቄ ተለጥፏል 🙏",
      toastSaved: "ወደ ቤተ-መጽሐፍት ተቀምጧል",
      toastUnsaved: "ከተቀመጠ ተወግዷል",
      toastMessageSent: "መልእክት ተልኳል",
      toastEncouragementSent: "ማበረታቻ ተልኳል 🙏",
      toastSignInRequired: "ለጸሎት እባክዎ ይግቡ",
      toastFillFields: "እባክዎ ርዕስ እና ጸሎት ይሙሉ",
      toastFailPost: "መለጠፍ አልተቻለም። እንደገና ይሞክሩ።",
      toastFailUpdate: "ማዘመን አልተቻለም። እንደገና ይሞክሩ።",
      categories: {
        all: "ሁሉም",
        health: "ጤና",
        family: "ቤተሰብ",
        faith: "እምነት",
        work: "ሥራ",
        relationships: "ግንኙነቶች",
        gratitude: "ምስጋና",
        other: "ሌላ",
      },
    },
  },

  ar: {
    common: {
      appName: "FaithLight",
      read: "اقرأ",
      listen: "استمع",
      share: "شارك",
      save: "احفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      update: "تحديث",
      continue: "متابعة",
      close: "إغلاق",
      search: "بحث",
      next: "التالي",
      previous: "السابق",
      loading: "جارٍ التحميل...",
      download: "تنزيل",
      downloaded: "تم التنزيل",
      downloading: "جارٍ التنزيل...",
      offlineMode: "الوضع دون اتصال",
      language: "اللغة",
      chooseLanguage: "اختر اللغة",
      selectLanguage: "اختر لغة",
      reply: "رد",
      send: "إرسال",
      bookmark: "إشارة مرجعية",
      hide: "إخفاء",
      show: "إظهار",
    },
  },
};

export function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function t(language, path) {
  return (
    getNestedValue(translations[language], path) ??
    getNestedValue(translations.en, path) ??
    path
  );
}

export function getLanguageDirection(language) {
  return LANGUAGE_META[language]?.dir || "ltr";
}

export function normalizeLanguage(lang) {
  if (!lang) return "en";
  const lower = lang.toLowerCase();

  if (lower.startsWith("om")) return "om";
  if (lower.startsWith("am")) return "am";
  if (lower.startsWith("ar")) return "ar";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("sw")) return "sw";
  if (lower.startsWith("ti")) return "ti";
  if (lower.startsWith("en")) return "en";

  return "en";
}

export async function detectInitialLanguage() {
  // Check both storage keys — Settings page uses 'app_language', home uses 'faithlight_language'
  const saved = localStorage.getItem("faithlight_language") || localStorage.getItem("app_language");
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;

  const browserLang = normalizeLanguage(navigator.language || "en");
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : "en";
}