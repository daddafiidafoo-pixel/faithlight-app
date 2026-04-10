#!/usr/bin/env python3
"""
Upload validated Bible JSON to a Base44 backend function.

Pipeline:
    converter.py -> validator.py -> upload_to_base44.py

This script:
- runs validator first
- loads normalized JSON files from bible-data/output/{lang}
- sends them in batches to your Base44 function
- supports dry run
- supports replaceLanguage mode

Environment variables:
- BASE44_FUNCTION_URL
    Example:
    https://your-app.base44.app/api/functions/importBibleJsonToBase44

- BASE44_API_KEY
    Optional, if your function endpoint requires auth

Usage:
    python bible-data/tools/upload_to_base44.py \
      --input bible-data/output/om \
      --dry-run \
      --strict

    python bible-data/tools/upload_to_base44.py \
      --input bible-data/output/om \
      --replace-language \
      --strict
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


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


def iter_verses(input_dir: Path) -> list[VerseRecord]:
    verses: list[VerseRecord] = []
    for path in find_book_files(input_dir):
        payload = load_json(path)

        if not isinstance(payload, dict):
            raise ValueError(f"{path}: expected JSON object")

        rows = payload.get("verses")
        if not isinstance(rows, list):
            raise ValueError(f"{path}: missing or invalid 'verses' list")

        for idx, row in enumerate(rows, start=1):
            if not isinstance(row, dict):
                raise ValueError(f"{path}: verse #{idx} is not an object")

            try:
                verses.append(
                    VerseRecord(
                        language=str(row["language"]).strip(),
                        bookNumber=int(row["bookNumber"]),
                        bookName=str(row["bookName"]).strip(),
                        chapter=int(row["chapter"]),
                        verse=int(row["verse"]),
                        text=str(row["text"]).strip(),
                    )
                )
            except Exception as exc:
                raise ValueError(f"{path}: invalid verse #{idx}: {exc}") from exc

    return verses


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

    raise ValueError("Could not detect language from manifest or book file")


def chunk(items: list[VerseRecord], size: int) -> list[list[VerseRecord]]:
    return [items[i:i + size] for i in range(0, len(items), size)]


def post_json(url: str, payload: dict[str, Any], api_key: str | None) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    request = urllib.request.Request(
        url=url,
        data=body,
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            response_body = response.read().decode("utf-8")
            if not response_body.strip():
                return {"ok": True, "emptyResponse": True}
            return json.loads(response_body)
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"HTTP {exc.code} calling Base44 function:\n{error_body}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed to reach Base44 function: {exc}") from exc


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Upload validated Bible JSON to Base44 import function."
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Folder containing converted JSON files"
    )
    parser.add_argument(
        "--function-url",
        help="Override BASE44_FUNCTION_URL environment variable"
    )
    parser.add_argument(
        "--entity-name",
        default="BibleVerseText",
        help="Target Base44 entity name"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="Number of verses per upload request"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Run validator in strict mode before upload"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and send dry-run payload only"
    )
    parser.add_argument(
        "--replace-language",
        action="store_true",
        help="Delete all existing rows for this language before upload"
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    input_dir = Path(args.input)
    if not input_dir.exists() or not input_dir.is_dir():
        print(f"Input folder does not exist or is not a directory: {input_dir}", file=sys.stderr)
        return 2

    function_url = (args.function_url or os.environ.get("BASE44_FUNCTION_URL", "")).strip()
    if not function_url:
        print("Missing function URL. Set BASE44_FUNCTION_URL or pass --function-url", file=sys.stderr)
        return 2

    api_key = os.environ.get("BASE44_API_KEY", "").strip() or None

    print("Running validator...\n")
    validation_code = run_validator(input_dir, strict=args.strict)
    if validation_code != 0:
        print("\nUpload stopped because validation failed.", file=sys.stderr)
        return validation_code

    try:
        language = detect_language(input_dir)
        verses = iter_verses(input_dir)
    except Exception as exc:
        print(f"Failed to load upload data: {exc}", file=sys.stderr)
        return 1

    books = len({v.bookNumber for v in verses})
    chapters = len({(v.bookNumber, v.chapter) for v in verses})
    total_verses = len(verses)

    print("UPLOAD PLAN")
    print(f"Language: {language}")
    print(f"Books: {books}")
    print(f"Chapters: {chapters}")
    print(f"Verses: {total_verses}")
    print(f"Batch size: {args.batch_size}")
    print(f"Mode: {'dry-run' if args.dry_run else 'write'}")
    print(f"Replace language: {args.replace_language}")

    verse_batches = chunk(verses, args.batch_size)
    created_total = 0
    updated_total = 0
    deleted_total = 0

    try:
        for idx, batch in enumerate(verse_batches, start=1):
            payload = {
                "entityName": args.entity_name,
                "replaceLanguage": args.replace_language and idx == 1,
                "dryRun": args.dry_run,
                "batchSize": args.batch_size,
                "records": [v.to_dict() for v in batch],
            }

            print(f"\nUploading batch {idx}/{len(verse_batches)} ({len(batch)} verses)...")
            result = post_json(function_url, payload, api_key)

            print(json.dumps(result, ensure_ascii=False, indent=2))

            if result.get("ok") is not True:
                raise RuntimeError(f"Base44 function returned failure on batch {idx}")

            created_total += int(result.get("created", 0))
            updated_total += int(result.get("updated", 0))
            deleted_total += int(result.get("deleted", 0))

        print("\nUPLOAD COMPLETE")
        print(f"Language: {language}")
        print(f"Total verses processed: {total_verses}")
        print(f"Created: {created_total}")
        print(f"Updated: {updated_total}")
        print(f"Deleted: {deleted_total}")
        print(f"Batches sent: {len(verse_batches)}")
        return 0

    except Exception as exc:
        print(f"\nUpload failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())