/**
 * Translation Audit Test - Run this before launch
 * Catches mixed-language pages (English UI in Oromo/Amharic mode)
 * 
 * Usage:
 * 1. Terminal: npx playwright test translationAudit.js
 * 2. Or: import & run manually in browser console
 */

// List of common English UI words that should NOT appear in Oromo/Amharic pages
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
  "Cancel",
  "Back",
  "Next",
  "Previous",
  "Download",
  "Share",
  "Copy",
  "Delete",
  "Edit",
  "Create",
  "New Entry",
  "My Profile",
  "Logout",
  "Login",
  "About",
  "Help",
  "Contact",
];

/**
 * Simple browser-based test (no Playwright needed)
 * Run in DevTools console
 */
export function runTranslationAudit() {
  console.log("🧪 Starting Translation Audit...\n");

  const pages = [
    { name: "Home", path: "/" },
    { name: "Bible Reader", path: "/BibleReader" },
    { name: "AI Guide", path: "/AIBibleGuide" },
    { name: "AI Companion", path: "/AIBibleCompanion" },
    { name: "AI Study", path: "/AIEnhancedBibleStudy" },
    { name: "Quiz", path: "/DailyBibleQuiz" },
    { name: "Journal", path: "/MyJournal" },
    { name: "Settings", path: "/UserSettings" },
  ];

  const languages = ["om", "am"];
  const results = [];

  // For browser testing
  async function testPageLanguage(pageUrl, lang, pageName) {
    try {
      // Simulated: in real test, navigate to pageUrl
      const bodyText = document.body.innerText || "";
      const violations = [];

      // Check for forbidden English words
      for (const word of FORBIDDEN_ENGLISH) {
        if (bodyText.includes(word)) {
          violations.push(word);
        }
      }

      return {
        page: pageName,
        language: lang,
        url: pageUrl,
        violations,
        passed: violations.length === 0,
      };
    } catch (err) {
      return {
        page: pageName,
        language: lang,
        url: pageUrl,
        error: err.message,
        passed: false,
      };
    }
  }

  // Print results summary
  function printResults(testResults) {
    console.log("\n📊 TRANSLATION AUDIT RESULTS\n");
    console.log("=".repeat(60));

    let passCount = 0;
    let failCount = 0;
    const failures = [];

    testResults.forEach((result) => {
      if (result.passed) {
        console.log(`✅ ${result.page} (${result.language.toUpperCase()})`);
        passCount++;
      } else {
        console.log(
          `❌ ${result.page} (${result.language.toUpperCase()}) - ${result.violations?.length || 1} issues`
        );
        failCount++;
        failures.push(result);
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log(`\n📈 Summary: ${passCount} ✅ passed, ${failCount} ❌ failed\n`);

    if (failures.length > 0) {
      console.log("⚠️  FAILURES TO FIX:\n");
      failures.forEach((f) => {
        console.log(`📄 ${f.page} (${f.language}):`);
        if (f.violations?.length > 0) {
          console.log(
            `   Found English: ${f.violations.slice(0, 3).join(", ")}...`
          );
        }
        if (f.error) {
          console.log(`   Error: ${f.error}`);
        }
      });
    } else {
      console.log("🎉 ALL TESTS PASSED! No mixed-language pages found.\n");
    }
  }

  return {
    pages,
    languages,
    forbiddenWords: FORBIDDEN_ENGLISH,
    testPageLanguage,
    printResults,
  };
}

/**
 * Browser console helper - copy & paste this:
 * 
 * const audit = runTranslationAudit();
 * // Then for each page:
 * const result = await audit.testPageLanguage("/path", "om", "Page Name");
 * console.log(result);
 */

/**
 * Deno backend version for automated testing
 * Use with Playwright or Puppeteer
 */
export const playwrightTest = `
import { test, expect } from "@playwright/test";

const pages = [
  { name: "Home", url: "/" },
  { name: "Bible Reader", url: "/BibleReader" },
  { name: "AI Guide", url: "/AIBibleGuide" },
  { name: "Quiz", url: "/DailyBibleQuiz" },
  { name: "Journal", url: "/MyJournal" },
];

const forbiddenEnglish = [
  "Home", "Read Bible", "Save", "Settings", "Daily Journal",
  "Generate", "Search", "Verse of the Day", "Try Again", "Loading"
];

test("Afaan Oromoo - No English UI labels visible", async ({ page }) => {
  for (const p of pages) {
    await page.goto(p.url);
    
    // Switch to Oromo (adjust selector to match your app)
    await page.click('[data-testid="language-switcher"]');
    await page.click('[data-lang="om"]');
    
    // Wait for page to update
    await page.waitForLoadState("networkidle");
    
    const bodyText = await page.locator("body").innerText();
    
    for (const word of forbiddenEnglish) {
      expect(bodyText, \`Page '\${p.name}' in Oromo should not contain: \${word}\`).not.toContain(word);
    }
  }
});

test("Amharic - No English UI labels visible", async ({ page }) => {
  for (const p of pages) {
    await page.goto(p.url);
    
    // Switch to Amharic
    await page.click('[data-testid="language-switcher"]');
    await page.click('[data-lang="am"]');
    
    await page.waitForLoadState("networkidle");
    
    const bodyText = await page.locator("body").innerText();
    
    for (const word of forbiddenEnglish) {
      expect(bodyText, \`Page '\${p.name}' in Amharic should not contain: \${word}\`).not.toContain(word);
    }
  }
});
`;