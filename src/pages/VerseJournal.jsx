import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Loader, BookOpen, Search, Heart, Filter } from 'lucide-react';
import VerseJournalForm from '@/components/journal/VerseJournalForm';
import VerseJournalCard from '@/components/journal/VerseJournalCard';
import { toast } from 'sonner';

const MOOD_OPTIONS = ['', 'grateful', 'peaceful', 'joyful', 'hopeful', 'reflective', 'seeking', 'struggling'];

export default function VerseJournal() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['verseJournal', user?.email],
    queryFn: () => base44.entities.VerseJournalEntry.filter({ userEmail: user.email }, '-created_date'),
    enabled: !!user
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorites.filter({ userId: user.email }),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.VerseJournalEntry.create({ ...data, userEmail: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseJournal'] });
      setShowForm(false);
      setEditingEntry(null);
      toast.success('Reflection saved! ✍️');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.VerseJournalEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseJournal'] });
      setEditingEntry(null);
      setShowForm(false);
      toast.success('Entry updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VerseJournalEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseJournal'] });
      toast.success('Entry deleted');
    }
  });

  const handleSubmit = (data) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewFromFavorite = (fav) => {
    setEditingEntry(null);
    setShowForm(true);
    // Pre-fill with favorite verse data
    window._prefillVerse = { reference: fav.reference, verseText: fav.verseText, fromFavorite: true };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = entries.filter(e => {
    const matchSearch = !searchTerm ||
      e.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchMood = !filterMood || e.mood === filterMood;
    const matchFav = !filterFav || e.fromFavorite;
    return matchSearch && matchMood && matchFav;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2 font-medium">Sign in to access your Verse Journal</p>
          <p className="text-sm text-gray-400">Your personal reflections are private and secure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verse Journal</h1>
          <p className="text-gray-500 text-sm">Private reflections linked to your favorite scriptures</p>
        </div>

        {/* Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-indigo-600">{entries.length}</p>
              <p className="text-xs text-gray-500">Entries</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-rose-500">{entries.filter(e => e.fromFavorite).length}</p>
              <p className="text-xs text-gray-500">From Favorites</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-amber-500">
                {[...new Set(entries.flatMap(e => e.tags || []))].length}
              </p>
              <p className="text-xs text-gray-500">Unique Tags</p>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-5">
            <VerseJournalForm
              initialData={editingEntry}
              prefillVerse={window._prefillVerse}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingEntry(null);
                window._prefillVerse = null;
              }}
            />
          </div>
        )}

        {!showForm && (
          <Button
            onClick={() => { window._prefillVerse = null; setShowForm(true); }}
            className="w-full mb-5 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            New Reflection
          </Button>
        )}

        {/* Favorites quick-link */}
        {favorites.length > 0 && !showForm && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-5">
            <p className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-1">
              <Heart size={13} fill="currentColor" /> Journal from your favorites
            </p>
            <div className="flex flex-wrap gap-2">
              {favorites.slice(0, 5).map(fav => (
                <button
                  key={fav.id}
                  onClick={() => handleNewFromFavorite(fav)}
                  className="text-xs bg-white border border-rose-200 text-rose-700 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
                >
                  {fav.reference}
                </button>
              ))}
              {favorites.length > 5 && (
                <span className="text-xs text-rose-400 self-center">+{favorites.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        {entries.length > 0 && (
          <div className="bg-white rounded-2xl p-3 mb-5 border border-gray-100 shadow-sm space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search entries, verses, tags…"
                className="w-full text-sm pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterMood}
                onChange={e => setFilterMood(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
              >
                {MOOD_OPTIONS.map(m => (
                  <option key={m} value={m}>{m ? `${m.charAt(0).toUpperCase() + m.slice(1)}` : 'All moods'}</option>
                ))}
              </select>
              <button
                onClick={() => setFilterFav(!filterFav)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${filterFav ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-600'}`}
              >
                ❤️ Favorites only
              </button>
              {(searchTerm || filterMood || filterFav) && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterMood(''); setFilterFav(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Entries List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {entries.length === 0
                ? "No reflections yet. Start journaling on a verse that speaks to you."
                : "No entries match your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => (
              <VerseJournalCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}