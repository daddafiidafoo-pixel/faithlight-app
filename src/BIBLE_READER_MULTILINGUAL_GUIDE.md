# Bible Reader: Multilingual Bible Support Implementation

## Overview

The BibleReaderPage now provides full multilingual support for the Bible. When users select a language, the page loads **actual Bible text in that language**, not just changing UI labels.

## Supported Languages

| Code | Name (Native) | Name (English) |
|------|---------------|---|
| `en` | English | English |
| `om` | Afaan Oromoo | Afaan Oromoo |
| `am` | አማርኛ | Amharic |
| `sw` | Kiswahili | Swahili |
| `fr` | Français | French |
| `ti` | ትግርኛ | Tigrinya |
| `ar` | العربية | Arabic |

## Data Structure

Bible verses are stored in the `BibleVerseText` entity with this structure:

```javascript
{
  language_code: "om",        // ISO language code
  book_id: "PSA",             // Standard Bible book ID
  book_name: "Faarfannaa",    // Localized book name
  chapter: 25,                // Chapter number
  verse: 1,                   // Verse number
  text: "Yaa Waaqayyoo...",   // The verse text in that language
  reference: "Faarfannaa 25:1" // Formatted reference
}
```

## How It Works

1. **User selects language**: The `<select>` dropdown in the header controls the `lang` state
2. **fetchChapter() called**: Queries `BibleVerseText` for the selected language, book, and chapter
3. **Data fetched**: Returns verses or shows "not available" message (no silent English fallback)
4. **Text rendered**: Displays verses with proper RTL support for Arabic
5. **Language saved**: Selection persists via localStorage as `bibleReaderLanguage`

## Key Features

### ✅ Language Persistence
When users reopen the app, it remembers their last selected language:
```javascript
const savedLang = localStorage.getItem('bibleReaderLanguage') || 'en';
```

### ✅ Same Book/Chapter/Verse Context
When switching languages, the app keeps:
- Same book (e.g., Psalms → Faarfannaa)
- Same chapter (25 stays 25)
- Same verse range (highlighting preserved)

Example flow:
```
User opens Psalms 25:1 in English
↓
User switches to Afaan Oromoo
↓
App loads Faarfannaa 25:1 in Oromoo (same reference, different language)
```

### ✅ No Silent Fallbacks
If a translation is unavailable, users see a clear message:
```
"Bible text not yet available in Amharic. Please select another language."
```

**Never** silently falls back to English.

### ✅ RTL Support for Arabic
Arabic text displays with proper right-to-left layout:
- Container direction set to `dir="rtl"`
- Verse numbers appear on the right
- Text aligned right
- Flex row reversed

### ✅ All Features Respect Language
- **Book names**: Localized (e.g., "Genesis" → "Umuma" in Oromo)
- **Chapter navigation**: Works across all languages
- **Search** (future): Will match selected language
- **Bookmarks**: Reopen in chosen language
- **Audio**: Language-specific audio available

## Backend Seeding

### Seed Sample Verses
Run the backend function to load sample multilingual verses:

```bash
POST /api/functions/seedBibleMultilingualFull
```

This seeds Genesis 1:1-2 and Psalms 25:1-2 in all 7 languages.

### Seed Full Bible (Production)
For publishing, you must import the **complete 66-book Bible** for each language:

1. **English**: Use standard translation (KJV, ESV, NIV)
2. **Afaan Oromoo**: Licensed translation (verify with translation authority)
3. **Amharic**: Official Amharic Bible (verify licensing)
4. **Swahili**: Swahili Union Version or equivalent
5. **French**: Louis Segond or equivalent French translation
6. **Tigrinya**: Tigrinya Bible (verify official source)
7. **Arabic**: Arabic Bible (verify approved translation)

**CRITICAL**: Do not publish without complete, properly licensed translations for each language. Use the seeding functions to bulk-import:

```javascript
await base44.asServiceRole.entities.BibleVerseText.bulkCreate(verseArray);
```

## Testing Acceptance Criteria

### Bible Reader Navigation
- ✅ Open English chapter → English text appears
- ✅ Switch to Afaan Oromoo → same passage appears in Oromoo
- ✅ Switch to Amharic → same passage appears in Amharic
- ✅ Switch to Swahili → same passage appears in Swahili
- ✅ Switch to French → same passage appears in French
- ✅ Switch to Tigrinya → same passage appears in Tigrinya
- ✅ Switch to Arabic → same passage appears in Arabic with RTL layout

