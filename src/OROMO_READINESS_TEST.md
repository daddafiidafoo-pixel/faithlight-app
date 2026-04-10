# Oromo (Afaan Oromoo) Readiness Test

Complete testing procedure to enable Oromo text and audio in the Bible reader.

## Prerequisites

✅ **Before starting:**
- `VITE_BIBLE_BRAIN_API_KEY` is set in environment variables
- `functions/verifyOromoFilesets.js` exists (already created)
- `lib/bibleBrainFilesetsConfig.js` updated with new structure
- `lib/bibleBibleChapterFetch.js` created
- `BibleReaderPage.jsx` wired to use new fetch helper
- `AudioBiblePage.jsx` already refactored

---

## Phase 1: Automated Verification (5 min)

### Step 1.1: Run the verification function

**In Dashboard > Code > Functions:**

1. Go to `verifyOromoFilesets`
2. Click "Test Function"
3. Payload: `{}`

**Expected success response:**

```json
{
  "success": true,
  "timestamp": "...",
  "testResults": {
    "text": {
      "fileset": "HAEBSE",
      "overallSuccess": true,
      "tests": [
        {
          "book": "PSA",
          "chapter": 23,
          "success": true,
          "verseCount": 6,
          "sampleText": "..."
        }
      ]
    },
    "audio": {
      "fileset": "HAEBSEDA",
      "overallSuccess": true,
      "tests": [...]
    }
  },
  "recommendation": {
    "enableText": true,
    "enableAudio": true,
    "reason": [
      "✅ Text fileset HAEBSE verified",
      "✅ Audio fileset HAEBSEDA verified"
    ]
  }
}
```

**If verification PASSES → Continue to Phase 2**
**If verification FAILS → Check error message, then troubleshoot (see end)**

---

## Phase 2: Update Config (1 min)

### Step 2.1: Enable Oromo in config

Edit `lib/bibleBrainFilesetsConfig.js`:

```javascript
om: {
  source: "biblebrain",
  name: "Afaan Oromoo",
  nativeName: "Afaan Oromoo",
  textFilesetId: "HAEBSE",
  audioFilesetId: "HAEBSEDA",
  enabledText: true,        // ← Change from false
  enabledAudio: true,       // ← Change from false
  verified: true,           // ← Change from false
  notes: "Verified 2026-03-29 via automated test",
},
```

Save file — hot reload will update BibleReaderPage and AudioBiblePage.

---

## Phase 3: Text Reader Test (10 min)

### Step 3.1: Open BibleReaderPage

1. Go to BibleReaderPage in preview
2. Check language dropdown — should now show **"Afaan Oromoo"**
3. Select **Afaan Oromoo**

### Step 3.2: Test Psalm 23

1. In book picker → select **Psalms (Faarfannaa)**
2. In chapter picker → select **23**
3. Verify text loads in Oromo:
   - ✅ No errors
   - ✅ 6 verses visible
   - ✅ Text is in Oromo script
   - ✅ Verse numbers show 1-6

### Step 3.3: Test Psalm 25

1. Change chapter to **25**
2. Verify text loads:
   - ✅ 22 verses visible
   - ✅ All text in Oromo
   - ✅ No "unavailable" message

### Step 3.4: Test Matthew 1

1. Select **Matthew (Mattewos)** from book picker
2. Select chapter **1**
3. Verify:
   - ✅ 25 verses load
   - ✅ Text in Oromo
   - ✅ Book name correct

### Step 3.5: Test John 3 (with verse 16)

1. Select **John (Yohannaa)** from book picker
2. Select chapter **3**
3. Verify:
   - ✅ Chapter loads
   - ✅ Verse 16 visible and readable
   - ✅ No errors

### Step 3.6: Test offline cache

1. With any Oromo chapter open
2. Click **Download** button (top right)
3. Verify:
   - ✅ Button shows checkmark
   - ✅ Message: "✓ Saved offline"
4. Refresh page
5. Verify:
   - ✅ Checkmark still shows (cached)
   - ✅ Text loads from cache (fast)

### Step 3.7: Test navigation

