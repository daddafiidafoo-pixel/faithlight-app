import { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveNote, updateNote, deleteNote, getNotesByReference } from '@/lib/notesDb';

export default function NotesPanelForVerse({ verseReference, userEmail, onNoteSaved }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verseReference && userEmail) {
      loadNotes();
    }
  }, [verseReference, userEmail]);

  const loadNotes = async () => {
    try {
      const notes = await getNotesByReference(userEmail, verseReference);
      setNotes(notes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleSaveNewNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      await saveNote(userEmail, verseReference, newNote);
      setNewNote('');
      await loadNotes();
      if (onNoteSaved) onNoteSaved();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
    setLoading(false);
  };

  const handleUpdateNote = async (noteId) => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      await updateNote(noteId, editContent);
      setEditingId(null);
      setEditContent('');
      await loadNotes();
      if (onNoteSaved) onNoteSaved();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
    setLoading(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (confirm('Delete this note?')) {
      try {
        await deleteNote(noteId);
        await loadNotes();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900 mb-4">My Notes on {verseReference}</h3>

      {/* New Note Form */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <Textarea
          placeholder="Add a personal reflection or study note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="mb-2 min-h-24"
        />
        <Button
          onClick={handleSaveNewNote}
          disabled={!newNote.trim() || loading}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Save Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No notes yet. Add one above!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              {editingId === note.id ? (
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-2 min-h-20"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateNote(note.id)}
                      size="sm"
                      disabled={loading}
                      className="gap-1"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </Button>
                    <Button
                      onClick={() => { setEditingId(null); setEditContent(''); }}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}