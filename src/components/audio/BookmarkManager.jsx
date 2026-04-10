import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bookmark, Trash2, Edit2, Share2, Loader } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = {
  yellow: '#fbbf24',
  blue: '#60a5fa',
  green: '#34d399',
  red: '#ef4444',
  purple: '#a78bfa',
  orange: '#fb923c'
};

const CATEGORIES = ['study', 'favorite', 'prayer', 'teaching', 'meditation', 'other'];

export default function BookmarkManager({ book, chapter, verse, translation, endVerse = null, user }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    color: 'yellow',
    category: 'favorite'
  });

  const queryClient = useQueryClient();

  // Fetch bookmarks for current chapter
  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks', book, chapter, translation],
    queryFn: async () => {
      try {
        return await base44.entities.Bookmark.filter(
          { user_id: user?.id, book, chapter: parseInt(chapter) },
          '-created_date',
          100
        );
      } catch { return []; }
    },
    enabled: !!user?.id && !!book && !!chapter
  });

  // Create bookmark mutation
  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Bookmark.create({
        user_id: user.id,
        user_name: user.full_name || '',
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse) || 1,
        end_verse: endVerse ? parseInt(endVerse) : undefined,
        translation,
        like_count: 0,
        ...data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', book, chapter, translation]);
      toast.success('Bookmark saved!');
      resetForm();
      setShowDialog(false);
    }
  });

  // Update bookmark mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.Bookmark.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', book, chapter, translation]);
      toast.success('Bookmark updated!');
      resetForm();
      setShowDialog(false);
    }
  });

  // Delete bookmark mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bookmark.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', book, chapter, translation]);
      toast.success('Bookmark deleted');
    }
  });

  const resetForm = () => {
    setFormData({ title: '', notes: '', color: 'yellow', category: 'favorite' });
    setEditingBookmark(null);
  };

  const handleOpenDialog = (bookmark = null) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
      setFormData({
        title: bookmark.title,
        notes: bookmark.notes || '',
        color: bookmark.color || 'yellow',
        category: bookmark.category || 'favorite'
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a bookmark title');
      return;
    }

    if (editingBookmark) {
      updateMutation.mutate({ id: editingBookmark.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this bookmark?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      {/* Quick Bookmark Button */}
      <Button
        onClick={() => handleOpenDialog()}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Bookmark className="w-4 h-4" />
        Bookmark ({bookmarks.length})
      </Button>

      {/* Bookmark Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBookmark ? 'Edit Bookmark' : 'New Bookmark'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reference Display */}
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-600">
                {book} {chapter}:{verse}
                {endVerse && endVerse !== verse ? `-${endVerse}` : ''}
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input
                type="text"
                placeholder="e.g., God's Promise"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <Textarea
                placeholder="Personal reflections..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-20"
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2">
                {Object.entries(COLORS).map(([name, hex]) => (
                  <button
                    key={name}
                    onClick={() => setFormData({ ...formData, color: name })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === name ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Bookmark'
                )}
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bookmarks List */}
      {bookmarks.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Bookmarks in This Chapter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-3 rounded-lg border-l-4 bg-gray-50"
                  style={{ borderLeftColor: COLORS[bookmark.color] || COLORS.yellow }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{bookmark.title}</p>
                      <p className="text-xs text-gray-500">
                        v{bookmark.verse}
                        {bookmark.end_verse && bookmark.end_verse !== bookmark.verse ? `-${bookmark.end_verse}` : ''}
                        {' '} • {bookmark.category}
                      </p>
                      {bookmark.notes && (
                        <p className="text-xs text-gray-600 mt-1 italic">"{bookmark.notes}"</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleOpenDialog(bookmark)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(bookmark.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}