### Navigation
- ✅ Previous chapter button keeps selected language active
- ✅ Next chapter button keeps selected language active
- ✅ Changing book keeps selected language active
- ✅ Chapter picker works in all languages

### Language Persistence
- ✅ Reload page → previously selected language remains active
- ✅ Close and reopen app → language selection preserved

### Data Integrity
- ✅ Same book number across all languages
- ✅ Same chapter numbers across all languages
- ✅ Same verse numbers across all languages
- ✅ Book/chapter/verse order consistent

## Code Implementation Details

### Language State Management
```javascript
const [lang, setLang] = useState(initialLang);

// Persist to localStorage
useEffect(() => {
  localStorage.setItem('bibleReaderLanguage', lang);
}, [lang]);
```

### Fetching Language-Specific Data
```javascript
const fetchChapter = useCallback(async (bkId, ch, langCode) => {
  const verseData = await base44.entities.BibleVerseText.filter({
    language_code: langCode,  // KEY: Filter by selected language
    book_id: bkId,
    chapter: ch,
  }, 'verse', 500);
  
  if (verseData?.length > 0) {
    setVerses(buildVerses(verseData, bkId, ch, langCode));
  } else {
    setError(`Bible text not yet available in ${getUI(langCode).title}`);
    setContentNote('missing');
  }
}, []);
```

### RTL Handling for Arabic
```javascript
// Apply RTL direction to container
<div style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>

// Reverse flex direction for verse layout
<div style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>

// Align text right for Arabic
<p style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
```

## Important Developer Notes

### ⚠️ This Must NOT Be UI-Only Language Switching

**WRONG:**
```javascript
// This only changes labels, text stays English ❌
const displayText = lang === 'om' ? translateToOromo(englishText) : englishText;
```

**RIGHT:**
```javascript
// This loads actual language data from database ✅
const verseData = await base44.entities.BibleVerseText.filter({
  language_code: lang,  // Selects the data source
  book_id, chapter
});
```

### Font Support
Ensure the app supports Unicode fonts for:
- **Amharic**: Ethiopic script
- **Tigrinya**: Ethiopic script
- **Arabic**: Arabic script
- **French**: Latin extended
- **Swahili**: Latin extended
- **Afaan Oromoo**: Latin extended

These are generally supported in modern browsers. No special font installation needed.

## Future Enhancements

1. **Search**: Full-text search matching selected language
2. **Audio**: Language-specific audio Bible playback
3. **Commentary**: Language-specific Biblical commentary
4. **Reading Plans**: Localized reading plans
5. **Bookmarks**: Language-aware bookmark system
6. **Sharing**: Share verses with language metadata

## Troubleshooting

### No verses appear after language switch
- Check that `BibleVerseText` has records for that language
- Verify `language_code`, `book_id`, `chapter` match exactly
- Check browser console for fetch errors

### Arabic text not RTL
- Verify `direction: rtl` applied to container
- Check parent elements don't override with `direction: ltr`
- Test in multiple browsers

### Language not persisting
- Check localStorage: `localStorage.getItem('bibleReaderLanguage')`
- Verify useEffect runs on language change
- Clear browser storage if needed

## API Reference

### BibleVerseText Entity Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `language_code` | string | Yes | ISO code (en, om, am, sw, fr, ti, ar) |
| `book_id` | string | Yes | Standard code (GEN, PSA, JHN, etc.) |
| `book_name` | string | Yes | Localized book name |
| `chapter` | number | Yes | Chapter number |
| `verse` | number | Yes | Verse number |
| `text` | string | Yes | The verse text |
| `reference` | string | No | Formatted reference string |

### Database Query Example
```javascript
const verses = await base44.entities.BibleVerseText.filter({
  language_code: 'om',
  book_id: 'PSA',
  chapter: 25
}, 'verse', 500);
```

## Publishing Checklist

Before publishing to app stores:

- [ ] All 66 books seeded for each language
- [ ] All verse text verified for accuracy
- [ ] No English fallbacks in code
- [ ] Arabic RTL tested and working
- [ ] Language persistence tested
- [ ] Fonts render correctly on all devices
- [ ] Empty state message works for all languages
- [ ] Book names translated for all languages
- [ ] Licensing documented for all translations
- [ ] User testing with native speakers