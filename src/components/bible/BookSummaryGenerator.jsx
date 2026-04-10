import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Loader2, ChevronDown } from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

export default function BookSummaryGenerator({ onGenerateSummary }) {
  const [book, setBook] = useState('');
  const [section, setSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerateSummary = async () => {
    if (!book.trim()) return;

    setIsLoading(true);
    try {
      const query = section.trim() ? `${book} ${section}` : book;
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive contextual summary of ${query}:

1. **Overview**: Brief summary of the book/section's main themes and purpose
2. **Author & Dating**: Who wrote it and when
3. **Original Audience**: Who it was written to and their context
4. **Major Themes**: 3-5 key theological themes running through the book
5. **Structure & Flow**: How the book is organized and progresses
6. **Key Passages**: The most important verses and their significance
7. **Historical Context**: Political, cultural, and religious situation at the time
8. **Theological Contribution**: How this book contributes to biblical theology
9. **Connection to Jesus**: How this book points to or connects with Christ
10. **Practical Application**: What modern believers should take from it

Format with clear markdown headers. Make it scholarly yet accessible.`,
        add_context_from_internet: true
      });

      onGenerateSummary(`Summary: ${query}`, summary);
      setBook('');
      setSection('');
      setExpanded(false);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Book/Section Summary</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-purple-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-purple-200 p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Bible Book:</label>
            <select
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              disabled={isLoading}
            >
              <option value="">Select a book...</option>
              {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Specific Section (optional):</label>
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., Chapters 1-5, or leave blank for full book"
              className="text-sm"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSummary()}
            />
          </div>

          <Button
            onClick={handleGenerateSummary}
            disabled={!book || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
            Generate Summary
          </Button>
        </div>
      )}
    </Card>
  );
}