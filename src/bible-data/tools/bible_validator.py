#!/usr/bin/env python3
"""
FaithLight Bible Data Validator
Validates Bible dataset files before import
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple

class BibleValidator:
    def __init__(self, metadata_path: str = "bible-data/metadata"):
        self.metadata_path = Path(metadata_path)
        self.books_meta = self._load_json("books.json")
        self.errors = []
        self.warnings = []
    
    def _load_json(self, filename: str) -> Any:
        """Load JSON file."""
        with open(self.metadata_path / filename, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def validate_book_file(self, filepath: str, language: str = "en") -> bool:
        """
        Validate a single book file.
        
        Returns True if valid, False otherwise.
        Populates self.errors and self.warnings.
        """
        self.errors = []
        self.warnings = []
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.errors.append(f"JSON parse error: {e}")
            return False
        except FileNotFoundError:
            self.errors.append(f"File not found: {filepath}")
            return False
        
        # Validate structure
        if not isinstance(data, dict):
            self.errors.append("Root must be a dict")
            return False
        
        # Check required fields
        if "meta" not in data:
            self.errors.append("Missing 'meta' field")
            return False
        
        if "book" not in data:
            self.errors.append("Missing 'book' field")
            return False
        
        if "chapters" not in data:
            self.errors.append("Missing 'chapters' field")
            return False
        
        # Validate meta
        meta = data["meta"]
        if meta.get("language") != language:
            self.warnings.append(f"Language mismatch: expected {language}, got {meta.get('language')}")
        
        # Validate book
        book = data["book"]
        if "id" not in book:
            self.errors.append("Book missing 'id'")
            return False
        
        if "name" not in book:
            self.errors.append("Book missing 'name'")
            return False
        
        book_id = book["id"]
        book_meta = self._get_book_meta(book_id)
        
        if not book_meta:
            self.errors.append(f"Unknown book ID: {book_id}")
            return False
        
        expected_chapters = book_meta["chapters"]
        
        # Validate chapters
        chapters = data["chapters"]
        if not isinstance(chapters, list):
            self.errors.append("Chapters must be an array")
            return False
        
        if len(chapters) != expected_chapters:
            self.errors.append(f"Expected {expected_chapters} chapters, got {len(chapters)}")
            return False
        
        # Validate each chapter
        for i, chapter in enumerate(chapters):
            chapter_num = chapter.get("chapter")
            
            if chapter_num != i + 1:
                self.errors.append(f"Chapter order error: expected {i+1}, got {chapter_num}")
                return False
            
            if "verses" not in chapter:
                self.errors.append(f"Chapter {chapter_num} missing 'verses'")
                return False
            
            verses = chapter["verses"]
            if not isinstance(verses, list):
                self.errors.append(f"Chapter {chapter_num} verses must be an array")
                return False
            
            if len(verses) == 0:
                self.warnings.append(f"Chapter {chapter_num} has no verses")
            
            # Validate verses
            prev_verse = 0
            for verse in verses:
                verse_num = verse.get("verse")
                
                if not isinstance(verse_num, int) or verse_num <= 0:
                    self.errors.append(f"Chapter {chapter_num}: invalid verse number {verse_num}")
                    return False
                
                if verse_num <= prev_verse:
                    self.errors.append(f"Chapter {chapter_num}: verses not in order")
                    return False
                
                prev_verse = verse_num
                
                # Check text
                if "text" not in verse or not verse["text"].strip():
                    self.errors.append(f"Chapter {chapter_num} verse {verse_num}: missing or empty text")
                    return False
                
                # Check reference if present
                if "reference" in verse and not verse["reference"].strip():
                    self.warnings.append(f"Chapter {chapter_num} verse {verse_num}: empty reference")
        
        return len(self.errors) == 0
    
    def _get_book_meta(self, book_id: str) -> Dict[str, Any]:
        """Get book metadata."""
        for book in self.books_meta:
            if book["id"] == book_id:
                return book
        return None
    
    def validate_directory(self, language_dir: str) -> Dict[str, Any]:
        """
        Validate all books in a language directory.
        
        Returns a summary dict with:
        - total: number of files checked
        - valid: number of valid files
        - invalid: list of invalid files
        - errors: list of all errors
        - warnings: list of all warnings
        """
        lang_path = Path(language_dir)
        if not lang_path.exists():
            return {"error": f"Directory not found: {language_dir}"}
        
        results = {
            "total": 0,
            "valid": 0,
            "invalid": [],
            "errors": [],
            "warnings": []
        }
        
        for book_file in sorted(lang_path.glob("*.json")):
            results["total"] += 1
            language = lang_path.name  # Get language code from parent dir
            
            if self.validate_book_file(str(book_file), language):
                results["valid"] += 1
            else:
                results["invalid"].append(book_file.name)
                results["errors"].extend([f"{book_file.name}: {e}" for e in self.errors])
            
            results["warnings"].extend([f"{book_file.name}: {w}" for w in self.warnings])
        
        return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python bible_validator.py <file_or_directory> [language_code]")
        sys.exit(1)
    
    path = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else "en"
    
    validator = BibleValidator()
    
    if Path(path).is_file():
        valid = validator.validate_book_file(path, language)
        print(f"\n=== Validation: {path} ===")
        print(f"Valid: {valid}")
        if validator.errors:
            print("\nErrors:")
            for err in validator.errors:
                print(f"  - {err}")
        if validator.warnings:
            print("\nWarnings:")
            for warn in validator.warnings:
                print(f"  - {warn}")
    else:
        results = validator.validate_directory(path)
        print(f"\n=== Directory Validation: {path} ===")
        print(f"Total files: {results['total']}")
        print(f"Valid: {results['valid']}")
        print(f"Invalid: {len(results['invalid'])}")
        
        if results['invalid']:
            print(f"\nInvalid files:")
            for f in results['invalid']:
                print(f"  - {f}")
        
        if results['errors']:
            print(f"\nErrors:")
            for e in results['errors']:
                print(f"  - {e}")
        
        if results['warnings']:
            print(f"\nWarnings:")
            for w in results['warnings'][:10]:  # Show first 10
                print(f"  - {w}")
            if len(results['warnings']) > 10:
                print(f"  ... and {len(results['warnings']) - 10} more")


if __name__ == "__main__":
    main()