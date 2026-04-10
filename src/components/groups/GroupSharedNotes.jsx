import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Edit2, Trash2, Check, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GroupSharedNotes({ groupId, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ title: '', content: '', scripture_reference: '', tag: '' });

  const { data: notes = [] } = useQuery({
    queryKey: ['group-shared-notes', groupId],
    queryFn: () => base44.entities.SharedGroupNote.filter({ group_id: groupId }, '-created_date', 100).catch(() => []),
    enabled: !!groupId,
  });

  const createNote = useMutation({
    mutationFn: () => base44.entities.SharedGroupNote.create({
      group_id: groupId,
      author_id: user.id,
      author_name: user.full_name,
      title: form.title.trim(),
      content: form.content.trim(),
      scripture_reference: form.scripture_reference.trim(),
      tag: form.tag.trim(),
    }),
    onSuccess: () => {
      toast.success('Note shared with group!');
      queryClient.invalidateQueries(['group-shared-notes', groupId]);
      setForm({ title: '', content: '', scripture_reference: '', tag: '' });
      setShowForm(false);
    },
    onError: () => toast.error('Failed to share note'),
  });

  const updateNote = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SharedGroupNote.update(id, data),
    onSuccess: () => {
      toast.success('Note updated!');
      queryClient.invalidateQueries(['group-shared-notes', groupId]);
      setEditingId(null);
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id) => base44.entities.SharedGroupNote.delete(id),
    onSuccess: () => {
      toast.success('Note deleted');
      queryClient.invalidateQueries(['group-shared-notes', groupId]);
    },
  });

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" /> Share a Note
        </Button>
      ) : (
        <Card className="border-indigo-200">
          <div className="p-5 space-y-3">
            <Input placeholder="Note title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Your study notes, insights, reflections..." className="h-32 resize-none" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Scripture (e.g. John 3:16)" value={form.scripture_reference} onChange={e => setForm(f => ({ ...f, scripture_reference: e.target.value }))} />
              <Input placeholder="Tag (e.g. grace, faith)" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" className="bg-indigo-600" disabled={!form.title.trim() || !form.content.trim() || createNote.isPending} onClick={() => createNote.mutate()}>
                {createNote.isPending ? 'Sharing...' : 'Share Note'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {notes.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400"><StickyNote className="w-10 h-10 mx-auto mb-2 text-gray-200" />No shared notes yet. Share your study insights!</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <Card key={note.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    <Textarea className="h-24 resize-none text-sm" value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Scripture" value={editForm.scripture_reference || ''} onChange={e => setEditForm(f => ({ ...f, scripture_reference: e.target.value }))} />
                      <Input placeholder="Tag" value={editForm.tag || ''} onChange={e => setEditForm(f => ({ ...f, tag: e.target.value }))} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => updateNote.mutate({ id: note.id, data: editForm })}><Check className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{note.title}</h4>
                      {(isAdmin || note.author_id === user?.id) && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setEditingId(note.id); setEditForm({ title: note.title, content: note.content, scripture_reference: note.scripture_reference || '', tag: note.tag || '' }); }} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { if (confirm('Delete this note?')) deleteNote.mutate(note.id); }} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                    {note.scripture_reference && (
                      <div className="flex items-center gap-1 text-xs text-indigo-600 mb-2">
                        <BookOpen className="w-3 h-3" /> {note.scripture_reference}
                      </div>
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">{(note.author_name || 'U')[0].toUpperCase()}</div>
                        <span className="text-xs text-gray-500">{note.author_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {note.tag && <Badge variant="secondary" className="text-xs">{note.tag}</Badge>}
                        <span className="text-xs text-gray-400">{format(new Date(note.created_date), 'MMM d')}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}