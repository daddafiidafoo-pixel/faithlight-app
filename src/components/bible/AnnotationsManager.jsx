import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StickyNote, Search, Globe, Lock, Trash2, Pencil, BookOpen } from 'lucide-react';

export default function AnnotationsManager({ userId }) {
  const [search, setSearch] = useState('');
  const [filterPublic, setFilterPublic] = useState('all'); // 'all' | 'public' | 'private'
  const [editingNote, setEditingNote] = useState(null); // { id, note_text, is_public }
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['verse-notes', userId],
    queryFn: () => base44.entities.VerseNote.filter({ user_id: userId }, '-created_date'),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, note_text, is_public }) =>
      base44.entities.VerseNote.update(id, { note_text, is_public }),
    onSuccess: () => {
      queryClient.invalidateQueries(['verse-notes', userId]);
      setEditingNote(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VerseNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['verse-notes', userId]),
  });

  const filtered = notes.filter(n => {
    const matchSearch = !search ||
      n.note_text?.toLowerCase().includes(search.toLowerCase()) ||
      n.book?.toLowerCase().includes(search.toLowerCase()) ||
      n.verse_text?.toLowerCase().includes(search.toLowerCase());
    const matchPublic =
      filterPublic === 'all' ||
      (filterPublic === 'public' && n.is_public) ||
      (filterPublic === 'private' && !n.is_public);
    return matchSearch && matchPublic;
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search annotations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'public', 'private'].map(f => (
            <Button
              key={f}
              size="sm"
              variant={filterPublic === f ? 'default' : 'outline'}
              onClick={() => setFilterPublic(f)}
              className="capitalize"
            >
              {f === 'public' ? <Globe className="w-3 h-3 mr-1" /> : f === 'private' ? <Lock className="w-3 h-3 mr-1" /> : null}
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{notes.length} total annotations</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {notes.filter(n => n.is_public).length} public</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {notes.filter(n => !n.is_public).length} private</span>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading annotations...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No annotations found.</p>
            <p className="text-sm text-gray-400 mt-1">Add notes to verses while reading the Bible.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <Card key={note.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Reference */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1 text-indigo-700 font-semibold text-sm">
                        <BookOpen className="w-3.5 h-3.5" />
                        {note.book} {note.chapter}:{note.verse}
                      </div>
                      {note.translation && (
                        <Badge variant="outline" className="text-xs">{note.translation}</Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs flex items-center gap-1 ${note.is_public ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-500'}`}
                      >
                        {note.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {note.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    {/* Verse Text */}
                    {note.verse_text && (
                      <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">"{note.verse_text}"</p>
                    )}
                    {/* Note */}
                    <p className="text-sm text-gray-800 leading-relaxed">{note.note_text}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(note.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingNote({ id: note.id, note_text: note.note_text, is_public: note.is_public })}
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(note.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingNote && (
        <Dialog open onOpenChange={() => setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Annotation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editingNote.note_text}
                onChange={e => setEditingNote(prev => ({ ...prev, note_text: e.target.value }))}
                rows={5}
                placeholder="Your annotation..."
              />
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {editingNote.is_public ? <Globe className="w-4 h-4 text-indigo-600" /> : <Lock className="w-4 h-4 text-gray-500" />}
                  <Label className="font-medium text-sm">
                    {editingNote.is_public ? 'Public — visible to community' : 'Private — only you'}
                  </Label>
                </div>
                <Switch
                  checked={editingNote.is_public}
                  onCheckedChange={v => setEditingNote(prev => ({ ...prev, is_public: v }))}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setEditingNote(null)}>Cancel</Button>
                <Button
                  className="flex-1"
                  onClick={() => updateMutation.mutate(editingNote)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}