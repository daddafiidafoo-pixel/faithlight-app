import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import PrayerJournalForm from './PrayerJournalForm';
import PrayerJournalEntryCard from './PrayerJournalEntryCard';

/**
 * PrayerJournalModal
 * Show and manage prayer journal entries for a specific verse
 */
export default function PrayerJournalModal({
  isOpen,
  onClose,
  reference,
  verseText,
}) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    if (isOpen) {
      base44.auth.me().then(setUser).catch(() => setUser(null));
    }
  }, [isOpen]);

  // Fetch entries for this verse
  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['prayer-journal', reference, user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      try {
        const results = await base44.entities.PrayerJournalEntry.filter(
          {
            userEmail: user.email,
            reference,
          },
          '-created_date'
        );
        return results || [];
      } catch (error) {
        console.error('[PrayerJournalModal] fetch error:', error);
        return [];
      }
    },
    enabled: !!user?.email && isOpen,
  });

  const handleSave = () => {
    setShowForm(false);
    setEditingEntry(null);
    refetch();
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = () => {
    refetch();
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingEntry(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prayer Journal</DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="py-8 text-center text-slate-600">
            <p>Sign in to save prayer notes linked to verses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Form or button */}
            {showForm ? (
              <PrayerJournalForm
                reference={reference}
                verseText={verseText}
                existingEntry={editingEntry}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                }}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors font-medium"
              >
                + Add Prayer Note
              </button>
            )}

            {/* Entries list */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Your Notes ({entries.length})
                </p>
                {entries.map((entry) => (
                  <PrayerJournalEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              !showForm && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No notes yet. Add one to get started.
                </p>
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}