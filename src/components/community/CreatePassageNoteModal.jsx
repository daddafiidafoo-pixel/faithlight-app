import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';

export default function CreatePassageNoteModal({ open, onClose, currentUser, bibleBook, chapter, verse, verseText, onNoteCreated }) {
  const [formData, setFormData] = useState({
    reference: `${bibleBook} ${chapter}:${verse}`,
    reflection: '',
    tags: '',
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = () => {
    setFormData(prev => ({
      ...prev,
      isPublic: !prev.isPublic
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reflection.trim()) {
      alert('Please write your reflection');
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      const note = await base44.entities.PassageNote.create({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: currentUser.avatar_url,
        book: bibleBook,
        chapter: parseInt(chapter),
        verse_start: parseInt(verse),
        verse_end: parseInt(verse),
        reference: formData.reference,
        verse_text: verseText,
        reflection: formData.reflection,
        is_public: formData.isPublic,
        tags: tags,
      });

      onNoteCreated?.(note);
      setFormData({
        reference: `${bibleBook} ${chapter}:${verse}`,
        reflection: '',
        tags: '',
        isPublic: true,
      });
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Your Reflection</DialogTitle>
          <DialogDescription>
            Share your thoughts on {formData.reference}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reference Display */}
          <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
            <p className="text-sm font-semibold text-indigo-900">{formData.reference}</p>
            {verseText && (
              <p className="text-sm text-indigo-700 italic mt-1">"{verseText}"</p>
            )}
          </div>

          {/* Reflection Textarea */}
          <div>
            <label className="text-sm font-medium">Your Reflection</label>
            <Textarea
              name="reflection"
              value={formData.reflection}
              onChange={handleChange}
              placeholder="Share your thoughts, insights, or questions about this passage..."
              className="mt-1 min-h-24"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="text-sm font-medium">Tags (comma separated, optional)</label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., prayer, encouragement, prophecy"
              className="mt-1"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={handleToggle}
              id="isPublic"
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm">
              Share with community
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}