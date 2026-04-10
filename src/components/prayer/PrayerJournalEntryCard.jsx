import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * PrayerJournalEntryCard
 * Display a single prayer journal entry
 */
export default function PrayerJournalEntryCard({
  entry,
  onEdit,
  onDelete,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry?')) return;

    setIsDeleting(true);
    try {
      await base44.entities.PrayerJournalEntry.delete(entry.id);
      onDelete?.(entry.id);
    } catch (error) {
      console.error('[PrayerJournalEntryCard] delete error:', error);
      alert('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Reference and date */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {entry.reference}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {format(new Date(entry.created_date), 'MMM d, yyyy')}
            {entry.updated_date && entry.updated_date !== entry.created_date && (
              <span> (edited)</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(entry)}
            className="text-slate-600 hover:text-indigo-600"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-600 hover:text-red-600"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Verse text */}
      <p className="text-sm text-slate-600 italic mb-3">{entry.verseText}</p>

      {/* Note */}
      <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
        {entry.note}
      </p>
    </div>
  );
}