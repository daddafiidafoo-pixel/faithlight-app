# 🚨 CRITICAL QA VERIFICATION (LANGUAGE PURITY TEST)

## DO NOT PUBLISH WITHOUT PASSING ALL TESTS

---

## TEST 1: Sermon Generation - English (BASELINE)

### Steps:
1. Open SermonPreparation page
2. Set "Sermon Output Language" → **English**
3. Fill form:
   - Theme: "Faith in Trials"
   - Passage: "Romans 8:28"
   - Audience: "General"
   - Style: "Pastoral"
   - Denomination: "General"
4. Click "Generate Sermon"

### Expected Result:
- ✅ Sermon is 100% English
- ✅ No Oromo words mixed in
- ✅ No Amharic text visible
- ✅ Audio player voice is English/US accent

### FAIL if:
- ❌ Any non-English text appears (STOP - don't continue testing)
- ❌ "undefined" text showing
- ❌ Audio plays in wrong language

---

## TEST 2: Sermon Generation - Afaan Oromoo (CRITICAL)

### Steps:
1. Clear form (click back)
2. Set "Sermon Output Language" → **Afaan Oromoo**
3. Fill form with SAME settings:
   - Theme: "Amana Gara Rakkina"
   - Passage: "Roma 8:28"
   - Audience: "General"
   - Style: "Pastoral"
   - Denomination: "General"
4. Click "Generate Sermon"

### Expected Result:
- ✅ Sermon is 100% Afaan Oromoo
- ✅ Uses Ge'ez/Latin script properly
- ✅ NO English words in content
- ✅ NO Amharic mixed in
- ✅ Audio voice is Oromo-accented (if TTS available)

### FAIL if:
- ❌ English words visible (e.g., "however", "therefore")
- ❌ Amharic characters (ሀ, በ, ገ) visible
- ❌ Random English phrases
- ❌ Title in English but content in Oromo

---

## TEST 3: Sermon Generation - Amharic (CRITICAL)

### Steps:
1. Clear form
2. Set "Sermon Output Language" → **Amharic**
3. Fill form:
   - Theme: "ተስፋ ስሪት"
   - Passage: "ሮሜ 8:28"
   - Audience: "General"
   - Style: "Pastoral"
   - Denomination: "General"
4. Click "Generate Sermon"

### Expected Result:
- ✅ Sermon is 100% Amharic (አማርኛ)
- ✅ All text in Ge'ez script
- ✅ NO English words in content
- ✅ NO Oromo mixed in
- ✅ Audio voice matches Amharic

### FAIL if:
- ❌ English text visible
- ❌ Oromo script visible
- ❌ Mixed scripts
- ❌ Unreadable/garbled Amharic

---

## TEST 4: Preaching Style Impact (English Only)

### Steps:
1. Generate 2 sermons in English with SAME settings EXCEPT:

**Sermon A:**
- Style: "Pastoral"
- Theme: "Love"

**Sermon B:**
- Style: "Evangelistic"
- Theme: "Love"

### Expected Result:
- ✅ Sermon A: Warm, encouraging, caring tone
- ✅ Sermon B: Urgent, call-to-action, conversion focus
- ✅ Both about same topic but DIFFERENT emphasis

### FAIL if:
- ❌ Both sermons read identically
- ❌ Style selector doesn't affect output
- ❌ Wrong tone (evangelistic reads pastoral)

---

## TEST 5: Denomination Impact (English Only)

### Steps:
1. Generate 2 sermons in English with SAME settings EXCEPT:

**Sermon A:**
- Denomination: "General"
- Theme: "Salvation"

**Sermon B:**
- Denomination: "Pentecostal"
- Theme: "Salvation"

### Expected Result:
- ✅ Sermon A: Balanced theology
- ✅ Sermon B: Emphasis on Holy Spirit, speaking in tongues, healing
- ✅ Same topic, DIFFERENT theological angle

### FAIL if:
- ❌ Both sermons are identical
- ❌ Denomination selector has no effect
- ❌ Theology is wrong (e.g., Catholic sermon lacks Mary reference)

---

## TEST 6: Audio Player (All Languages)

### Steps:
1. Generate sermon in each language
2. For each:
   - Click Play button
   - Wait 3 seconds
   - Click Pause
   - Drag slider to 50%
   - Click Play again
   - Change speed to 1.25x
   - Listen for 5 seconds

### Expected Result:
- ✅ Play works
- ✅ Pause works
- ✅ Slider works (jumps to position)
- ✅ Speed changes audio playback
- ✅ Voice matches language (EN/OM/AM)
- ✅ No crashes or UI breaks

### FAIL if:
- ❌ Audio doesn't play
- ❌ Audio in wrong language
- ❌ Speed control broken
- ❌ Pause doesn't work
- ❌ Console errors

---

## TEST 7: Offline Saving (All Languages)

### Steps:
1. Generate sermon in English
2. Click "Save" button
3. Note: Button should show "Saved ✓"
4. Go to "/SavedSermons" page
5. Verify sermon appears in list
6. Enable Airplane Mode
7. Reload page (F5)
8. Navigate back to SavedSermons

### Expected Result:
- ✅ Sermon saved to IndexedDB
- ✅ Appears in "My Sermons" list
- ✅ Still visible in offline mode
- ✅ Can search/filter offline

### FAIL if:
- ❌ Save button doesn't work
- ❌ Sermon doesn't appear in list
- ❌ Disappears when offline
- ❌ Data loss on reload

---

## TEST 8: PDF Export (All Languages)

### Steps:
1. Generate sermon (try EN, OM, AM)
2. Click "PDF" button
3. Verify PDF downloads
4. Open PDF in reader

### Expected Result:
- ✅ PDF downloads with correct filename
- ✅ PDF opens in reader (Adobe, Preview, etc.)
- ✅ Title visible
- ✅ All sermon text readable
- ✅ Metadata (date, type, passage) included
- ✅ Language-specific characters render properly

### FAIL if:
- ❌ PDF doesn't download
- ❌ PDF corrupted/won't open
- ❌ Amharic/Oromo text garbled
- ❌ Missing content

---

## TEST 9: Share Functionality

### Steps:
1. Generate sermon
2. Click "Share" button
3. Try each share method:
   - Native Share (if on mobile)
   - WhatsApp
   - Copy (test separately)

### Expected Result:
- ✅ Native share opens OS dialog
- ✅ WhatsApp link works (opens app or web)
- ✅ Copy button copies full sermon
- ✅ No UI breaks

### FAIL if:
- ❌ Share buttons don't work
- ❌ WhatsApp link malformed
- ❌ Copy doesn't copy
- ❌ Errors in console

---

## TEST 10: Language Switching (App UI)

### Steps:
1. Home page
2. Click language selector (top right)
3. Change to Oromo
4. Navigate to:
   - SermonPreparation
   - SavedSermons
   - Prayer Journal
5. Verify UI is in Oromo
6. Change to Amharic
7. Repeat navigation

### Expected Result:
- ✅ All UI text in selected language
- ✅ No mixed English/Oromo
- ✅ No "undefined" keys
- ✅ Language persists on reload

### FAIL if:
- ❌ English text still showing
- ❌ Partial translations
- ❌ Language resets on page load
- ❌ Missing translations (keys visible)

---

## TEST 11: Mobile Responsiveness

### Steps (on iPhone 12 or Pixel):
1. Open SermonPreparation
2. Verify all buttons ≥ 44px tall
3. No horizontal scroll
4. Generate sermon
5. Verify audio player fits screen
6. Test PDF export (verify download works)
7. Test WhatsApp share

### Expected Result:
- ✅ All buttons easily tappable
- ✅ No layout breaks
- ✅ Audio player visible
- ✅ Share works on mobile

### FAIL if:
- ❌ Buttons < 44px
- ❌ Horizontal scroll needed
- ❌ UI overlapping
- ❌ Share doesn't work

---

## TEST 12: Console Check (NO ERRORS)

### Steps:
1. Open DevTools (F12)
2. Go to Console tab
3. Generate sermon in English
4. Generate sermon in Oromo
5. Generate sermon in Amharic
6. Save sermon
7. Export PDF
8. Share

### Expected Result:
- ✅ NO red error messages
- ✅ NO "undefined" warnings
- ✅ NO missing key warnings
- ✅ Only info/log messages OK

### FAIL if:
- ❌ Any red errors
- ❌ TypeError or ReferenceError
- ❌ Network errors

---

## FINAL GO/NO-GO CHECKLIST

### ✅ PASS ALL THESE:
- [ ] Test 1: English sermon 100% English
- [ ] Test 2: Oromo sermon 100% Oromo
- [ ] Test 3: Amharic sermon 100% Amharic
- [ ] Test 4: Style affects tone
- [ ] Test 5: Denomination affects theology
- [ ] Test 6: Audio plays in all languages
- [ ] Test 7: Offline saving works
- [ ] Test 8: PDF export works all languages
- [ ] Test 9: Share buttons work
- [ ] Test 10: UI language switching clean
- [ ] Test 11: Mobile buttons ≥ 44px
- [ ] Test 12: Console has NO red errors

### ❌ STOP IF ANY:
- Mixed languages in sermon output
- English text in Oromo/Amharic sermon
- PDF export broken
- Audio doesn't play
- Save function fails
- Console red errors
- Buttons < 44px on mobile

---

## 🚀 PUBLISH APPROVAL

Once you pass ALL 12 tests:

1. ✅ Take screenshots (for documentation)
2. ✅ Note any warnings/observations
3. ✅ Confirm version number (e.g., 1.0.0)
4. ✅ Deploy to Play Store

---

## Test Results Template

```
Test 1 (English): ✅ PASS / ❌ FAIL
Test 2 (Oromo): ✅ PASS / ❌ FAIL
Test 3 (Amharic): ✅ PASS / ❌ FAIL
Test 4 (Style): ✅ PASS / ❌ FAIL
Test 5 (Denomination): ✅ PASS / ❌ FAIL
Test 6 (Audio): ✅ PASS / ❌ FAIL
Test 7 (Offline): ✅ PASS / ❌ FAIL
Test 8 (PDF): ✅ PASS / ❌ FAIL
Test 9 (Share): ✅ PASS / ❌ FAIL
Test 10 (Language UI): ✅ PASS / ❌ FAIL
Test 11 (Mobile): ✅ PASS / ❌ FAIL
Test 12 (Console): ✅ PASS / ❌ FAIL

Date: __________
Tester: __________
Notes: __________
```

---

**RUN THESE TESTS NOW BEFORE PUBLISHING.**