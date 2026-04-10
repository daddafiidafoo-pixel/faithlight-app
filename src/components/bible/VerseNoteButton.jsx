import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StickyNote, Highlighter, Save, X, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', ring: 'ring-yellow-400' },
  { id: 'green',  bg: 'bg-green-200',  ring: 'ring-green-400' },
  { id: 'blue',   bg: 'bg-blue-200',   ring: 'ring-blue-400' },
  { id: 'pink',   bg: 'bg-pink-200',   ring: 'ring-pink-400' },
  { id: 'purple', bg: 'bg-purple-200', ring: 'ring-purple-400' },
];

export default function VerseNoteButton({ reference, verseText, bookCode, bookName, chapter, verse }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [color, setColor] = useState('yellow');

  const { data: existingNote } = useQuery({
    queryKey: ['verseNote', user?.email, reference],
    queryFn: async () => {
      const results = await base44.entities.VerseNote.filter({ userEmail: user.email, reference });
      return results[0] || null;
    },
    enabled: isAuthenticated && !!user?.email && open,
    onSuccess: (note) => {
      if (note) {
        setNoteText(note.noteText || '');
        setHighlight(note.highlight || false);
        setColor(note.highlightColor || 'yellow');
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { userEmail: user.email, reference, verseText, bookCode, bookName, chapter, verse, noteText, highlight, highlightColor: color };
      if (existingNote) {
        return base44.entities.VerseNote.update(existingNote.id, data);
      }
      return base44.entities.VerseNote.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseNotes', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['verseNote', user?.email, reference] });
      toast.success('Note saved!');
      setOpen(false);
    },
    onError: () => toast.error('Failed to save note'),
  });

  if (!isAuthenticated) return null;

  const hasNote = !!existingNote;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Add note or highlight"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
          hasNote
            ? 'bg-amber-100 text-amber-700 border border-amber-200'
            : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 border border-transparent'
        }`}
      >
        {hasNote ? <Check size={11} /> : <StickyNote size={11} />}
        {hasNote ? 'Noted' : 'Note'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-900 text-sm">{reference}</p>
              <button onClick={() => setOpen(false)}><X size={16} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 italic mb-4 leading-relaxed">"{verseText?.slice(0, 120)}{verseText?.length > 120 ? '…' : ''}"</p>

            <Textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Your reflection on this verse..."
              rows={3}
              className="text-sm mb-4"
            />

            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
              <input type="checkbox" checked={highlight} onChange={e => setHighlight(e.target.checked)} className="rounded" />
              <Highlighter size={13} /> Highlight verse
            </label>

            {highlight && (
              <div className="flex gap-2 mb-4">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-all ${color === c.id ? `ring-2 ${c.ring} scale-125` : 'border-white'}`}
                  />
                ))}
              </div>
            )}

            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Save size={13} className="mr-1.5" />
              {saveMutation.isPending ? 'Saving…' : existingNote ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}