1. Click **Next** button
2. Verify:
   - ✅ Chapter advances
   - ✅ Text updates
   - ✅ Language stays Oromo
3. Click **Previous** button
4. Verify:
   - ✅ Chapter goes back
   - ✅ Text updates
   - ✅ Language stays Oromo

**Text Reader Status: ✅ PASS** (if all tests pass)

---

## Phase 4: Audio Bible Test (10 min)

### Step 4.1: Open AudioBiblePage

1. Go to AudioBiblePage in preview
2. Default language is English
3. Language dropdown should show **Afaan Oromoo**

### Step 4.2: Change to Oromo

1. Change language to **Afaan Oromoo**
2. Default book should be Psalms (or let it load)
3. Default chapter should be 23 (or similar)
4. Verify:
   - ✅ No red "Audio not available" message
   - ✅ Play button is **enabled** (not gray)
   - ✅ Purple gradient card shows

### Step 4.3: Test audio playback (Psalm 23)

1. Keep book = Psalms, chapter = 23
2. Click **Play** button
3. Verify:
   - ✅ No console errors
   - ✅ Audio element gets a `src` URL
   - ✅ Audio starts playing (or permission prompt)
   - ✅ Timer advances from 0:00

**Note:** First audio play may need browser permission; allow it.

### Step 4.4: Test audio navigation

1. Click **Next Chapter** button
2. Change chapter to **25**
3. Verify:
   - ✅ New audio URL loads
   - ✅ Play button still enabled
   - ✅ Audio plays for Psalm 25

### Step 4.5: Test volume and speed controls

1. With audio playing, click **Settings** (gear icon, top right)
2. Adjust **Speed** slider
3. Verify:
   - ✅ Playback speed changes
   - ✅ No errors
4. Adjust **Volume** slider
5. Verify:
   - ✅ Audio volume changes

### Step 4.6: Test offline audio (if enabled)

1. With audio playing, look for **Download** button (optional)
2. If available, click it
3. Verify:
   - ✅ Audio file caches locally
   - ✅ Can play offline (next reload without internet)

**Audio Bible Status: ✅ PASS** (if all tests pass)

---

## Phase 5: Cross-language Test (5 min)

### Step 5.1: Switch between languages

1. In BibleReaderPage, switch: **English → Oromo → English**
2. Verify:
   - ✅ Text loads for each language
   - ✅ No errors
   - ✅ Verse numbers consistent

3. In AudioBiblePage, switch: **English → Oromo → English**
4. Verify:
   - ✅ Audio loads for each language
   - ✅ No "Audio not available" errors
   - ✅ Play button responds

### Step 5.2: Test with other enabled languages

1. Switch to **Swahili (Kiswahili)**
2. Verify text loads and audio plays
3. Switch to **Français** or **العربية**
4. Verify text loads and audio plays

**Cross-language Status: ✅ PASS**

---

## Phase 6: Error State Tests (5 min)

### Step 6.1: Test network error

1. In browser DevTools → Network → go **Offline**
2. Try to load a new Oromo chapter
3. Verify:
   - ✅ Error message shows: "Connection failed. Check your internet."
   - ✅ No white-screen crash
4. Go back **Online**
5. Reload chapter
6. Verify:
   - ✅ Chapter loads successfully
   - ✅ Error cleared

### Step 6.2: Test missing chapter

