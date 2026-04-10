import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen } from 'lucide-react';

const BIBLE_BOOKS = [
  { name: 'Genesis', id: 1, chapters: 50, abbrev: ['Gen', 'Ge', 'Gn'] },
  { name: 'Exodus', id: 2, chapters: 40, abbrev: ['Exo', 'Ex', 'Exod'] },
  { name: 'Leviticus', id: 3, chapters: 27, abbrev: ['Lev', 'Le', 'Lv'] },
  { name: 'Numbers', id: 4, chapters: 36, abbrev: ['Num', 'Nu', 'Nm', 'Nb'] },
  { name: 'Deuteronomy', id: 5, chapters: 34, abbrev: ['Deu', 'Dt', 'Deut'] },
  { name: 'Joshua', id: 6, chapters: 24, abbrev: ['Jos', 'Josh'] },
  { name: 'Judges', id: 7, chapters: 21, abbrev: ['Jdg', 'Judg'] },
  { name: 'Ruth', id: 8, chapters: 4, abbrev: ['Rut', 'Ru', 'Rth'] },
  { name: '1 Samuel', id: 9, chapters: 31, abbrev: ['1Sa', '1Sam', '1S'] },
  { name: '2 Samuel', id: 10, chapters: 24, abbrev: ['2Sa', '2Sam', '2S'] },
  { name: '1 Kings', id: 11, chapters: 22, abbrev: ['1Ki', '1Kg', '1Kgs'] },
  { name: '2 Kings', id: 12, chapters: 25, abbrev: ['2Ki', '2Kg', '2Kgs'] },
  { name: '1 Chronicles', id: 13, chapters: 29, abbrev: ['1Ch', '1Chr'] },
  { name: '2 Chronicles', id: 14, chapters: 36, abbrev: ['2Ch', '2Chr'] },
  { name: 'Ezra', id: 15, chapters: 10, abbrev: ['Ezr', 'Ez'] },
  { name: 'Nehemiah', id: 16, chapters: 13, abbrev: ['Neh', 'Ne'] },
  { name: 'Esther', id: 17, chapters: 10, abbrev: ['Est', 'Es'] },
  { name: 'Job', id: 18, chapters: 42, abbrev: ['Job', 'Jb'] },
  { name: 'Psalm', id: 19, chapters: 150, abbrev: ['Psa', 'Ps', 'Psalms'] },
  { name: 'Proverbs', id: 20, chapters: 31, abbrev: ['Pro', 'Pr', 'Prv'] },
  { name: 'Ecclesiastes', id: 21, chapters: 12, abbrev: ['Ecc', 'Ec', 'Eccl'] },
  { name: 'Song of Songs', id: 22, chapters: 8, abbrev: ['Sng', 'SS', 'Song', 'Sol'] },
  { name: 'Isaiah', id: 23, chapters: 66, abbrev: ['Isa', 'Is'] },
  { name: 'Jeremiah', id: 24, chapters: 52, abbrev: ['Jer', 'Je', 'Jr'] },
  { name: 'Lamentations', id: 25, chapters: 5, abbrev: ['Lam', 'La'] },
  { name: 'Ezekiel', id: 26, chapters: 48, abbrev: ['Eze', 'Ezk', 'Ezek'] },
  { name: 'Daniel', id: 27, chapters: 12, abbrev: ['Dan', 'Da', 'Dn'] },
  { name: 'Hosea', id: 28, chapters: 14, abbrev: ['Hos', 'Ho'] },
  { name: 'Joel', id: 29, chapters: 3, abbrev: ['Joe', 'Jl'] },
  { name: 'Amos', id: 30, chapters: 9, abbrev: ['Amo', 'Am'] },
  { name: 'Obadiah', id: 31, chapters: 1, abbrev: ['Oba', 'Ob'] },
  { name: 'Jonah', id: 32, chapters: 4, abbrev: ['Jon', 'Jnh'] },
  { name: 'Micah', id: 33, chapters: 7, abbrev: ['Mic', 'Mc'] },
  { name: 'Nahum', id: 34, chapters: 3, abbrev: ['Nah', 'Na'] },
  { name: 'Habakkuk', id: 35, chapters: 3, abbrev: ['Hab', 'Hb'] },
  { name: 'Zephaniah', id: 36, chapters: 3, abbrev: ['Zep', 'Zp'] },
  { name: 'Haggai', id: 37, chapters: 2, abbrev: ['Hag', 'Hg'] },
  { name: 'Zechariah', id: 38, chapters: 14, abbrev: ['Zec', 'Zc', 'Zch'] },
  { name: 'Malachi', id: 39, chapters: 4, abbrev: ['Mal', 'Ml'] },
  { name: 'Matthew', id: 40, chapters: 28, abbrev: ['Mat', 'Mt', 'Matt'] },
  { name: 'Mark', id: 41, chapters: 16, abbrev: ['Mar', 'Mk', 'Mrk'] },
  { name: 'Luke', id: 42, chapters: 24, abbrev: ['Luk', 'Lk'] },
  { name: 'John', id: 43, chapters: 21, abbrev: ['Joh', 'Jn'] },
  { name: 'Acts', id: 44, chapters: 28, abbrev: ['Act', 'Ac'] },
  { name: 'Romans', id: 45, chapters: 16, abbrev: ['Rom', 'Ro', 'Rm'] },
  { name: '1 Corinthians', id: 46, chapters: 16, abbrev: ['1Co', '1Cor'] },
  { name: '2 Corinthians', id: 47, chapters: 13, abbrev: ['2Co', '2Cor'] },
  { name: 'Galatians', id: 48, chapters: 6, abbrev: ['Gal', 'Ga'] },
  { name: 'Ephesians', id: 49, chapters: 6, abbrev: ['Eph', 'Ep'] },
  { name: 'Philippians', id: 50, chapters: 4, abbrev: ['Php', 'Phi', 'Phil'] },
  { name: 'Colossians', id: 51, chapters: 4, abbrev: ['Col'] },
  { name: '1 Thessalonians', id: 52, chapters: 5, abbrev: ['1Th', '1Thes', '1Thess'] },
  { name: '2 Thessalonians', id: 53, chapters: 3, abbrev: ['2Th', '2Thes', '2Thess'] },
  { name: '1 Timothy', id: 54, chapters: 6, abbrev: ['1Ti', '1Tim'] },
  { name: '2 Timothy', id: 55, chapters: 4, abbrev: ['2Ti', '2Tim'] },
  { name: 'Titus', id: 56, chapters: 3, abbrev: ['Tit', 'Ti'] },
  { name: 'Philemon', id: 57, chapters: 1, abbrev: ['Phm', 'Pm'] },
  { name: 'Hebrews', id: 58, chapters: 13, abbrev: ['Heb', 'He'] },
  { name: 'James', id: 59, chapters: 5, abbrev: ['Jam', 'Jas', 'Jm'] },
  { name: '1 Peter', id: 60, chapters: 5, abbrev: ['1Pe', '1Pet', '1P'] },
  { name: '2 Peter', id: 61, chapters: 3, abbrev: ['2Pe', '2Pet', '2P'] },
  { name: '1 John', id: 62, chapters: 5, abbrev: ['1Jn', '1Jo', '1J'] },
  { name: '2 John', id: 63, chapters: 1, abbrev: ['2Jn', '2Jo', '2J'] },
  { name: '3 John', id: 64, chapters: 1, abbrev: ['3Jn', '3Jo', '3J'] },
  { name: 'Jude', id: 65, chapters: 1, abbrev: ['Jud', 'Jd'] },
  { name: 'Revelation', id: 66, chapters: 22, abbrev: ['Rev', 'Re', 'Rv'] }
];

