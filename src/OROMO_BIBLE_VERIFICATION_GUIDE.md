# Afaan Oromoo Bible Verification & Deployment Guide

**Status**: CRITICAL PRIORITY  
**Date**: 2026-03-30  
**Goal**: Make Oromo the first fully working non-English Bible language

---

## Overview

This guide ensures Afaan Oromoo Bible content is:
- ✅ Real (from Bible Brain API, not manually typed)
- ✅ Complete (all requested chapters load)
- ✅ Consistent (wording stays correct across all books)
- ✅ Tested (key verses verified before launch)
- ❌ NOT empty, fake, or partial

---

## Current Oromo Configuration

**File**: `lib/bibleBrainFilesetsConfig.js`

```javascript
om: {
  source: "biblebrain",
  name: "Afaan Oromoo",
  nativeName: "Afaan Oromoo",
  textFilesetId: "ORMBSNN2ET",        // ← Oromo text
  audioFilesetId: "ORMBSNN1DA",       // ← Oromo audio
  enabledText: true,                   // ✅ TEXT ENABLED
  enabledAudio: false,                 // ⏳ Audio pending verification
  verified: true,
  notes: "Live Oromo Bible from Bible Brain API",
}
```

**Status**: Text is enabled and configured. Audio is disabled (waiting for verification).

---

## Pre-Launch Verification Checklist

### Step 1: Test Oromo Bible Brain Connectivity

**Test URL Format**:
```
https://4.dbt.io/api/bibles/filesets/ORMBSNN2ET/{BOOK}/{CHAPTER}?key={API_KEY}
```

**Test these chapters** (in order of priority):

#### 1. Psalms 23 (PSA/23)
```
https://4.dbt.io/api/bibles/filesets/ORMBSNN2ET/PSA/23?key={YOUR_API_KEY}
```

**Expected**: 
- [ ] Returns JSON array of verses
- [ ] Verse 1 starts with real Oromo text
- [ ] No empty `text` fields
- [ ] 6+ verses total

**Sample output**:
```json
[
  {
    "verse_number": 1,
    "text": "Waaqayyo timsaajeesa Abbaa nuti facaasaa jirra...",
    "formatting": []
  },
  ...
]
```

#### 2. John 3 (JHN/3)
```
https://4.dbt.io/api/bibles/filesets/ORMBSNN2ET/JHN/3?key={YOUR_API_KEY}
```

**Expected**:
- [ ] Returns 36+ verses
- [ ] Verse 3 starts (famous verse location)
- [ ] All verses have Oromo text
- [ ] No broken characters

#### 3. Philippians 4 (PHP/4) — KEY TEST
```
https://4.dbt.io/api/bibles/filesets/ORMBSNN2ET/PHP/4?key={YOUR_API_KEY}
```

**Expected for verse 13**:
- [ ] Verse 13 present in response
- [ ] Text is in Oromo (not English, not placeholder)
- [ ] Readable Oromo script
- [ ] Complete verse text

**CRITICAL**: Philippians 4:13 must come from the API, not be manually typed.

#### Test Result Template

Create a simple test to verify:

```javascript
// Test in browser console or create a test function
const testOromo = async () => {
  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;
  const tests = [
    { book: 'PSA', chapter: 23, name: 'Psalms 23' },
    { book: 'JHN', chapter: 3, name: 'John 3' },
    { book: 'PHP', chapter: 4, name: 'Philippians 4' },
  ];

  for (const test of tests) {
    const url = `https://4.dbt.io/api/bibles/filesets/ORMBSNN2ET/${test.book}/${test.chapter}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`${test.name}:`, {
      status: response.status,
      verses: data?.length || 0,
      sample: data?.[0]?.text?.substring(0, 50),
    });
  }
};

