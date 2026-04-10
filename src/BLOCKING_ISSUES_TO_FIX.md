# Critical Blocking Issues for App Store Submission

**This file maps each blocker to specific code files and fixes needed.**

---

## BLOCKER 1: VerseImageGenerator Refresh Crash ⚠️ CRITICAL

### File: `pages/VerseImageGenerator.jsx`

### The Problem
When user refreshes the VerseImageGenerator page, app crashes.

### Root Causes (Likely)
1. State not properly reset on page reload
2. Image canvas element reference lost
3. Event listeners not cleaned up
4. API call triggered before component mounted

### Code to Audit
```javascript
// In VerseImageGenerator.jsx, look for:

1. useState hooks — are they initialized properly?
2. useEffect cleanup — does it remove listeners?
3. Canvas refs — are they safely accessed?
4. API calls — are they guarded with mounted checks?
```

### Fix Steps
1. Add effect cleanup
2. Validate refs before use
3. Prevent API calls if unmounted
4. Test refresh 10 times on device

### Verification
```
✅ Open VerseImageGenerator
✅ Create/view image
✅ Refresh page (cmd+R)
✅ No crash
✅ Image still visible
✅ Can create new image
```

---

## BLOCKER 2: Mixed-Language Pages ⚠️ CRITICAL

### Files Affected
- `pages/Home.jsx` (or Home page)
- `pages/BibleReaderPage.jsx`
- `pages/AudioBiblePage.jsx`
- `pages/BibleSearchPage.jsx`
- `components/Header.jsx`
- `components/BottomTabs.jsx`
- Any page with hardcoded English text

### The Problem
User selects Oromo, but some UI labels stay in English.  
Example: Button says "Share" (English) while everything else is Oromo.

### Root Causes
1. Hardcoded English strings in components
2. Missing i18n wrapper on some elements
3. Labels loaded from wrong translation file
4. Partially translated pages

### How to Find Them

**Search codebase for hardcoded strings:**
```bash
# Find English labels that should be translated
grep -r "Share\|Back\|Search\|Save\|Cancel\|Delete" src/pages/ src/components/
```

**Look for missing i18n usage:**
```javascript
// BAD - hardcoded English:
<button>Share Verse</button>

// GOOD - uses translation:
<button>{t('shareVerse')}</button>
```

### Fix Strategy

1. **Audit each page:**
   ```
   Home.jsx → Search for hardcoded text → Replace with t('key')
   Reader.jsx → Same
   Audio.jsx → Same
   Search.jsx → Same
   Prayers.jsx → Same
   ```

2. **Ensure all i18n files have translations:**
   - `components/i18n/locales/en.json`
   - `components/i18n/locales/om.json`
   - `components/i18n/locales/am.json`

3. **Test each page:**
   ```
   Set language to Oromo
   Open each page
   Look for ANY English text
   If found: Add to translation file + use t('key')
   ```

### Verification Script
```
Language: Oromo

✅ Home page: All Oromo
✅ Reader: All Oromo (title, buttons, labels)
✅ Audio: All Oromo
✅ Search: All Oromo
✅ My Prayers: All Oromo
✅ Settings: All Oromo
✅ Bottom tabs: All Oromo (labels must be translated)

Same for Amharic.
```

---

## BLOCKER 3: English Bible Shows When Another Language Selected ⚠️ CRITICAL

### Files Affected
- `pages/BibleReaderPage.jsx`
- `lib/bibleService.js`
- `services/bibleService.js`
- `functions/bibleBrainChapter.js` (backend)

### The Problem
User selects Oromo in language settings.  
User opens Bible Reader.  
Chapter loads, but text is in English instead of Oromo.

### Root Causes (Likely)
1. Language parameter not passed to Bible API correctly
2. Fallback to English triggered incorrectly
3. Bible API call using wrong language code
4. Cached English content not cleared on language switch
5. Bible data not configured for that language

### How to Debug

**Step 1: Check language code**
```javascript
// In BibleReaderPage.jsx, verify:
const language = useLanguageStore(state => state.language); // Should be 'om' for Oromo
console.log('Selected language:', language);

// Then when fetching Bible:
const chapter = await fetchChapter(language, bookId, chapterNum);
// Verify 'om' is being sent to API
```

**Step 2: Check Bible API call**
```javascript
// In bibleBrainChapter.js or bibleBrainAPI function:
// Should send correct language code to Bible Brain

// WRONG:
const url = `https://api.biblebrain.com/v1/bible/chapter/ENGESV/GEN/1`;
// (always uses English)

