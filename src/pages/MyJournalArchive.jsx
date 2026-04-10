import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export default function MyJournalArchive() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const user = await base44.auth.me();
      if (user) {
        const data = await base44.entities.BibleVersesJournal.filter(
          { userEmail: user.email },
          '-entryDate'
        );
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase();
    return (
      entry.reference.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query) ||
      entry.thoughts?.toLowerCase().includes(query) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  if (loading) return <div className="p-6 text-center">Loading journal...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Journal Archive</h1>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by verse, notes, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div className="grid gap-4">
        {filteredEntries.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No journal entries found</p>
        ) : (
          filteredEntries.map(entry => (
            <Card
              key={entry.id}
              className="p-5 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedEntry(entry.id === selectedEntry ? null : entry.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{entry.reference}</h3>
                  <p className="text-xs text-gray-500">{format(new Date(entry.entryDate), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {entry.notes && <p className="text-sm text-gray-700 mb-2">{entry.notes}</p>}

              {entry.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedEntry === entry.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {entry.thoughts && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Thoughts</h4>
                      <p className="text-sm text-gray-700">{entry.thoughts}</p>
                    </div>
                  )}
                  {entry.voiceMemoUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Voice Memo</h4>
                      <audio controls className="w-full h-8">
                        <source src={entry.voiceMemoUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}