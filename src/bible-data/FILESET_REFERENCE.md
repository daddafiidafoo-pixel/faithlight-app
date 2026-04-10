# Bible Brain Fileset Reference

## Important Rules

⚠️ **NEVER guess fileset IDs** - Text and audio filesets are separate in Bible Brain

✅ **Verified approach:**
1. Use confirmed fileset IDs only
2. Query Bible Brain API for audio lookups
3. Document verification source
4. Disable features until verified

## Verified Filesets

### English
- **Text**: ENGESV (English Standard Version)
  - Source: Bible.is, Bible Brain public docs
  - Status: ✅ Verified
- **Audio**: ENGESVN2DA
  - Source: Bible Brain API
  - Status: ✅ Verified

### Afaan Oromoo (Eastern Oromo)
- **Text**: HAEBSE
  - Source: Bible.is page HAEBSE/MAT/1, HAEBSE/1TH/5
  - Credit: © The Bible Society of Ethiopia, 2005
  - Status: ✅ Verified
- **Audio**: `[PENDING - Must query Bible Brain API]`
  - Query: `language="Eastern Oromo" + content_type="audio"`
  - Status: ⏳ NOT YET VERIFIED

### Amharic
- **Text**: `[Requires API lookup]`
  - Status: ⏳ Not verified
- **Audio**: `[Requires API lookup]`
  - Status: ⏳ Not verified

### Swahili
- **Text**: `[Requires API lookup]`
  - Status: ⏳ Not verified
- **Audio**: `[Requires API lookup]`
  - Status: ⏳ Not verified

### Tigrinya
- **Text**: `[Requires API lookup]`
  - Status: ⏳ Not verified
- **Audio**: `[Requires API lookup]`
  - Status: ⏳ Not verified

### Arabic
- **Text**: `[Requires API lookup]`
  - Status: ⏳ Not verified
- **Audio**: `[Requires API lookup]`
  - Status: ⏳ Not verified

## How to Verify a New Fileset

### Step 1: Query Bible Brain API

```bash
curl -H "api-key: YOUR_API_KEY" \
  "https://api.scripture.api.bible/v1/bibles?language=Eastern%20Oromo"
```

### Step 2: Check Response

Look for:
- `id`: The fileset ID (e.g., HAEBSE)
- `type.name`: Content type (Text, Audio, Audio Drama, Video)
- `name`: Display name
- `language.name`: Language

### Step 3: Test Fileset

For text:
```
https://bible.is/{FILESET_ID}/MAT/1
```

For audio, use:
```
https://api.scripture.api.bible/v1/filesets/{FILESET_ID}/books
```

### Step 4: Document

Add to this file with:
- Fileset ID
- Language
- Type (Text/Audio/Audio Drama)
- Verification source
- Date verified

## Bible Brain API Endpoints

**List Bibles by Language**
```
GET /v1/bibles?language={language_name}
Headers: api-key: YOUR_KEY
```

**Get Fileset Details**
```
GET /v1/filesets/{FILESET_ID}
Headers: api-key: YOUR_KEY
```

**Get Books in Fileset**
```
GET /v1/filesets/{FILESET_ID}/books
Headers: api-key: YOUR_KEY
```

## Update Timeline

- 2026-03-29: HAEBSE verified for Oromo text
- 2026-03-29: Created audio lookup function
- [Pending]: Audio fileset verification for all languages

## Config Status

Current config in `lib/bibleLangConfig.js`:
- ✅ English (text + audio verified)
- ✅ Oromo (text verified, audio pending)
- ⏳ Amharic (pending verification)
- ⏳ Swahili (pending verification)
- ⏳ Tigrinya (pending verification)
- ⏳ Arabic (pending verification)