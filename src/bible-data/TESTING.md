# Bible Dataset Loader - Testing Guide

This document describes how to test the Bible dataset loader system and its integration with FaithLight components.

## Quick Test Checklist

- [ ] Load English John 3:16 in BibleReaderPage
- [ ] Load English Psalms 23 in BibleReaderPage
- [ ] Load Oromo John 3:16 (should show Oromo text)
- [ ] Load Oromo Psalms 23 (should show Oromo text)
- [ ] Request missing Amharic chapter (should show fallback banner)
- [ ] Test VerseImageGenerator with Oromo verse
- [ ] Test single verse lookup via `getVerse()`
- [ ] Test chapter refresh safety (no crashes on refresh)
- [ ] Test fallback transparent behavior (only show when needed)
- [ ] Test language switching

## Test Environment Setup

The sample files provide placeholder content for structure testing:

```
✓ bible-data/en/john.json     (John 1:1-3, John 3:16-17)
✓ bible-data/en/psalms.json   (Psalm 23:1-4)
✓ bible-data/om/john.json     (Oromo equivalents)
✓ bible-data/om/psalms.json   (Oromo equivalents)
✗ bible-data/am/...           (Not yet provided)
✗ bible-data/sw/...           (Not yet provided)
✗ bible-data/ti/...           (Not yet provided)
```

These are **placeholder files for testing the loader structure only**. For production, real Bible translations should be imported via the Python converter.

## Test Cases

### 1. Basic Chapter Loading (English)

**Test**: Load John 3 in English

```javascript
import { getChapter } from '@/lib/bibleDatasetsService';

const result = await getChapter({
  bookId: 'john',
  chapter: 3,
  selectedLanguage: 'en'
});

console.log(result);
// Expected:
// {
//   success: true,
//   verses: [
//     { verse: 16, text: "For God so loved the world..." },
//     { verse: 17, text: "For God sent not his Son..." }
//   ],
//   language: 'en',
//   bookName: 'John',
//   fallbackUsed: false
// }
```

**In BibleReaderPage**:
1. Select English language
2. Go to John, Chapter 3
3. Verify verses appear: 16, 17
4. No fallback banner should show

**Expected Result**: ✓ Verses display correctly, no fallback message

---

### 2. Basic Chapter Loading (Oromo)

**Test**: Load John 3 in Oromo

```javascript
import { getChapter } from '@/lib/bibleDatasetsService';

const result = await getChapter({
  bookId: 'john',
  chapter: 3,
  selectedLanguage: 'om'
});

console.log(result);
// Expected:
// {
//   success: true,
//   verses: [
//     { verse: 16, text: "Waaqi addunyaa itti gaaffatee..." }
//   ],
//   language: 'om',
//   languageName: 'Afaan Oromoo',
//   bookName: 'Yohannis',
//   fallbackUsed: false
// }
```

**In BibleReaderPage**:
1. Select Oromo language
2. Go to Yohannis (John), Chapter 3
3. Verify Oromo verses appear
4. Book name should show as "Yohannis" (not "John")
5. No fallback banner

**Expected Result**: ✓ Oromo text displays, localized book name works

---

### 3. Single Verse Lookup

**Test**: Get John 3:16 specifically

```javascript
import { getVerse } from '@/lib/bibleDatasetsService';

const verse = await getVerse({
  bookId: 'john',
  chapter: 3,
  verse: 16,
  selectedLanguage: 'en'
});

console.log(verse.text);
// Expected: "For God so loved the world..."
```

**Expected Result**: ✓ Single verse loads correctly

---

### 4. Fallback Behavior (Missing Language)

**Test**: Request Amharic chapter (not yet in dataset)

```javascript
import { getChapter } from '@/lib/bibleDatasetsService';

const result = await getChapter({
  bookId: 'john',
  chapter: 3,
  selectedLanguage: 'am'
});

console.log(result);
// Expected:
// {
//   success: true,
//   verses: [...],           // English verses (fallback)
//   language: 'en',          // Actually loaded in English
//   fallbackUsed: true,      // Flag that fallback was used
//   fallbackLanguage: 'en',  // Which language we fell back to
//   selectedLanguage: 'am'   // What user requested
// }
```

**In BibleReaderPage**:
1. Select Amharic language
2. Go to John, Chapter 3
3. Verses should display (from English fallback)
4. **Yellow fallback banner should show**: "Bible not available in this language — showing English"
5. Book name stays consistent

**Expected Result**: ✓ Fallback works transparently, banner indicates fallback

---

### 5. Missing Chapter (Both Languages)

**Test**: Request a chapter that doesn't exist in dataset (e.g., Leviticus)

```javascript
import { getChapter } from '@/lib/bibleDatasetsService';

const result = await getChapter({
  bookId: 'leviticus',
  chapter: 1,
  selectedLanguage: 'en'
});

console.log(result);
// Expected:
// {
//   success: false,
//   error: "Book leviticus not found in en or fallback"
// }
```

**In BibleReaderPage**:
1. Go to Leviticus, Chapter 1
2. **Red error banner should show**: "This chapter is not available in this language"
3. Verses list stays empty
4. No crash

**Expected Result**: ✓ Error handled gracefully, no crash

---

### 6. Language Switching Safety

**Test**: Switch languages while chapter is loading

**Steps**:
1. Go to John 3 in English
2. Immediately switch to Oromo
3. Wait for load
4. Switch to Amharic
5. Wait for load

**Expected Result**: ✓ No race conditions, latest selection wins, no crashes

---

### 7. Page Refresh Safety

