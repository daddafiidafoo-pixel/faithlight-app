import React, { useState, useEffect } from 'react';
import { Highlighter, Filter, BookOpen, Trash2, RefreshCw } from 'lucide-react';
import { loadHighlights, removeHighlight, HIGHLIGHT_COLORS, getColorById } from '@/lib/highlightsStore';
import { toast } from 'sonner';

export default function MyHighlightsPage() {
  const [highlights, setHighlights] = useState([]);
  const [colorFilter, setColorFilter] = useState('all');
  const [bookFilter, setBookFilter] = useState('all');

  useEffect(() => { setHighlights(loadHighlights()); }, []);

  const books = ['all', ...new Set(highlights.map(h => h.bookName).filter(Boolean))];

  const filtered = highlights.filter(h => {
    if (colorFilter !== 'all' && h.color !== colorFilter) return false;
    if (bookFilter !== 'all' && h.bookName !== bookFilter) return false;
    return true;
  });

  const del = (reference) => {
    removeHighlight(reference);
    setHighlights(loadHighlights());
    toast.success('Highlight removed');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Highlighter size={20} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Highlights</h1>
          <span className="ml-auto text-sm text-gray-400">{filtered.length} verses</span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5 space-y-3">
          {/* Color filter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Filter by Color</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setColorFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${colorFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                All
              </button>
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColorFilter(c.id)}
                  style={{ backgroundColor: colorFilter === c.id ? c.ring : c.bg, color: colorFilter === c.id ? 'white' : '#374151' }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Book filter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Filter by Book</p>
            <select
              value={bookFilter}
              onChange={e => setBookFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            >
              {books.map(b => <option key={b} value={b}>{b === 'all' ? 'All Books' : b}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Highlighter className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No highlights yet</p>
            <p className="text-gray-300 text-sm mt-1">Tap the highlight icon while reading any verse</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(h => {
              const color = getColorById(h.color);
              return (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div style={{ backgroundColor: color.bg }} className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={12} style={{ color: color.ring }} />
                        <span className="text-xs font-bold" style={{ color: color.ring }}>{h.reference}</span>
                      </div>
                      <button onClick={() => del(h.reference)} className="p-1 text-gray-400 hover:text-red-500 rounded-full">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 italic leading-relaxed">"{h.text}"</p>
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{h.bookName}</span>
                    <span className="text-xs text-gray-300">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}