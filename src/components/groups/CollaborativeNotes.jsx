import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PenLine, Save, Plus, Trash2, Users, Clock, Pin, History, Eye, Edit3, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Debounce hook for auto-save
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function NoteEditor({ note, user, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const isNew = !note?.id;

  const doSave = useCallback(async (t, c, showToast = false) => {
    if (!t.trim() && !c.trim()) return;
    setSaving(true);
    await onSave({ title: t, content: c });
    setSaving(false);
    setLastSaved(new Date());
    if (showToast) toast.success('Note saved!');
  }, [onSave]);

  // Auto-save every 3s when editing existing note
  const debouncedSave = useDebounce((t, c) => {
    if (!isNew) doSave(t, c);
  }, 3000);

  useEffect(() => {
    if (!isNew) debouncedSave(title, content);
  }, [title, content]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Note title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <textarea
        className="w-full border rounded-lg px-3 py-2 text-sm min-h-[180px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono leading-relaxed"
        placeholder="Start writing... supports plain text and Markdown"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {saving && <span className="flex items-center gap-1 text-indigo-500"><Clock className="w-3 h-3" /> Saving...</span>}
          {!saving && lastSaved && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>}
          <span>{content.length} chars</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => doSave(title, content, true)}>
            <Save className="w-3.5 h-3.5" /> {isNew ? 'Create Note' : 'Save Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NoteVersionHistory({ note }) {
  const versions = note?.version_history || [];
  if (versions.length === 0) return <p className="text-xs text-gray-400 py-2">No version history yet.</p>;
  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {[...versions].reverse().map((v, i) => (
        <div key={i} className="text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">{v.edited_by}</span>
            <span className="text-gray-400">{v.edited_at ? formatDistanceToNow(new Date(v.edited_at), { addSuffix: true }) : ''}</span>
          </div>
          <p className="text-gray-500 mt-0.5 line-clamp-1">{v.content?.slice(0, 80)}...</p>
        </div>
      ))}
    </div>
  );
}

export default function CollaborativeNotes({ groupId, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [activeEditors, setActiveEditors] = useState({}); // noteId -> [userName]

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['group-collab-notes', groupId],
    queryFn: () => base44.entities.SharedGroupNote.filter({ group_id: groupId }, '-updated_date', 50).catch(() => []),
    enabled: !!groupId,
    refetchInterval: 8000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!groupId) return;
    const unsub = base44.entities.SharedGroupNote.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        queryClient.invalidateQueries(['group-collab-notes', groupId]);
        // Show who's editing
        if (event.data?.currently_editing && event.data.currently_editing !== user?.full_name) {
          setActiveEditors(prev => ({ ...prev, [event.id]: event.data.currently_editing }));
        }
      }
    });
    return unsub;
  }, [groupId, queryClient, user]);

  const saveNote = async (existingNote, data) => {
    if (existingNote?.id) {
      // Append to version history
      const history = existingNote.version_history || [];
      const newHistory = [...history.slice(-9), {
        edited_by: user.full_name,
        edited_at: new Date().toISOString(),
        content: existingNote.content,
      }];
      await base44.entities.SharedGroupNote.update(existingNote.id, {
        ...data,
        last_edited_by: user.full_name,
        last_edited_at: new Date().toISOString(),
        version_history: newHistory,
        currently_editing: null,
      });
    } else {
      await base44.entities.SharedGroupNote.create({
        group_id: groupId,
        ...data,
        author_id: user.id,
        author_name: user.full_name,
        is_pinned: false,
        last_edited_by: user.full_name,
        last_edited_at: new Date().toISOString(),
        version_history: [],
      });
    }
    queryClient.invalidateQueries(['group-collab-notes', groupId]);
    setEditingId(null);
    setCreating(false);
  };

  const deleteNote = useMutation({
    mutationFn: (id) => base44.entities.SharedGroupNote.delete(id),
    onSuccess: () => { toast.success('Note deleted'); queryClient.invalidateQueries(['group-collab-notes', groupId]); },
  });

  const togglePin = (note) => base44.entities.SharedGroupNote.update(note.id, { is_pinned: !note.is_pinned })
    .then(() => queryClient.invalidateQueries(['group-collab-notes', groupId]));

  // Signal that user started editing
  const startEditing = (noteId) => {
    setEditingId(noteId);
    base44.entities.SharedGroupNote.update(noteId, { currently_editing: user?.full_name }).catch(() => {});
  };

  const pinnedNotes = notes.filter(n => n.is_pinned);
  const otherNotes = notes.filter(n => !n.is_pinned);
  const displayNotes = [...pinnedNotes, ...otherNotes];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">Collaborative Notes</h3>
          <Badge variant="outline" className="text-xs gap-1 border-indigo-200 text-indigo-600">
            <Users className="w-3 h-3" /> Real-time
          </Badge>
        </div>
        <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => { setCreating(true); setEditingId(null); }}>
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      {/* Note count & stats */}
      {notes.length > 0 && (
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><PenLine className="w-3 h-3" />{notes.length} notes</span>
          <span className="flex items-center gap-1"><Pin className="w-3 h-3" />{pinnedNotes.length} pinned</span>
          <span className="flex items-center gap-1"><History className="w-3 h-3" />Auto-save enabled</span>
        </div>
      )}

      {/* Create form */}
      {creating && (
        <Card className="border-indigo-300 bg-indigo-50">
          <CardContent className="pt-4">
            <NoteEditor note={null} user={user}
              onSave={(data) => saveNote(null, data)}
              onCancel={() => setCreating(false)} />
          </CardContent>
        </Card>
      )}

      {/* Version history modal */}
      {viewingHistory && (
        <Card className="border-gray-300 bg-gray-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><History className="w-4 h-4" /> Version History — {viewingHistory.title}</h4>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewingHistory(null)}>✕</Button>
            </div>
            <NoteVersionHistory note={viewingHistory} />
          </CardContent>
        </Card>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400 animate-pulse">Loading notes...</div>
      ) : displayNotes.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <PenLine className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No group notes yet. Create the first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayNotes.map(note => {
            const isEditing = editingId === note.id;
            const editorName = activeEditors[note.id];
            const isBeingEditedByOther = editorName && editorName !== user?.full_name;
            const versions = note.version_history?.length || 0;

            return (
              <Card key={note.id} className={`border transition-shadow ${note.is_pinned ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'} ${isEditing ? 'ring-2 ring-indigo-400' : ''}`}>
                {isEditing ? (
                  <CardContent className="pt-4">
                    <NoteEditor note={note} user={user}
                      onSave={(data) => saveNote(note, data)}
                      onCancel={() => setEditingId(null)} />
                  </CardContent>
                ) : (
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {note.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                          <h4 className="font-semibold text-gray-900 text-sm">{note.title || 'Untitled'}</h4>
                          {isBeingEditedByOther && (
                            <Badge className="bg-green-100 text-green-700 text-[10px] animate-pulse">
                              ✏️ {editorName} editing...
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4 leading-relaxed">{note.content}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {note.last_edited_by ? `${note.last_edited_by}` : note.author_name}
                            {note.last_edited_at ? ` · ${formatDistanceToNow(new Date(note.last_edited_at), { addSuffix: true })}` : ''}
                          </span>
                          {versions > 0 && (
                            <button onClick={() => setViewingHistory(note)}
                              className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1">
                              <History className="w-3 h-3" /> {versions} versions
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                          title="Edit" onClick={() => startEditing(note.id)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-amber-500"
                            title={note.is_pinned ? 'Unpin' : 'Pin'} onClick={() => togglePin(note)}>
                            <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'text-amber-500' : ''}`} />
                          </Button>
                        )}
                        {(isAdmin || note.author_id === user?.id) && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                            title="Delete" onClick={() => { if (confirm('Delete this note?')) deleteNote.mutate(note.id); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}