/**
 * FaithLight Translation Audit Test
 * Run this before launch to catch mixed-language pages
 * 
 * Copy & paste in browser DevTools console:
 * runTranslationAudit()
 */

const FORBIDDEN_ENGLISH = [
  "Home",
  "Read Bible",
  "Save",
  "Settings",
  "Daily Journal",
  "Generate",
  "Search",
  "Verse of the Day",
  "Try Again",
  "Loading",
  "Bible",
  "Journal",
  "Quiz",
  "Prayer",
  "Submit",
];

window.runTranslationAudit = function() {
  console.log("🧪 Translation Audit Started\n");

  const pages = [
    { name: "Home", path: "/" },
    { name: "Bible Reader", path: "/BibleReader" },
    { name: "AI Guide", path: "/AIBibleGuide" },
    { name: "AI Study", path: "/AIEnhancedBibleStudy" },
    { name: "Quiz", path: "/DailyBibleQuiz" },
    { name: "Journal", path: "/MyJournal" },
    { name: "Settings", path: "/UserSettings" },
  ];

  const violations = [];
  const bodyText = document.body.innerText;

  console.log(`📄 Scanning current page for mixed languages...\n`);
  console.log(`Language: ${window.currentLanguage || 'unknown'}\n`);

  for (const word of FORBIDDEN_ENGLISH) {
    if (bodyText.includes(word)) {
      violations.push(word);
    }
  }

  if (violations.length === 0) {
    console.log("✅ PASS - No English UI labels found");
    return { status: "pass", violations: [] };
  } else {
    console.log(`❌ FAIL - Found ${violations.length} English words:\n`);
    violations.forEach((w) => console.log(`  - "${w}"`));
    return { status: "fail", violations, count: violations.length };
  }
};

window.quickTranslationCheck = function(language) {
  console.log(`\n🌍 Quick check for ${language}:\n`);
  console.log("Instructions:");
  console.log("1. Switch app to: " + (language === "om" ? "Afaan Oromoo" : "Amharic"));
  console.log("2. Open each page");
  console.log("3. Run: runTranslationAudit()");
  console.log("4. If anything shows ❌ FAIL, those pages have mixed languages\n");
};