import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Copy, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/I18nProvider';
import { toast } from 'sonner';

export default function SavedVersesDashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch current user
  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights', user?.id],
    queryFn: () => base44.entities.HighlightItem.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', user?.id],
    queryFn: () => base44.entities.HighlightCollection.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  // Filter and sort
  let filtered = highlights;

  if (searchTerm) {
    filtered = filtered.filter(
      (h) =>
        h.verse_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.verse_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedCollection !== 'all') {
    filtered = filtered.filter((h) => h.collection_ids?.includes(selectedCollection));
  }

  if (sortBy === 'recent') {
    filtered = [...filtered].reverse();
  } else if (sortBy === 'book') {
    filtered = [...filtered].sort((a, b) => a.book_code.localeCompare(b.book_code));
  }

  const handleCopy = (verseRef, verseText) => {
    navigator.clipboard.writeText(`${verseRef} - ${verseText}`);
    toast.success(t('verses.copied', 'Copied to clipboard'));
  };

  const handleDelete = async (id) => {
    await base44.entities.HighlightItem.delete(id);
    toast.success(t('verses.deleted', 'Verse removed'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">
          {t('verses.saved', 'Saved Verses')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('verses.description', 'Organize and explore your highlighted verses')}
        </p>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('verses.search', 'Search verses...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('verses.collection', 'Collection')}
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t('verses.allCollections', 'All Collections')}</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('verses.sortBy', 'Sort By')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recent">{t('verses.recent', 'Most Recent')}</option>
                <option value="book">{t('verses.book', 'By Book')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                {t('verses.moreFilters', 'More Filters')}
              </Button>
            </div>
          </div>
        </div>

        {/* Verses List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">{t('verses.noResults', 'No verses found')}</p>
            </div>
          ) : (
            filtered.map((verse) => (
              <div
                key={verse.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow"
                style={{ borderLeftColor: verse.color === 'yellow' ? '#FBBF24' : '#6366F1' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-900 text-lg">{verse.verse_ref}</h3>
                    <p className="text-gray-700 mt-2 leading-relaxed">{verse.verse_text}</p>

                    {verse.note && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          {t('verses.note', 'Note')}
                        </p>
                        <p className="text-sm text-amber-800">{verse.note}</p>
                      </div>
                    )}

                    {verse.collection_ids && verse.collection_ids.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {verse.collection_ids.map((colId) => {
                          const col = collections.find((c) => c.id === colId);
                          return col ? (
                            <span
                              key={colId}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: col.color }}
                            >
                              {col.icon} {col.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(verse.verse_ref, verse.verse_text)}
                      title={t('verses.copy', 'Copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={t('verses.share', 'Share')}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(verse.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title={t('verses.delete', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          {filtered.length} {t('verses.count', 'verses')}
        </p>
      </div>
    </div>
  );
}