1. Select Psalm 200 (doesn't exist)
2. Verify:
   - ✅ Error shows: "Chapter not found in this language"
   - ✅ Can select different chapter and recover

### Step 6.3: Test disabled language

1. Temporarily disable Oromo: Edit `bibleBrainFilesetsConfig.js` → set `enabledText: false`
2. Refresh BibleReaderPage
3. Verify:
   - ✅ Oromo **not** in language dropdown
   - ✅ Only enabled languages show
4. Re-enable Oromo: set `enabledText: true`
5. Refresh
6. Verify:
   - ✅ Oromo reappears in dropdown

**Error States Status: ✅ PASS**

---

## Phase 7: Mobile Test (optional but recommended)

### Step 7.1: Test on iOS

1. Open BibleReaderPage on iPhone
2. Select Oromo
3. Load Psalm 23
4. Verify:
   - ✅ Text readable (no layout issues)
   - ✅ Buttons are tappable (44x44px minimum)
   - ✅ Dropdown accessible

### Step 7.2: Test on Android

1. Open BibleReaderPage on Android device
2. Select Oromo
3. Load Psalm 25
4. Verify:
   - ✅ Text readable
   - ✅ Navigation works
   - ✅ Offline cache works

**Mobile Status: ✅ PASS** (optional)

---

## Phase 8: Documentation Update (2 min)

### Step 8.1: Update FILESET_REFERENCE.md

Edit `bible-data/FILESET_REFERENCE.md`:

Change:
```
| Afaan Oromoo | om | ⚠️ HAEBSE | ⚠️ HAEBSEDA | ⚠️ Testing needed |
```

To:
```
| Afaan Oromoo | om | ✅ HAEBSE | ✅ HAEBSEDA | ✅ Verified 2026-03-29 |
```

### Step 8.2: Update IMPLEMENTATION_VERIFICATION_GUIDE.md

Add under "Rollout Checklist":
```
- ✅ Oromo text loads for PSA 23, 25, MAT 1, JHN 3
- ✅ Oromo audio plays without errors
- ✅ Offline cache saves/loads chapters
- ✅ No console errors
- ✅ Mobile tests pass (iOS + Android)
- ✅ Documentation updated
```

---

## Summary Checklist

### ✅ Ready to Enable Oromo

- [ ] **Automated verification passes** (`verifyOromoFilesets` function)
- [ ] **Config updated** (`enabledText: true, enabledAudio: true, verified: true`)
- [ ] **Text reader tests pass** (Psalm 23, 25, Matthew 1, John 3)
- [ ] **Audio tests pass** (playback works, controls respond)
- [ ] **Cross-language switch works** (no errors)
- [ ] **Error states handled** (network error, missing chapter)
- [ ] **Mobile tests pass** (iOS + Android responsive)
- [ ] **Documentation updated** (FILESET_REFERENCE.md, etc.)

**Result:** Oromo is now production-ready for all users.

---

## Troubleshooting

### "Text not available" in reader for Oromo

**Cause:** `enabledText: false` in config

**Fix:** 
1. Edit `lib/bibleBrainFilesetsConfig.js`
2. Set `enabledText: true` for Oromo
3. Save and refresh

### "Audio not available" in AudioBiblePage

**Cause:** `enabledAudio: false` in config

**Fix:**
1. Edit `lib/bibleBrainFilesetsConfig.js`
2. Set `enabledAudio: true` for Oromo
3. Save and refresh

### "API returned 404" error

**Cause:** Fileset ID is wrong or API key invalid

**Fix:**
1. Check `VITE_BIBLE_BRAIN_API_KEY` is set
2. Verify fileset IDs (HAEBSE for text, HAEBSEDA for audio)
3. Test manually:
   ```bash
   curl "https://4.dbt.io/api/bibles/filesets/HAEBSE/PSA/23?key=YOUR_API_KEY"
   ```

### "Console error: Cannot read property 'enabledText' of undefined"

**Cause:** Config structure mismatch

**Fix:**
1. Verify `bibleBrainFilesetsConfig.js` exports `BIBLE_SOURCES` as default
2. Verify BibleReaderPage imports as: `import BIBLE_BRAIN_CONFIG from '@/lib/bibleBrainFilesetsConfig'`
3. Check field names are `enabledText`, `enabledAudio` (not `enabled`)

### Audio plays but no sound

**Cause:** Browser volume muted or system volume off

**Fix:**
1. Check system volume on device
2. Check browser volume (top-right settings in AudioBiblePage)
3. Try with different chapter (PSA 25 instead of PSA 23)

---

## Success Criteria ✅

**Oromo is fully ready when:**
1. ✅ All 8 phases pass
2. ✅ All 5 test chapters load (PSA 23, 25, MAT 1, JHN 3)
3. ✅ Audio plays without errors
4. ✅ Mobile is responsive
5. ✅ No console errors
6. ✅ Documentation updated