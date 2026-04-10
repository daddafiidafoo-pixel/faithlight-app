#!/usr/bin/env python3
"""
Bible JSON database importer

Pipeline:
    converter.py -> validator.py -> import_to_db.py

This script:
- runs validator first
- reads normalized JSON files
- imports verses into a database
- supports dry run
- supports replace/upsert behavior

Expected JSON structure per file:
{
  "language": "om",
  "bookNumber": 19,
  "bookName": "Faarfannaa",
  "verses": [
    {
      "language": "om",
      "bookNumber": 19,
      "bookName": "Faarfannaa",
      "chapter": 23,
      "verse": 1,
      "text": "..."
    }
  ]
}

Environment variables:
- BIBLE_DB_URL
    Example SQLite:
        BIBLE_DB_URL=sqlite:///./bible.sqlite3

Usage examples:
    python bible-data/tools/import_to_db.py \
        --input bible-data/output/om \
        --dry-run

    python bible-data/tools/import_to_db.py \
        --input bible-data/output/om \
        --strict

    python bible-data/tools/import_to_db.py \
        --input bible-data/output/om \
        --replace
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

TABLE_NAME = "bible_verses"


@dataclass
class VerseRecord:
    language: str
    bookNumber: int
    bookName: str
    chapter: int
    verse: int
    text: str


def parse_db_url() -> tuple[str, str]:
    db_url = os.environ.get("BIBLE_DB_URL", "").strip()
    if not db_url:
        raise ValueError("BIBLE_DB_URL is not set")

    if db_url.startswith("sqlite:///"):
        return "sqlite", db_url.replace("sqlite:///", "", 1)

    raise ValueError(
        "Unsupported BIBLE_DB_URL. Currently supported: sqlite:///path/to/file.sqlite3"
    )


def get_connection() -> sqlite3.Connection:
    db_type, db_target = parse_db_url()
    if db_type != "sqlite":
        raise ValueError(f"Unsupported database type: {db_type}")

    conn = sqlite3.connect(db_target)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            language TEXT NOT NULL,
            bookNumber INTEGER NOT NULL,
            bookName TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text TEXT NOT NULL,
            UNIQUE(language, bookNumber, chapter, verse)
        )
        """
    )
    conn.execute(
        f"""
        CREATE INDEX IF NOT EXISTS idx_{TABLE_NAME}_lookup
        ON {TABLE_NAME}(language, bookNumber, chapter, verse)
        """
    )
    conn.commit()


def run_validator(input_dir: Path, strict: bool) -> int:
    validator_path = Path(__file__).with_name("validator.py")
    cmd = [sys.executable, str(validator_path), str(input_dir)]
    if strict:
        cmd.append("--strict")

    result = subprocess.run(cmd, check=False)
    return result.returncode


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def find_book_files(input_dir: Path) -> list[Path]:
    files = sorted(
        p for p in input_dir.glob("*.json")
        if p.name.lower() != "manifest.json"
    )
    if not files:
        raise ValueError(f"No book JSON files found in {input_dir}")
    return files


def iter_verses(input_dir: Path) -> Iterable[VerseRecord]:
    for path in find_book_files(input_dir):
        payload = load_json(path)

        if not isinstance(payload, dict):
            raise ValueError(f"{path}: expected JSON object")

        verses = payload.get("verses")
        if not isinstance(verses, list):
            raise ValueError(f"{path}: missing or invalid 'verses' list")

        for idx, row in enumerate(verses, start=1):
            if not isinstance(row, dict):
                raise ValueError(f"{path}: verse #{idx} is not an object")

            try:
                yield VerseRecord(
                    language=str(row["language"]).strip(),
                    bookNumber=int(row["bookNumber"]),
                    bookName=str(row["bookName"]).strip(),
                    chapter=int(row["chapter"]),
                    verse=int(row["verse"]),
                    text=str(row["text"]).strip(),
                )
            except Exception as exc:
                raise ValueError(f"{path}: invalid verse #{idx}: {exc}") from exc


def count_existing_rows(
    conn: sqlite3.Connection,
    language: str | None = None,
) -> int:
    if language:
        row = conn.execute(
            f"SELECT COUNT(*) AS c FROM {TABLE_NAME} WHERE language = ?",
            (language,),
        ).fetchone()
    else:
        row = conn.execute(
            f"SELECT COUNT(*) AS c FROM {TABLE_NAME}"
        ).fetchone()
    return int(row["c"])


