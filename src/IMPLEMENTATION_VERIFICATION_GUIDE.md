# Implementation Verification Guide

Complete checklist for verifying offline caching, Oromo filesets, and AudioBiblePage refactor.

## Part 1: Offline Cache Implementation ✅

### Frontend Components
- ✅ `components/bible/OfflineCacheIndicator.jsx` — UI for download/delete buttons
- ✅ Integrated into `pages/BibleReaderPage.jsx` header
- ✅ Uses `lib/offlineCacheStrategy.js` for light-level caching

### Testing Offline Cache

**In BibleReaderPage:**

1. Open any book/chapter (e.g., Psalm 25)
2. Look for "Save offline" button in the offline cache section
3. Click "Save offline"
4. Should see: ✓ Saved offline badge
5. Refresh page — chapter should show as cached
6. Toggle "Delete offline copy" to remove

**Expected behavior:**
- Cache persists across page reloads
- Only caches what user explicitly saves
- Shows storage usage in settings (optional)
- Gracefully handles storage quota exceeded

**Test multilingual:**
- Save English chapter
- Save Oromo chapter
- Switch languages
- Both should remain cached independently

---

## Part 2: Oromo Fileset Verification 🔍

### Automated Verification Test

**Function created:** `functions/verifyOromoFilesets.js`

This admin-only function tests Oromo filesets (HAEBSE text, HAEBSEDA audio) against Bible Brain API.

### Run Verification Test

**From dashboard > Code > Functions:**

1. Go to `verifyOromoFilesets` function
2. Click "Test Function"
3. Payload: `{}`
4. Expected response:

```json
{
  "success": true,
  "timestamp": "2026-03-29T...",
  "testResults": {
    "text": {
      "fileset": "HAEBSE",
      "overallSuccess": true,
      "tests": [
        { "success": true, "verseCount": 8, "sampleText": "..." }
      ]
    },
    "audio": {
      "fileset": "HAEBSEDA",
      "overallSuccess": true,
      "tests": [
        { "success": true, "verseCount": ..., "sampleStructure": [...] }
      ]
    }
  },
  "recommendation": {
    "enableText": true,
    "enableAudio": true,
    "reason": [
      "✅ Text fileset HAEBSE verified",
      "✅ Audio fileset HAEBSEDA verified"
    ]
  },
  "nextSteps": [
    "✅ Verification passed",
    "Update bibleBrainFilesetsConfig.js with new enabled status",
    "..."
  ]
}
```

### Manual Verification (Optional)

If you want to test directly with curl:

```bash
# Test text
curl "https://4.dbt.io/api/bibles/filesets/HAEBSE/PSA/25?key=YOUR_API_KEY"

# Test audio
curl "https://4.dbt.io/api/bibles/filesets/HAEBSEDA/PSA/23?key=YOUR_API_KEY"
```

### Update Config Based on Results

**If verification PASSES:**

Edit `lib/bibleBrainFilesetsConfig.js`:

```javascript
om: {
  type: "biblebrain",
  textFileset: "HAEBSE",
  audioFilesetId: "HAEBSEDA",
  enabled: true,        // ← Change from false
  name: "Afaan Oromoo",
  verified: true,       // ← Change from false
  notes: "Verified 2026-03-29 via automated test",
},
```

**If verification FAILS:**

Keep disabled and check:
1. API key is valid
2. Filesets are correct in Bible Brain account
3. Check error message for specific API issue

### Update Documentation

Edit `bible-data/FILESET_REFERENCE.md`:

Change from:
```
| Afaan Oromoo | om | ⚠️ HAEBSE | ⚠️ HAEBSEDA | ⚠️ Testing needed |
```

To:
```
| Afaan Oromoo | om | ✅ HAEBSE | ✅ HAEBSEDA | ✅ Verified 2026-03-29 |
```

---

## Part 3: AudioBiblePage Refactor ✅

### Imports Added
- `lib/bibleBrainFilesetsConfig.js` — Language configuration
- `lib/audioBibleHelpers.js` — Audio loading + validation

### Key Changes

**Old approach:**
- Assumed text fileset = audio fileset
- Generic API call, no error handling
- No "audio unavailable" message

**New approach:**
- Separate `textFilesetId` and `audioFilesetId`
- Dynamic URL resolution with error handling
- Clear UI for missing audio

