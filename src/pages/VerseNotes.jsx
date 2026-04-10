import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Highlighter, StickyNote, Trash2, Plus, ChevronRight, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const HIGHLIGHT_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-400', label: 'Yellow' },
  { id: 'green',  bg: 'bg-green-200',  border: 'border-green-400',  label: 'Green' },
  { id: 'blue',   bg: 'bg-blue-200',   border: 'border-blue-400',   label: 'Blue' },
  { id: 'pink',   bg: 'bg-pink-200',   border: 'border-pink-400',   label: 'Pink' },
  { id: 'purple', bg: 'bg-purple-200', border: 'border-purple-400', label: 'Purple' },
];

const COLOR_MAP = {
  yellow: 'bg-yellow-100 border-yellow-300',
  green:  'bg-green-100 border-green-300',
  blue:   'bg-blue-100 border-blue-300',
  pink:   'bg-pink-100 border-pink-300',
  purple: 'bg-purple-100 border-purple-300',
};

function NoteCard({ note, onDelete, onEdit }) {
  const colorClass = COLOR_MAP[note.highlightColor] || COLOR_MAP.yellow;
  return (
    <div className={`rounded-xl border p-4 ${note.highlight ? colorClass : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{note.reference}</span>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(note)} className="p-1 rounded hover:bg-black/10 transition-colors">
            <Edit3 size={13} className="text-gray-500" />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1 rounded hover:bg-red-100 transition-colors">
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-800 italic mb-3 leading-relaxed">"{note.verseText}"</p>
      {note.noteText && (
        <p className="text-sm text-gray-700 bg-white/70 rounded-lg px-3 py-2 leading-relaxed">{note.noteText}</p>
      )}
      <div className="flex items-center gap-2 mt-2">
        {note.highlight && <span className="text-xs text-gray-500 flex items-center gap-1"><Highlighter size={10} /> Highlighted</span>}
        {note.noteText && <span className="text-xs text-gray-500 flex items-center gap-1"><StickyNote size={10} /> Note</span>}
      </div>
    </div>
  );
}

function EditModal({ note, onSave, onClose }) {
  const [noteText, setNoteText] = useState(note?.noteText || '');
  const [highlight, setHighlight] = useState(note?.highlight || false);
  const [highlightColor, setHighlightColor] = useState(note?.highlightColor || 'yellow');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Edit Note — {note.reference}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-500" /></button>
        </div>
        <p className="text-sm text-gray-600 italic mb-4 bg-gray-50 rounded-lg p-3">"{note.verseText}"</p>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Personal Note</label>
          <Textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Your reflection on this verse..."
            rows={4}
            className="text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 cursor-pointer">
            <input type="checkbox" checked={highlight} onChange={e => setHighlight(e.target.checked)} className="rounded" />
            <Highlighter size={14} /> Highlight this verse
          </label>
          {highlight && (
            <div className="flex gap-2 mt-2">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setHighlightColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-transform ${highlightColor === c.id ? `${c.border} scale-125` : 'border-transparent'}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave({ noteText, highlight, highlightColor })} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            <Save size={14} className="mr-1" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerseNotes() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['verseNotes', user?.email],
    queryFn: () => base44.entities.VerseNote.filter({ userEmail: user.email }, 'bookCode,chapter,verse'),
    enabled: isAuthenticated && !!user?.email,
  });

  // Group by book → chapter
  const grouped = notes.reduce((acc, note) => {
    const book = note.bookName || note.bookCode || 'Unknown';
    if (!acc[book]) acc[book] = {};
    const chKey = `Chapter ${note.chapter || '?'}`;
    if (!acc[book][chKey]) acc[book][chKey] = [];
    acc[book][chKey].push(note);
    return acc;
  }, {});

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VerseNote.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['verseNotes', user?.email] });
      const prev = queryClient.getQueryData(['verseNotes', user?.email]);
      queryClient.setQueryData(['verseNotes', user?.email], old => (old || []).filter(n => n.id !== id));
      return { prev };
    },
    onSuccess: () => toast.success('Note deleted'),
    onError: (e, id, ctx) => {
      queryClient.setQueryData(['verseNotes', user?.email], ctx.prev);
      toast.error('Failed to delete');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VerseNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseNotes', user?.email] });
      setEditingNote(null);
      toast.success('Note saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <BookOpen size={40} className="text-indigo-400 mx-auto" />
          <p className="text-gray-600">Sign in to view your verse notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {editingNote && (
        <EditModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={(data) => updateMutation.mutate({ id: editingNote.id, data })}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b px-5 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <StickyNote size={22} className="text-indigo-600" /> My Verse Notes
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{notes.length} saved {notes.length === 1 ? 'note' : 'notes'}</p>
            </div>
            <Link to="/BibleReaderPage">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                <Plus size={14} /> Add Note
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}
          </div>
        )}

        {!isLoading && notes.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
              <Highlighter size={28} className="text-indigo-500" />
            </div>
            <h3 className="font-semibold text-gray-800">No notes yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Open the Bible Reader, tap any verse, and add highlights or personal notes.</p>
            <Link to="/BibleReaderPage">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Open Bible Reader</Button>
            </Link>
          </div>
        )}

        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([book, chapters]) => (
          <div key={book} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} className="text-indigo-500" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{book}</h2>
            </div>
            {Object.entries(chapters).sort(([a], [b]) => {
              const na = parseInt(a.replace('Chapter ', ''));
              const nb = parseInt(b.replace('Chapter ', ''));
              return na - nb;
            }).map(([chap, chNotes]) => (
              <div key={chap} className="mb-4">
                <p className="text-xs text-gray-400 font-semibold mb-2 pl-1">{chap}</p>
                <div className="space-y-3">
                  {chNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onEdit={(n) => setEditingNote(n)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}