testOromo();
```

---

### Step 2: Test Oromo in App UI

**Open the Bible Reader page**:

1. Navigate to Bible Reader
2. Select "Afaan Oromoo" from language dropdown
3. Test each chapter

#### Test: Psalms 23
- [ ] Language shows "Afaan Oromoo"
- [ ] Book selector shows Oromo book names
- [ ] Click PSA (Psalms) → loads
- [ ] Chapter 23 loads
- [ ] Text displays in Oromo script
- [ ] No loading error
- [ ] No fallback to English

#### Test: John 3
- [ ] Navigate to JHN (John)
- [ ] Chapter 3 loads
- [ ] Verse 3 and following display correctly
- [ ] Oromo text readable
- [ ] No mixed English

#### Test: Philippians 4:13 (CRITICAL)
- [ ] Navigate to PHP (Philippians)
- [ ] Chapter 4 loads
- [ ] Verse 13 displays
- [ ] Text is in Oromo (NOT English placeholder)
- [ ] Verse content matches Bible Brain API response
- [ ] Copy button works
- [ ] Share button works

**Expected Oromo Philippians 4:13** (approximate):
```
"Ani waan hunda danda'u keessa jabina Kiristoos karaa jeedha jaldeeffachuuf..."
```

**NOT acceptable**:
- Empty verse
- English text: "I can do all things through Christ..."
- Machine-generated placeholder text
- Incomplete verse

---

### Step 3: Test Home Page Daily Verse in Oromo

**Setup**:
1. Open Home page
2. Select "Afaan Oromoo" language

**Expected behavior**:
- [ ] Daily verse card shows Oromo text
- [ ] Verse is from real Oromo Bible source
- [ ] Book/chapter reference in Oromo
- [ ] No English mixed in
- [ ] All action buttons (explain, share, bookmark) show Oromo labels

**If Oromo daily verse unavailable** (no local data):
- [ ] Clean message shows: "Afaan Oromoo Bible yeroo ammaa hin argamu. Maaloo afaan Ingiliffaa itti fayyadami."
- [ ] No empty blank card
- [ ] No fake verse displayed

---

### Step 4: Test Oromo UI Localization

**File**: `src/locales/om.json`

**Test on each page**:

#### Home Page
- [ ] Greetings in Oromo (Akkam Bulte, Akkam Oolte, Akkam Galgaloofte)
- [ ] "Macaafa Qulqulluu Bani" (Open Bible)
- [ ] "Luqqisa Ibsi" (Explain)
- [ ] "Qoodi" (Share)
- [ ] "Mallattoo Dubbisaa" (Bookmark)

#### Bible Reader Page
- [ ] "Dubbisaa Macaafa Qulqulluu" (Bible Reader title)
- [ ] "Kitaaba Filadhu" (Select Book)
- [ ] "Boqonnaa Filadhu" (Select Chapter)
- [ ] Prev/Next buttons show Oromo
- [ ] Action buttons all in Oromo

#### Audio Player
- [ ] "Jalqabi" (Play)
- [ ] "Raajii" (Pause)
- [ ] "Sagalee" (Volume)
- [ ] "Ariifni" (Speed)

#### Profile Page
- [ ] "Maqaa" (Name)
- [ ] "Email"
- [ ] "Afaan" (Language)
- [ ] "Bahuun" (Logout)

#### Settings Page
- [ ] All labels in Oromo
- [ ] No English mixed in

---

### Step 5: Audio Verification (Optional for Launch)

**Current Status**: `enabledAudio: false` (disabled)

**To enable audio later**:

1. Verify fileset `ORMBSNN1DA` works:
```
https://4.dbt.io/api/bibles/filesets/ORMBSNN1DA/PSA/23?key={API_KEY}
```

2. Check response:
   - [ ] Returns audio file URLs
   - [ ] Audio plays correctly
   - [ ] Syncs with verse text

3. Update config:
```javascript
om: {
  ...
  enabledAudio: true,
  verified: true,
}
```

---

## Deployment Checklist

### Before Publishing to Users

#### Bible Content
- [ ] Oromo text loads from Bible Brain (not local/fake data)
- [ ] PSA 23 tested ✅
- [ ] JHN 3 tested ✅
- [ ] PHP 4:13 tested ✅ (CRITICAL)
- [ ] No empty/blank chapters
- [ ] No fake placeholder verses
- [ ] No manually typed verses that diverge from source

#### UI Localization
- [ ] `src/locales/om.json` complete (400+ strings)
- [ ] Home page all Oromo
- [ ] Bible reader all Oromo
- [ ] Audio player all Oromo
- [ ] Profile page all Oromo
- [ ] Settings all Oromo
- [ ] No English in UI (except as intentional fallback)

#### Error Handling
- [ ] If Bible unavailable → shows "Afaan Oromoo Bible yeroo ammaa hin argamu"
- [ ] No empty blank pages
- [ ] Clean fallback messaging

#### Performance
- [ ] Bible verses load in <2 seconds
- [ ] No lag when switching chapters
- [ ] Offline mode gracefully disabled for Oromo

#### QA Testing
- [ ] Tested on desktop (Chrome, Safari, Firefox)
- [ ] Tested on mobile (iOS Safari, Android Chrome)
- [ ] Font rendering correct
- [ ] No script/encoding issues

---

## Implementation Order (CRITICAL PRIORITY)

1. **Verify Oromo Bible Brain connectivity** (this doc → Step 1-4)
2. **Test key verses in app** (PSA 23, JHN 3, PHP 4:13)
3. **Verify UI localization complete** (om.json)
4. **QA test Oromo end-to-end**
5. **Deploy Oromo as fully working language**
6. **Then move to Amharic, Arabic, French**

**Oromo is PRIMARY because it's the main target language.**

---

## CRITICAL RULES

### Real Bible Source Only
✅ Fetch from Bible Brain API (`ORMBSNN2ET`)  
✅ Verify each chapter loads  
❌ Do NOT type verses manually  
❌ Do NOT use fake/placeholder text  
❌ Do NOT mix sources  

**Philippians 4:13 example**:
```javascript
// ✅ CORRECT — loads from API
const verse = await fetchBibleBrainVerse('om', 'PHP', 4, 13);
display(verse.text);

