import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, Play, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalm': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Songs': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
  'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

export default function PlaylistBuilder({ playlist, onClose }) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(playlist?.items || []);
  const [newItem, setNewItem] = useState({
    book: 'John',
    chapter: 1,
    verse_start: 1,
    verse_end: null,
    translation: 'WEB',
    order: 0
  });

  const { data: translations = [] } = useQuery({
    queryKey: ['translations-for-audio'],
    queryFn: () => base44.entities.Translation.filter({ is_active: true }, 'name')
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioPlaylist.update(playlist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['audio-playlists']);
      toast.success('Playlist updated!');
      onClose();
    }
  });

  const handleAddItem = () => {
    if (!newItem.book || !newItem.chapter) {
      toast.error('Please select book and chapter');
      return;
    }

    const item = {
      ...newItem,
      order: items.length,
      id: Date.now()
    };
    setItems([...items, item]);
    setNewItem({ ...newItem, order: items.length + 1 });
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }));
    setItems(updated);
  };

  const handleSave = () => {
    const totalDuration = items.length * 60; // Estimate 1 minute per chapter
    updatePlaylistMutation.mutate({
      items: items,
      total_duration: totalDuration
    });
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems.map((item, i) => ({ ...item, order: i })));
  };

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add to Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Book</label>
              <Select value={newItem.book} onValueChange={(v) => setNewItem({ ...newItem, book: v, chapter: 1 })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {BIBLE_BOOKS.map(book => (
                    <SelectItem key={book} value={book}>{book}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Chapter</label>
              <Input
                type="number"
                min={1}
                max={CHAPTER_COUNTS[newItem.book] || 150}
                value={newItem.chapter}
                onChange={(e) => setNewItem({ ...newItem, chapter: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Verse Start</label>
              <Input
                type="number"
                min={1}
                placeholder="Optional"
                value={newItem.verse_start || ''}
                onChange={(e) => setNewItem({ ...newItem, verse_start: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Verse End</label>
              <Input
                type="number"
                min={1}
                placeholder="Optional"
                value={newItem.verse_end || ''}
                onChange={(e) => setNewItem({ ...newItem, verse_end: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Translation</label>
              <Select value={newItem.translation} onValueChange={(v) => setNewItem({ ...newItem, translation: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {translations.map(t => (
                    <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddItem} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add to Playlist
          </Button>
        </CardContent>
      </Card>

      {/* Playlist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Playlist Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-gray-600 py-4">No items added yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.book} {item.chapter}
                      {item.verse_start && `:${item.verse_start}`}
                      {item.verse_end && `-${item.verse_end}`}
                    </p>
                    <Badge variant="outline" className="text-xs">{item.translation}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="h-8 w-8 text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={items.length === 0 || updatePlaylistMutation.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save Playlist
        </Button>
      </div>
    </div>
  );
}