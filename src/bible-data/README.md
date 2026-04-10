# FaithLight Bible Dataset

This directory contains the Bible dataset files for the FaithLight application, supporting multiple languages with graceful fallback behavior.

## Directory Structure

```
bible-data/
├── manifest.json          # Language configurations and metadata
├── schema.json            # JSON schema for book files
├── en/                    # English Bible
│   ├── genesis.json
│   ├── john.json
│   ├── psalms.json
│   └── ... (one file per book)
├── om/                    # Afaan Oromoo Bible
│   ├── genesis.json
│   ├── john.json
│   └── ...
├── am/                    # Amharic Bible
├── sw/                    # Swahili Bible
└── ti/                    # Tigrinya Bible
```

## Supported Languages

| Code | Name | Native | Status |
|------|------|--------|--------|
| `en` | English | English | ✓ Active |
| `om` | Afaan Oromoo | Afaan Oromoo | ✓ Active |
| `am` | Amharic | አማርኛ | ✓ Active |
| `sw` | Swahili | Kiswahili | ✓ Active |
| `ti` | Tigrinya | ትግርኛ | ✓ Active |

## File Format

Each book file is a JSON document following the schema defined in `schema.json`.

### Example: John 3:16 in English

```json
{
  "meta": {
    "language": "en",
    "language_name": "English",
    "version_id": "english_bible",
    "version_name": "English Bible",
    "direction": "ltr"
  },
  "book_id": "john",
  "book_name": "John",
  "book_abbr": "Jhn",
  "chapters": [
    {
      "chapter": 3,
      "verses": [
        {
          "verse": 16,
          "text": "For God so loved the world, that he gave his only begotten Son..."
        }
      ]
    }
  ]
}
```

### Example: Same passage in Oromo

```json
{
  "meta": {
    "language": "om",
    "language_name": "Afaan Oromoo",
    "version_id": "oromo_bible",
    "version_name": "Afaan Oromoo Bible",
    "direction": "ltr"
  },
  "book_id": "john",
  "book_name": "Yohannis",
  "book_abbr": "Yoh",
  "chapters": [
    {
      "chapter": 3,
      "verses": [
        {
          "verse": 16,
          "text": "Waaqi addunyaa itti gaaffatee ilma isaa tokko kan isa jidduu baase ni dhaabe..."
        }
      ]
    }
  ]
}
```

## manifest.json

The `manifest.json` file defines all available languages and their configurations:

```json
{
  "languages": {
    "en": {
      "code": "en",
      "language_name": "English",
      "native_name": "English",
      "version_id": "english_bible",
      "version_name": "English Bible",
      "direction": "ltr",
      "bibleAvailable": true,
      "fallbackLanguage": null
    },
    "om": {
      "code": "om",
      "language_name": "Afaan Oromoo",
      "native_name": "Afaan Oromoo",
      "version_id": "oromo_bible",
      "version_name": "Afaan Oromoo Bible",
      "direction": "ltr",
      "bibleAvailable": true,
      "fallbackLanguage": "en"
    }
  },
  "bookOrder": ["genesis", "exodus", ..., "revelation"],
  "timestamp": "2026-03-29T00:00:00Z",
  "format_version": "1.0"
}
```

## Using the Bible Dataset Service

The `lib/bibleDatasetsService.js` module provides utilities for loading verses and chapters:

```javascript
import { getVerse, getChapter, getAvailableBooks } from '@/lib/bibleDatasetsService';

// Load a single verse
const verse = await getVerse({
  bookId: 'john',
  chapter: 3,
  verse: 16,
  selectedLanguage: 'om'  // Request Oromo
});

if (verse.success) {
  console.log(verse.text);           // "Waaqi addunyaa itti gaaffatee..."
  console.log(verse.bookName);       // "Yohannis"
  console.log(verse.fallbackUsed);   // true/false
}

// Load a full chapter
const chapter = await getChapter({
  bookId: 'psalms',
  chapter: 23,
  selectedLanguage: 'om'
});

if (chapter.success) {
  chapter.verses.forEach(v => console.log(`${v.verse}: ${v.text}`));
}

// List available books for a language
const books = await getAvailableBooks('om');
console.log(books); // [{ id: 'john', name: 'Yohannis', chapters: 21 }, ...]
```

## Fallback Behavior

When a user requests content in a language:

1. **Try selected language first** - Load from `bible-data/{selectedLanguage}/{bookId}.json`
2. **If missing, use fallback** - If configured in manifest, load from fallback language
3. **Return metadata** - The result includes:
   - `fallbackUsed: boolean` - Whether fallback was needed
   - `fallbackLanguage: string` - Which language was actually loaded
   - `selectedLanguage: string` - What was originally requested

### Example Response with Fallback

```javascript
{
  success: true,
  verse: 16,
  chapter: 3,
  text: "For God so loved the world...",  // English text
  language: "en",                          // Actually loaded in English
  languageName: "English",
  fallbackUsed: true,                      // Oromo was requested but unavailable
  fallbackLanguage: "en",                  // Fell back to English
  selectedLanguage: "om",                  // User requested Oromo
  bookId: "john",
  bookName: "John",
  reference: "John 3:16"
}
```

## Adding a New Language

To add support for a new language (e.g., French):

1. **Update `manifest.json`**:
   ```json
   "fr": {
     "code": "fr",
     "language_name": "French",
     "native_name": "Français",
     "version_id": "french_bible",
     "version_name": "French Bible",
     "direction": "ltr",
     "bibleAvailable": true,
     "fallbackLanguage": "en"
   }
   ```

2. **Create language folder**: `bible-data/fr/`

3. **Add book files**: `bible-data/fr/genesis.json`, `bible-data/fr/john.json`, etc.

4. **Clear caches** (in development):
   ```javascript
   import { clearCaches } from '@/lib/bibleDatasetsService';
   clearCaches();
   ```

## Data Requirements

For a complete Bible:
- **66 books** (39 OT + 27 NT)
- **1,189 chapters**
- **31,102 verses**

### Book Order

OT (39 books): Genesis through Malachi
NT (27 books): Matthew through Revelation

Full list in `manifest.bookOrder` array.

## Licensing & Copyright

When adding new language files:
- Ensure you have permission to use the Bible translation
- Update `copyright` field in book metadata
- Document the source and license in this README
- Consider public domain sources (e.g., older translations)

## Testing

Sample placeholder files are provided for testing:
- `en/john.json` - English John with John 1:1-3 and John 3:16-17
- `en/psalms.json` - English Psalms 23 (sample)
- `om/john.json` - Oromo translation of the same passages
- `om/psalms.json` - Oromo Psalms 23

These are for **structure testing only** and not complete translations.

## API Reference

See `lib/bibleDatasetsService.js` for full API documentation:

- `loadManifest()` - Get manifest data
- `getLanguageConfig(langCode)` - Get language metadata
- `getAllLanguages()` - List all languages
- `getVerse({bookId, chapter, verse, selectedLanguage})` - Load single verse
- `getChapter({bookId, chapter, selectedLanguage})` - Load full chapter
- `getAvailableBooks(langCode)` - List books for a language
- `getLocalizedBookName(bookId, langCode)` - Get localized book name
- `getDatasetStatus()` - Get overall dataset health
- `clearCaches()` - Clear in-memory caches

## Implementation Notes

- **Lazy loading**: Book files are loaded on-demand and cached
- **Fallback transparent**: UI only shows selected language unless explicitly queried
- **No crashes**: All functions handle missing files gracefully
- **Future-proof**: Adding languages requires no code changes, only config + files