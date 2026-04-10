import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StickyNote, Trash2, Edit2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function VerseNotePanel({ user, book, chapter, verse, isDarkMode }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showList, setShowList] = useState(false);

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  const { data: notes = [] } = useQuery({
    queryKey: ['verse-notes', user?.id, book, chapter, verse],
    queryFn: () =>
      base44.entities.VerseNote.filter(
        { user_id: user.id, book, chapter: parseInt(chapter), verse },
        '-created_date',
        50
      ),
    enabled: !!user?.id && !!book && !!chapter && !!verse,
  });

  const createMutation = useMutation({
    mutationFn: (text) =>
      base44.entities.VerseNote.create({
        user_id: user.id,
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        reference: `${book} ${chapter}:${verse}`,
        note_text: text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['verse-notes', user?.id, book, chapter, verse]);
      toast.success('Note saved!');
      setShowDialog(false);
      setNoteText('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, text }) => base44.entities.VerseNote.update(id, { note_text: text }),
    onSuccess: () => {
      queryClient.invalidateQueries(['verse-notes', user?.id, book, chapter, verse]);
      toast.success('Note updated!');
      setShowDialog(false);
      setEditingNote(null);
      setNoteText('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VerseNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['verse-notes', user?.id, book, chapter, verse]);
      toast.success('Note deleted');
    },
  });

  const openNew = () => {
    setEditingNote(null);
    setNoteText('');
    setShowDialog(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setNoteText(note.note_text);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!noteText.trim()) return;
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, text: noteText });
    } else {
      createMutation.mutate(noteText);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={openNew}
          className="gap-1 text-xs"
          style={{ color: primaryColor }}
        >
          <Plus className="w-3 h-3" />
          Add Note
        </Button>
        {notes.length > 0 && (
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-1 text-xs"
            style={{ color: primaryColor }}
          >
            <StickyNote className="w-3 h-3" />
            {notes.length} note{notes.length > 1 ? 's' : ''}
            {showList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {showList && notes.length > 0 && (
        <div className="mt-2 space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg border text-sm"
              style={{ backgroundColor: cardColor, borderColor, color: textColor }}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openEdit(note)} className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(note.id)}
                  className="text-xs text-red-500 opacity-70 hover:opacity-100 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              {editingNote ? 'Edit Note' : 'New Note'} — {book} {chapter}:{verse}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your thoughts, reflections, or study notes…"
            className="h-32 resize-none"
            autoFocus
          />
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={!noteText.trim() || createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              Save Note
            </Button>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}