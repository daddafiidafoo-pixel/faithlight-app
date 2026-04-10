# Bible Brain Audio Integration Guide

## Architecture Overview

The app now uses a verified Bible Brain audio system with the following components:

### 1. **Runtime Configuration** (`lib/bibleBrainRuntimeConfig.js`)
Defines which languages have verified audio filesets:
- `enabledAudio`: Only `true` after audio fileset is verified and tested
- `audioFilesetId`: Real audio fileset ID (never guessed from text ID)
- `enabledText`: Text availability (separate from audio)

**Key Rule**: Oromo audio stays `false` until a verified fileset is discovered.

```javascript
om: {
  enabledText: true,
  enabledAudio: false,  // Disabled until verified
  textFilesetId: "OMAFAO",
  audioFilesetId: null,  // No verified audio yet
}
```

### 2. **Audio Helpers** (`lib/audioBibleHelpers.js`)

#### `fetchBibleBrainAudioTrack({ language, bookId, chapter, apiKey })`
- Checks if audio is enabled for the language
- Fetches chapter audio from Bible Brain API
- Extracts signed URL from response
- Throws error if no playable URL is returned

```javascript
const track = await fetchBibleBrainAudioTrack({
  language: "en",
  bookId: "JHN",
  chapter: 3,
  apiKey: "YOUR_BIBLE_BRAIN_KEY"
});
```

#### `verifyPlayableAudio(url)`
Tests if a URL can load audio metadata:
- Waits for `loadedmetadata` event
- 10-second timeout
- Returns `true` only if metadata loads successfully

```javascript
const isPlayable = await verifyPlayableAudio(signedUrl);
if (!isPlayable) {
  // Show error, don't enable playback
}
```

#### `formatAudioError(error, language = "en")`
Converts errors to user-safe messages:
- English: "Audio is not available for this chapter."
- Oromo: "Sagaleen Afaan Oromootiin amma hin mirkanoofne."

### 3. **Global Audio Store** (`components/audio/useAudioPlayerStore.js`)

Single source of truth for playback state across the app.

**State**:
- `currentTrack`: `{ url, language, bookId, chapter, title }`
- `isPlaying`, `isLoading`, `error`
- `currentTime`, `duration`

**Methods**:
- `loadTrack(track)`: Loads and validates audio metadata
- `play()`: Starts playback
- `pause()`: Pauses playback
- `toggle()`: Play/pause toggle
- `stop()`: Stops and resets
- `setTime(seconds)`: Seek to time
- `clearError()`: Dismiss error message

### 4. **Persistent Audio Bar** (`components/audio/PersistentAudioBar.jsx`)

Floats at bottom of app, shows current playback status.

**Features**:
- Play/pause/skip controls
- Progress bar with seek
- Collapsed and expanded views
- Error display with dismiss button
- Play button disabled if no valid URL

### 5. **Chapter Cache** (`lib/bibleChapterCacheService.js`)

Caches successful audio responses for 5 minutes.

```javascript
import { getCachedTrack, cacheTrack } from "@/lib/bibleChapterCacheService";

const cached = getCachedTrack("en", "JHN", 3);
if (cached) {
  // Use cached track
} else {
  // Fetch fresh
}
```

---

## Usage Example: AudioBiblePage

```javascript
import { fetchBibleBrainAudioTrack } from "@/lib/audioBibleHelpers";
import { useAudioPlayerStore } from "@/components/audio/useAudioPlayerStore";

function PlayChapter() {
  const { loadTrack, play } = useAudioPlayerStore();

  const handlePlay = async () => {
    try {
      // 1. Fetch audio from Bible Brain
      const track = await fetchBibleBrainAudioTrack({
        language: "en",
        bookId: "PSA",
        chapter: 23,
        apiKey: import.meta.env.VITE_BIBLE_BRAIN_API_KEY,
      });

      // 2. Load into global store (validates metadata)
      await loadTrack(track);

      // 3. Play (only if metadata loaded)
      await play();
    } catch (error) {
      // Error is stored in store and shown in PersistentAudioBar
      console.error("Audio failed:", error);
    }
  };

  return <button onClick={handlePlay}>Play Psalm 23</button>;
}
```

---

## Oromo Audio Handling

### Current Status
Oromo audio is **disabled** by default:

```javascript
om: {
  enabledText: true,
  enabledAudio: false,
  audioFilesetId: null,
}
```

### When to Enable
Only enable Oromo audio after:
1. **Discovery**: Find Oromo audio fileset ID (e.g., `OMAFAN2DA`)
2. **Verification**: Test chapter fetch returns playable signed URL
3. **Metadata**: Audio element successfully loads `loadedmetadata`

### UI Behavior
When Oromo is selected and audio is unavailable:

```
┌─────────────────────────────┐
│  🔊 Audio Bible             │
├─────────────────────────────┤
│  ⚠️  Audio not yet          │
│      available              │
├─────────────────────────────┤
│                             │
│  [ Play button DISABLED ]   │
│                             │
└─────────────────────────────┘
```

Error message shown in `PersistentAudioBar`:
> Sagaleen Afaan Oromootiin amma hin mirkanoofne.

---

## Workflow: Add New Language Audio

### 1. Find Audio Fileset
Use Bible Brain Discovery API:
```bash
curl "https://4.dbt.io/api/bibles?fileset_type=audio_drama&language_code=om"
```

Look for entry with `code` like `OMAFAN2DA`.

### 2. Update Runtime Config
```javascript
// lib/bibleBrainRuntimeConfig.js
om: {
  enabledText: true,
  enabledAudio: true,  // ✅ Enable after verification
  textFilesetId: "OMAFAO",
  audioFilesetId: "OMAFAN2DA",  // New verified ID
}
```

### 3. Test Chapter Fetch
```javascript
const track = await fetchBibleBrainAudioTrack({
  language: "om",
  bookId: "JHN",
  chapter: 1,
  apiKey: "YOUR_KEY",
});
console.log(track.url);  // Should be a signed CDN URL
```

### 4. Test Playback
```javascript
const isPlayable = await verifyPlayableAudio(track.url);
if (isPlayable) {
  // Safe to enable in UI
  await loadTrack(track);
  await play();
}
```

### 5. Deploy
Push update to `bibleBrainRuntimeConfig.js` and test live.

---

## Error Scenarios

### Scenario 1: Audio Fileset Not Found
**Error**: "Audio not available for language: om"
**Cause**: No verified audio fileset ID
**Solution**: Keep `enabledAudio: false` in config

### Scenario 2: Chapter Has No Audio
**Error**: "No playable audio URL returned for this chapter."
**Cause**: Bible Brain returned empty `data.path`
**Solution**: Show user-safe message, not raw error

### Scenario 3: Signed URL Expired
**Error**: Audio metadata fails to load
**Cause**: Signed URL is time-limited
**Solution**: Cache invalidates after 5 minutes, user retries

### Scenario 4: Network Timeout
**Error**: "Audio load timeout."
**Cause**: Metadata not loaded in 10 seconds
**Solution**: Show error, disable play button, allow retry

---

## Testing Checklist

- [ ] English audio plays for a known chapter
- [ ] Progress bar updates during playback
- [ ] Seek works (click on progress bar)
- [ ] Play/pause/stop buttons sync across pages
- [ ] Persistent bar stays visible during navigation
- [ ] Oromo play button is disabled (not spinning forever)
- [ ] Error message appears if URL fails
- [ ] Cache reuses tracks within 5 minutes
- [ ] Speed/volume controls work (if implemented)

---

## API Reference

### Bible Brain Audio Endpoint
```
GET https://4.dbt.io/api/bibles/filesets/{audioFilesetId}/{bookId}/{chapter}?key={apiKey}

Response:
{
  "data": [
    {
      "path": "https://cdn.example.com/audio.m4a?signature=...",
      ...
    }
  ]
}
```

### Fileset ID Examples
- English ESV: `ENGESVN2DA`
- Oromo (if available): `OMAFAN2DA`
- Amharic (if available): `AMHAETHIO`

---

## Dependencies

- `zustand`: Global state management
- `lucide-react`: UI icons
- `date-fns`: Time formatting
- No external audio libraries (using native HTML5 Audio API)

---

## Future Enhancements

1. **Playback Speed**: Scale audio playback speed
2. **Volume Control**: Save user volume preference
3. **Bookmarks**: Store favorite playback positions
4. **Offline Playback**: Cache audio for offline use
5. **Sleep Timer**: Auto-pause after N minutes
6. **Continuous Playback**: Auto-play next chapter