### Test AudioBiblePage

**Test 1: Language with Audio (English)**
1. Open AudioBiblePage
2. Default language is English
3. Select a chapter
4. Audio should load and play
5. Check console: No errors

**Test 2: Language without Audio (Oromo until verified)**
1. Open AudioBiblePage
2. Change language to Oromo
3. Should see red alert: "Audio not available in Afaan Oromoo"
4. Play button disabled
5. No errors in console

**Test 3: Chapter Audio Missing**
1. Select language (English)
2. Try unusual chapter (e.g., John 30:1)
3. Should show: "Audio not available for this chapter"
4. Play button disabled

**Test 4: Network Error**
1. Go offline (devtools > Network > Offline)
2. Try to load chapter
3. Should show: "Audio failed to load. Check your connection."
4. Play button disabled
5. Go back online, retry — should work

**Test 5: Error Recovery**
1. With error showing
2. Change chapter
3. New chapter audio should attempt to load
4. Error should clear or update

### Check Console Logs

Open browser DevTools > Console:

- ❌ **Bad**: "Cannot read property 'audioFilesetId' of undefined"
- ✅ **Good**: No errors, or just console.warn from helper

---

## Part 4: Integration Test Checklist

### Full User Flow

**Scenario 1: Read + Cache Chapter**
1. Open BibleReaderPage
2. Select book/chapter (e.g., Psalms 25)
3. Text loads
4. Click "Save offline"
5. See "✓ Saved offline" badge
6. Refresh page
7. Badge still shows (cached)
8. Click "Delete offline copy"
9. Badge gone

**Scenario 2: Audio Play**
1. Open AudioBiblePage
2. English chapter loads
3. Audio URL appears (check Network tab)
4. Click play
5. Audio plays (or shows permission request)
6. Change chapter
7. New audio loads
8. Switch language to one without audio
9. "Audio not available" shows
10. Play button disabled

**Scenario 3: After Oromo Verification**
1. Run `verifyOromoFilesets` function
2. Get "✅ Verification passed"
3. Update `bibleBrainFilesetsConfig.js`
4. Open AudioBiblePage
5. Select Oromo
6. Audio should load (not show "unavailable")
7. Play works

---

## Rollout Checklist

- [ ] Test offline cache with multiple languages
- [ ] Run Oromo verification test
- [ ] If passes: Update config + docs
- [ ] Test AudioBiblePage with all enabled languages
- [ ] Test error states (network offline, bad API, etc.)
- [ ] Check console for errors/warnings
- [ ] Test on mobile device (iOS + Android)
- [ ] Verify "Audio unavailable" message appears when needed
- [ ] Deploy to production

---

## Troubleshooting

### Offline Cache Issues

**"Failed to save offline" message**
- Storage quota exceeded — user needs to clear other data
- Or app using private browsing mode — not supported

**Cache not persisting**
- Browser localStorage is enabled? (Check settings)
- Same language/book/chapter being tested?

### AudioBiblePage Issues

**"Audio not available" for enabled language**
- Check: Is language enabled in `bibleBrainFilesetsConfig.js`?
- Check: Does `audioFilesetId` have a value?
- Check: Does API key exist?
- Check: Run verification test for that language

**Play button not responding**
- Audio element not loading? Check Network tab for URL
- URL returning 404? Fileset ID is wrong
- Check browser console for errors

**Audio playing very quiet or skipping**
- Normal — speed/volume controls work (top right settings)
- Some Bibles have lower audio quality

### Verification Test Issues

**"BIBLE_BRAIN_API_KEY not set"**
- Add secret in Dashboard > Environment Variables
- Restart app

**"Forbidden: Admin access required"**
- Only admins can run verification test
- Use an admin account

**Test passes but config disabled**
- Manually update `bibleBrainFilesetsConfig.js`
- Or re-run verification test (auto-updates)

---

## Success Criteria

✅ All tests should pass before release:

- [ ] Offline cache saves/loads chapters
- [ ] Oromo filesets verified via automated test
- [ ] AudioBiblePage shows audio for enabled languages
- [ ] AudioBiblePage shows "unavailable" for disabled languages
- [ ] All error messages are user-friendly
- [ ] No console errors
- [ ] Mobile devices work properly