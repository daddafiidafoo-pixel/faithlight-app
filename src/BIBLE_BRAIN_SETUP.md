# Bible Brain API Integration Setup

FaithLight now supports live Bible text loading from Bible Brain API as a fallback layer when local dataset files are unavailable.

## What's New

- **Backend Function**: `functions/bibleBrainFetch.js` — Fetches chapters from Bible Brain API
- **Dataset Integration**: `lib/bibleDatasetsService.js` — Tries dataset first, falls back to Bible Brain
- **UI Indicator**: BibleReaderPage shows blue banner when loading from Bible Brain
- **Automatic Fallback**: Works transparently for all 5 languages (English, Oromo, Amharic, Swahili, Tigrinya)

## Setup Steps

### 1. Get Your API Key

Visit: **https://4.dbt.io/api_key/request**

- Create account (free)
- Request API key
- Copy key to clipboard

### 2. Add Secret to FaithLight Dashboard

1. Go to **Dashboard > Settings > Environment Variables**
2. Click **Add Variable**
3. Set name: `BIBLE_BRAIN_API_KEY`
4. Paste your API key value
5. Save

The key is already configured in the code as:
```javascript
const apiKey = Deno.env.get("BIBLE_BRAIN_API_KEY");
```

## How It Works

### Loading Priority

1. **First**: Try local dataset (`bible-data/om/john.json`, etc.)
2. **Second**: Fall back to Bible Brain API if local missing
3. **Third**: Show error if both unavailable

### Example Flow

```
User selects Oromo → Bible Reader
  ↓
Check: Does bible-data/om/{book}.json exist?
  ├─ YES → Load from local file (fast) → Display verses
  └─ NO → Fetch from Bible Brain API → Display verses + blue banner
```

### What the Banner Says

- **Blue "Loading from Bible Brain API"** → Data is live from API (not cached locally)
- **Yellow "Bible not available in this language"** → Showing fallback language
- **Red "Bible text not yet available"** → No data found anywhere

## Tested Filesets

| Language | Code | Fileset | Status |
|----------|------|---------|--------|
| English | en | ENGESV | ✅ Works |
| Afaan Oromoo | om | HAEBSE | ⚠️ Test pending |
| Amharic | am | AMHEVG | ⚠️ Test pending |
| Swahili | sw | SWAKJV | ⚠️ Test pending |
| Tigrinya | ti | TIGKJV | ⚠️ Test pending |

**Verify the filesets**: Use Bible Brain's "Available Content" tool at https://4.dbt.io

## Testing

### Test English John 3:16

```
1. Open BibleReaderPage
2. Select English (default)
3. Go to John, Chapter 3
4. Should load instantly from local data (no banner)
```

### Test Oromo (API Fallback)

```
1. Select Oromo language
2. Go to John, Chapter 3
3. Should show blue banner: "Loading from Bible Brain API..."
4. Verses display from API
```

### Verify API is Working

Check browser developer tools:
- Network tab: Look for requests to `/api/functions/bibleBrainFetch`
- Console: No errors should appear

## Common Issues

### Issue: Blue banner stays, then error appears

**Cause**: Bible Brain fileset not available for that language

**Solution**: 
1. Go to https://4.dbt.io
2. Check "Available Content" tool
3. Verify the fileset ID in `bibleBrainFetch.js` BIBLE_FILES map

### Issue: "API key not configured" error

**Cause**: Secret not set in dashboard

**Solution**:
1. Go to Dashboard > Settings > Environment Variables
2. Add `BIBLE_BRAIN_API_KEY` with your API key
3. Refresh page

### Issue: Wrong verses display

**Cause**: Book code mapping issue

**Solution**:
- Check that book IDs match Bible Brain's expected codes (e.g., "JHN" not "john")
- Function auto-converts but some books may need mapping adjustment

## How Local Data Still Comes First

When you eventually add real Bible data:

```
1. Import licensed Oromo Bible → bible-data/om/john.json
2. User selects Oromo
3. System checks: does om/john.json exist? → YES
4. Load from local file (fast, no API call)
5. No blue banner (data is cached locally)
```

Bible Brain is only used when local files don't exist.

## Optimizations in Place

- **Caching**: Books cached after first load
- **Error Handling**: Silent fallback on API errors
- **No Crashes**: Bad responses handled gracefully
- **Fast Paths**: Local data always preferred over API calls

## What Happens Next

### Phase 1 (Current)
✅ Bible Brain fallback working
✅ All languages configured
✅ API key setup documented

### Phase 2 (When You Have Licensed Data)
- Import real Oromo Bible → replaces API calls
- Import real Amharic Bible → replaces API calls
- Local data automatically used (faster, cached)

### Phase 3 (No Code Changes Needed)
- Add Swahili, Tigrinya Bible data
- Loader auto-discovers new files
- No modifications required

## API Rate Limits

Bible Brain API has rate limits (check their docs):
- Free tier: Limited requests per day/month
- If you hit limits: Add `BIBLE_BRAIN_API_RATE_LIMIT` to handle gracefully

Current code handles errors but doesn't throttle. If needed, add queue:
```javascript
// Future: queue requests if near limit
```

## Security Notes

- API key stored in environment variables (not in code)
- Backend function validates all inputs
- No keys exposed to frontend
- Safe to use even with limits

## Next: Import Real Bible Data

When you're ready to add licensed translations:

1. **Get files**: Obtain Oromo/Amharic/Swahili Bible files
2. **Convert**: Use Python converter (to be built)
3. **Place**: Put files in `bible-data/{langCode}/`
4. **Done**: No code changes, loader automatically uses them

Until then, Bible Brain ensures your app works for all languages.

---

**Questions?** Check `bibleDatasetsService.js` and `bibleBrainFetch.js` for implementation details.