export default function GoToVerse({ open, onOpenChange, onNavigate, isDarkMode }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const searchTerm = input.toLowerCase().trim();
    const parsed = parseReference(searchTerm);
    
    if (parsed) {
      setSuggestions([parsed]);
      return;
    }

    // Find matching books
    const matches = BIBLE_BOOKS.filter(book => 
      book.name.toLowerCase().startsWith(searchTerm) ||
      book.abbrev.some(abbr => abbr.toLowerCase().startsWith(searchTerm))
    ).slice(0, 5);

    setSuggestions(matches.map(book => ({ book: book.name, bookId: book.id })));
    setSelectedIndex(0);
  }, [input]);

  const parseReference = (ref) => {
    // Match patterns like "John 3:16", "Jn 3:16", "John 3", "1 Cor 13:4-7"
    const pattern = /^([\d\s]*[a-z]+)\s*(\d+)?:?(\d+)?(?:-(\d+))?$/i;
    const match = ref.match(pattern);
    
    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = match[2] ? parseInt(match[2]) : null;
    const verse = match[3] ? parseInt(match[3]) : null;

    const book = BIBLE_BOOKS.find(b => 
      b.name.toLowerCase() === bookName.toLowerCase() ||
      b.abbrev.some(abbr => abbr.toLowerCase() === bookName.toLowerCase())
    );

    if (!book) return null;
    if (chapter && chapter > book.chapters) return null;

    return {
      book: book.name,
      bookId: book.id,
      chapter,
      verse,
      display: `${book.name}${chapter ? ` ${chapter}` : ''}${verse ? `:${verse}` : ''}`
    };
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    const selection = suggestions[selectedIndex];
    if (!selection) return;

    onNavigate({
      book: selection.book,
      chapter: selection.chapter?.toString() || '1',
      verse: selection.verse
    });
    
    setInput('');
    onOpenChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const hoverColor = isDarkMode ? '#2A2F2C' : '#F5F5F5';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{ backgroundColor: cardColor }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: textColor }}>
            <Search className="w-5 h-5" style={{ color: primaryColor }} />
            Go To Verse
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="e.g., John 3:16, Psalm 23, 1 Cor 13"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-lg"
              style={{ 
                backgroundColor: cardColor, 
                borderColor: borderColor,
                color: textColor 
              }}
            />
            <p className="text-xs mt-2" style={{ color: mutedColor }}>
              Try: "John 3:16" or "Ps 23" or "Genesis 1"
            </p>
          </div>

          {suggestions.length > 0 && (
            <div 
              className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto"
              style={{ borderColor: borderColor }}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    handleSubmit();
                  }}
                  className="w-full px-4 py-3 text-left transition-colors flex items-center gap-3"
                  style={{
                    backgroundColor: selectedIndex === index ? hoverColor : cardColor,
                    color: textColor,
                    borderBottom: index < suggestions.length - 1 ? `1px solid ${borderColor}` : 'none'
                  }}
                >
                  <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
                  <div>
                    <div className="font-semibold">
                      {suggestion.display || suggestion.book}
                    </div>
                    {!suggestion.chapter && (
                      <div className="text-xs" style={{ color: mutedColor }}>
                        Press Enter to go to chapter 1
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <Button
            type="submit"
            disabled={suggestions.length === 0}
            className="w-full gap-2"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            <BookOpen className="w-4 h-4" />
            Go
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}