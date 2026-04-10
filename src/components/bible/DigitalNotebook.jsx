import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2, Tag, Search, Loader2, Edit3 } from 'lucide-react';

export default function DigitalNotebook({ currentUser, book, chapter, translation }) {
  const qc = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notebookNotes', currentUser?.id],
    queryFn: () => base44.entities.VerseNote.filter({ user_id: currentUser.id }, '-created_date', 100),
    enabled: !!currentUser,
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.VerseNote.create(data),
    onSuccess: () => { qc.invalidateQueries(['notebookNotes', currentUser?.id]); setNewNote(''); setNewTag(''); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VerseNote.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['notebookNotes', currentUser?.id]); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VerseNote.delete(id),
    onSuccess: () => qc.invalidateQueries(['notebookNotes', currentUser?.id]),
  });

  const filtered = notes.filter(n =>
    !search || n.note_text?.toLowerCase().includes(search.toLowerCase()) ||
    n.book?.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
          <Edit3 className="w-4 h-4" /> New Annotation
          {book && chapter && <span className="text-xs font-normal text-indigo-500">for {book} {chapter}</span>}
        </p>
        <Textarea
          placeholder="Write your study note or annotation..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          className="mb-2 bg-white text-sm min-h-[80px]"
        />
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 text-xs border border-indigo-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-indigo-400"
            placeholder="Add tags (comma separated)..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!newNote.trim() || addMutation.isPending}
            onClick={() => addMutation.mutate({
              user_id: currentUser.id,
              book: book || '',
              chapter: chapter ? parseInt(chapter) : 0,
              verse: 0,
              note_text: newNote.trim(),
              tags: newTag ? newTag.split(',').map(t => t.trim()).filter(Boolean) : [],
              translation: translation || 'WEB',
            })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
          >
            {addMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Save
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No annotations yet. Start writing your study notes!
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filtered.map(note => (
            <div key={note.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {note.book && (
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {note.book} {note.chapter || ''}{note.verse ? `:${note.verse}` : ''}
                    </span>
                  )}
                  {note.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs gap-1">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors"
                    onClick={() => { setEditingId(note.id); setEditText(note.note_text); }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    onClick={() => deleteMutation.mutate(note.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="text-sm min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: note.id, data: { note_text: editText } })} className="bg-indigo-600 text-white">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{note.note_text}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{new Date(note.created_date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}