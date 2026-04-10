# Bible Data Tools

Scripts for converting, validating, and importing Bible content into the Base44 database.

---

## Scripts

| Script | Purpose |
|---|---|
| `converter.py` | Convert source files (USFM, CSV, JSON, TXT) to normalized JSON |
| `validator.py` | Validate normalized JSON before upload |
| `upload_to_base44.py` | Upload validated JSON to the Base44 backend function |
| `pipeline.py` | Run all three steps in one command |

---

## Quick Start

### 1. Set environment variables

```bash
export BASE44_FUNCTION_URL="https://YOUR-APP.base44.app/api/functions/importBibleJsonToBase44"
export BASE44_API_KEY="YOUR_TOKEN_IF_NEEDED"   # optional
```

### 2. Full pipeline (recommended)

```bash
python bible-data/tools/pipeline.py \
  --input bible-data/sources/om \
  --output bible-data/output/om \
  --language om \
  --format usfm \
  --strict \
  --replace-language
```

### 3. Dry run first

```bash
python bible-data/tools/pipeline.py \
  --input bible-data/sources/om \
  --output bible-data/output/om \
  --language om \
  --format usfm \
  --strict \
  --dry-run
```

---

## Pipeline Steps

### Step 1 — Convert (`converter.py`)

Converts source Bible files into a normalized JSON format.

**Supported input formats:** USFM, CSV, JSON, plain text

**Output structure** (`bible-data/output/{lang}/`):
```
genesis.json
exodus.json
...
manifest.json
```

Each book file contains:
```json
{
  "language": "om",
  "book_id": "GEN",
  "verses": [
    {
      "language": "om",
      "bookNumber": 1,
      "bookName": "Uumamaa",
      "chapter": 1,
      "verse": 1,
      "text": "..."
    }
  ]
}
```

**Example:**
```bash
python bible-data/tools/converter.py \
  --input bible-data/sources/om \
  --output bible-data/output/om \
  --language om \
  --format usfm
```

---

### Step 2 — Validate (`validator.py`)

Validates the converted JSON files for schema correctness, completeness, and consistency.

**Checks:**
- Required fields present and correctly typed
- `bookNumber` in range 1–66
- No duplicate verses
- No missing chapters or verse sequences (in `--strict` mode)

```bash
python bible-data/tools/validator.py bible-data/output/om --strict
```

Exit codes:
- `0` — validation passed
- `1` — validation errors found

---

### Step 3 — Upload (`upload_to_base44.py`)

Sends validated JSON to the `importBibleJsonToBase44` backend function in batches.

**Modes:**
- **`--replace-language`** — deletes all existing rows for the language, then bulk-inserts. Use for full reimports.
- **Default (upsert)** — updates existing verses, inserts new ones. Slower but safe for incremental updates.
- **`--dry-run`** — validates and summarizes without writing to the database.

```bash
python bible-data/tools/upload_to_base44.py \
  --input bible-data/output/om \
  --strict \
  --replace-language
```

---

## Common Workflows

### Add a new language from scratch

```bash
python bible-data/tools/pipeline.py \
  --input bible-data/sources/am \
  --output bible-data/output/am \
  --language am \
  --format usfm \
  --strict \
  --replace-language
```

### Re-import after source corrections

```bash
python bible-data/tools/pipeline.py \
  --input bible-data/sources/om \
  --output bible-data/output/om \
  --language om \
  --format usfm \
  --strict \
  --replace-language
```

### Validate + upload only (skip re-convert)

```bash
python bible-data/tools/pipeline.py \
  --output bible-data/output/om \
  --language om \
  --strict \
  --replace-language \
  --skip-convert
```

### Convert only (inspect output before uploading)

```bash
python bible-data/tools/pipeline.py \
  --input bible-data/sources/om \
  --output bible-data/output/om \
  --language om \
  --format usfm \
  --skip-validate \
  --skip-upload
```

---

## Normalized Record Schema

Every verse record sent to Base44 must have these fields:

| Field | Type | Description |
|---|---|---|
| `language` | string | ISO language code (`en`, `om`, `am`, …) |
| `bookNumber` | integer | Canonical book number 1–66 |
| `bookName` | string | Localized book name |
| `chapter` | integer | Chapter number ≥ 1 |
| `verse` | integer | Verse number ≥ 1 |
| `text` | string | Verse text (non-empty) |

---

## Backend Function

The `importBibleJsonToBase44` Deno function accepts POST requests with this payload:

```json
{
  "entityName": "BibleVerseText",
  "replaceLanguage": false,
  "dryRun": false,
  "batchSize": 200,
  "records": [ { ... } ]
}
```

Find the function URL in **Dashboard → Code → Functions → importBibleJsonToBase44**.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Missing function URL` | Set `BASE44_FUNCTION_URL` env var |
| `HTTP 400` from function | Check that all required fields are present and types are correct |
| `HTTP 500` from function | Check function logs in the Base44 dashboard |
| Validator fails on missing verses | Use `--strict` only when source is complete; omit it for partial imports |
| Upload is slow | Increase `--batch-size` (default 200); for large imports always use `--replace-language` |