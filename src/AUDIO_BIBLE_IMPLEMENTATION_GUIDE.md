# Audio Bible Implementation Guide

## Overview
This guide shows how to fix AudioBiblePage using the new helper modules and proper fileset architecture.

## Current Problem
AudioBiblePage renders a player UI, but:
- No audio source loads
- Language selection doesn't affect audio fileset
- No error handling for missing audio
- No fallback when audio unavailable

## Root Cause
Text fileset ≠ audio fileset. The page needs to:
1. Load language configuration
2. Check if audio is actually available
3. Resolve the correct audio fileset for that language
4. Fetch chapter audio from Bible Brain API
5. Attach URL to audio element

## Solution Architecture

### 1. Configuration Layer
✅ **Already created**: `lib/bibleBrainFilesetsConfig.js`
- Separate `textFilesetId` and `audioFilesetId`
- `enabledText` and `enabledAudio` flags
- Verified status tracking

### 2. Helper Layer
✅ **Already created**: `lib/audioBibleHelpers.js`
- `loadChapterAudio()` → Get audio URL from Bible Brain
- `attachAudioSource()` → Load audio with error handling
- `isAudioAvailable()` → Check if language supports audio
- `formatAudioError()` → User-friendly error messages

### 3. Caching Layer (Optional)
✅ **Already created**: `lib/offlineCacheStrategy.js`
- Level 1: Light passive caching (safe)
- Service Worker caching (optional)
- `cacheChapterText()` + `getCachedChapter()`

## Implementation Steps

### Step 1: Update AudioBiblePage Structure

Current flow (broken):
```
User selects language
  → Assume text fileset = audio fileset
  → Try to play (fails, wrong fileset)
```

New flow (fixed):
```
User selects language
  → Load config: getFileset(languageCode)
  → Check: isAudioAvailable(config)?
    ✅ YES → Load audio
    ❌ NO → Show message "Audio not available in this language"
  → Load chapter: loadChapterAudio(...)
  → Attach to element: audioEl.src = url
```

### Step 2: Import Helpers

In `pages/AudioBiblePage.jsx`:

```javascript
import { getFileset, isLanguageReady } from "@/lib/bibleBrainFilesetsConfig";
import {
  loadChapterAudio,
  attachAudioSource,
  isAudioAvailable,
  formatAudioError,
} from "@/lib/audioBibleHelpers";
import { getCachedChapter, cacheChapterText } from "@/lib/offlineCacheStrategy";
```

### Step 3: Update Language Selection Handler

```javascript
const handleLanguageChange = async (newLanguageCode) => {
  setSelectedLanguage(newLanguageCode);
  
  // Load config for new language
  const config = getFileset(newLanguageCode);
  setLanguageConfig(config);

  // Check audio availability
  const canPlayAudio = isAudioAvailable(config);
  setAudioAvailable(canPlayAudio);

  if (!canPlayAudio) {
    setMessage("Audio is not available in this language.");
    return;
  }

  // Preload current chapter if needed
  if (currentBook && currentChapter) {
    await loadAudio(newLanguageCode, currentBook, currentChapter);
  }
};
```

### Step 4: Update Audio Loading Function

```javascript
const loadAudio = async (languageCode, bookId, chapter) => {
  try {
    setLoading(true);
    setError(null);

    const config = getFileset(languageCode);

    // Check audio available
    if (!isAudioAvailable(config)) {
      setError("Audio not available for this language");
      setLoading(false);
      return;
    }

    // Load audio URL from Bible Brain
    const audioUrl = await loadChapterAudio({
      audioFilesetId: config.audioFilesetId,
      bookId: bookId,
      chapter: chapter,
      apiKey: import.meta.env.VITE_BIBLE_BRAIN_API_KEY,
    });

    // Attach to audio element
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setCurrentUrl(audioUrl);
    }

    setLoading(false);
  } catch (err) {
    const friendlyError = formatAudioError(err, "Audio");
    setError(friendlyError);
    setLoading(false);
  }
};
```

### Step 5: Update Render Logic

#### Show/Hide Play Button Based on Audio Availability

