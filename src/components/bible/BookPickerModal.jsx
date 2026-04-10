/**
 * BookPickerModal — Bilingual book picker (EN / Afaan Oromoo)
 * Groups books by testament, respects language strictly.
 * Never mixes English and Oromo labels.
 */
import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { BIBLE_BOOKS, BIBLE_UI, TESTAMENT_LABELS } from '@/lib/bibleBookNames';

export default function BookPickerModal({ lang = 'en', onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [activeTestament, setActiveTestament] = useState('all');

  const ui = BIBLE_UI[lang] || BIBLE_UI.en;
  const tLabels = TESTAMENT_LABELS[lang] || TESTAMENT_LABELS.en;

  const filtered = BIBLE_BOOKS.filter(b => {
    const name = lang === 'om' ? b.name_om : b.name_en;
    const abbr = lang === 'om' ? b.abbreviation_om : b.abbreviation_en;
    const matchesQuery = !query ||
      name.toLowerCase().includes(query.toLowerCase()) ||
      abbr.toLowerCase().includes(query.toLowerCase());
    const matchesTestament =
      activeTestament === 'all' ||
      (activeTestament === 'OT' && b.testament === 'Kakuu Moofaa') ||
      (activeTestament === 'NT' && b.testament === 'Kakuu Haaraa');
    return matchesQuery && matchesTestament;
  });

  const otBooks = filtered.filter(b => b.testament === 'Kakuu Moofaa');
  const ntBooks = filtered.filter(b => b.testament === 'Kakuu Haaraa');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h2 className="font-bold text-lg text-gray-900">{ui.reader.selectBook}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={ui.search.byKeyword}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Testament tabs */}
        <div className="flex gap-2 px-4 pb-2 shrink-0">
          {[
            { key: 'all', label: lang === 'om' ? 'Hunda' : 'All' },
            { key: 'OT',  label: tLabels.ot },
            { key: 'NT',  label: tLabels.nt },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTestament(tab.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTestament === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Book list */}
        <div className="overflow-y-auto flex-1 px-2 pb-4">
          {otBooks.length > 0 && (
            <div>
              <p className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white">
                {tLabels.ot}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {otBooks.map(b => {
                  const name = lang === 'om' ? b.name_om : b.name_en;
                  return (
                    <button
                      key={b.book_id}
                      onClick={() => onSelect(b)}
                      className="text-left px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <p className="text-sm font-medium leading-tight">{name}</p>
                      <p className="text-xs text-gray-400">{b.chapters_count} ch</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {ntBooks.length > 0 && (
            <div className="mt-2">
              <p className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white">
                {tLabels.nt}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {ntBooks.map(b => {
                  const name = lang === 'om' ? b.name_om : b.name_en;
                  return (
                    <button
                      key={b.book_id}
                      onClick={() => onSelect(b)}
                      className="text-left px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <p className="text-sm font-medium leading-tight">{name}</p>
                      <p className="text-xs text-gray-400">{b.chapters_count} ch</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{ui.search.noResults}</p>
          )}
        </div>
      </div>
    </div>
  );
}