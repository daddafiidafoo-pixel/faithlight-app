#!/usr/bin/env python3
"""
Bible JSON validator

Validates converted Bible JSON data before database import.

Expected verse shape:
{
  "language": "om",
  "bookNumber": 19,
  "bookName": "Faarfannaa",
  "chapter": 23,
  "verse": 1,
  "text": "..."
}

Usage:
    python bible-data/tools/validator.py path/to/file.json
    python bible-data/tools/validator.py path/to/folder
    python bible-data/tools/validator.py path/to/file.json --strict
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

VALID_BOOK_RANGE = range(1, 67)


@dataclass
class ValidationReport:
    files_checked: int = 0
    books_checked: set[int] = field(default_factory=set)
    chapters_checked: set[tuple[str, int, int]] = field(default_factory=set)
    verses_checked: int = 0
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def add_error(self, message: str) -> None:
        self.errors.append(message)

    def add_warning(self, message: str) -> None:
        self.warnings.append(message)

    @property
    def passed(self) -> bool:
        return len(self.errors) == 0


def load_json(path: Path) -> Any:
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in {path}: {exc}") from exc


def normalize_records(data: Any, path: Path) -> list[dict[str, Any]]:
    """
    Supports:
    - a list of verse dicts
    - a dict with key 'verses'
    """
    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        if "verses" in data and isinstance(data["verses"], list):
            return data["verses"]

    raise ValueError(
        f"Unsupported JSON structure in {path}. Expected a list or {{'verses': [...]}}."
    )


def validate_required_fields(
    record: dict[str, Any], idx: int, path: Path, report: ValidationReport
) -> None:
    required_fields = [
        "language",
        "bookNumber",
        "bookName",
        "chapter",
        "verse",
        "text",
    ]
    for field_name in required_fields:
        if field_name not in record:
            report.add_error(f"{path} record #{idx}: missing required field '{field_name}'")


def validate_field_types(
    record: dict[str, Any], idx: int, path: Path, report: ValidationReport
) -> None:
    if "language" in record and not isinstance(record["language"], str):
        report.add_error(f"{path} record #{idx}: 'language' must be a string")

    if "bookName" in record and not isinstance(record["bookName"], str):
        report.add_error(f"{path} record #{idx}: 'bookName' must be a string")

    for numeric_field in ("bookNumber", "chapter", "verse"):
        if numeric_field in record and not isinstance(record[numeric_field], int):
            report.add_error(f"{path} record #{idx}: '{numeric_field}' must be an integer")

    if "text" in record and not isinstance(record["text"], str):
        report.add_error(f"{path} record #{idx}: 'text' must be a string")


def validate_record_values(
    record: dict[str, Any], idx: int, path: Path, report: ValidationReport
) -> None:
    language = record.get("language")
    book_number = record.get("bookNumber")
    book_name = record.get("bookName")
    chapter = record.get("chapter")
    verse = record.get("verse")
    text = record.get("text")

    if isinstance(language, str) and not language.strip():
        report.add_error(f"{path} record #{idx}: 'language' cannot be empty")

    if isinstance(book_name, str) and not book_name.strip():
        report.add_error(f"{path} record #{idx}: 'bookName' cannot be empty")

    if isinstance(book_number, int) and book_number not in VALID_BOOK_RANGE:
        report.add_error(
            f"{path} record #{idx}: invalid bookNumber '{book_number}', expected 1-66"
        )

    if isinstance(chapter, int) and chapter < 1:
        report.add_error(f"{path} record #{idx}: chapter must be >= 1")

    if isinstance(verse, int) and verse < 1:
        report.add_error(f"{path} record #{idx}: verse must be >= 1")

    if isinstance(text, str):
        if not text.strip():
            report.add_error(
                f"{path} record #{idx}: empty text at {language} {book_name} {chapter}:{verse}"
            )
        elif text.strip() != text:
            report.add_warning(
                f"{path} record #{idx}: text has leading/trailing whitespace at "
                f"{language} {book_name} {chapter}:{verse}"
            )


def validate_consistency(
    records: list[dict[str, Any]],
    path: Path,
    report: ValidationReport,
    strict: bool,
) -> None:
    seen_keys: set[tuple[str, int, int, int]] = set()
    language_values: set[str] = set()

    chapters_by_book_lang: dict[tuple[str, int], set[int]] = defaultdict(set)
    verses_by_chapter: dict[tuple[str, int, int], set[int]] = defaultdict(set)
    book_names_by_number_lang: dict[tuple[str, int], set[str]] = defaultdict(set)

    for idx, record in enumerate(records, start=1):
        validate_required_fields(record, idx, path, report)
        validate_field_types(record, idx, path, report)

        required = {"language", "bookNumber", "bookName", "chapter", "verse", "text"}
        if not required.issubset(record.keys()):
            continue

        validate_record_values(record, idx, path, report)

        if not all(
            isinstance(record[k], t)
            for k, t in {
                "language": str,
                "bookNumber": int,
                "bookName": str,
                "chapter": int,
                "verse": int,
                "text": str,
            }.items()
        ):
            continue

        language = record["language"].strip()
        book_number = record["bookNumber"]
        book_name = record["bookName"].strip()
        chapter = record["chapter"]
        verse = record["verse"]

        language_values.add(language)
        report.books_checked.add(book_number)
        report.chapters_checked.add((language, book_number, chapter))
        report.verses_checked += 1

        key = (language, book_number, chapter, verse)
        if key in seen_keys:
            report.add_error(
                f"{path}: duplicate verse detected at {language} {book_name} {chapter}:{verse}"
            )
        else:
            seen_keys.add(key)

        chapters_by_book_lang[(language, book_number)].add(chapter)
        verses_by_chapter[(language, book_number, chapter)].add(verse)
        book_names_by_number_lang[(language, book_number)].add(book_name)

    if len(language_values) > 1:
        report.add_error(
            f"{path}: multiple language codes found in one file: {sorted(language_values)}"
        )

    for (language, book_number), names in book_names_by_number_lang.items():
        if len(names) > 1:
            report.add_error(
                f"{path}: inconsistent book names for language={language}, "
                f"bookNumber={book_number}: {sorted(names)}"
            )

    for (language, book_number), chapters in sorted(chapters_by_book_lang.items()):
        sorted_chapters = sorted(chapters)
        if not sorted_chapters:
            continue

        expected_chapters = list(range(sorted_chapters[0], sorted_chapters[-1] + 1))
        if sorted_chapters != expected_chapters:
            missing = sorted(set(expected_chapters) - set(sorted_chapters))
            report.add_error(
                f"{path}: missing chapter(s) for language={language}, "
                f"bookNumber={book_number}: {missing}"
            )

        if strict and sorted_chapters[0] != 1:
            report.add_error(
                f"{path}: strict mode failed — first chapter for "
                f"language={language}, bookNumber={book_number} is {sorted_chapters[0]}, expected 1"
            )

    for (language, book_number, chapter), verses in sorted(verses_by_chapter.items()):
        sorted_verses = sorted(verses)
        if not sorted_verses:
            continue

        expected_verses = list(range(sorted_verses[0], sorted_verses[-1] + 1))
        if sorted_verses != expected_verses:
            missing = sorted(set(expected_verses) - set(sorted_verses))
            report.add_error(
                f"{path}: missing verse(s) for language={language}, "
                f"bookNumber={book_number}, chapter={chapter}: {missing}"
            )

        if strict and sorted_verses[0] != 1:
            report.add_error(
                f"{path}: strict mode failed — first verse for "
                f"language={language}, bookNumber={book_number}, chapter={chapter} "
                f"is {sorted_verses[0]}, expected 1"
            )


def validate_manifest(path: Path, report: ValidationReport) -> None:
    manifest_path = path.parent / "manifest.json"
    if not manifest_path.exists():
        return

    try:
        manifest = load_json(manifest_path)
    except ValueError as exc:
        report.add_error(str(exc))
        return

    if not isinstance(manifest, dict):
        report.add_error(f"{manifest_path}: manifest must be a JSON object")
        return

    version = manifest.get("version")
    language = manifest.get("language")

    if version is None:
        report.add_warning(f"{manifest_path}: missing optional field 'version'")
    elif not isinstance(version, str) or not version.strip():
        report.add_error(f"{manifest_path}: 'version' must be a non-empty string")

    if language is None:
        report.add_warning(f"{manifest_path}: missing optional field 'language'")
    elif not isinstance(language, str) or not language.strip():
        report.add_error(f"{manifest_path}: 'language' must be a non-empty string")


def validate_file(path: Path, report: ValidationReport, strict: bool) -> None:
    report.files_checked += 1

    try:
        data = load_json(path)
        records = normalize_records(data, path)
    except ValueError as exc:
        report.add_error(str(exc))
        return

    if len(records) == 0:
        report.add_error(f"{path}: file contains no verse records")
        return

    validate_consistency(records, path, report, strict)


def find_json_files(target: Path) -> list[Path]:
    if target.is_file():
        return [target] if target.suffix.lower() == ".json" else []

    if target.is_dir():
        return sorted(
            p for p in target.rglob("*.json")
            if p.name.lower() != "manifest.json"
        )

    return []


def print_report(report: ValidationReport) -> None:
    status = "VALIDATION PASSED" if report.passed else "VALIDATION FAILED"
    print(status)
    print(f"Files checked: {report.files_checked}")
    print(f"Books checked: {len(report.books_checked)}")
    print(f"Chapters checked: {len(report.chapters_checked)}")
    print(f"Verses checked: {report.verses_checked}")
    print(f"Warnings: {len(report.warnings)}")
    print(f"Errors: {len(report.errors)}")

    if report.warnings:
        print("\nWarnings:")
        for warning in report.warnings:
            print(f"- {warning}")

    if report.errors:
        print("\nErrors:")
        for error in report.errors:
            print(f"- {error}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate Bible JSON files before database import."
    )
    parser.add_argument(
        "path",
        help="Path to a JSON file or folder containing JSON files"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Require every chapter and verse sequence to start at 1"
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    target = Path(args.path)
    if not target.exists():
        print(f"Path does not exist: {target}", file=sys.stderr)
        return 2

    files = find_json_files(target)
    if not files:
        print(f"No JSON files found at: {target}", file=sys.stderr)
        return 2

    report = ValidationReport()

    if target.is_dir():
        validate_manifest(target, report)

    for file_path in files:
        validate_file(file_path, report, args.strict)

    print_report(report)
    return 0 if report.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())