def delete_language(conn: sqlite3.Connection, language: str) -> int:
    cur = conn.execute(
        f"DELETE FROM {TABLE_NAME} WHERE language = ?",
        (language,),
    )
    return cur.rowcount


def upsert_verse(conn: sqlite3.Connection, verse: VerseRecord) -> None:
    conn.execute(
        f"""
        INSERT INTO {TABLE_NAME}
            (language, bookNumber, bookName, chapter, verse, text)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(language, bookNumber, chapter, verse)
        DO UPDATE SET
            bookName = excluded.bookName,
            text = excluded.text
        """,
        (
            verse.language,
            verse.bookNumber,
            verse.bookName,
            verse.chapter,
            verse.verse,
            verse.text,
        ),
    )


def insert_verse_ignore_duplicates(conn: sqlite3.Connection, verse: VerseRecord) -> None:
    conn.execute(
        f"""
        INSERT OR IGNORE INTO {TABLE_NAME}
            (language, bookNumber, bookName, chapter, verse, text)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            verse.language,
            verse.bookNumber,
            verse.bookName,
            verse.chapter,
            verse.verse,
            verse.text,
        ),
    )


def detect_language(input_dir: Path) -> str:
    manifest_path = input_dir / "manifest.json"
    if manifest_path.exists():
        manifest = load_json(manifest_path)
        language = manifest.get("language")
        if isinstance(language, str) and language.strip():
            return language.strip()

    first_file = find_book_files(input_dir)[0]
    payload = load_json(first_file)
    language = payload.get("language")
    if isinstance(language, str) and language.strip():
        return language.strip()

    raise ValueError("Could not detect language from manifest or first book file")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import validated Bible JSON into the database."
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Folder containing converted JSON files"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and summarize import without writing to database"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Run validator in strict mode before import"
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing rows for this language before import"
    )
    parser.add_argument(
        "--insert-only",
        action="store_true",
        help="Insert new rows only, ignore duplicates instead of upserting"
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    input_dir = Path(args.input)
    if not input_dir.exists() or not input_dir.is_dir():
        print(f"Input folder does not exist or is not a directory: {input_dir}", file=sys.stderr)
        return 2

    print("Running validator...\n")
    validation_code = run_validator(input_dir, strict=args.strict)
    if validation_code != 0:
        print("\nImport stopped because validation failed.", file=sys.stderr)
        return validation_code

    try:
        language = detect_language(input_dir)
        verses = list(iter_verses(input_dir))
    except Exception as exc:
        print(f"Failed to load import data: {exc}", file=sys.stderr)
        return 1

    books = len({v.bookNumber for v in verses})
    chapters = len({(v.bookNumber, v.chapter) for v in verses})
    verse_count = len(verses)

    print("IMPORT PLAN")
    print(f"Language: {language}")
    print(f"Books: {books}")
    print(f"Chapters: {chapters}")
    print(f"Verses: {verse_count}")
    print(f"Mode: {'dry-run' if args.dry_run else 'write'}")
    print(f"Replace existing language rows: {args.replace}")
    print(f"Insert only: {args.insert_only}")

    if args.dry_run:
        print("\nDry run complete. No database changes were made.")
        return 0

    try:
        conn = get_connection()
        ensure_schema(conn)

        before_count = count_existing_rows(conn, language=language)
        print(f"\nExisting rows for language '{language}': {before_count}")

        with conn:
            if args.replace:
                deleted = delete_language(conn, language)
                print(f"Deleted existing rows for '{language}': {deleted}")

            for verse in verses:
                if args.insert_only:
                    insert_verse_ignore_duplicates(conn, verse)
                else:
                    upsert_verse(conn, verse)

        after_count = count_existing_rows(conn, language=language)

        print("\nIMPORT COMPLETE")
        print(f"Language: {language}")
        print(f"Rows before: {before_count}")
        print(f"Rows after: {after_count}")
        print(f"Verses processed: {verse_count}")

        expected_full_bible = 31102
        if after_count < expected_full_bible:
            print(
                f"Warning: imported row count for '{language}' is {after_count}, "
                f"which is below the common 66-book full Bible count of {expected_full_bible}."
            )

        return 0

    except Exception as exc:
        print(f"Database import failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())