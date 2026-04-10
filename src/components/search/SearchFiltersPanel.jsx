import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const BOOK_CATEGORIES = {
  'Law':               ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy'],
  'History':           ['Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther'],
  'Poetry':            ['Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon'],
  'Major Prophets':    ['Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel'],
  'Minor Prophets':    ['Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'],
  'Gospels':           ['Matthew','Mark','Luke','John'],
  'NT History':        ['Acts'],
  'Pauline Epistles':  ['Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon'],
  'General Epistles':  ['Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude'],
  'Prophecy':          ['Revelation'],
};

const TRANSLATIONS = ['WEB', 'KJV', 'ASV'];

export default function SearchFiltersPanel({ filters, onChange }) {
  const { scope, translation, testament, categories } = filters;

  const toggleCategory = (cat) => {
    const next = categories.includes(cat)
      ? categories.filter(c => c !== cat)
      : [...categories, cat];
    onChange({ ...filters, categories: next });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Scope */}
      <div>
        <label className="text-xs font-bold uppercase text-gray-400 block mb-1.5">Search Scope</label>
        <Select value={scope} onValueChange={v => onChange({ ...filters, scope: v })}>
          <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current translation</SelectItem>
            <SelectItem value="all">All translations</SelectItem>
          </SelectContent>
        </Select>

        {scope === 'current' && (
          <div className="mt-3">
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1.5">Translation</label>
            <Select value={translation} onValueChange={v => onChange({ ...filters, translation: v })}>
              <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRANSLATIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Testament */}
      <div>
        <label className="text-xs font-bold uppercase text-gray-400 block mb-1.5">Testament</label>
        <div className="flex gap-2">
          {[['any','Any'],['ot','Old'],['nt','New']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, testament: v })}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                testament === v
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="flex items-end">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onChange({ scope: 'current', translation: localStorage.getItem('preferred_translation') || 'WEB', testament: 'any', categories: [] })}
        >
          Reset Filters
        </Button>
      </div>

      {/* Book Categories — full width */}
      <div className="sm:col-span-3">
        <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Book Category</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BOOK_CATEGORIES).map(([cat, books]) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                categories.includes(cat)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cat} <span className="opacity-60">({books.length})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}