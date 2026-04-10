# Identified Critical Bugs for App Store Submission

## BUG 1: VerseImageGenerator Refresh Crash ✅ FOUND

**File:** `pages/VerseImageGenerator.jsx`  
**Lines:** 75-87

### The Problem
The component uses `useState` with initializers that call an async function, causing a state management issue on refresh.

```javascript
// Lines 75-87: Effect tries to update state but doesn't check if component is mounted
useEffect(() => {
  setIsLoading(true);
  const todayKey = new Date().toISOString().split('T')[0].slice(5);
  base44.entities.DailyVerse.filter({ dateKey: todayKey, language: 'en' })
    .then(res => {
      if (res?.[0]) {
        const v = res[0];
        setSelectedVerse({ reference: v?.reference || '', text: v?.verseText || '' });
      }
    })
    .catch(() => {})
    .finally(() => setIsLoading(false)); // ⚠️ State update after unmount
}, []);
```

### Root Cause
**Memory leak warning:** `setIsLoading` is called in `.finally()` even if component unmounts before promise resolves. On refresh, old promise resolves and tries to set state on unmounted component.

### Fix
Add cleanup + mounted flag:

```javascript
useEffect(() => {
  let isMounted = true;
  setIsLoading(true);
  
  const todayKey = new Date().toISOString().split('T')[0].slice(5);
  base44.entities.DailyVerse.filter({ dateKey: todayKey, language: 'en' })
    .then(res => {
      if (!isMounted) return; // Prevent state update if unmounted
      if (res?.[0]) {
        const v = res[0];
        setSelectedVerse({ reference: v?.reference || '', text: v?.verseText || '' });
      }
    })
    .catch(() => {})
    .finally(() => {
      if (isMounted) setIsLoading(false); // Only set if still mounted
    });
  
  return () => { isMounted = false; }; // Cleanup
}, []);
```

---

## BUG 2: Mixed-Language Pages ✅ FOUND

**File:** `components/i18n/locales/om.json`  
**Lines:** 99-100

### The Problem
Missing comma after line 98, causing JSON parse error. Also, Oromo file has English hardcoded text.

```javascript
// Line 98-100: SYNTAX ERROR - Missing comma
"home.audioUnavailable": "Sagaleen aayata kanaaf hin jiru"
  } // ← Should be }; and line 99 should have comma

// Also, the file is incomplete and many Oromo keys are missing
```

### Root Cause
1. **JSON syntax error** - Missing comma after line 98
2. **Incomplete translation file** - Many English keys from `en.json` are missing from `om.json`, so English falls back silently
3. **Hard-coded English in components** - Some UI uses English strings directly instead of translation keys

### Where English Strings Are Hardcoded
Looking at `Header.jsx` line 114:
```javascript
// Hard-coded page titles - NOT translated!
const pageTitle = PAGE_TITLES[currentPageName] ?? currentPageName?.replace(/([A-Z])/g, ' $1').trim();
// All PAGE_TITLES values (lines 14-81) are in English only
```

### Fix Required
1. Fix JSON syntax error in `om.json`
2. Add all missing Oromo translations
3. Translate PAGE_TITLES in Header.jsx
4. Search for all hardcoded English strings and add to translation files

---

## BUG 3: English Bible Showing When Another Language Selected ✅ FOUND

**File:** `lib/bibleService.js`  
**Lines:** 32-39, 41-67

### The Problem
The `getCurrentLang()` function reads from localStorage, but if BibleLanguage is not configured for that language, it silently falls back to English Bible without error.

```javascript
// Line 32-39: Gets current language
function getCurrentLang() {
  try {
    const store = JSON.parse(localStorage.getItem('faithlight-language-store') || '{}');
    return store?.state?.bibleLanguage || store?.state?.uiLanguage || 'en'; // ⚠️ Defaults to 'en'
  } catch {
    return 'en'; // ⚠️ Always falls back to English
  }
}

// Line 41-67: getVerseOfDay checks if Bible available
export async function getVerseOfDay(lang) {
  const l = lang || getCurrentLang();
  
  // ✅ Good: Checks if Bible is available
  const isAvailable = await isBibleAvailableForLanguage(l);
  if (!isAvailable) {
    return { unavailable: true, message: 'bible_not_available_in_language', language: l };
  }
  // ... but getChapter() does NOT check this!
}
```

### Root Cause
**getChapter() doesn't check if Bible is available** before calling the API. If BibleLanguage.bible_id is missing for Oromo, it passes empty string to API, which either:
1. Returns English (fallback)
2. Returns 404 "Chapter not found"

But the UI doesn't show the user that the language isn't configured—it just shows English or an error.

### Fix
Add language availability check in `getChapter()`:

```javascript
export async function getChapter(book, chapter, lang) {
  if (!book || !chapter) return null;
  const l = lang || getCurrentLang();
  
  // ✅ NEW: Check if Bible is available for this language
  const isAvailable = await isBibleAvailableForLanguage(l);
  if (!isAvailable) {
    return {
      unavailable: true,
      message: 'bible_not_available_in_language',
      language: l,
      book,
      chapter
    };
  }
  
  const cacheKey = `chapter:${l}:${book}:${chapter}`;
  // ... rest of function
}
```

