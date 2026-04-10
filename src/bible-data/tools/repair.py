from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Tuple, Optional


REFERENCE_RE = re.compile(r"^.+\s+\d+:\d+$")


@dataclass
class RepairIssue:
    severity: str   # info | warning | error
    file: str
    action: str
    message: str


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def build_reference(book_name: str, chapter: int, verse: int) -> str:
    return f"{book_name} {chapter}:{verse}"


def clean_meta(meta: dict) -> dict:
    cleaned = dict(meta or {})
    for key, value in list(cleaned.items()):
        if isinstance(value, str):
            cleaned[key] = normalize_whitespace(value)
    return cleaned


def repair_book_file(book_path: Path) -> Tuple[List[RepairIssue], Optional[dict]]:
    issues: List[RepairIssue] = []

    try:
        data = load_json(book_path)
    except Exception as e:
        return [RepairIssue("error", str(book_path), "load_failed", str(e))], None

    meta = clean_meta(data.get("meta", {}))
    book_id = data.get("book_id")
    book_name = normalize_whitespace(str(data.get("book_name", "") or ""))
    book_abbr = normalize_whitespace(str(data.get("book_abbr", "") or ""))
    chapters = data.get("chapters", [])

    if not isinstance(chapters, list):
        return [RepairIssue("error", str(book_path), "invalid_structure", "chapters is not a list")], None

    repaired_chapters: List[dict] = []
    seen_chapter_numbers = set()

    for chapter_obj in chapters:
        chapter_num = chapter_obj.get("chapter")
        verses = chapter_obj.get("verses", [])

        if not isinstance(chapter_num, int) or chapter_num <= 0:
            issues.append(
                RepairIssue(
                    "warning",
                    str(book_path),
                    "drop_invalid_chapter",
                    f"Dropped invalid chapter: {chapter_num}",
                )
            )
            continue

        if chapter_num in seen_chapter_numbers:
            issues.append(
                RepairIssue(
                    "warning",
                    str(book_path),
                    "drop_duplicate_chapter",
                    f"Dropped duplicate chapter entry: {chapter_num}",
                )
            )
            continue
        seen_chapter_numbers.add(chapter_num)

        if not isinstance(verses, list):
            issues.append(
                RepairIssue(
                    "warning",
                    str(book_path),
                    "replace_invalid_verses_list",
                    f"Chapter {chapter_num} verses was not a list; replaced with empty list",
                )
            )
            verses = []

        verse_map: Dict[int, dict] = {}

        for verse_obj in verses:
            verse_num = verse_obj.get("verse")
            text = verse_obj.get("text", "")
            reference = verse_obj.get("reference", "")

            if not isinstance(verse_num, int) or verse_num <= 0:
                issues.append(
                    RepairIssue(
                        "warning",
                        str(book_path),
                        "drop_invalid_verse",
                        f"Dropped invalid verse number in chapter {chapter_num}: {verse_num}",
                    )
                )
                continue

            cleaned_text = normalize_whitespace(str(text or ""))
            if cleaned_text != str(text or ""):
                issues.append(
                    RepairIssue(
                        "info",
                        str(book_path),
                        "fix_whitespace",
                        f"Normalized whitespace in {chapter_num}:{verse_num}",
                    )
                )

            if not cleaned_text:
                issues.append(
                    RepairIssue(
                        "warning",
                        str(book_path),
                        "drop_empty_verse",
                        f"Dropped empty verse {chapter_num}:{verse_num}",
                    )
                )
                continue

            expected_reference = build_reference(book_name, chapter_num, verse_num)
            cleaned_reference = normalize_whitespace(str(reference or ""))

            if not cleaned_reference or not REFERENCE_RE.match(cleaned_reference) or cleaned_reference != expected_reference:
                issues.append(
                    RepairIssue(
                        "info",
                        str(book_path),
                        "rebuild_reference",
                        f"Rebuilt malformed reference for {chapter_num}:{verse_num}",
                    )
                )
                cleaned_reference = expected_reference

            repaired_verse = {
                "verse": verse_num,
                "text": cleaned_text,
                "reference": cleaned_reference,
                "book_id": book_id,
                "chapter_number": chapter_num,
                "language": meta.get("language"),
                "version_id": meta.get("version_id"),
            }

            if verse_num in verse_map:
                existing = verse_map[verse_num]
                if len(cleaned_text) > len(existing.get("text", "")):
                    verse_map[verse_num] = repaired_verse
                    issues.append(
                        RepairIssue(
                            "warning",
                            str(book_path),
                            "replace_duplicate_verse",
                            f"Duplicate verse {chapter_num}:{verse_num} found; kept longer text",
                        )
                    )
                else:
                    issues.append(
                        RepairIssue(
                            "warning",
                            str(book_path),
                            "drop_duplicate_verse",
                            f"Duplicate verse {chapter_num}:{verse_num} found; dropped duplicate",
                        )
                    )
            else:
                verse_map[verse_num] = repaired_verse

        repaired_verses = [verse_map[v] for v in sorted(verse_map)]

        repaired_chapters.append(
            {
                "chapter": chapter_num,
                "verses": repaired_verses,
            }
        )

    repaired_chapters.sort(key=lambda c: c["chapter"])

    repaired_data = {
        "meta": meta,
        "book_id": book_id,
        "book_name": book_name,
        "book_abbr": book_abbr,
        "chapters": repaired_chapters,
    }

    return issues, repaired_data


