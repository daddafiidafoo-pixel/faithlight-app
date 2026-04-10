#!/usr/bin/env python3
"""
FaithLight Bible Data Importer
Imports Bible data from various formats into standardized JSON
"""

import json
import csv
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from bible_validator import BibleValidator

@dataclass
class VerseData:
    """Simple verse data container."""
    book_id: str
    chapter: int
    verse: int
    text: str
    reference: Optional[str] = None


class BibleImporter:
    def __init__(self, output_dir: str = "bible-data/languages"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.validator = BibleValidator()
    
    def import_from_csv(self, csv_file: str, language: str, 
                       book_col: int = 0, chapter_col: int = 1, 
                       verse_col: int = 2, text_col: int = 3) -> bool:
        """
        Import from CSV file.
        
        Expected format:
        book_id,chapter,verse,text
        john,3,16,"For God so loved..."
        """
        verses = []
        
        try:
            with open(csv_file, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                
                for row in reader:
                    if len(row) < 4:
                        continue
                    
                    try:
                        verse = VerseData(
                            book_id=row[book_col].strip(),
                            chapter=int(row[chapter_col]),
                            verse=int(row[verse_col]),
                            text=row[text_col].strip()
                        )
                        verses.append(verse)
                    except (ValueError, IndexError):
                        continue
        except FileNotFoundError:
            print(f"File not found: {csv_file}")
            return False
        
        return self._save_verses(verses, language)
    
    def import_from_json_array(self, json_file: str, language: str,
                              book_key: str = "book", chapter_key: str = "chapter",
                              verse_key: str = "verse", text_key: str = "text") -> bool:
        """
        Import from JSON array of verse objects.
        
        Expected format:
        [
          {"book": "john", "chapter": 3, "verse": 16, "text": "For God..."},
          ...
        ]
        """
        verses = []
        
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"JSON error: {e}")
            return False
        except FileNotFoundError:
            print(f"File not found: {json_file}")
            return False
        
        if not isinstance(data, list):
            print("Expected JSON array")
            return False
        
        for item in data:
            try:
                verse = VerseData(
                    book_id=item[book_key].strip(),
                    chapter=int(item[chapter_key]),
                    verse=int(item[verse_key]),
                    text=item[text_key].strip(),
                    reference=item.get("reference")
                )
                verses.append(verse)
            except (KeyError, ValueError, AttributeError):
                continue
        
        return self._save_verses(verses, language)
    
    def _save_verses(self, verses: List[VerseData], language: str) -> bool:
        """Organize verses by book and save to files."""
        # Group verses by book
        books: Dict[str, Dict[int, Dict[int, str]]] = {}
        
        for verse in verses:
            if verse.book_id not in books:
                books[verse.book_id] = {}
            
            if verse.chapter not in books[verse.book_id]:
                books[verse.book_id][verse.chapter] = {}
            
            books[verse.book_id][verse.chapter][verse.verse] = {
                "text": verse.text,
                "reference": verse.reference or f"{verse.book_id.title()} {verse.chapter}:{verse.verse}"
            }
        
        # Save each book
        lang_dir = self.output_dir / language / "books"
        lang_dir.mkdir(parents=True, exist_ok=True)
        
        for book_id, chapters_data in sorted(books.items()):
            book_file = {
                "meta": {
                    "language": language,
                    "version_id": f"{language}_bible"
                },
                "book": {
                    "id": book_id,
                    "name": book_id.replace("_", " ").title()
                },
                "chapters": []
            }
            
            for chapter_num in sorted(chapters_data.keys()):
                verses = chapters_data[chapter_num]
                chapter_obj = {
                    "chapter": chapter_num,
                    "verses": []
                }
                
                for verse_num in sorted(verses.keys()):
                    verse_obj = {
                        "verse": verse_num,
                        "text": verses[verse_num]["text"],
                        "reference": verses[verse_num]["reference"]
                    }
                    chapter_obj["verses"].append(verse_obj)
                
                book_file["chapters"].append(chapter_obj)
            
            # Save file
            output_path = lang_dir / f"{book_id}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(book_file, f, ensure_ascii=False, indent=2)
            
            print(f"✓ Saved: {output_path}")
        
        # Validate the output
        print(f"\nValidating imported data...")
        results = self.validator.validate_directory(str(lang_dir.parent))
        
        if results.get("error"):
            print(f"❌ {results['error']}")
            return False
        
        print(f"✓ Valid: {results['valid']}/{results['total']} files")
        
        if results["errors"]:
            print(f"\n❌ Errors:")
            for err in results["errors"][:5]:
                print(f"  - {err}")
            if len(results["errors"]) > 5:
                print(f"  ... and {len(results['errors']) - 5} more")
            return False
        
        if results["warnings"]:
            print(f"\n⚠ Warnings:")
            for warn in results["warnings"][:5]:
                print(f"  - {warn}")
            if len(results["warnings"]) > 5:
                print(f"  ... and {len(results['warnings']) - 5} more")
        
        return True


def main():
    importer = BibleImporter()
    
    # Example: import from JSON
    # importer.import_from_json_array("path/to/oromo_bible.json", "om")
    
    print("BibleImporter ready.")
    print("Use import_from_csv() or import_from_json_array() to import data.")


if __name__ == "__main__":
    main()