**Test**: Hard refresh while viewing a chapter

**Steps**:
1. Navigate to John 3 in English
2. Select a verse (highlight it)
3. Press F5 or Cmd+R to hard refresh
4. Wait for page to load

**Expected Result**: ✓ Page loads correctly, same chapter appears, no errors in console

---

### 8. VerseImageGenerator Integration

**Test**: Generate image from Oromo verse

**Steps**:
1. Go to Psalms 23 in Oromo
2. Select verse 1
3. Click "Create Image" (or equivalent action)
4. Verify image shows Oromo text

**Expected**:
- Image displays verse text in Oromo
- Reference shows in Oromo format
- No data loading errors

**Expected Result**: ✓ Image generator uses dataset text correctly

---

### 9. Available Books Listing

**Test**: Get list of available books for a language

```javascript
import { getAvailableBooks } from '@/lib/bibleDatasetsService';

// English: should list john, psalms
const enBooks = await getAvailableBooks('en');
console.log(enBooks);
// Expected: [
//   { id: 'john', name: 'John', abbr: 'Jhn', chapters: 1 },
//   { id: 'psalms', name: 'Psalms', abbr: 'Psa', chapters: 1 }
// ]

// Oromo: should list john, psalms with Oromo names
const omBooks = await getAvailableBooks('om');
console.log(omBooks);
// Expected: [
//   { id: 'john', name: 'Yohannis', abbr: 'Yoh', chapters: 1 },
//   { id: 'psalms', name: 'Faarfannaa', abbr: 'Faa', chapters: 1 }
// ]
```

**Expected Result**: ✓ Lists match available book files

---

### 10. Cache Clearing

**Test**: Clear cache and reload same chapter

```javascript
import { clearCaches, getChapter } from '@/lib/bibleDatasetsService';

// First load
const result1 = await getChapter({ bookId: 'john', chapter: 3, selectedLanguage: 'en' });

// Clear caches
clearCaches();

// Second load (should fetch from file again)
const result2 = await getChapter({ bookId: 'john', chapter: 3, selectedLanguage: 'en' });
```

**Expected Result**: ✓ Both loads succeed, cache is properly cleared

---

## Developer Testing Tools

### Check Dataset Status

```javascript
import { getDatasetStatus } from '@/lib/bibleDatasetsService';

const status = await getDatasetStatus();
console.log(status);

// Returns:
// {
//   manifest: { ... },
//   languages: {
//     en: {
//       config: { ... },
//       booksLoaded: 2,
//       books: [
//         { id: 'john', name: 'John', chapters: 1 },
//         { id: 'psalms', name: 'Psalms', chapters: 1 }
//       ]
//     },
//     om: { ... },
//     am: { ... },
//     sw: { ... },
//     ti: { ... }
//   }
// }
```

Use this to check what's currently loaded without making UI changes.

### Log Available Languages

```javascript
import { getAllLanguages } from '@/lib/bibleDatasetsService';

const langs = getAllLanguages();
console.table(langs);
// Shows all configured languages with metadata
```

### Test Hooks

```javascript
import { useBibleDataset } from '@/components/hooks/useBibleDataset';

function TestComponent() {
  const { loadVerse, verse, error } = useBibleDataset('en');

  const handleTest = async () => {
    await loadVerse('john', 3, 16);
  };

  return (
    <div>
      <button onClick={handleTest}>Load John 3:16</button>
      {error && <p>Error: {error}</p>}
      {verse && <p>{verse.text}</p>}
    </div>
  );
}
```

---

## Console Debugging

The dataset service logs warnings for missing files:

```javascript
// Warning in console when file not found:
// "Failed to load book john for language am: Error: ..."

// Enable verbose logging in development:
// Search for `console.warn` calls in bibleDatasetsService.js
```

## File Structure Validation

Verify your book files match the schema:

```javascript
// Validate a loaded book
const book = await fetch('/bible-data/en/john.json').then(r => r.json());

// Check required fields
console.assert(book.meta, 'Missing meta');
console.assert(book.book_id, 'Missing book_id');
console.assert(book.book_name, 'Missing book_name');
console.assert(Array.isArray(book.chapters), 'chapters must be array');

// Check chapter structure
book.chapters.forEach(ch => {
  console.assert(typeof ch.chapter === 'number', 'Chapter must be number');
  console.assert(Array.isArray(ch.verses), 'verses must be array');
});
```

## Next Steps: Adding More Languages

When you have licensed Bible data files:

1. **Convert files** using the Python converter (next implementation)
2. **Place files** in appropriate language folders
3. **Update manifest.json** if needed
4. **Test** with the steps above
5. **No code changes required** — loader will automatically discover new files

## Troubleshooting

### Issue: "Chapter not found" errors even though file exists

**Solution**: Check that:
- File is in correct folder: `bible-data/{langCode}/{bookId}.json`
- `bookId` in URL/code matches filename exactly (lowercase)
- File is valid JSON

### Issue: Fallback not showing even when language missing

**Solution**: Check manifest fallback configuration:
```javascript
const langConfig = getLanguageConfig('am');
console.log(langConfig.fallbackLanguage); // Should be 'en'
```

### Issue: Book names showing in wrong language

**Solution**: Verify book file `book_name` field matches language:
```json
{
  "book_id": "john",
  "book_name": "Yohannis",  // Should be localized for language
  ...
}
```

### Issue: Images generated with wrong verse text

**Solution**: VerseImageGenerator must use verse data from dataset:
- Check that hook is being used: `useBibleDataset(selectedLanguage)`
- Verify verse object passed to component has correct `text` field