import React, { useState } from 'react';
import { parseVerseReference } from './VerseReferenceParser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, AlertCircle } from 'lucide-react';

export default function VerseReferenceSearch({ onVerseFound }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseVerseReference(input);

    if (!parsed) {
      setError('Invalid verse reference. Try "John 3:16", "Jn 3:16", or "ዮሐ 3:16"');
      return;
    }

    if (onVerseFound) {
      onVerseFound(parsed);
    } else {
      // Navigate to Bible reader with the parsed verse
      navigate(
        createPageUrl(
          `BibleReader?book=${parsed.bookKey}&chapter=${parsed.chapter}&verse=${parsed.verse}&lang=${parsed.language}`
        )
      );
    }

    setInput('');
  };

  return (
    <form onSubmit={handleSearch} className="w-full space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="e.g., John 3:16 or Jn 3:16 or ዮሐ 3:16"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" className="gap-2">
          <Search className="w-4 h-4" /> Find
        </Button>
      </div>
      {error && (
        <div className="flex gap-2 text-sm text-red-600 items-start">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}