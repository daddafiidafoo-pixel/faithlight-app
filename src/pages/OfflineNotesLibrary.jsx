import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookMarked, Highlighter, Search, Trash2, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../components/I18nProvider';
import { toast } from 'sonner';

export default function OfflineNotesLibrary() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, notes, highlights
  const [filterBook, setFilterBook] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          setLoading(false);
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [notesData, highlightsData] = await Promise.all([
          base44.entities.OfflineNote.filter({ user_id: currentUser.id }, '-created_date', 500),
          base44.entities.OfflineHighlight.filter({ user_id: currentUser.id }, '-created_date', 500),
        ]);

        setNotes(notesData || []);
        setHighlights(highlightsData || []);
      } catch (err) {
        console.error('Error loading notes/highlights:', err);
        toast.error('Failed to load your notes and highlights.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const books = [...new Set([...notes, ...highlights].map(i => i.book))].sort();

  const filtered = [
    ...(filterType === 'all' || filterType === 'notes' ? notes : []),
    ...(filterType === 'all' || filterType === 'highlights' ? highlights : []),
  ]
    .filter(item => !filterBook || item.book === filterBook)
    .filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.text?.toLowerCase().includes(searchLower) ||
        item.book?.toLowerCase().includes(searchLower) ||
        item.chapter?.toString().includes(searchQuery)
      );
    })
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedItems(filtered.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelect = id => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    
    setDeleting(true);
    try {
      const isNote = notes.some(n => n.id === id);
      const entity = isNote ? base44.entities.OfflineNote : base44.entities.OfflineHighlight;
      await entity.delete(id);
      
      if (isNote) {
        setNotes(notes.filter(n => n.id !== id));
      } else {
        setHighlights(highlights.filter(h => h.id !== id));
      }
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    if (!window.confirm(`Delete ${selectedItems.length} items?`)) return;

    setDeleting(true);
    try {
      for (const id of selectedItems) {
        const isNote = notes.some(n => n.id === id);
        const entity = isNote ? base44.entities.OfflineNote : base44.entities.OfflineHighlight;
        await entity.delete(id);
      }
      
      setNotes(notes.filter(n => !selectedItems.includes(n.id)));
      setHighlights(highlights.filter(h => !selectedItems.includes(h.id)));
      setSelectedItems([]);
      toast.success(`Deleted ${selectedItems.length} items`);
    } catch (err) {
      toast.error('Failed to delete some items');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">{t('common.login_required', 'Please log in to view your notes and highlights.')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookMarked className="w-8 h-8 text-indigo-600" />
          {t('offline.notes_library', 'Notes & Highlights')}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {notes.length + highlights.length} total items
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search', 'Search...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['all', 'notes', 'highlights'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-white text-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type === 'all' ? 'All' : type === 'notes' ? 'Notes' : 'Highlights'}
              </button>
            ))}
          </div>

          <select
            value={filterBook || ''}
            onChange={e => setFilterBook(e.target.value || null)}
            className="px-3 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400"
          >
            <option value="">All Books</option>
            {books.map(book => (
              <option key={book} value={book}>
                {book}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-blue-900">
            {selectedItems.length} selected
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={deleting}
            className="gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookMarked className="w-12 h-12 mx-auto opacity-20 mb-2" />
            <p>{t('offline.no_items', 'No notes or highlights yet.')}</p>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <input
                type="checkbox"
                checked={selectedItems.length === filtered.length && filtered.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Select all</span>
            </div>

            {filtered.map(item => {
              const isNote = item.text && notes.some(n => n.id === item.id);
              const ref = `${item.book} ${item.chapter}:${item.verse_start || item.verse}`;
              
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                      className="w-4 h-4 rounded border-gray-300 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isNote ? (
                          <BookMarked className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Highlighter className="w-4 h-4 shrink-0" style={{
                            color: {
                              yellow: '#EAB308',
                              green: '#22C55E',
                              blue: '#3B82F6',
                              pink: '#EC4899',
                              purple: '#A855F7',
                            }[item.color] || '#EAB308'
                          }} />
                        )}
                        <span className="text-xs font-semibold text-gray-700">{ref}</span>
                        <span className="text-xs text-gray-500">
                            {item.status === 'pending' ? '(unsynced)' : ''}
                          </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.created_date).toLocaleDateString(lang)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting}
                      className="text-gray-400 hover:text-red-600 transition-colors shrink-0 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}