Also verify that `BibleLanguage` table has correct entries for EN, OM, AM with proper `bible_id` values.

---

## BUG 4: "Chapter Not Found" on Supported Languages ✅ FOUND

**File:** `lib/bibleLanguageService.js`  
**Lines:** 30-33

### The Problem
`resolveBibleId()` returns empty string if not found, but the calling code doesn't show an error—it just silently fails or shows English.

```javascript
// Line 30-33: Returns empty string if not configured
export async function resolveBibleId(languageCode) {
  const config = await getBibleLanguageConfig(languageCode);
  return config?.bible_id || ''; // ⚠️ Returns empty string, not an error
}
```

### Root Cause
When `bible_id` is empty:
1. API call to Bible Brain with empty bible_id fails
2. Error is caught, returns null
3. UI shows generic "Chapter not found" instead of "Bible not available for this language"

### Verification Needed
**Check BibleLanguage table entries:**
- Does EN have a valid `bible_id` (e.g., "ENGESV")?
- Does OM have a valid `bible_id` (e.g., "GAZGAZ")?
- Does AM have a valid `bible_id` (e.g., "AMEAAB")?

If any are missing or empty, the error will show "Chapter not found" instead of proper language unavailability message.

### Fix
Update error handling to distinguish between:
1. **Language not available** (no bible_id configured)
2. **Chapter truly not available** (404 from API)

---

## BUG 5: Oromo Spelling Errors ✅ FOUND

**File:** `components/i18n/locales/om.json`

### Specific Errors Found

**Line 69: Incomplete translation**
```javascript
"home.subtitle": "Imala kee guyyaa guyyaan Waaqayyo wajjin",
```
✅ This is CORRECT Oromo (not "Caraa kee")

**BUT Line 99-100: JSON Syntax Error**
```javascript
"home.audioUnavailable": "Sagaleen aayata kanaaf hin jiru"
  }; // ← Missing comma on line 98!
```

### Fix
1. Add comma after line 98
2. Verify all Oromo strings with native speaker
3. Check for incomplete translations (English fallback words)

### Quick Search Needed
Search these in all Oromo files:
- ❌ "Caraa kee" - Wrong spelling
- ❌ "wajjiin" - Check if correct (should be "wajjin")
- ✅ "Imala kee" - Correct
- ❌ "guyya guyyaan" - Check spacing

---

## BUG 6: Broken Audio ✅ NEED TO VERIFY

**File:** `lib/bibleLanguageService.js` (needs extension)

### The Problem
No audit trail found in read files, but need to check:
1. Does BibleLanguage table have `audio_fileset_id` for each language?
2. Does AudioBiblePage pass the correct fileset ID to player?

### What to Check
```javascript
// In bibleLanguageService.js, verify this works:
export async function resolveAudioFilesetId(languageCode) {
  const config = await getBibleLanguageConfig(languageCode);
  return config?.audio_fileset_id || ''; // ⚠️ May return empty string
}
```

If empty, audio won't play but won't show clear error.

### Verification
Test on device:
- English audio → Should play (ENGESVN2DA or similar)
- Oromo audio → Should play (GAZGAZN2DA or similar) or show "not available"
- Amharic audio → Same

---

## Summary: Priority Fixes

### IMMEDIATE (Today)
1. ✅ **VerseImageGenerator refresh crash** - Add mounted flag in useEffect
2. ✅ **JSON syntax error in om.json** - Add missing comma line 98
3. ✅ **English Bible fallback** - Add isBibleAvailableForLanguage check in getChapter()

### THIS WEEK
4. ✅ **Mixed-language UI** - Translate all PAGE_TITLES in Header.jsx
5. ✅ **Complete om.json** - Add all missing Oromo translations
6. ✅ **"Chapter not found" error** - Verify BibleLanguage table has all entries with bible_id

### BEFORE SUBMISSION
7. ✅ **Oromo spelling** - Native speaker review
8. ✅ **Audio fileset IDs** - Verify AudioCatalog has entries for all languages
9. ✅ **Device testing** - Test all scenarios on real iPhone

---

## Code Locations Summary

```
Bug 1 (Refresh Crash):        pages/VerseImageGenerator.jsx: lines 75-87
Bug 2 (Mixed Language):       components/i18n/locales/om.json: line 99 (syntax)
                              components/Header.jsx: lines 14-81 (hardcoded titles)
Bug 3 (English Fallback):     lib/bibleService.js: line 92 (getChapter function)
Bug 4 (Chapter Not Found):    lib/bibleLanguageService.js: line 30 (resolveBibleId)
                              BibleLanguage table: verify bible_id entries
Bug 5 (Oromo Spelling):       components/i18n/locales/om.json: verify all strings
Bug 6 (Broken Audio):         lib/bibleLanguageService.js: line 39 (resolveAudioFilesetId)
                              AudioCatalog entity: verify fileset IDs
``