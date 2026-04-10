import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Check } from 'lucide-react';
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

export default function PlaylistCreator({ user, isDarkMode, currentTranslation, onPlaylistCreated }) {
  const [showDialog, setShowDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    book: 'Genesis',
    chapter: 1,
    startVerse: 1,
    endVerse: null,
    fullChapter: true
  });
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const chapters = CHAPTER_COUNTS[newItem.book] || 1;

  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData) => {
      return base44.entities.Playlist.create(playlistData);
    },
    onSuccess: (newPlaylist) => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists', user?.id] });
      toast.success('Playlist created!');
      setShowDialog(false);
      setPlaylistName('');
      setDescription('');
      setItems([]);
      setTags([]);
      setTagInput('');
      onPlaylistCreated?.(newPlaylist);
    },
    onError: () => {
      toast.error('Failed to create playlist');
    }
  });

  const handleAddItem = () => {
    if (!newItem.book) return;
    
    const item = {
      id: `${newItem.book}_${newItem.chapter}_${Date.now()}`,
      book: newItem.book,
      chapter: newItem.chapter,
      startVerse: newItem.startVerse,
      endVerse: newItem.fullChapter ? null : newItem.endVerse,
      translation: currentTranslation,
      duration: 0
    };

    setItems([...items, item]);
    setNewItem({
      book: 'Genesis',
      chapter: 1,
      startVerse: 1,
      endVerse: null,
      fullChapter: true
    });
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSavePlaylist = async () => {
    if (!playlistName.trim() || items.length === 0 || !user) {
      toast.error('Please enter a name and add at least one item');
      return;
    }

    setSaving(true);
    createPlaylistMutation.mutate({
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      title: playlistName,
      description,
      items,
      translation: currentTranslation,
      total_duration: 0,
      item_count: items.length,
      is_public: false,
      is_featured: false,
      tags,
      category: 'custom'
    });
    setSaving(false);
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="w-full gap-2"
        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
      >
        <Plus className="w-4 h-4" />
        Create New Playlist
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: cardColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: textColor }}>Create Playlist</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Playlist Name & Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textColor }}>
                Playlist Name *
              </label>
              <Input
                placeholder="e.g., Daily Psalms"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textColor }}>
                Description (optional)
              </label>
              <Textarea
                placeholder="What's this playlist for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor
                }}
              />
            </div>

            {/* Add Items Section */}
            <div className="border-t pt-4" style={{ borderColor }}>
              <h4 className="font-semibold mb-3" style={{ color: textColor }}>Add Chapters/Verses</h4>

              <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: bgColor }}>
                {/* Book Selection */}
                <div>
                  <label className="text-sm mb-1 block" style={{ color: textColor }}>Book</label>
                  <select
                    value={newItem.book}
                    onChange={(e) => setNewItem({ ...newItem, book: e.target.value })}
                    className="w-full p-2 rounded-lg border"
                    style={{ backgroundColor: cardColor, borderColor, color: textColor }}
                  >
                    {BIBLE_BOOKS.map(book => (
                      <option key={book} value={book}>{book}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Selection */}
                <div>
                  <label className="text-sm mb-1 block" style={{ color: textColor }}>Chapter</label>
                  <select
                    value={newItem.chapter}
                    onChange={(e) => setNewItem({ ...newItem, chapter: parseInt(e.target.value) })}
                    className="w-full p-2 rounded-lg border"
                    style={{ backgroundColor: cardColor, borderColor, color: textColor }}
                  >
                    {Array.from({ length: chapters }, (_, i) => i + 1).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                {/* Full Chapter Toggle */}
                <label className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: cardColor }}>
                  <input
                    type="checkbox"
                    checked={newItem.fullChapter}
                    onChange={(e) => setNewItem({ ...newItem, fullChapter: e.target.checked })}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Full chapter</span>
                </label>

                {/* Verse Range (if not full chapter) */}
                {!newItem.fullChapter && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm mb-1 block" style={{ color: textColor }}>Start Verse</label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.startVerse}
                        onChange={(e) => setNewItem({ ...newItem, startVerse: parseInt(e.target.value) })}
                        style={{ backgroundColor: cardColor, borderColor, color: textColor }}
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block" style={{ color: textColor }}>End Verse</label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.endVerse}
                        onChange={(e) => setNewItem({ ...newItem, endVerse: parseInt(e.target.value) })}
                        style={{ backgroundColor: cardColor, borderColor, color: textColor }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddItem}
                  className="w-full gap-2"
                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                >
                  <Plus className="w-4 h-4" />
                  Add to Playlist
                </Button>
              </div>
            </div>

            {/* Tags Section */}
            <div className="border-t pt-4" style={{ borderColor }}>
              <h4 className="font-semibold mb-3" style={{ color: textColor }}>Tags (for organization)</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag (e.g., psalms, devotion)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    style={{
                      backgroundColor: cardColor,
                      borderColor,
                      color: textColor
                    }}
                  />
                  <Button
                    onClick={handleAddTag}
                    type="button"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:opacity-70"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3" style={{ color: textColor }}>
                  Playlist Items ({items.length})
                </h4>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ backgroundColor: bgColor, borderColor }}
                    >
                      <div>
                        <p className="font-semibold text-sm" style={{ color: textColor }}>
                          {item.book} {item.chapter}
                          {!item.endVerse ? '' : `:${item.startVerse}-${item.endVerse}`}
                        </p>
                        <p className="text-xs" style={{ color: mutedColor }}>
                          {item.translation}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:opacity-70"
                      >
                        <X className="w-4 h-4" style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t" style={{ borderColor }}>
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1"
                style={{ borderColor, color: textColor }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePlaylist}
                disabled={saving || !playlistName.trim() || items.length === 0}
                className="flex-1 gap-2"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Playlist'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}