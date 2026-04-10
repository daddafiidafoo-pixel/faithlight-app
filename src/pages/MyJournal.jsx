import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getPrayerJournalEntries, deletePrayerJournalEntry } from '@/lib/prayerJournal';
import { Button } from '@/components/ui/button';
import { Trash2, Search } from 'lucide-react';
import PullToRefresh from '@/components/PullToRefresh';

export default function MyJournal() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setEntries(getPrayerJournalEntries(u.email));
    });
  }, []);

  const filteredEntries = entries.filter(e =>
    e.noteContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.verseReference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (user && deletePrayerJournalEntry(user.email, id)) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const handleRefresh = useCallback(() => {
    if (user) setEntries(getPrayerJournalEntries(user.email));
  }, [user]);

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Prayer Journal</h1>
        <p className="text-purple-100">Your private reflections on Scripture</p>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search verses or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'No entries found.' : 'No journal entries yet.'}
            </p>
            <p className="text-sm text-slate-500">
              Create your first entry by selecting a verse in the Bible reader
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="card p-6 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-600 mb-1">{entry.verseReference}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.mood && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
                          {entry.mood}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-700 mb-3">{entry.noteContent}</p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}