def repair_manifest(manifest_path: Path) -> Tuple[List[RepairIssue], Optional[dict]]:
    issues: List[RepairIssue] = []

    if not manifest_path.exists():
        return [RepairIssue("error", str(manifest_path), "missing_manifest", "Manifest file not found")], None

    try:
        manifest = load_json(manifest_path)
    except Exception as e:
        return [RepairIssue("error", str(manifest_path), "load_failed", str(e))], None

    languages = manifest.get("languages", [])
    if not isinstance(languages, list):
        return [RepairIssue("error", str(manifest_path), "invalid_structure", "languages is not a list")], None

    repaired_languages = []
    seen_codes = set()

    for lang in languages:
        code = normalize_whitespace(str(lang.get("code", "") or ""))
        if not code:
            issues.append(
                RepairIssue("warning", str(manifest_path), "drop_language_entry", "Dropped language entry with empty code")
            )
            continue

        if code in seen_codes:
            issues.append(
                RepairIssue("warning", str(manifest_path), "drop_duplicate_language", f"Dropped duplicate language code: {code}")
            )
            continue
        seen_codes.add(code)

        repaired = dict(lang)
        for key, value in list(repaired.items()):
            if isinstance(value, str):
                repaired[key] = normalize_whitespace(value)

        repaired_languages.append(repaired)

    repaired_manifest = {"languages": repaired_languages}
    return issues, repaired_manifest


def build_summary(issues: List[RepairIssue]) -> dict:
    counts = {"info": 0, "warning": 0, "error": 0}
    action_counts: Dict[str, int] = {}

    for issue in issues:
        counts[issue.severity] = counts.get(issue.severity, 0) + 1
        action_counts[issue.action] = action_counts.get(issue.action, 0) + 1

    return {
        "ok": counts["error"] == 0,
        "counts": counts,
        "action_counts": action_counts,
        "issues": [asdict(i) for i in issues],
    }


def repair_dataset(
    bible_data_dir: Path,
    summary_output_path: Path,
    dry_run: bool = False,
) -> dict:
    all_issues: List[RepairIssue] = []

    manifest_path = bible_data_dir / "manifest.json"
    manifest_issues, repaired_manifest = repair_manifest(manifest_path)
    all_issues.extend(manifest_issues)

    if repaired_manifest is not None and not dry_run:
        save_json(manifest_path, repaired_manifest)

    for lang_dir in bible_data_dir.iterdir():
        if not lang_dir.is_dir() or lang_dir.name == "__pycache__":
            continue

        for book_file in sorted(lang_dir.glob("*.json")):
            issues, repaired_data = repair_book_file(book_file)
            all_issues.extend(issues)

            if repaired_data is not None and not dry_run:
                save_json(book_file, repaired_data)

    summary = build_summary(all_issues)

    if not dry_run:
        summary_output_path.parent.mkdir(parents=True, exist_ok=True)
        save_json(summary_output_path, summary)

    return summary


def main() -> None:
    bible_data_dir = Path("bible-data")
    summary_output_path = Path("bible-data/repair-summary.json")
    dry_run = False

    summary = repair_dataset(
        bible_data_dir=bible_data_dir,
        summary_output_path=summary_output_path,
        dry_run=dry_run,
    )

    print("Repair complete.")
    print(json.dumps(summary["counts"], indent=2))
    print(f"Summary written to: {summary_output_path}")

    if summary["counts"]["error"] > 0:
        print("Some errors remain. Check repair-summary.json for details.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()