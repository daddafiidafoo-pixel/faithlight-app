# Oromo Bible Brain Verification Checklist

## Overview
Before enabling Oromo (om) in the app, you must verify:
1. Text fileset HAEBSE contains Psalms 25
2. Audio fileset HAEBSEDA contains Psalms 23
3. Coverage matches your app's needs

## Prerequisites
✅ `BIBLE_BRAIN_API_KEY` set in environment
✅ API key is a valid DBP v4 developer key

## Step 1: Verify Text Fileset (HAEBSE)

### Public evidence
- Bible.is publicly shows Eastern Oromo HAEBSE with Matthew 1
- This is strong evidence the fileset exists

### Test with your API key
```bash
curl "https://4.dbt.io/api/bibles/filesets/HAEBSE/PSA/25?key=YOUR_API_KEY"
```

### Expected response
- ✅ Array of verse objects with text
- Sample:
```json
[
  {
    "verse_sequence": 1,
    "text": "Waaqayyo si jaarsa...",
    "chapter": 25,
    "verse": 1
  },
  ...
]
```

### If you get an error
- ❌ 401/403 → Check API key validity
- ❌ Empty array → Fileset doesn't cover Psalms
- ❌ 404 → Fileset ID is wrong

### Conclusion
If successful:
```
✅ HAEBSE text fileset verified
→ Update bibleBrainFilesetsConfig.js: enabledText: true
```

---

## Step 2: Verify Audio Fileset (HAEBSEDA)

### Test with your API key
```bash
curl "https://4.dbt.io/api/bibles/filesets/HAEBSEDA/PSA/23?key=YOUR_API_KEY"
```

### Expected response
Should return audio asset info:
```json
{
  "data": [
    {
      "path": "https://..../HAEBSEDA_PSA_23_1.mp3",
      "verse": 1,
      "chapter": 23
    }
  ]
}
```

Or similar structure with audio URL/path.

### If you get an error
- ❌ 401/403 → Check API key validity
- ❌ Empty array → Fileset doesn't cover Psalms 23
- ❌ 404 → Audio fileset doesn't exist

### Conclusion
If successful:
```
✅ HAEBSEDA audio fileset verified
→ Update bibleBrainFilesetsConfig.js: enabledAudio: true
```

---

## Step 3: Check Chapter Coverage

If tests pass for Psalms 23 & 25, verify a few more books:

```bash
# Test Matthew
curl "https://4.dbt.io/api/bibles/filesets/HAEBSE/MAT/1?key=YOUR_API_KEY"

# Test John
curl "https://4.dbt.io/api/bibles/filesets/HAEBSE/JHN/3?key=YOUR_API_KEY"

# Test Genesis
curl "https://4.dbt.io/api/bibles/filesets/HAEBSE/GEN/1?key=YOUR_API_KEY"
```

### Success indicator
If all return verse arrays → Full OT/NT coverage ✅

### Partial coverage
If some return empty → Note which books are unavailable
Update fileset config with coverage notes

---

## Step 4: Update Configuration

### If both text & audio verified ✅

Edit `lib/bibleBrainFilesetsConfig.js`:

```javascript
om: {
  type: "biblebrain",
  textFileset: "HAEBSE",
  audioFileset: "HAEBSEDA",
  enabled: true,        // ← Change from false
  name: "Afaan Oromoo",
  verified: true,       // ← Change from false
  notes: "Verified PSA/23 audio, PSA/25 text, MAT/1",
},
```

### If only text verified ⚠️

```javascript
om: {
  type: "biblebrain",
  textFileset: "HAEBSE",
  audioFileset: null,   // ← Audio not available
  enabled: true,
  enabledText: true,
  enabledAudio: false,
  verified: false,
},
```

### If neither verified ❌

```javascript
om: {
  enabled: false,
  verified: false,
  notes: "HAEBSE text/audio not available — test failed"
},
```

---

## Step 5: Update Documentation

Update `bible-data/FILESET_REFERENCE.md`:

```markdown
| Afaan Oromoo | om | ✅ HAEBSE | ✅ HAEBSEDA | ✅ Full | Verified 2026-03-29 |
```

Change status from ⚠️ to ✅

---

## Expected Timeline

1. **Today**: Run curl tests (5 min)
2. **Today**: Update config & docs (2 min)
3. **Today**: Test in AudioBiblePage + BibleReaderPage (10 min)
4. **Done**: Oromo ready for users ✅

## Troubleshooting

### "API key not recognized"
- Verify key in `Deno.env.get("BIBLE_BRAIN_API_KEY")`
- Check key is valid in Bible Brain dashboard
- Test with simple endpoint first

### "Empty array returned"
- Fileset doesn't cover that book/chapter
- Try another book to confirm
- Check if HAEBSE is text-only (no audio)

### "Unexpected JSON structure"
- Bible Brain API might return different format
- Log full response: `console.log(JSON.stringify(data, null, 2))`
- Adjust audio helper to match actual structure

## Next: Fix AudioBiblePage

After verification, use the audio helper in `lib/audioBibleHelpers.js`:

```javascript
import { loadChapterAudio } from "@/lib/audioBibleHelpers";

// In component
const audioUrl = await loadChapterAudio({
  audioFilesetId: "HAEBSEDA",
  bookId: "PSA",
  chapter: 23,
  apiKey: BIBLE_BRAIN_API_KEY,
});
```

See `lib/audioBibleHelpers.js` for complete pattern.