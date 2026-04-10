# Bible Converter Tool Guide

This tool converts licensed or public-domain Bible text files into FaithLight's JSON format.

## Quick Start

1. **Place your source file** in `bible-data/sources/` (e.g., `oromo_bible.txt`)
2. **Customize the variables** in `converter.py`:
   - `input_path` → path to your source file
   - `language_code` → 2-letter code (e.g., "om", "am", "sw")
   - `language_name` → full name (e.g., "Afaan Oromoo")
   - `version_id` → identifier (e.g., "oromo_bible")
   - `version_name` → display name (e.g., "Afaan Oromoo Bible")

3. **Run the converter**:
   ```bash
   cd bible-data/tools
   python converter.py
   ```

4. **Check the output** in `bible-data/{language_code}/` and `bible-data/manifest.json`

## Input File Formats

### Format 1: Space-separated
```
Yohannis 3:16 Waaqayyo akkasitti addunyaa jaallate...
Yohannis 3:17 Waaqayyo ilma isaa addunyaatti erge...
```

### Format 2: Tab-separated (TSV)
```
Yohannis	3	16	Waaqayyo akkasitti addunyaa jaallate...
Yohannis	3	17	Waaqayyo ilma isaa addunyaatti erge...
```

## Book Name Mapping

The `BOOK_MAP` in `converter.py` includes all 66 books in Afaan Oromoo. 

### For other languages, customize:

**Amharic Example:**
```python
"ዮሐንስ": {"book_id": "john", "book_abbr": "ዮሐ"},
"ሮሞስ": {"book_id": "romans", "book_abbr": "ሮሞ"},
```

**Swahili Example:**
```python
"Yohana": {"book_id": "john", "book_abbr": "Yoh"},
"Waroma": {"book_id": "romans", "book_abbr": "Rom"},
```

## Output Structure

The converter creates:

```
bible-data/
  om/
    john.json
    psalms.json
    ...
  manifest.json
```

### Example output file (john.json):
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
      "chapter": 1,
      "verses": [
        {
          "verse": 1,
          "text": "Jalqaba Seera Ofii Waaqaa ilaallaa...",
          "reference": "Yohannis 1:1",
          "book_id": "john",
          "chapter_number": 1,
          "language": "om",
          "version_id": "oromo_bible"
        }
      ]
    }
  ]
}
```

## Workflow for Multiple Languages

### Phase 1: Setup (NOW)
- ✅ Use Bible Brain API for English, Oromo, Amharic, Swahili, Tigrinya
- ✅ Launch app with dynamic audio
- ✅ Save converter tool

### Phase 2: Licensed Data (LATER)
1. Get licensed Bible text from:
   - Digital Bible Library (dbl.org)
   - Bible Society
   - Local Christian organizations
2. Convert using this tool
3. Import into your database
4. Enable offline reading

## Troubleshooting

### "Unknown book name in source"
- Check your book names match `BOOK_MAP` exactly
- Update `BOOK_MAP` for your language

### "Could not parse line X"
- Verify line format matches one of the patterns
- Check for tab vs. space separators
- Ensure verse numbers are numeric

### Empty output
- Verify input file is UTF-8 encoded
- Check that lines aren't commented (starting with #)
- Ensure file path is correct

## Testing

For testing, start with a small sample:

```
Yohannis 3:16 Waaqayyo akkasitti addunyaa jaallate...
Yohannis 3:17 Waaqayyo ilma isaa addunyaatti erge...
Faarfannaa 23:1 Waaqayyo si jaarsa...
```

This verifies:
- Parsing works
- Book names map correctly
- JSON output is valid
- App can load the data

## Integration with FaithLight

Once converted, the app's `bibleDatasetsService.js` will:
1. Check for local JSON files first
2. Use converted data for offline reading
3. Fall back to Bible Brain API if needed

No additional setup required!