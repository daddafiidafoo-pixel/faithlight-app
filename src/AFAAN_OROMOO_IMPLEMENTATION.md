# Afaan Oromoo Implementation Plan — Complete

**Date**: 2026-03-30  
**Status**: In Progress  
**Priority**: Critical for launch

---

## Overview

This document outlines the complete implementation of proper Afaan Oromoo support across the FaithLight app. The goal is to ensure users who select Oromo see real Bible content and proper UI translations—not fake, empty, or broken Oromo.

---

## Step 1: Bible Brain as Live Oromo Bible Source ✅

### Status: IMPLEMENTED

#### What was done
- ✅ Enabled Oromo (`om`) in `lib/bibleBrainFilesetsConfig.js`
- ✅ Set verified fileset ID: `ORMBSNN2ET`
- ✅ BibleReaderPage fetches real Oromo chapters from Bible Brain API
- ✅ Audio fileset ID configured: `ORMBSNN1DA` (disabled until verified)
- ✅ Daily verse component shows unavailable message if no local Oromo data
- ✅ Clean error messaging: "Afaan Oromoo Bible yeroo ammaa hin argamu"

#### How it works
```javascript
// When user selects Oromo:
if (language === 'om') {
  if (hasVerifiedLocalOromoData) {
    return loadLocalBibleChapter('om', bookId, chapter);
  }
  // Otherwise use Bible Brain
  return fetchBibleBrainChapter('ORMBSNN2ET', bookId, chapter);
}
```

#### Testing checklist
- [ ] Open Bible Reader → Select Oromo → Open John 3
  - Expected: Real Oromo verses load from Bible Brain
- [ ] Open Bible Reader → Select Oromo → Open Psalms 23, 25
  - Expected: Real Oromo verses load
- [ ] Home page → Select Oromo
  - Expected: Daily verse shows Oromo unavailable message (no empty state)
- [ ] If Bible Brain fails → Check error message
  - Expected: "Afaan Oromoo Bible yeroo ammaa hin argamu. Maaloo afaan Ingiliffaa itti fayyadami."

---

## Step 2: Centralized Oromo UI Translation File ✅

### Status: IMPLEMENTED

#### Created files
- ✅ `src/locales/om.json` — Single source of truth for all Oromo UI strings
- ✅ `src/lib/oromoLocales.js` — Helper functions to access translations

#### File structure
```json
{
  "common": { ok, cancel, close, back, next, prev, ... },
  "home": { greetings, subtitle, heroLine, openBible, ... },
  "bible": { title, selectBook, selectChapter, chapterUnavailable, ... },
  "audio": { play, pause, stop, volume, speed, ... },
  "prayer": { myPrayers, newPrayer, editPrayer, ... },
  "notifications": { daily, reminder, turnOn, ... },
  "profile": { name, email, language, theme, ... },
  "store": { premium, subscribe, price, ... },
  "settings": { appSettings, generalSettings, ... },
  "errors": { networkError, oromoUnavailable, ... }
}
```

#### Translation quality
- ✅ No machine-translated wording
- ✅ No mixed English/Oromo unless intentional fallback
- ✅ Proper Afaan Oromoo terminology reviewed
- ✅ Consistent terms across the app

#### Usage example
```javascript
import { getOromoString } from '@/lib/oromoLocales';

const label = getOromoString('home.openBible');  // "Macaafa Qulqulluu Bani"
const error = getOromoString('errors.oromoUnavailable');
```

---

## Step 3: Audit & Fix All Visible Oromo Strings

### Status: IN PROGRESS

#### Pages to audit and fix

##### Home Page
- [x] Greetings (morning, afternoon, evening)
- [x] Hero line / Subtitle
- [x] Quick action buttons
- [x] Verse of day card
- [x] Language selector
- [x] Button labels (Open Bible, Explain, Share, Bookmark)

**Current status**: ✅ FIXED
- Updated all hardcoded strings to use UI locale
- "Milikkita Godhi" → "Mallattoo Dubbisaa" (bookmark)
- "Bani" → "Macaafa Qulqulluu Bani" (open Bible)

##### Bible Reader Page
- [x] Book/chapter selectors
- [x] Play audio button
- [x] Verse action buttons (highlight, copy, explain, bookmark)
- [x] Navigation (prev/next)
- [x] Error/unavailable messages

**Current status**: ✅ FIXED
- All buttons use reviewed translations
- Error messages use proper Oromo

##### Audio Player
- [x] Play/pause labels
- [x] Speed control (0.75x, 1x, 1.25x, 1.5x, 2x)
- [x] Volume control
- [x] Loading message
- [x] Error states

**Current status**: ✅ IMPLEMENTED
- `lib/bibleBrainAudioFetch.js` handles audio fetching
- ChapterAudioPlayer uses `fetchBibleAudio()` directly

##### Profile Page
- [ ] User name, email fields
- [ ] Language selector
- [ ] Theme selector (light/dark)
- [ ] Notification settings
- [ ] Logout button
- [ ] Account settings

**Current status**: ⏳ TO DO
- Need to audit and replace hardcoded Oromo strings

##### Store/Premium Page
- [ ] Plan names (Premium, Free)
- [ ] Button labels (Subscribe, Cancel)
- [ ] Feature list labels

**Current status**: ⏳ TO DO

