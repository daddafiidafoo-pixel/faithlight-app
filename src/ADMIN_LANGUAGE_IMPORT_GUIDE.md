# Quick Admin Guide: Importing Bible Languages

## TL;DR - 3 Steps to Add a Language

### 1. Prepare Data
Get Bible translation as JSON with this format:
```json
[
  { "language_code": "om", "book_id": "GEN", "book_name": "Umuma", "chapter": 1, "verse": 1, "text": "..." },
  // 31,101 more records
]
```

### 2. Import
```javascript
base44.functions.invoke('importBibleLanguage', {
  language_code: 'om',
  verses: [/* your 31,102 verses */]
})
```

### 3. Validate
```javascript
base44.functions.invoke('validateBibleLanguageReadiness', {
  language_code: 'om'
})
```

**Done!** Language appears in dropdown automatically.

---

## Detailed Process

### Get Licensed Bible Data

Choose your language and source:

| Language | Code | Best Source |
|----------|------|------------|
| Afaan Oromoo | om | Ethiopian Bible Society |
| Amharic | am | Ethiopian Bible Society |
| Swahili | sw | Bible League / Union Version |
| French | fr | Louis Segond (LSG) public domain |
| Tigrinya | ti | Ethiopian Bible Society |
| Arabic | ar | Van Dyck or Beirut Bible |

**⚠️ Verify you have permission to use the translation before importing.**

### Format Your Data

The importer expects an array of objects with these fields:

```javascript
{
  language_code: string,   // "om", "am", "sw", "fr", "ti", "ar"
  book_id: string,         // "GEN", "EXO", "PSA", "JHN", etc.
  book_name: string,       // Localized name (e.g., "Umuma" for Genesis in Oromo)
  chapter: number,         // 1-150 depending on book
  verse: number,          // 1-176 depending on chapter
  text: string,           // The actual verse text (cannot be empty)
  reference: string       // Optional: "Umuma 1:1"
}
```

**Total records needed:** ~31,102 verses (all 66 books)

### Run Import Function

```javascript
// Option 1: From browser console (if admin)
await base44.functions.invoke('importBibleLanguage', {
  language_code: 'om',
  verses: verseArray  // Your array of 31,102+ verses
})

// Option 2: Via dashboard function caller
// (Dashboard > Code > Functions > importBibleLanguage)
```

**Response:**
```javascript
{
  language_code: "om",
  imported: 31102,
  failed: 0,
  success: true,
  nextStep: "Run validateBibleLanguageReadiness"
}
```

### Validate the Import

```javascript
await base44.functions.invoke('validateBibleLanguageReadiness', {
  language_code: 'om'
})
```

**Success response:**
```javascript
{
  language_code: "om",
  ready: true,
  details: {
    verseCount: { current: 31102, required: 31102, status: "PASS" },
    bookCount: { current: 66, required: 66, status: "PASS" },
    testPassages: { /* Genesis 1, Psalms 23, John 3 all present */ },
    chapterCoverage: { totalChapters: 1189, ... }
  },
  recommendations: ["✅ om is ready to enable in the dropdown"]
}
```

**Failure response:**
```javascript
{
  ready: false,
  recommendations: [
    "❌ Need 500 more verses (98% complete)",
    "❌ Missing 2 books (64/66 present)"
  ]
}
```

### Test in Bible Reader

1. **Reload the Bible Reader page** (or clear browser cache)
2. **Check language dropdown** - New language should appear
3. **Select the language** and test:
   - Genesis 1 (should load)
   - Psalms 23 (should load)
   - John 3 (should load)
   - Navigate chapters (should work)
   - Reload page (language should persist)

---

## Validation Criteria

The language is "ready" when:

✅ Has all 66 books
✅ Has all 1,189 chapters
✅ Has all ~31,102 verses
✅ No empty text fields
✅ Sample passages load correctly
✅ Navigation works (prev/next chapter)
✅ Language persistence works

---

## Common Issues & Fixes

### Language doesn't appear after import

**Check:**
1. Validation passed? Run `validateBibleLanguageReadiness`
2. Import returned `success: true`?
3. Clear browser cache and reload
4. Wait 1 hour for cache to expire

**Debug:**
```javascript
// Check database directly
const verses = await base44.entities.BibleVerseText.filter({
  language_code: 'om'
});
console.log('Verses in database:', verses.length);
// Should be ~31,102
```

### Some verses show "not available"

**Check:**
1. Run validation again - check `testPassages` results
2. Look for missing chapters in validation output
3. Verify import completed (check `failed` count)

**Solutions:**
- Re-import if import failed
- Import missing chapters separately
- Check for data format errors

### Import fails with error

**Check:**
1. Is the verses array valid JSON?
2. Does each object have required fields? (language_code, book_id, chapter, verse, text)
3. Are verse numbers correct? (1-based, not 0-based)
4. Is text field never empty?

**Debug logs:**
- Check function logs in dashboard (Functions > importBibleLanguage > Logs)
- Look for batch errors (logged during import)

---

## Performance Tips

- **Import in batches**: Function handles batches of 1,000 verses automatically
- **One language at a time**: Don't import multiple languages simultaneously
- **Wait for validation**: Complete validation before testing in app
- **Cache clearing**: Language availability cached for 1 hour

---

## Supported Languages & Status

| Code | Language | Status | Action |
|------|----------|--------|--------|
| en | English | ✅ Active | - |
| om | Afaan Oromoo | ⏳ Pending | Get data → Import → Validate |
| am | Amharic | ⏳ Pending | Get data → Import → Validate |
| sw | Swahili | ⏳ Pending | Get data → Import → Validate |
| fr | French | ⏳ Pending | Get data → Import → Validate |
| ti | Tigrinya | ⏳ Pending | Get data → Import → Validate |
| ar | Arabic | ⏳ Pending | Get data → Import → Validate |

---

## Legal & Licensing

Before importing any Bible translation:

1. **Verify copyright status**
   - Public domain? (KJV, Louis Segond 1910, etc.)
   - Licensed? (Get permission from copyright holder)
   - Open license? (Verify terms)

2. **Document your source**
   - Keep records of where translation came from
   - Note any licensing agreements
   - Save original files

3. **Examples of safe sources:**
   - ✅ King James Version (1611) = Public domain
   - ✅ Louis Segond 1910 (French) = Public domain
   - ✅ Ethiopian Bible Society Oromo = Check with society
   - ✅ Bible League Swahili = Check with organization

**Do not publish until licensing is verified.**

---

## Next Steps After Enabling a Language

1. **Test thoroughly** with native speaker if possible
2. **Enable in mobile app** (same data works for iOS/Android)
3. **Add to help documentation**
4. **Announce to users**
5. **Monitor for issues** (check error logs regularly)

---

## Questions?

For technical details, see: `MULTILINGUAL_IMPORT_WORKFLOW.md`

For validation details, see: `BIBLE_DATA_IMPORT_CRITICAL.md`

For code details, see: `lib/bibleLanguageAvailability.js