// CORRECT:
const url = `https://api.biblebrain.com/v1/bible/chapter/${bibleId}/GEN/1`;
// where bibleId is based on language: 'GAZGAZ' for Oromo, etc.
```

**Step 3: Check fallback logic**
```javascript
// Look for this pattern:
try {
  chapter = await fetchFromOromoBible()
} catch {
  // DON'T silently fallback to English!
  // Show translated error instead
  return { error: t('bibleNotAvailable') }
}
```

### Fix Steps

1. **Verify Bible IDs are correct:**
   ```javascript
   // Should have mapping like:
   const bibleMap = {
     'en': 'ENGESV',
     'om': 'GAZGAZ',
     'am': 'AMEAAB' // or whatever Amharic Bible ID
   };
   ```

2. **Pass language to fetch:**
   ```javascript
   const bibleId = bibleMap[selectedLanguage];
   const chapter = await fetchChapter(bibleId, bookId, chapterNum);
   ```

3. **Don't fallback to English silently:**
   ```javascript
   // If Oromo Bible unavailable, show Oromo error message:
   // "Macaabni Afaan Oromoo for this chapter is unavailable"
   // NOT English message or English Bible text
   ```

4. **Test on device:**
   ```
   Set language to Oromo
   Open Reader
   Select Genesis 1
   Confirm text is Oromo (not English)
   ```

### Verification
```
✅ Language: Oromo selected
✅ Open Genesis 1
✅ Text is in Oromo
✅ Can scroll, see Oromo verses
✅ Switch to English
✅ Text is in English
✅ Switch back to Oromo
✅ Text is Oromo again (no cached English)
```

---

## BLOCKER 4: "Chapter Not Found" on Supported Languages ⚠️ CRITICAL

### Files Affected
- `pages/BibleReaderPage.jsx`
- `functions/bibleBrainChapter.js`
- Bible data backend

### The Problem
User selects supported language (Oromo).  
User tries to open Genesis 1.  
Error shows: "Chapter not found" — but it SHOULD exist.

### Root Causes
1. Bible data not seeded for that language
2. API returns 404 even though book exists
3. Wrong chapter URL being called
4. Book available in one language but not another

### How to Debug

**Step 1: Check if Bible data exists**
```javascript
// In functions/bibleBrainChapter.js:
console.log('Fetching:', bibleId, bookId, chapter);

// Call Bible Brain API manually to verify:
// https://api.biblebrain.com/v1/bibles?language=om
// Check if Oromo Bible exists

// Then try:
// https://api.biblebrain.com/v1/bible/chapter/GAZGAZ/GEN/1
// Does it return valid data?
```

**Step 2: Check error handling**
```javascript
// Look for where error is thrown:
if (!chapter || chapter.error) {
  throw new Error('Chapter not found'); // Generic message
  
  // BETTER:
  if (!chapter.data) {
    return {
      error: t('chapterNotAvailable'),
      fallback: null // Don't show English
    };
  }
}
```

**Step 3: Verify supported languages**
```javascript
// Document which languages have which books:
const supportedBooks = {
  'om': ['GEN', 'EXO', 'LEV', ...], // Oromo has these
  'am': ['GEN', 'EXO', ...],         // Amharic has these
};

// If Genesis not in list for Oromo, show:
// "Macaabni Afaan Oromoo for Genesis coming soon"
```

### Fix Steps

1. **Verify Bible data is seeded:**
   ```bash
   # Check if Oromo Bible exists in system
   # Run a backend function to list available Bibles
   ```

2. **Test each supported language/book combo:**
   ```
   English Genesis 1 → Should work
   Oromo Genesis 1 → Should work
   Amharic Genesis 1 → Should work
   
   If not, data is missing — need to seed it
   ```

3. **Update error message:**
   ```javascript
   // Instead of generic "Chapter not found":
   // Show localized: "This book is not yet available in Oromo"
   ```

### Verification
```
✅ Language: Oromo
✅ Book: Genesis (supported)
✅ Open Genesis 1 → Loads (no error)

