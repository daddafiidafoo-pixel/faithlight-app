import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pencil, X, Globe, Lock } from 'lucide-react';

export default function VerseNotes({ verseId, notes, isPublic, onSaveNotes, onDeleteNotes, onTogglePublic }) {
  const [editText, setEditText] = useState(notes || '');
  const [publicNote, setPublicNote] = useState(isPublic || false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSaveNotes(editText, publicNote);
    setOpen(false);
  };

  const handleDelete = () => {
    onDeleteNotes();
    setEditText('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={notes ? 'text-amber-600' : 'text-gray-400'}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note to This Verse</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your personal notes here..."
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-32"
          />
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {publicNote ? (
                <Globe className="w-4 h-4 text-indigo-600" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500" />
              )}
              <div>
                <Label htmlFor="public-note" className="font-medium text-sm">
                  {publicNote ? 'Public Note' : 'Private Note'}
                </Label>
                <p className="text-xs text-gray-500">
                  {publicNote ? 'Share your insights with the community' : 'Only you can see this note'}
                </p>
              </div>
            </div>
            <Switch
              id="public-note"
              checked={publicNote}
              onCheckedChange={setPublicNote}
            />
          </div>

          <div className="flex gap-2 justify-end">
            {notes && (
              <Button variant="destructive" onClick={handleDelete}>
                <X className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            <Button onClick={handleSave}>Save Note</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}