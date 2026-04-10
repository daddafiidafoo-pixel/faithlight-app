import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';

/**
 * PrayerJournalForm
 * Create or edit a prayer journal entry linked to a verse
 */
export default function PrayerJournalForm({
  reference,
  verseText,
  existingEntry = null,
  onSave,
  onCancel,
}) {
  const [note, setNote] = useState(existingEntry?.note || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!note.trim()) {
      setError('Please write a note');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const user = await base44.auth.me();
      if (!user) {
        setError('You must be logged in to save entries');
        setIsSaving(false);
        return;
      }

      if (existingEntry?.id) {
        // Update existing entry
        await base44.entities.PrayerJournalEntry.update(existingEntry.id, {
          note: note.trim(),
        });
      } else {
        // Create new entry
        await base44.entities.PrayerJournalEntry.create({
          userEmail: user.email,
          reference,
          verseText,
          note: note.trim(),
          languageCode: user.languageCode || 'en',
          isPrivate: true,
        });
      }

      onSave?.();
    } catch (err) {
      console.error('[PrayerJournalForm] save error:', err);
      setError(err?.message || 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {reference}
        </p>
        <p className="text-sm text-slate-600 italic mt-1 line-clamp-2">{verseText}</p>
      </div>

      {/* Note textarea */}
      <Textarea
        placeholder="Write your prayer, reflection, or thoughts here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-32 mb-3 text-sm"
        disabled={isSaving}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !note.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
          {existingEntry ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>
  );
}