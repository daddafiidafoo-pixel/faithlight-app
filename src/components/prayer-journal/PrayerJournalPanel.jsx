import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPrayerJournalEntry, deletePrayerJournalEntry, getEntriesForVerse } from '@/lib/prayerJournal';

const MOOD_OPTIONS = ['grateful', 'hopeful', 'struggling', 'peaceful', 'curious', 'convicted', 'joyful'];

export default function PrayerJournalPanel({ verseReference, verseText, userEmail, onClose }) {
  const [entries, setEntries] = useState(() => getEntriesForVerse(userEmail, verseReference));
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ noteContent: '', mood: 'peaceful', tags: '' });

  const handleCreate = () => {
    if (!formData.noteContent.trim()) return;

    const entry = createPrayerJournalEntry(
      userEmail,
      verseReference,
      formData.noteContent,
      formData.mood,
      formData.tags.split(',').map(t => t.trim()).filter(t => t)
    );

    if (entry) {
      setEntries([entry, ...entries]);
      setFormData({ noteContent: '', mood: 'peaceful', tags: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    if (deletePrayerJournalEntry(userEmail, id)) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-2xl rounded-t-lg md:rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Prayer Journal</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600 mb-1">Verse:</p>
          <p className="font-semibold text-slate-900">{verseReference}</p>
          <p className="text-sm text-slate-600 mt-2 italic">{verseText}</p>
        </div>

        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2 justify-center py-2 px-4 border-2 border-dashed border-slate-300 rounded-lg text-indigo-600 font-semibold hover:border-indigo-400 transition-colors mb-6"
          >
            <Plus className="w-5 h-5" />
            Add a Note
          </button>
        ) : (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg space-y-3">
            <textarea
              value={formData.noteContent}
              onChange={(e) => setFormData({ ...formData, noteContent: e.target.value })}
              placeholder="What does this verse mean to you? How does it apply to your life?"
              className="w-full h-24 p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              aria-label="Mood"
              className="w-full min-h-[44px] px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MOOD_OPTIONS.map(mood => (
                <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
              ))}
            </select>

            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Add tags (comma-separated)"
              className="w-full min-h-[44px] px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Save Note
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {entries.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-600 uppercase">Your Notes</h4>
            {entries.map(entry => (
              <div key={entry.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded capitalize">
                        {entry.mood}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Delete note"
                    className="text-slate-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-700">{entry.noteContent}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && !isAdding && (
          <p className="text-center text-slate-500 text-sm">No notes yet. Start reflecting!</p>
        )}
      </div>
    </div>
  );
}