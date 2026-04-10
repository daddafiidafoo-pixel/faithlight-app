#!/usr/bin/env python3
"""
Bible import pipeline

Runs the full pipeline in one command:

    converter.py -> validator.py -> upload_to_base44.py

This script:
- converts source files into normalized JSON
- validates the output
- uploads validated data to Base44

Example:
    python bible-data/tools/pipeline.py \
      --input bible-data/sources/om \
      --output bible-data/output/om \
      --language om \
      --format usfm \
      --strict \
      --replace-language

Environment variables used by uploader:
- BASE44_FUNCTION_URL
- BASE44_API_KEY (optional)
"""

from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], step_name: str) -> int:
    print(f"\n{'=' * 72}")
    print(f"STEP: {step_name}")
    print(f"{'=' * 72}")
    print("Running:")
    print(" ".join(shlex.quote(part) for part in cmd))
    print()

    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        print(f"\n{step_name} failed with exit code {result.returncode}", file=sys.stderr)
    else:
        print(f"\n{step_name} completed successfully.")
    return result.returncode


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run converter, validator, and uploader in one command."
    )

    parser.add_argument("--input", required=False, help="Input source file or folder")
    parser.add_argument("--output", required=True, help="Output folder for converted JSON")
    parser.add_argument("--language", required=True, help="Language code, e.g. om")
    parser.add_argument(
        "--format",
        choices=["usfm", "csv", "json", "txt"],
        help="Force input format"
    )
    parser.add_argument("--book-number", type=int, help="Required for some TXT inputs")
    parser.add_argument("--book-name", help="Required for some TXT inputs")

    parser.add_argument(
        "--strict",
        action="store_true",
        help="Run validator in strict mode"
    )

    parser.add_argument(
        "--entity-name",
        default="BibleVerseText",
        help="Target Base44 entity name for upload"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="Batch size for upload"
    )
    parser.add_argument(
        "--replace-language",
        action="store_true",
        help="Delete all existing rows for this language before upload"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run upload step in dry-run mode"
    )

    parser.add_argument(
        "--skip-convert",
        action="store_true",
        help="Skip converter step"
    )
    parser.add_argument(
        "--skip-validate",
        action="store_true",
        help="Skip validator step"
    )
    parser.add_argument(
        "--skip-upload",
        action="store_true",
        help="Skip uploader step"
    )

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    tools_dir = Path(__file__).resolve().parent
    converter = tools_dir / "converter.py"
    validator = tools_dir / "validator.py"
    uploader = tools_dir / "upload_to_base44.py"

    for script in (converter, validator, uploader):
        if not script.exists():
            print(f"Missing required script: {script}", file=sys.stderr)
            return 2

    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)

    # Step 1: Convert
    if not args.skip_convert:
        if not args.input:
            print("--input is required unless --skip-convert is set", file=sys.stderr)
            return 2

        input_path = Path(args.input)
        if not input_path.exists():
            print(f"Input path does not exist: {input_path}", file=sys.stderr)
            return 2

        convert_cmd = [
            sys.executable,
            str(converter),
            "--input", str(input_path),
            "--output", str(output_path),
            "--language", args.language,
        ]

        if args.format:
            convert_cmd.extend(["--format", args.format])
        if args.book_number is not None:
            convert_cmd.extend(["--book-number", str(args.book_number)])
        if args.book_name:
            convert_cmd.extend(["--book-name", args.book_name])

        convert_rc = run_command(convert_cmd, "CONVERT")
        if convert_rc != 0:
            return convert_rc

    # Step 2: Validate
    if not args.skip_validate:
        validate_cmd = [
            sys.executable,
            str(validator),
            str(output_path),
        ]
        if args.strict:
            validate_cmd.append("--strict")

        validate_rc = run_command(validate_cmd, "VALIDATE")
        if validate_rc != 0:
            return validate_rc

    # Step 3: Upload
    if not args.skip_upload:
        upload_cmd = [
            sys.executable,
            str(uploader),
            "--input", str(output_path),
            "--entity-name", args.entity_name,
            "--batch-size", str(args.batch_size),
        ]

        if args.strict:
            upload_cmd.append("--strict")
        if args.replace_language:
            upload_cmd.append("--replace-language")
        if args.dry_run:
            upload_cmd.append("--dry-run")

        upload_rc = run_command(upload_cmd, "UPLOAD")
        if upload_rc != 0:
            return upload_rc

    print(f"\n{'=' * 72}")
    print("PIPELINE COMPLETE")
    print(f"{'=' * 72}")
    print(f"Language: {args.language}")
    print(f"Output: {output_path}")
    print(f"Strict mode: {args.strict}")
    print(f"Dry run: {args.dry_run}")
    print(f"Replace language: {args.replace_language}")
    print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())