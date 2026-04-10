import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, Search, Tag, Lock, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VerseJournalModal from '@/components/journal/VerseJournalModal';

const MOOD_EMOJIS = {
  grateful: '🙏', hopeful: '✨', peaceful: '🕊️', joyful: '😊',
  curious: '🤔', struggling: '💙', convicted: '🔥'
};

const CATEGORY_COLORS = {
  health: 'bg-red-100 text-red-700',
  faith: 'bg-purple-100 text-purple-700',
  grateful: 'bg-green-100 text-green-700',
  hopeful: 'bg-blue-100 text-blue-700',
  struggling: 'bg-orange-100 text-orange-700',
};

export default function MyVerseJournal() {
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['verseJournalEntries', user?.email],
    queryFn: () => base44.entities.VerseJournalEntry.filter({ userEmail: user.email }),
    enabled: isAuthenticated && !!user?.email
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['myGroups', user?.email],
    queryFn: () => base44.entities.StudyGroup.filter({ memberEmails: { $in: [user.email] } }),
    enabled: isAuthenticated && !!user?.email
  });

  const handleDelete = async (entryId) => {
    if (!confirm('Delete this journal entry?')) return;
    await base44.entities.VerseJournalEntry.delete(entryId);
    refetch();
  };

  const filtered = entries
    .filter(e => !filterMood || e.mood === filterMood)
    .filter(e => !searchQuery || 
      e.verseReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.reflection?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-slate-600">Please sign in to access your journal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Journal</h1>
            <p className="text-sm text-slate-500">{entries.length} reflections</p>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Entry
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reflections or verses..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Mood filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterMood('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!filterMood ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All
          </button>
          {Object.entries(MOOD_EMOJIS).map(([val, emoji]) => (
            <button
              key={val}
              onClick={() => setFilterMood(val === filterMood ? '' : val)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterMood === val ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {emoji} {val}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {isLoading && <p className="text-center text-slate-500 py-12">Loading...</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">No journal entries yet</p>
            <p className="text-sm text-slate-400 mt-1">Write your first reflection on a verse</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">Start Journaling</Button>
          </div>
        )}

        {filtered.map(entry => (
          <div
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{entry.verseReference}</span>
                  <span className="text-lg">{MOOD_EMOJIS[entry.mood] || '📖'}</span>
                  {entry.isPrivate
                    ? <Lock className="w-3.5 h-3.5 text-slate-400" />
                    : <Users className="w-3.5 h-3.5 text-purple-500" />
                  }
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(entry.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {entry.verseText && (
              <p className="text-sm text-slate-500 italic border-l-2 border-purple-200 pl-3 mb-3 line-clamp-2">
                "{entry.verseText}"
              </p>
            )}

            <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{entry.reflection}</p>

            {entry.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {entry.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Entry detail modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-lg">{selectedEntry.verseReference}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(selectedEntry.created_date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <span className="text-slate-500 text-xl">×</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selectedEntry.verseText && (
                <div className="bg-purple-50 border-l-4 border-purple-400 px-4 py-3 rounded-r-lg">
                  <p className="text-sm italic text-slate-700">"{selectedEntry.verseText}"</p>
                </div>
              )}
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedEntry.reflection}</p>
              {selectedEntry.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {selectedEntry.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <VerseJournalModal
          verseReference="Write freely"
          verseText=""
          groups={groups}
          onClose={() => setShowModal(false)}
          onSaved={() => { refetch(); setShowModal(false); }}
        />
      )}
    </div>
  );
}