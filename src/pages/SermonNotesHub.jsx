import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SermonNoteEditor from '@/components/sermon/SermonNoteEditor';
import SermonNotesArchive from '@/components/sermon/SermonNotesArchive';

export default function SermonNotesHub() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['sermonNotes', user?.email],
    queryFn: () => user?.email ? base44.entities.SermonNote.filter({ user_email: user.email }, '-created_date') : [],
    enabled: !!user?.email,
    initialData: []
  });

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.SermonNote.create({
      user_email: user.email,
      ...noteData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermonNotes'] });
      setShowEditor(false);
      setEditingNote(null);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SermonNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermonNotes'] });
      setShowEditor(false);
      setEditingNote(null);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => base44.entities.SermonNote.delete(noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sermonNotes'] })
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => base44.entities.SermonNote.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sermonNotes'] })
  });

  const handleSaveNote = async (noteData) => {
    if (editingNote) {
      await updateNoteMutation.mutateAsync({ id: editingNote.id, data: noteData });
    } else {
      await createNoteMutation.mutateAsync(noteData);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to save notes</h2>
          <p className="text-slate-600 mb-4">Create an account to start building your sermon notes archive</p>
          <Button onClick={() => window.location.href = '/login'} className="w-full">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sermon Notes</h1>
            <p className="text-sm text-slate-500">Archive and organize your spiritual insights</p>
          </div>
          <Button onClick={() => {
            setEditingNote(null);
            setShowEditor(true);
          }} size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Note
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-600">Total Notes</p>
              <p className="text-lg font-bold text-purple-600">{notes.length}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-600">Favorites</p>
              <p className="text-lg font-bold text-amber-600">{notes.filter(n => n.is_favorite).length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <p className="text-center text-slate-500">Loading notes...</p>
        ) : (
          <SermonNotesArchive
            notes={notes}
            onEdit={(note) => {
              setEditingNote(note);
              setShowEditor(true);
            }}
            onDelete={(noteId) => deleteNoteMutation.mutate(noteId)}
            onToggleFavorite={(noteId) => {
              const note = notes.find(n => n.id === noteId);
              toggleFavoriteMutation.mutate({ id: noteId, isFavorite: note.is_favorite });
            }}
          />
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <SermonNoteEditor
          currentTime={currentTime}
          initialNote={editingNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}