```javascript
return (
  <div className="audio-player-container">
    {/* Language Selector */}
    <div>
      <label>Language</label>
      <select 
        value={selectedLanguage} 
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        {getEnabledLanguages().map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>

    {/* Audio Not Available Message */}
    {languageConfig && !isAudioAvailable(languageConfig) && (
      <div className="alert alert-info">
        Audio is not available in {languageConfig.name} for this chapter.
      </div>
    )}

    {/* Error Message */}
    {error && (
      <div className="alert alert-error">{error}</div>
    )}

    {/* Audio Element & Controls */}
    {audioAvailable && (
      <audio 
        ref={audioRef}
        controls 
        style={{ width: "100%" }}
      >
        Your browser does not support audio.
      </audio>
    )}

    {/* Loading State */}
    {loading && <p>Loading audio...</p>}
  </div>
);
```

### Step 6: Add Offline Caching (Optional)

After successfully loading audio, cache it:

```javascript
// In loadAudio() after audio element loads
audioRef.current.addEventListener("loadedmetadata", () => {
  // Chapter text already loaded from API
  const cachedVerses = getCachedChapter(languageCode, bookId, chapter);
  if (cachedVerses) {
    // Already cached
    console.log("Using cached text");
  } else {
    // Cache for offline reading
    cacheChapterText(languageCode, bookId, chapter, verses);
  }
});
```

## Testing Checklist

### Before release:

- [ ] English audio plays ✅
- [ ] Swahili audio plays ✅
- [ ] French audio plays ✅
- [ ] Arabic audio plays ✅
- [ ] Oromo shows "not available" message (until verified)
- [ ] Amharic shows "not available" message (until verified)
- [ ] Tigrinya shows audio-only (no text reader)
- [ ] Language selector updates audio properly
- [ ] Error message shows if audio fails to load
- [ ] "Loading..." indicator appears during fetch

### After Oromo verification:

- [ ] Update config: `om: { enabled: true, verified: true }`
- [ ] Test Oromo Psalm 23 audio
- [ ] Test Oromo Psalm 25 text
- [ ] Verify no errors in console

## Integration with BibleReaderPage

BibleReaderPage already handles text properly. Just ensure:

```javascript
import { getFileset, isLanguageReady } from "@/lib/bibleBrainFilesetsConfig";

// Show text-only message if no audio
const config = getFileset(selectedLanguage);
if (!isAudioAvailable(config) && hasAudioButton) {
  showToast("Audio not available for this chapter");
}
```

## Rollout Plan

### Week 1: Deploy base infrastructure
- ✅ bibleBrainFilesetsConfig.js (done)
- ✅ audioBibleHelpers.js (done)
- ✅ offlineCacheStrategy.js (done)
- Update AudioBiblePage to use new helpers

### Week 2: Test verified languages
- Test English, Swahili, French, Arabic
- Fix any API response format issues
- Update tests

### Week 3: Verify Oromo & Amharic
- Run OROMO_TEST_CHECKLIST.md
- If passes: enable in config
- Update FILESET_REFERENCE.md

### Week 4: Launch with all languages
- All verified languages enabled
- Offline caching working
- Error handling comprehensive

## Troubleshooting

### Audio element renders but no sound
- Check browser console for errors
- Verify audio URL is valid CORS
- Test audio URL directly in browser

### "Audio not available" for verified language
- Check audioFilesetId in config
- Verify enabledAudio: true
- Test fileset with curl (see OROMO_TEST_CHECKLIST.md)

### Network error in console
- Check BIBLE_BRAIN_API_KEY in environment
- Verify API key is still valid
- Test with curl first

### Empty verses array returned
- Fileset doesn't cover that book/chapter
- Update config notes
- Show user-friendly message

## Reference Files

- `lib/bibleBrainFilesetsConfig.js` — Language configuration
- `lib/audioBibleHelpers.js` — Audio loading + validation
- `lib/offlineCacheStrategy.js` — Caching layer
- `bible-data/OROMO_TEST_CHECKLIST.md` — Verification steps
- `bible-data/FILESET_REFERENCE.md` — Current status table