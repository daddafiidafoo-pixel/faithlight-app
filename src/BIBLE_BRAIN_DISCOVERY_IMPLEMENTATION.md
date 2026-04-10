# Bible Brain Auto-Discovery + Verification System

**Status**: Implementation Guide  
**Date**: 2026-03-30  
**Goal**: Stop guessing fileset IDs. Auto-discover, verify, cache, and enable languages safely.

---

## Architecture Overview

### Three Core Services

1. **bibleBrainDiscoveryService.js**
   - Queries Bible Brain API for available filesets by language
   - Verifies text filesets (fetch John 3, check verse text)
   - Verifies audio filesets (fetch Psalms 23, check audio metadata)
   - Returns verified fileset IDs only

2. **bibleChapterCacheService.js**
   - Caches discovered filesets (7 days)
   - Caches fetched chapters (30 days)
   - Enables offline reading of previously fetched content
   - Clear expired cache automatically

3. **bibleBrainRuntimeConfig.js**
   - Stores verified discovery results
   - Enables only what works
   - Provides language status and user messages
   - Never contains hardcoded guessed IDs

---

## Workflow

```
User selects language
    ↓
Check runtime config (is it verified?)
    ├─ YES → Use enabled fileset IDs
    └─ NO → Run discovery + verification
              ↓
         Query Bible Brain API
              ↓
         Test with known chapters (John 3, Psalms 23)
              ↓
         Save verified IDs to cache + runtime config
              ↓
         Enable language if verified
```

---

## Implementation Steps

### Step 1: Create Discovery Service

**File**: `lib/bibleBrainDiscoveryService.js`

Functions:
- `discoverFilesets(languageCode)` — Query API for available filesets
- `verifyTextFileset(languageCode, filesetId)` — Test with John 3
- `verifyAudioFileset(languageCode, filesetId)` — Test with Psalms 23
- `discoverAndVerifyLanguage(languageCode)` — Full workflow
- `discoverAllLanguages(languages)` — Batch discovery

**Example usage**:
```javascript
import { discoverAndVerifyLanguage } from '@/lib/bibleBrainDiscoveryService';
import { cacheDiscoveredFileset } from '@/lib/bibleChapterCacheService';
import { updateConfigFromDiscovery } from '@/lib/bibleBrainRuntimeConfig';

// Discover Oromo
const discovery = await discoverAndVerifyLanguage('om');

// Cache result
await cacheDiscoveredFileset('om', discovery);

// Update runtime config
updateConfigFromDiscovery('om', discovery);
```

---

### Step 2: Create Cache Service

**File**: `lib/bibleChapterCacheService.js`

Functions:
- `cacheDiscoveredFileset(languageCode, discovery)` — Save fileset discovery
- `getCachedFileset(languageCode)` — Retrieve cached fileset (7 days)
- `cacheChapter(languageCode, filesetId, book, chapter, verses)` — Save chapter
- `getCachedChapter(languageCode, filesetId, book, chapter)` — Retrieve cached chapter (30 days)
- `clearExpiredCache()` — Clean old entries
- `clearAllCache()` — Reset all cache

**Storage**:
- IndexedDB: `faithlight_bible_cache`
- Stores: `filesets`, `chapters`

---

### Step 3: Create Runtime Config

**File**: `lib/bibleBrainRuntimeConfig.js`

State shape:
```javascript
{
  om: {
    source: 'biblebrain',
    textFilesetId: 'VERIFIED_ID', // or null
    audioFilesetId: 'VERIFIED_ID', // or null
    enabledText: true,              // true only if verified
    enabledAudio: false,            // true only if verified
    status: 'verified',             // pending | verified | unavailable | failed
    message: null,                  // user-friendly unavailable message
    lastVerifiedAt: '2026-03-30T...',
  }
}
```

Functions:
- `updateConfigFromDiscovery(languageCode, discovery)` — Update from discovery
- `getLanguageConfig(languageCode)` — Get config for one language
- `getEnabledTextLanguages()` — Get all languages with text enabled
- `getEnabledAudioLanguages()` — Get all languages with audio enabled
- `isTextEnabled(languageCode)` — Quick check
- `isAudioEnabled(languageCode)` — Quick check
- `getUnavailableMessage(languageCode)` — User-friendly message

---

### Step 4: Update BibleReaderPage

**Fallback chain** (in order):

1. Check local licensed dataset (if exists and verified)
2. Check runtime config for enabled text fileset
3. Fetch from Bible Brain API (if cached, use cache)
4. Show clean unavailable message

