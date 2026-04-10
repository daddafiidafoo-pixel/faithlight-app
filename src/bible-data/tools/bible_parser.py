#!/usr/bin/env python3
"""
FaithLight Bible Reference Parser
Parses verses like "John 3:16" or "Yohannis 3:16" to canonical form
"""

import json
import re
from pathlib import Path
from typing import Optional, Tuple, Dict, Any

class BibleReferenceParser:
    def __init__(self, metadata_path: str = "bible-data/metadata"):
        self.metadata_path = Path(metadata_path)
        self.books_meta = self._load_json("books.json")
        self.aliases_en = self._load_json("aliases.en.json")
        self.aliases_om = self._load_json("aliases.om.json")
        self.all_aliases = {**self.aliases_en, **self.aliases_om}
        
    def _load_json(self, filename: str) -> Dict[str, Any]:
        """Load JSON metadata file."""
        with open(self.metadata_path / filename, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def parse_reference(self, reference: str, language: str = "en") -> Optional[Dict[str, Any]]:
        """
        Parse a Bible reference string.
        
        Examples:
            parse_reference("John 3:16") -> {"book": "john", "chapter": 3, "verse": 16}
            parse_reference("Yohannis 3:16", "om") -> {"book": "john", "chapter": 3, "verse": 16}
        """
        ref = reference.strip().lower()
        
        # Match: Book Chapter:Verse or Book Chapter:Verse-Verse
        pattern = r"^([a-zA-Z0-9\s':.-]+?)\s+(\d+):(\d+)(?:-(\d+))?$"
        match = re.match(pattern, ref)
        
        if not match:
            return None
        
        book_name = match.group(1).strip()
        chapter = int(match.group(2))
        verse_start = int(match.group(3))
        verse_end = int(match.group(4)) if match.group(4) else verse_start
        
        # Resolve book name to canonical ID
        book_id = self._resolve_book(book_name)
        if not book_id:
            return None
        
        # Validate chapter exists
        book_meta = self._get_book_meta(book_id)
        if not book_meta or chapter > book_meta["chapters"]:
            return None
        
        return {
            "book": book_id,
            "book_order": book_meta["order"],
            "chapter": chapter,
            "verse": verse_start,
            "verse_end": verse_end,
            "is_range": verse_start != verse_end
        }
    
    def _resolve_book(self, book_name: str) -> Optional[str]:
        """Resolve book name to canonical ID."""
        book_lower = book_name.lower()
        
        for book_id, aliases in self.all_aliases.items():
            if book_lower in aliases:
                return book_id
        
        return None
    
    def _get_book_meta(self, book_id: str) -> Optional[Dict[str, Any]]:
        """Get book metadata."""
        for book in self.books_meta:
            if book["id"] == book_id:
                return book
        return None
    
    def format_reference(self, book_id: str, chapter: int, verse: int, 
                        language: str = "en", localized: bool = False) -> str:
        """
        Format a canonical reference for display.
        
        Examples:
            format_reference("john", 3, 16, "en") -> "John 3:16"
            format_reference("john", 3, 16, "om") -> "Yohannis 3:16"
        """
        # Get localized book name
        book_meta = self._get_book_meta(book_id)
        if not book_meta:
            return ""
        
        # For now, use the first alias as the display name
        aliases = self.aliases_en if language == "en" else self.aliases_om
        book_name = aliases.get(book_id, [book_id])[0].title()
        
        return f"{book_name} {chapter}:{verse}"


class VerseID:
    """Generate and parse verse IDs."""
    
    @staticmethod
    def create(book_id: str, chapter: int, verse: int) -> str:
        """Create a canonical verse ID."""
        return f"{book_id}-{chapter}-{verse}"
    
    @staticmethod
    def parse(verse_id: str) -> Tuple[str, int, int]:
        """Parse a verse ID."""
        parts = verse_id.split("-")
        if len(parts) < 3:
            raise ValueError(f"Invalid verse ID: {verse_id}")
        book = "-".join(parts[:-2])
        chapter = int(parts[-2])
        verse = int(parts[-1])
        return book, chapter, verse


def main():
    parser = BibleReferenceParser()
    
    # Test cases
    test_refs = [
        ("John 3:16", "en"),
        ("Yohannis 3:16", "om"),
        ("1 Corinthians 13:4-7", "en"),
        ("Psalms 23:1", "en"),
        ("Faarfannaa 23:1", "om"),
    ]
    
    print("=== Bible Reference Parser Test ===\n")
    for ref, lang in test_refs:
        parsed = parser.parse_reference(ref, lang)
        if parsed:
            formatted_en = parser.format_reference(parsed["book"], parsed["chapter"], 
                                                   parsed["verse"], "en")
            formatted_om = parser.format_reference(parsed["book"], parsed["chapter"], 
                                                   parsed["verse"], "om")
            print(f"Input: {ref} ({lang})")
            print(f"  Parsed: {parsed}")
            print(f"  EN: {formatted_en}")
            print(f"  OM: {formatted_om}")
        else:
            print(f"Input: {ref} ({lang}) - FAILED TO PARSE")
        print()


if __name__ == "__main__":
    main()