✅ Language: Oromo
✅ Book: 3 John (if not supported)
✅ Open 3 John 1 → Shows localized "not available" message
```

---

## BLOCKER 5: Oromo Text Spelling Errors ⚠️ MEDIUM

### Files Affected
- `components/i18n/locales/om.json`
- `components/i18n/om.js` (if separate)
- All Oromo translation keys

### The Problem
Oromo text contains spelling mistakes:  
- "Caraa kee" should be "Imala kee"
- Similar mistakes throughout UI

### Root Causes
1. Machine translation errors
2. Copy-paste mistakes
3. Typos in source file
4. Not reviewed by native speaker

### How to Find Them

**Search Oromo translation file:**
```bash
# View all Oromo strings:
cat src/components/i18n/locales/om.json | grep -i "caraa\|imala"
```

**Compare with Amharic/English to spot oddities**

### Fix Steps

1. **Get native Oromo speaker to review:**
   - [ ] List all Oromo strings
   - [ ] Have speaker read & correct
   - [ ] Document changes
   - [ ] Update translation file

2. **Common Oromo translations (verify against speaker):**
   ```
   Welcome: Baga nagaan dhuftan
   Bible: Macaafa Qulqulluu
   Prayer: Kadhaa
   Search: Barbaaduu
   Share: Qoochi
   Go back: Deebi'i
   Save: Kuusi
   ```

3. **Update all occurrences:**
   ```javascript
   // Find wrong text:
   "Caraa kee": "...",
   
   // Replace with correct:
   "Imala kee": "...",
   ```

### Verification
```
✅ Have Oromo speaker review om.json
✅ All corrections applied
✅ Test app in Oromo
✅ No misspellings visible
```

---

## BLOCKER 6: Broken Audio or Blank Sections ⚠️ CRITICAL

### Files Affected
- `pages/AudioBiblePage.jsx`
- `components/audio/BibleVerseAudioPlayer.jsx`
- `components/audio/PersistentAudioPlayer.jsx`
- Audio API calls

### The Problem
Audio chapters don't play, or sections show blank.

### Root Causes
1. Audio fileset ID missing for language
2. Audio file URL invalid or 404
3. Playback controls broken
4. Audio player component crashes on certain chapters
5. Blank sections due to missing data

### How to Debug

**Step 1: Check audio data exists**
```javascript
// In AudioBiblePage.jsx:
console.log('Audio fileset ID:', audioFilesetId);

// Should be something like:
// 'ENGESVN2DA' for English
// 'GAZGAZ...' for Oromo

// Verify it's not null/undefined
```

**Step 2: Test playback on device**
```
✅ Open Audio page
✅ Select English
✅ Play Genesis 1
✅ Confirm audio plays (not silent)
✅ Confirm progress bar moves
✅ Can pause/resume
✅ Can skip ahead
```

**Step 3: Check for blank sections**
```javascript
// Look for places audio might not render:
- Audio player not showing
- Play button missing
- Progress bar blank
- No metadata (book/chapter)
```

### Fix Steps

1. **Verify audio filesets:**
   ```javascript
   // Should have mapping:
   const audioMap = {
     'en': 'ENGESVN2DA',
     'om': 'GAZGAZN2DA', // or correct Oromo fileset
     'am': 'AMEAABN2DA'  // or correct Amharic fileset
   };
   ```

2. **Test each language:**
   ```
   English audio → Play → Works
   Oromo audio → Play → Works (or show "not available")
   Amharic audio → Play → Works (or show "not available")
   ```

3. **Fix blank sections:**
   ```javascript
   // Check if audio player renders all elements:
   - [ ] Play button visible
   - [ ] Progress bar visible
   - [ ] Time display visible
   - [ ] Volume control visible
   - [ ] Speed control visible
   ```

4. **Test on device (real iPhone):**
   ```
   ✅ Audio actually plays (not muted)
   ✅ No lag/delay
   ✅ Can skip chapters
   ✅ Can change speed
   ```

### Verification
```
✅ Open Audio Bible
✅ Select English
✅ Play Genesis 1 Chapter 1 verse 1
✅ Audio plays (you hear sound)
✅ Progress bar moves
✅ Can pause/resume

Repeat for Oromo and Amharic.
```

---

## Summary: Quick Fix Checklist

```
[ ] BLOCKER 1: VerseImageGenerator refresh crash fixed
    - Test refresh 10x on device
    
[ ] BLOCKER 2: Mixed-language pages fixed
    - Audit all pages for hardcoded English
    - Add translations
    - Test all languages
    
[ ] BLOCKER 3: English Bible showing when wrong language selected
    - Verify language parameter passed correctly
    - Check fallback logic
    - No silent English fallback
    
[ ] BLOCKER 4: "Chapter not found" on supported languages
    - Verify Bible data exists
    - Test each language/book combo
    - Fix error messages
    
[ ] BLOCKER 5: Oromo spelling errors
    - Have native speaker review
    - Correct all mistakes
    
[ ] BLOCKER 6: Broken audio
    - Test playback on device
    - Fix blank sections
    - Verify all languages
```

---

## Next Steps

**TODAY:**
1. [ ] Assign each blocker to developer
2. [ ] Start with BLOCKER 1 (VerseImageGenerator)
3. [ ] Daily sync on progress

**BY END OF WEEK:**
1. [ ] All 6 blockers fixed
2. [ ] Device testing complete
3. [ ] Ready for TestFlight

**Next week:**
1. [ ] App Store Connect setup
2. [ ] TestFlight testing
3. [ ] Screenshot prep

**Week 3:**
1. [ ] Submit for review