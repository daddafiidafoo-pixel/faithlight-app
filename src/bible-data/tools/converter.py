#!/usr/bin/env python3
"""
Bible data converter

Converts Bible source files into normalized JSON records compatible with:
    bible-data/tools/validator.py

Supported input types:
- USFM (.usfm, .sfm)
- CSV (.csv)
- JSON passthrough normalization (.json)
- Plain text (.txt) with simple verse-per-line parsing

Output record shape:
{
  "language": "om",
  "bookNumber": 19,
  "bookName": "Faarfannaa",
  "chapter": 23,
  "verse": 1,
  "text": "..."
}

Usage examples:
    python bible-data/tools/converter.py \
        --input bible-data/sources/om \
        --output bible-data/output/om \
        --language om

    python bible-data/tools/converter.py \
        --input bible-data/sources/om/psa.usfm \
        --output bible-data/output/om \
        --language om \
        --book-number 19 \
        --book-name "Faarfannaa"

    python bible-data/tools/converter.py \
        --input bible-data/sources/sw.csv \
        --output bible-data/output/sw \
        --language sw \
        --format csv \
        --validate

Notes:
- USFM is the main target.
- CSV expects columns like:
    language,bookNumber,bookName,chapter,verse,text
  or close variants.
- TXT expects lines like:
    1:1 In the beginning...
    1:2 And the earth...
  and requires --book-number and --book-name.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

BOOK_NUMBER_TO_CODE = {
    1: "GEN", 2: "EXO", 3: "LEV", 4: "NUM", 5: "DEU", 6: "JOS", 7: "JDG", 8: "RUT",
    9: "1SA", 10: "2SA", 11: "1KI", 12: "2KI", 13: "1CH", 14: "2CH", 15: "EZR", 16: "NEH",
    17: "EST", 18: "JOB", 19: "PSA", 20: "PRO", 21: "ECC", 22: "SNG", 23: "ISA", 24: "JER",
    25: "LAM", 26: "EZK", 27: "DAN", 28: "HOS", 29: "JOL", 30: "AMO", 31: "OBA", 32: "JON",
    33: "MIC", 34: "NAM", 35: "HAB", 36: "ZEP", 37: "HAG", 38: "ZEC", 39: "MAL", 40: "MAT",
    41: "MRK", 42: "LUK", 43: "JHN", 44: "ACT", 45: "ROM", 46: "1CO", 47: "2CO", 48: "GAL",
    49: "EPH", 50: "PHP", 51: "COL", 52: "1TH", 53: "2TH", 54: "1TI", 55: "2TI", 56: "TIT",
    57: "PHM", 58: "HEB", 59: "JAS", 60: "1PE", 61: "2PE", 62: "1JN", 63: "2JN", 64: "3JN",
    65: "JUD", 66: "REV",
}
BOOK_CODE_TO_NUMBER = {v: k for k, v in BOOK_NUMBER_TO_CODE.items()}

CSV_COLUMN_ALIASES = {
    "language": {"language", "lang", "language_code"},
    "bookNumber": {"booknumber", "book_number", "booknum", "book", "bookid"},
    "bookName": {"bookname", "book_name", "booktitle", "book_title"},
    "chapter": {"chapter", "chap", "chapter_number"},
    "verse": {"verse", "verse_number", "v"},
    "text": {"text", "verse_text", "content", "body"},
}


@dataclass
class VerseRecord:
    language: str
    bookNumber: int
    bookName: str
    chapter: int
    verse: int
    text: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "language": self.language,
            "bookNumber": self.bookNumber,
            "bookName": self.bookName,
            "chapter": self.chapter,
            "verse": self.verse,
            "text": self.text,
        }


def slugify_filename(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", name.strip().lower()).strip("_")
    return cleaned or "book"


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def detect_format(path: Path, forced: str | None) -> str:
    if forced:
        return forced.lower()

    ext = path.suffix.lower()
    if ext in {".usfm", ".sfm"}:
        return "usfm"
    if ext == ".csv":
        return "csv"
    if ext == ".json":
        return "json"
    if ext == ".txt":
        return "txt"
    raise ValueError(f"Could not detect format for file: {path}")


def ensure_output_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def parse_usfm_file(path: Path, default_language: str) -> list[VerseRecord]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    language = default_language
    book_code: str | None = None
    book_name: str | None = None
    book_number: int | None = None
    current_chapter: int | None = None

    verses: list[VerseRecord] = []
    current_verse_num: int | None = None
    current_verse_parts: list[str] = []

    def flush_current_verse() -> None:
        nonlocal current_verse_num, current_verse_parts
        if (
            current_verse_num is not None
            and current_chapter is not None
            and book_number is not None
            and book_name is not None
        ):
            verse_text = normalize_whitespace(" ".join(current_verse_parts))
            verses.append(
                VerseRecord(
                    language=language,
                    bookNumber=book_number,
                    bookName=book_name,
                    chapter=current_chapter,
                    verse=current_verse_num,
                    text=verse_text,
                )
            )
        current_verse_num = None
        current_verse_parts = []

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        if line.startswith("\\id "):
            parts = line.split(maxsplit=2)
            if len(parts) >= 2:
                book_code = parts[1].upper()
                book_number = BOOK_CODE_TO_NUMBER.get(book_code)
            continue

        if line.startswith("\\h "):
            book_name = normalize_whitespace(line[3:])
            continue

        if line.startswith("\\toc1 ") and not book_name:
            book_name = normalize_whitespace(line[6:])
            continue

        if line.startswith("\\toc2 ") and not book_name:
            book_name = normalize_whitespace(line[6:])
            continue

        if line.startswith("\\toc3 ") and not book_name:
            book_name = normalize_whitespace(line[6:])
            continue

        if line.startswith("\\c "):
            flush_current_verse()
            match = re.match(r"\\c\s+(\d+)", line)
            if match:
                current_chapter = int(match.group(1))
            continue

        if line.startswith("\\v "):
            flush_current_verse()
            match = re.match(r"\\v\s+(\d+)\s*(.*)", line)
            if match:
                current_verse_num = int(match.group(1))
                initial_text = match.group(2).strip()
                if initial_text:
                    current_verse_parts.append(initial_text)
            continue

        if line.startswith("\\"):
            continue

        if current_verse_num is not None:
            current_verse_parts.append(line)

    flush_current_verse()

    if not verses:
        raise ValueError(f"No verses found in USFM file: {path}")

    if book_number is None:
        raise ValueError(f"Could not determine book code/number from USFM file: {path}")

    if not book_name:
        book_name = book_code or path.stem

    for verse in verses:
        verse.bookName = book_name

    return verses


def map_csv_columns(fieldnames: list[str]) -> dict[str, str]:
    lowered = {name.lower().strip(): name for name in fieldnames}
    resolved: dict[str, str] = {}

    for target, aliases in CSV_COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in lowered:
                resolved[target] = lowered[alias]
                break

    missing = [k for k in ("bookNumber", "bookName", "chapter", "verse", "text") if k not in resolved]
    if missing:
        raise ValueError(f"CSV missing required columns: {missing}")

    return resolved


def parse_csv_file(path: Path, default_language: str) -> list[VerseRecord]:
    verses: list[VerseRecord] = []

    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            raise ValueError(f"CSV has no header row: {path}")

        column_map = map_csv_columns(reader.fieldnames)

        for idx, row in enumerate(reader, start=2):
            try:
                language_col = column_map.get("language")
                language = (
                    normalize_whitespace(row.get(language_col, "")) if language_col else default_language
                ) or default_language

                verse = VerseRecord(
                    language=language,
                    bookNumber=int(str(row[column_map["bookNumber"]]).strip()),
                    bookName=normalize_whitespace(str(row[column_map["bookName"]])),
                    chapter=int(str(row[column_map["chapter"]]).strip()),
                    verse=int(str(row[column_map["verse"]]).strip()),
                    text=normalize_whitespace(str(row[column_map["text"]])),
                )
            except Exception as exc:
                raise ValueError(f"CSV parse error in {path} line {idx}: {exc}") from exc

            verses.append(verse)

    if not verses:
        raise ValueError(f"No verse rows found in CSV file: {path}")

    return verses


def parse_json_file(path: Path, default_language: str) -> list[VerseRecord]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "verses" in data:
        rows = data["verses"]
    elif isinstance(data, list):
        rows = data
    else:
        raise ValueError(f"Unsupported JSON structure in {path}")

    verses: list[VerseRecord] = []
    for idx, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            raise ValueError(f"JSON row #{idx} in {path} is not an object")

        try:
            language = normalize_whitespace(str(row.get("language", default_language))) or default_language
            verse = VerseRecord(
                language=language,
                bookNumber=int(row["bookNumber"]),
                bookName=normalize_whitespace(str(row["bookName"])),
                chapter=int(row["chapter"]),
                verse=int(row["verse"]),
                text=normalize_whitespace(str(row["text"])),
            )
        except Exception as exc:
            raise ValueError(f"JSON parse error in {path} row #{idx}: {exc}") from exc

        verses.append(verse)

    if not verses:
        raise ValueError(f"No verses found in JSON file: {path}")

    return verses


def parse_txt_file(
    path: Path,
    default_language: str,
    book_number: int | None,
    book_name: str | None,
) -> list[VerseRecord]:
    if book_number is None or book_name is None:
        raise ValueError("TXT conversion requires --book-number and --book-name")

    lines = path.read_text(encoding="utf-8").splitlines()
    verses: list[VerseRecord] = []

    pattern = re.compile(r"^\s*(\d+):(\d+)\s+(.*)$")
    for idx, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped:
            continue
        match = pattern.match(stripped)
        if not match:
            raise ValueError(
                f"TXT parse error in {path} line {idx}: expected 'chapter:verse text'"
            )
        chapter = int(match.group(1))
        verse = int(match.group(2))
        text = normalize_whitespace(match.group(3))

        verses.append(
            VerseRecord(
                language=default_language,
                bookNumber=book_number,
                bookName=book_name,
                chapter=chapter,
                verse=verse,
                text=text,
            )
        )

    if not verses:
        raise ValueError(f"No verses found in TXT file: {path}")

    return verses


def parse_input_file(
    path: Path,
    input_format: str,
    language: str,
    book_number: int | None,
    book_name: str | None,
) -> list[VerseRecord]:
    if input_format == "usfm":
        return parse_usfm_file(path, language)
    if input_format == "csv":
        return parse_csv_file(path, language)
    if input_format == "json":
        return parse_json_file(path, language)
    if input_format == "txt":
        return parse_txt_file(path, language, book_number, book_name)
    raise ValueError(f"Unsupported format: {input_format}")


def find_input_files(input_path: Path, forced_format: str | None) -> list[Path]:
    if input_path.is_file():
        return [input_path]

    if not input_path.is_dir():
        raise ValueError(f"Input path does not exist: {input_path}")

    patterns = {
        "usfm": ["*.usfm", "*.sfm"],
        "csv": ["*.csv"],
        "json": ["*.json"],
        "txt": ["*.txt"],
    }

    files: list[Path] = []
    if forced_format:
        for pattern in patterns.get(forced_format.lower(), []):
            files.extend(input_path.rglob(pattern))
    else:
        for pats in patterns.values():
            for pattern in pats:
                files.extend(input_path.rglob(pattern))

    files = sorted(set(files))
    if not files:
        raise ValueError(f"No supported input files found in: {input_path}")

    return files


def group_by_book(records: list[VerseRecord]) -> dict[tuple[int, str, str], list[VerseRecord]]:
    grouped: dict[tuple[int, str, str], list[VerseRecord]] = {}
    for record in records:
        key = (record.bookNumber, record.bookName, record.language)
        grouped.setdefault(key, []).append(record)

    for key in grouped:
        grouped[key].sort(key=lambda r: (r.chapter, r.verse))

    return grouped


def write_book_json(
    output_dir: Path,
    book_number: int,
    book_name: str,
    language: str,
    records: list[VerseRecord],
) -> Path:
    code = BOOK_NUMBER_TO_CODE.get(book_number, f"BOOK{book_number}")
    filename = f"{book_number:02d}_{code.lower()}_{slugify_filename(book_name)}.json"
    output_path = output_dir / filename

    payload = {
        "language": language,
        "bookNumber": book_number,
        "bookName": book_name,
        "verses": [r.to_dict() for r in records],
    }

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return output_path


def write_manifest(output_dir: Path, language: str, generated_files: list[Path]) -> Path:
    books: list[dict[str, Any]] = []
    for path in generated_files:
        with path.open("r", encoding="utf-8") as f:
            payload = json.load(f)
        verses = payload["verses"]
        books.append(
            {
                "file": path.name,
                "bookNumber": payload["bookNumber"],
                "bookName": payload["bookName"],
                "verses": len(verses),
                "chapters": len({(v["chapter"]) for v in verses}),
            }
        )

    books.sort(key=lambda b: b["bookNumber"])

    manifest = {
        "language": language,
        "version": "1.0",
        "books": books,
    }

    manifest_path = output_dir / "manifest.json"
    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    return manifest_path


def run_validator(output_dir: Path, strict: bool) -> int:
    validator_path = Path(__file__).with_name("validator.py")
    cmd = [sys.executable, str(validator_path), str(output_dir)]
    if strict:
        cmd.append("--strict")

    result = subprocess.run(cmd, check=False)
    return result.returncode


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert Bible source files into normalized JSON."
    )
    parser.add_argument("--input", required=True, help="Input file or folder")
    parser.add_argument("--output", required=True, help="Output folder")
    parser.add_argument("--language", required=True, help="Language code, e.g. om")
    parser.add_argument(
        "--format",
        choices=["usfm", "csv", "json", "txt"],
        help="Force input format"
    )
    parser.add_argument("--book-number", type=int, help="Required for some TXT inputs")
    parser.add_argument("--book-name", help="Required for some TXT inputs")
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Run validator.py after conversion"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Pass --strict to validator"
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)
    language = args.language.strip()

    if not language:
        print("Language code cannot be empty", file=sys.stderr)
        return 2

    try:
        files = find_input_files(input_path, args.format)
        ensure_output_dir(output_dir)

        all_records: list[VerseRecord] = []

        for file_path in files:
            file_format = detect_format(file_path, args.format)
            records = parse_input_file(
                file_path,
                file_format,
                language,
                args.book_number,
                args.book_name,
            )
            all_records.extend(records)

        if not all_records:
            print("No records were converted.", file=sys.stderr)
            return 1

        grouped = group_by_book(all_records)
        generated_files: list[Path] = []

        for (book_number, book_name, lang), records in sorted(grouped.items()):
            generated_files.append(
                write_book_json(output_dir, book_number, book_name, lang, records)
            )

        write_manifest(output_dir, language, generated_files)

        print("CONVERSION COMPLETE")
        print(f"Language: {language}")
        print(f"Input files processed: {len(files)}")
        print(f"Books written: {len(generated_files)}")
        print(f"Verses written: {len(all_records)}")
        print(f"Output folder: {output_dir}")

        if args.validate:
            print("\nRunning validator...\n")
            code = run_validator(output_dir, strict=args.strict)
            if code != 0:
                print("Validation failed. Conversion output was written but should not be imported.", file=sys.stderr)
                return code

        return 0

    except Exception as exc:
        print(f"Conversion failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())