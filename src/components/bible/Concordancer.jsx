import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

export default function Concordancer({ translation = 'WEB', isDarkMode }) {
  const [searchWord, setSearchWord] = useState('');
  const [submittedWord, setSubmittedWord] = useState('');
  const [expandedBook, setExpandedBook] = useState(null);

  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['concordancer', submittedWord, translation],
    queryFn: async () => {
      if (!submittedWord || submittedWord.length < 2) return [];
      // Use AI to find occurrences since we can't do full-text search across all verses
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Bible concordance expert. List the top 20 most important Bible verses (${translation} translation) that contain the word or concept "${submittedWord}". 
Include both exact occurrences and closely related usages.
Return JSON with an array of occurrences, each with: book, chapter (number), verse (number), text (the verse text with the word highlighted using *asterisks*).`,
        response_json_schema: {
          type: 'object',
          properties: {
            occurrences: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  book: { type: 'string' },
                  chapter: { type: 'number' },
                  verse: { type: 'number' },
                  text: { type: 'string' },
                }
              }
            },
            total_count: { type: 'number' },
            summary: { type: 'string' }
          }
        }
      });
      return result;
    },
    enabled: !!submittedWord && submittedWord.length >= 2,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchWord.trim().length >= 2) setSubmittedWord(searchWord.trim());
  };

  // Group by book
  const byBook = (results?.occurrences || []).reduce((acc, item) => {
    if (!acc[item.book]) acc[item.book] = [];
    acc[item.book].push(item);
    return acc;
  }, {});

  const highlightWord = (text, word) => {
    if (!text) return text;
    // Replace *word* markdown with highlighted span
    return text.replace(/\*(.*?)\*/g, '<mark class="bg-amber-200 text-amber-900 rounded px-0.5">$1</mark>');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-1" style={{ color: textColor }}>📚 Concordancer</h3>
        <p className="text-xs mb-3" style={{ color: mutedColor }}>Find every occurrence of a word or concept across Scripture</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
            <Input
              value={searchWord}
              onChange={e => setSearchWord(e.target.value)}
              placeholder="Search a word (e.g. grace, faith, light...)"
              className="pl-9"
              style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9FAF7', borderColor, color: textColor }}
            />
          </div>
          <Button type="submit" size="sm" disabled={isLoading || searchWord.length < 2}
            style={{ backgroundColor: '#6B8E6E', color: '#fff' }}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-6 justify-center" style={{ color: mutedColor }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Searching Scripture...</span>
        </div>
      )}

      {submittedWord && !isLoading && results?.occurrences?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-semibold" style={{ color: textColor }}>
              Results for "<span style={{ color: '#6B8E6E' }}>{submittedWord}</span>"
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                {results.occurrences.length} occurrences shown
                {results.total_count > results.occurrences.length && ` of ~${results.total_count}`}
              </Badge>
            </div>
          </div>

          {results.summary && (
            <div className="text-xs p-3 rounded-lg italic" style={{ backgroundColor: isDarkMode ? '#1A2820' : '#F0FDF4', color: mutedColor }}>
              💡 {results.summary}
            </div>
          )}

          {Object.entries(byBook).map(([bookName, verses]) => (
            <div key={bookName} className="rounded-xl overflow-hidden border" style={{ borderColor }}>
              <button
                onClick={() => setExpandedBook(expandedBook === bookName ? null : bookName)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                style={{ backgroundColor: isDarkMode ? '#1A2A1A' : '#F0FDF4' }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: '#6B8E6E' }} />
                  <span className="text-sm font-semibold" style={{ color: textColor }}>{bookName}</span>
                  <Badge className="bg-green-100 text-green-800 border-0 text-xs">{verses.length}</Badge>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedBook === bookName ? 'rotate-90' : ''}`} style={{ color: mutedColor }} />
              </button>
              {expandedBook === bookName && (
                <div className="divide-y" style={{ borderColor, backgroundColor: cardColor }}>
                  {verses.map((v, i) => (
                    <div key={i} className="px-4 py-3">
                      <Link
                        to={`${createPageUrl('BibleReader')}?book=${encodeURIComponent(v.book)}&chapter=${v.chapter}`}
                        className="text-xs font-bold hover:underline"
                        style={{ color: '#6B8E6E' }}
                      >
                        {v.book} {v.chapter}:{v.verse}
                      </Link>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: textColor }}
                        dangerouslySetInnerHTML={{ __html: highlightWord(v.text, submittedWord) }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {submittedWord && !isLoading && !results?.occurrences?.length && (
        <div className="text-center py-8" style={{ color: mutedColor }}>
          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No results found for "{submittedWord}"</p>
        </div>
      )}
    </div>
  );
}