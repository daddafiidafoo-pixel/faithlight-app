import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Zap, Volume2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BookDetailModal from '../components/bible/BookDetailModal';

// Normalize testament value to OT/NT regardless of language stored in DB
function normalizeTestament(testament) {
  if (!testament) return 'OT';
  const t = testament.toLowerCase();
  if (t.includes('haaraa') || t.includes('new') || t === 'nt') return 'NT';
  return 'OT'; // Default OT for "Kakuu Moofaa", "Old", "OT", etc.
}

// Get display name based on selected language
function getBookName(book, language) {
  if (language === 'om') return book.name_om || book.name_en || 'Unknown';
  return book.name_en || book.name_om || 'Unknown';
}

function getAbbreviation(book, language) {
  if (language === 'om') return book.abbreviation_om || book.abbreviation_en || '';
  return book.abbreviation_en || book.abbreviation_om || '';
}

const TESTAMENT_COLORS = {
  OT: { badge: 'bg-amber-100 text-amber-800 border-amber-200', section: 'border-amber-300 bg-amber-50', hover: 'hover:border-amber-400 hover:shadow-md' },
  NT: { badge: 'bg-blue-100 text-blue-800 border-blue-200',   section: 'border-blue-300 bg-blue-50',   hover: 'hover:border-blue-400 hover:shadow-md' },
};

export default function BibleCanon() {
  const [search, setSearch] = useState('');
  const [filterTestament, setFilterTestament] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  const { data: rawBooks = [], isLoading } = useQuery({
    queryKey: ['bible-books'],
    queryFn: () => base44.entities.BibleBook.filter({ is_active: true }, 'order_number', 66).catch(() => []),
  });

  // Normalize all books to a consistent shape
  const books = rawBooks.map(b => ({
    ...b,
    _testament: normalizeTestament(b.testament),
    _name: getBookName(b, language),
    _abbreviation: getAbbreviation(b, language),
    _chapters: b.chapters_count || b.chapter_count || 0,
    _order: b.order_number || b.canonical_order || 0,
  }));

  const otBooks = books.filter(b => b._testament === 'OT');
  const ntBooks = books.filter(b => b._testament === 'NT');

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      b._name.toLowerCase().includes(q) ||
      b._abbreviation.toLowerCase().includes(q) ||
      (b.name_en || '').toLowerCase().includes(q) ||
      (b.name_om || '').toLowerCase().includes(q);
    const matchT = filterTestament === 'all' || b._testament === filterTestament;
    return matchSearch && matchT;
  });

  // Group by testament
  const otFiltered = filtered.filter(b => b._testament === 'OT');
  const ntFiltered = filtered.filter(b => b._testament === 'NT');

  const groups = [];
  if (otFiltered.length > 0) groups.push({ testament: 'OT', label: language === 'om' ? 'Kakuu Moofaa' : 'Old Testament', books: otFiltered });
  if (ntFiltered.length > 0) groups.push({ testament: 'NT', label: language === 'om' ? 'Kakuu Haaraa' : 'New Testament', books: ntFiltered });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Language selector */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Select language</span>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="en">🇬🇧 English</option>
              <option value="om">🇪🇹 Afaan Oromo</option>
            </select>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bible Canon</h1>
          </div>
          <p className="text-gray-500">Protestant 66-book canon — click any book to explore it in depth</p>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              📜 Old Testament: {otBooks.length} books
            </span>
            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              ✝️ New Testament: {ntBooks.length} books
            </span>
            <Link to="/BibleQuizGame">
              <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 h-7 text-xs px-3">
                <Zap className="w-3.5 h-3.5" /> Take Bible Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              className="flex-1 text-sm bg-transparent focus:outline-none"
              placeholder="Search books by name or abbreviation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={filterTestament}
            onChange={e => setFilterTestament(e.target.value)}
          >
            <option value="all">All Testaments</option>
            <option value="OT">Old Testament</option>
            <option value="NT">New Testament</option>
          </select>
        </div>

        {/* Books */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 animate-pulse">Loading Bible canon...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No Bible books found.</div>
        ) : (
          <div className="space-y-8">
            {groups.map(group => {
              const tColors = TESTAMENT_COLORS[group.testament];
              return (
                <div key={group.testament}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`text-xs border ${tColors.badge}`}>{group.label}</Badge>
                    <span className="text-xs text-gray-400">{group.books.length} books</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {group.books.map(book => (
                      <Card
                        key={book.id}
                        className={`border ${tColors.section} ${tColors.hover} transition-all active:scale-95`}
                      >
                        <CardContent className="py-3 px-3">
                          <button className="w-full text-left" onClick={() => setSelectedBook(book)}>
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 leading-tight">{book._name}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{book._abbreviation}</p>
                              </div>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">#{book._order}</span>
                            </div>
                            <div className="mt-1.5">
                              {book._chapters > 0
                                ? <span className="text-[10px] text-gray-500">{book._chapters} chapters</span>
                                : <span className="text-[10px] text-gray-400 italic">Tap to explore</span>
                              }
                            </div>
                          </button>
                          {/* Read + Listen actions */}
                          <div className="flex gap-1.5 mt-2.5">
                            <Link
                              to="/BibleReaderPage"
                              className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                            >
                              <BookOpen className="w-2.5 h-2.5" /> Read
                            </Link>
                            <button
                              onClick={() => navigate('/AudioBiblePage')}
                              className="flex-1 flex items-center justify-center gap-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                            >
                              <Volume2 className="w-2.5 h-2.5" /> Listen
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BookDetailModal
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}