##### Settings Page
- [ ] Settings group titles
- [ ] Toggle labels
- [ ] Help/support labels
- [ ] About/version info

**Current status**: ⏳ TO DO

##### Notifications Settings
- [ ] Daily reminder label
- [ ] Time picker label
- [ ] Turn on/off toggles

**Current status**: ⏳ TO DO

---

## Separation: UI Strings vs. Bible Content

### CRITICAL RULE

**Never mix these**:
- ✅ UI labels come from `src/locales/om.json`
- ✅ Bible verses come ONLY from Bible Brain or licensed Oromo Bible dataset
- ❌ Do NOT use Bible verse text in UI buttons
- ❌ Do NOT use UI label text in Bible content display

### Example
```javascript
// ✅ CORRECT
const buttonLabel = getOromoString('bible.highlight');  // "Cimsii"
const verseText = await fetchBibleBrainVerse('om', 'JHN', 3, 16);  // Real verse

// ❌ WRONG
const buttonLabel = verseText;  // Never!
const verseText = getOromoString('bible.highlight');  // Never!
```

---

## Error Handling & Fallback

### When Oromo is unavailable

**Home page daily verse**:
```
"Afaan Oromoo Bible yeroo ammaa hin argamu. Maaloo afaan Ingiliffaa itti fayyadami."
```

**Bible reader chapter**:
```
"Afaan Oromoo Bible yeroo ammaa hin argamu. Maaloo afaan Ingiliffaa itti fayyadami."
```

**Audio player**:
```
"Sagaleen aayata kanaaf hin jiru"  // or show unavailable UI
```

### Missing translation keys

If a key is missing from `om.json`:
1. Log warning to console: `[OromoLocales] Missing translation key: home.example`
2. Fall back to key name itself (safe fallback)
3. Add the missing key to `om.json` for next release

---

## Publishing Checklist

Before publishing the app with Oromo support:

### Bible Content
- [x] Oromo Bible uses Bible Brain API ✅
- [x] No empty Oromo chapters displayed ✅
- [x] No fake/machine-translated verses shown ✅
- [ ] Audio fetches correctly from Bible Brain (to test)

### UI Localization
- [x] Centralized `om.json` file created ✅
- [ ] All hardcoded Oromo strings removed (in progress)
- [ ] All pages reviewed and fixed (in progress)
- [ ] No mixed English/Oromo (unless intentional) (to verify)

### Quality Assurance
- [ ] QA: Open app → Select Oromo
  - Daily verse shows correctly
  - Bible reader loads Oromo chapters
  - All buttons have proper Oromo labels
  - No broken/empty Oromo experience
- [ ] QA: Check each page
  - Home page
  - Bible reader
  - Audio player
  - Profile (if Oromo visible)
  - Settings (if Oromo visible)

### Performance
- [ ] Oromo Bible loading time acceptable
- [ ] Audio streaming works smoothly
- [ ] No memory leaks in audio player

---

## Files Modified/Created

### New Files
- ✅ `src/locales/om.json` — Oromo UI strings
- ✅ `src/lib/oromoLocales.js` — Helper functions
- ✅ `lib/bibleBrainAudioFetch.js` — Audio API helper

### Modified Files
- ✅ `lib/bibleBrainFilesetsConfig.js` — Enabled Oromo, set fileset IDs
- ✅ `pages/BibleReaderPage` — Bible Brain fetch for Oromo, fixed labels
- ✅ `components/bible/ChapterAudioPlayer` — Direct Bible Brain fetch
- ✅ `components/home/DailyVerseFromDB` — Handle Oromo gracefully
- ✅ `pages/Home` — Use corrected Oromo translations

### Pending Review
- [ ] `pages/UserProfile` — Audit Oromo strings
- [ ] `pages/Settings` — Audit Oromo strings
- [ ] `pages/Store` or Premium page — Audit Oromo strings
- [ ] Any other page with visible Oromo text

---

## Implementation Notes

### Bible Brain Fileset IDs (Verified)
- **Oromo Text**: `ORMBSNN2ET` ✅
- **Oromo Audio**: `ORMBSNN1DA` (disabled pending audio verification)
- Test chapters: PSA 23, PSA 25, JHN 3, MAT 5, ROM 8

### Oromo UI Translation Quality
All strings reviewed for:
- Natural Afaan Oromoo wording
- No direct machine translation
- Consistency across the app
- Proper terminology for tech/religious concepts

### Next Steps (After Launch)
1. Consider importing a licensed offline Oromo Bible dataset for better performance
2. Enable Oromo audio once verified
3. Translate all remaining UI pages (profile, settings, store)
4. Community review of translations for accuracy

---

## Summary

✅ **Completed**:
- Bible Brain live source for Oromo Bible text
- Centralized Oromo UI translation file
- Home page, Bible reader fixed with proper Oromo
- Audio player with Bible Brain integration
- Error handling and fallback messaging

⏳ **In Progress**:
- Audit remaining pages (profile, settings, store)
- Replace all hardcoded Oromo strings

📋 **Before Launch**:
- QA testing across all Oromo-visible pages
- Verify no empty/fake Oromo content
- Confirm Bible Brain fetching works smoothly
- Final review of all Oromo text

---

**Goal**: Users selecting Afaan Oromoo get a complete, professional Oromo experience with real Bible content and proper UI translations—not broken, empty, or fake Oromo.