**Code pattern**:
```javascript
import { getLanguageConfig, isTextEnabled } from '@/lib/bibleBrainRuntimeConfig';
import { getCachedChapter, cacheChapter } from '@/lib/bibleChapterCacheService';
import { discoverAndVerifyLanguage } from '@/lib/bibleBrainDiscoveryService';

async function loadChapter(languageCode, book, chapter) {
  // 1. Check if verified
  const config = getLanguageConfig(languageCode);
  if (!isTextEnabled(languageCode)) {
    // Show unavailable message
    return null;
  }

  // 2. Check cache
  const cached = await getCachedChapter(languageCode, config.textFilesetId, book, chapter);
  if (cached) {
    return { verses: cached.verses, source: 'cache' };
  }

  // 3. Fetch from API
  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;
  const url = `https://4.dbt.io/api/bibles/filesets/${config.textFilesetId}/${book}/${chapter}?key=${apiKey}`;
  const response = await fetch(url);
  const verses = await response.json();

  // Cache result
  if (verses.length > 0) {
    await cacheChapter(languageCode, config.textFilesetId, book, chapter, verses);
  }

  return { verses, source: 'api' };
}
```

---

### Step 5: Update AudioBiblePage

**Rules**:
- Only show playable UI if `enabledAudio` is true
- Show clear unavailable message if false
- Use cached chapters when available

**Code pattern**:
```javascript
import { isAudioEnabled, getUnavailableMessage } from '@/lib/bibleBrainRuntimeConfig';

function AudioBiblePage() {
  const bibleLanguage = useLanguageStore(s => s.bibleLanguage);
  const audioEnabled = isAudioEnabled(bibleLanguage);

  if (!audioEnabled) {
    return (
      <div className="p-4">
        <p className="text-center text-slate-600">
          {getUnavailableMessage(bibleLanguage)}
        </p>
      </div>
    );
  }

  // Render playable UI...
}
```

---

### Step 6: Add Initialization Logic

**Create**: `lib/bibleBrainInitializer.js`

Function: Run discovery on app startup (once per 7 days).

```javascript
import { discoverAllLanguages } from '@/lib/bibleBrainDiscoveryService';
import { getCachedFileset, cacheDiscoveredFileset } from '@/lib/bibleChapterCacheService';
import { updateConfigFromDiscovery } from '@/lib/bibleBrainRuntimeConfig';

export async function initializeBibleBrain() {
  const languages = ['om', 'am', 'sw', 'ar'];

  for (const lang of languages) {
    // Check cache
    const cached = await getCachedFileset(lang);
    if (cached) {
      updateConfigFromDiscovery(lang, cached);
      continue;
    }

    // Run discovery
    const discovery = await discoverAndVerifyLanguage(lang);
    await cacheDiscoveredFileset(lang, discovery);
    updateConfigFromDiscovery(lang, discovery);
  }

  console.log('[Bible] Initialization complete');
}
```

Call on app startup (Layout component or App.jsx):

```javascript
useEffect(() => {
  initializeBibleBrain();
}, []);
```

---

## Key Rules

### 1. Discovery First
- Never hardcode fileset IDs in config
- Query API for official truth
- Cache results to avoid repeated queries

### 2. Verification Required
- Text: Fetch John 3, verify verse text exists
- Audio: Fetch Psalms 23, verify audio URLs exist
- Only enable if verification passes

### 3. UI Respects Config
- enabledText → show Bible reader
- enabledAudio → show audio player
- Disabled → show clean unavailable message

### 4. Offline Support
- Cache successful chapter fetches (30 days)
- Show cached chapters when offline
- Show clean offline message for uncached chapters
- Do NOT guess fileset IDs for offline mode

### 5. No Guessing
- Do NOT assume text and audio filesets have same ID
- Do NOT infer fileset IDs from naming patterns
- Do NOT hardcode any fileset ID as truth
- Always discover and verify first

---

## Testing Checklist

For each enabled language:

**Text Discovery & Verification**
- [ ] Discovery queries Bible Brain API for filesets
- [ ] Text fileset found and ID stored
- [ ] John 3 fetch succeeds
- [ ] Verse text is non-empty
- [ ] Text marked as verified
- [ ] Config shows enabledText: true

**Audio Discovery & Verification**
- [ ] Audio fileset found and ID stored
- [ ] Psalms 23 fetch succeeds
- [ ] Audio URLs/paths exist
- [ ] Audio marked as verified
- [ ] Config shows enabledAudio: true

**Caching**
- [ ] Fileset discovery cached (7 days)
- [ ] Chapter content cached (30 days)
- [ ] Cached fileset retrieved without API call
- [ ] Cached chapter retrieved without API call

**UI Behavior**
- [ ] Language appears in reader dropdown if text enabled
- [ ] Language appears in audio dropdown if audio enabled
- [ ] Unavailable message shows if disabled
- [ ] Refresh button re-verifies and updates cache

**Offline**
- [ ] Open cached chapter in airplane mode
- [ ] Chapter still displays
- [ ] Uncached chapter shows offline message
- [ ] No fake verse displayed

---

## FAQ

**Q: What if a fileset can't be discovered?**  
A: Status = "unavailable", language stays disabled. User sees clean message.

**Q: What if discovery succeeds but verification fails?**  
A: Fileset ID is set to null, language stays disabled.

**Q: Can I manually override a fileset ID?**  
A: No. Always use discovered, verified IDs.

**Q: What if Bible Brain API is down?**  
A: Use cached fileset results. If cache is expired, show unavailable message.

**Q: Do I need to run discovery for every language at startup?**  
A: No. Check cache first. Only discover if cache is expired (7 days).

---

## Important Note

Bible Brain supports multiple filesets per Bible version, and text and audio filesets have different IDs. They are NOT safe to infer from naming patterns alone. This system **discovers + verifies** each language before enabling it, ensuring users always see real, working Bible content—never guessed, cached, or broken fileset IDs.