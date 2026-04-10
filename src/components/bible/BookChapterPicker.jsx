import React, { useState, useMemo } from 'react';
import { BIBLE_BOOKS, OLD_TESTAMENT, NEW_TESTAMENT, getChapterNumbers } from '../lib/bibleBooks';
import { useLocale } from '../lib/useLocale';
import { useI18n } from '../I18nProvider';
import { Search, ChevronRight } from 'lucide-react';

/**
 * Reusable Book → Chapter picker.
 * Props:
 *   selectedBook  {string}  - currently selected book code
 *   selectedChapter {number} - currently selected chapter
 *   language      {string}  - 'en' | 'om' (default 'en')
 *   onSelect      ({bookCode, chapter}) => void
 *   compact       {boolean} - smaller inline layout
 */
export default function BookChapterPicker({ selectedBook, selectedChapter, language: _langProp, onSelect, compact = false }) {
  const { lang: ctxLang, bookName: _bookName, safeT } = useLocale();
  const { t } = useI18n();
  // prefer prop if explicitly passed, else use global language
  const language = _langProp || ctxLang;
  const getLocalizedBookName = (book) => _bookName(book);
  const [step, setStep] = useState('book'); // 'book' | 'chapter'
  const [search, setSearch] = useState('');
  const [testament, setTestament] = useState('old');

  const filteredBooks = useMemo(() => {
    const list = testament === 'old' ? OLD_TESTAMENT : NEW_TESTAMENT;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return BIBLE_BOOKS.filter(b =>
      b.name_en.toLowerCase().includes(q) ||
      b.name_om.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q)
    );
  }, [search, testament]);

  const [pendingBook, setPendingBook] = useState(null);
  const bookForChapters = pendingBook || (selectedBook ? BIBLE_BOOKS.find(b => b.code === selectedBook) : null);
  const chapters = bookForChapters ? getChapterNumbers(bookForChapters.code) : [];

  const handleBookSelect = (book) => {
    setPendingBook(book);
    setSearch('');
    setStep('chapter');
  };

  const handleChapterSelect = (ch) => {
    onSelect({ bookCode: bookForChapters.code, chapter: ch });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <button onClick={() => { setStep('book'); setPendingBook(null); }}
          className="font-bold text-indigo-700 hover:underline">
          {selectedBook ? getLocalizedBookName(BIBLE_BOOKS.find(b => b.code === selectedBook)) : safeT('reader.book', 'Book')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button onClick={() => setStep('chapter')} className="font-bold text-indigo-700 hover:underline">
          {selectedChapter || 'Ch'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Step: Book */}
      {step === 'book' && (
        <div>
          {/* Search bar */}
          <div className="px-3 pt-3 pb-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={safeT('reader.searchBook', language === 'om' ? 'Kitaaba barbaadi…' : 'Search book…')}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Testament tabs */}
          {!search && (
            <div className="flex gap-1 px-3 pt-2 pb-1">
              {[['old', t('bible.oldTestament', 'Old Testament')], ['new', t('bible.newTestament', 'New Testament')]].map(([v, l]) => (
                <button key={v} onClick={() => setTestament(v)}
                  className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${testament === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {l}
                </button>
              ))}
            </div>
          )}

          {/* Book grid */}
          <div className="overflow-y-auto max-h-72 px-3 py-2">
            <div className="grid grid-cols-3 gap-1.5">
              {filteredBooks.map(book => {
                const isSelected = book.code === selectedBook;
                return (
                  <button key={book.code} onClick={() => handleBookSelect(book)}
                    className={`px-2 py-2 rounded-xl text-left text-xs font-bold border transition-all leading-tight
                      ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                    <div className="truncate">{getLocalizedBookName(book)}</div>
                    <div className={`text-xs font-normal mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {book.chapters} ch
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step: Chapter */}
      {step === 'chapter' && bookForChapters && (
        <div>
          <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <button onClick={() => setStep('book')} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">
                  ← {getLocalizedBookName(bookForChapters)}
            </button>
          </div>
          <div className="overflow-y-auto max-h-72 p-3">
            <div className="grid grid-cols-6 gap-1.5">
              {chapters.map(ch => {
                const isSelected = bookForChapters.code === selectedBook && ch === selectedChapter;
                return (
                  <button key={ch} onClick={() => handleChapterSelect(ch)}
                    className={`h-9 w-full rounded-lg text-xs font-extrabold border transition-all
                      ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}