// ❌ WRONG — manually typed
const verse = "Ani waan hunda danda'u...";
display(verse);
```

### UI and Bible Separated
✅ UI labels → from `om.json`  
✅ Bible verses → from Bible Brain API  
❌ Never mix  

### Consistency
Once verse loaded from API once, it stays the same everywhere.  
No manual edits → no inconsistency.

---

## Testing Commands

### Test Oromo Bible Brain Fileset

```bash
# In browser console:
const testOromo = async () => {
  const apiKey = '{YOUR_API_KEY}';
  const url = 'https://4.dbt.io/api/bibles/filesets/ORMBSNN2ET/PHP/4?key=' + apiKey;
  const resp = await fetch(url);
  const data = await resp.json();
  console.log('Philippians 4 verse count:', data.length);
  console.log('Verse 13:', data.find(v => v.verse_number === 13));
};
testOromo();
```

### Test in App

```javascript
// In BibleReaderPage or test component:
import { testFileset } from '@/lib/bibleBrainFilesetsConfig';

const result = await testFileset('om', 'PHP', 4);
console.log('Oromo Philippians 4:', result);
```

---

## Success Criteria

**Oromo is "fully working" when**:

1. ✅ Bible verses load from Bible Brain API
2. ✅ PSA 23 displays correctly in Oromo
3. ✅ JHN 3 displays correctly in Oromo
4. ✅ PHP 4:13 appears in Oromo (not English)
5. ✅ Home page shows daily verse OR clean unavailable message
6. ✅ All UI labels in Oromo (from om.json)
7. ✅ No empty/fake/broken Oromo pages
8. ✅ Works on desktop and mobile

---

## FAQ

**Q: What if Philippians 4:13 doesn't load?**  
A: Check fileset ID. Verify API key. Test URL directly in browser.

**Q: Can I manually add Oromo verses?**  
A: NO. Always load from Bible Brain. Manually typed verses cause inconsistency.

**Q: What if Oromo Bible Brain is slow?**  
A: Cache responses. Implement timeout. Show loading state. Never show fake verse.

**Q: Should Amharic be next?**  
A: After Oromo is fully working. Oromo is primary target language.

---

## Summary

**Goal**: Oromo Bible is real, complete, consistent, and polished.

**Result**: Users who select Afaan Oromoo get professional Bible experience with real content, not empty/fake/broken Oromo.

**Next**: Verify using Steps 1-5, then mark ✅ READY FOR LAUNCH.

---

**Important Note**:  
Do not manually type Oromo Bible verses into the app. Load them from the verified Oromo Bible source (Bible Brain fileset `ORMBSNN2ET`) so the wording stays correct across the whole Bible. One source of truth = consistent experience.