import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Highlighter, Save, X, Trash2, Tag, FolderOpen, Plus, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = [
  { name: 'yellow',  hex: '#FEF08A', label: 'Yellow'  },
  { name: 'green',   hex: '#BBF7D0', label: 'Green'   },
  { name: 'blue',    hex: '#BFDBFE', label: 'Blue'    },
  { name: 'pink',    hex: '#FBCFE8', label: 'Pink'    },
  { name: 'orange',  hex: '#FED7AA', label: 'Orange'  },
  { name: 'purple',  hex: '#DDD6FE', label: 'Purple'  },
];

export default function VerseHighlightPanel({ verse, onClose, user }) {
  const [color, setColor]               = useState('yellow');
  const [note, setNote]                 = useState('');
  const [tags, setTags]                 = useState([]);
  const [tagInput, setTagInput]         = useState('');
  const [collectionIds, setCollectionIds] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [collections, setCollections]   = useState([]);
  const [existingId, setExistingId]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [showNewColl, setShowNewColl]   = useState(false);
  const [newCollName, setNewCollName]   = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [verse, user]);

  const loadData = async () => {
    const [existing, colls] = await Promise.all([
      base44.entities.VerseHighlight.filter({ user_id: user.id, book: verse.book, chapter: verse.chapter, verse: verse.verse }),
      base44.entities.HighlightCollection.filter({ user_id: user.id }, 'name', 50),
    ]);
    setCollections(colls || []);
    if (existing?.length > 0) {
      const h = existing[0];
      setExistingId(h.id);
      setColor(h.color || 'yellow');
      setNote(h.note || '');
      setTags(h.tags || []);
      setCollectionIds(h.collection_ids || []);
      setIsBookmarked(h.is_bookmarked || false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const toggleCollection = (id) => {
    setCollectionIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const createCollection = async () => {
    if (!newCollName.trim()) return;
    const created = await base44.entities.HighlightCollection.create({
      user_id: user.id,
      name: newCollName.trim(),
    });
    setCollections(prev => [...prev, created]);
    setCollectionIds(prev => [...prev, created.id]);
    setNewCollName('');
    setShowNewColl(false);
  };

  const handleSave = async () => {
    if (!user) { toast.error('Sign in to save highlights'); return; }
    setLoading(true);
    const data = {
      user_id: user.id,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      reference: verse.reference,
      verse_text: verse.text,
      color,
      note: note.trim() || null,
      tags,
      collection_ids: collectionIds,
      is_bookmarked: isBookmarked,
    };
    if (existingId) {
      await base44.entities.VerseHighlight.update(existingId, data);
      toast.success('Highlight updated');
    } else {
      await base44.entities.VerseHighlight.create(data);
      toast.success('Verse highlighted');
    }
    setLoading(false);
    onClose(true);
  };

  const handleDelete = async () => {
    if (!existingId) return;
    setLoading(true);
    await base44.entities.VerseHighlight.delete(existingId);
    toast.success('Highlight removed');
    setLoading(false);
    onClose(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base font-semibold text-gray-900">
              {existingId ? 'Edit Highlight' : 'Highlight Verse'}
            </h3>
          </div>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Verse preview */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs font-semibold text-indigo-600 mb-1">{verse.reference}</p>
            <p className="text-sm text-gray-700 leading-relaxed italic">"{verse.text}"</p>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.label}
                  style={{ backgroundColor: c.hex }}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    color === c.name ? 'border-gray-700 scale-110 shadow-md' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bookmark toggle */}
          <button
            onClick={() => setIsBookmarked(v => !v)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-all w-full ${
              isBookmarked
                ? 'bg-amber-50 border-amber-400 text-amber-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
          </button>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="faith, promise, prayer…"
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-3">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <Badge key={t} className="bg-indigo-100 text-indigo-700 border-0 gap-1 pr-1 cursor-pointer hover:bg-indigo-200" onClick={() => removeTag(t)}>
                    #{t} <X className="w-2.5 h-2.5" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Collections */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
              <FolderOpen className="w-3 h-3" /> Collections
            </label>
            {collections.length === 0 && !showNewColl ? (
              <p className="text-xs text-gray-400 mb-2">No collections yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-2">
                {collections.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleCollection(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                      collectionIds.includes(c.id)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {c.icon || '📚'} {c.name}
                  </button>
                ))}
              </div>
            )}
            {showNewColl ? (
              <div className="flex gap-2">
                <Input
                  value={newCollName}
                  onChange={e => setNewCollName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createCollection()}
                  placeholder="Collection name…"
                  className="h-8 text-sm flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={createCollection} className="h-8 bg-indigo-600">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewColl(false)} className="h-8">Cancel</Button>
              </div>
            ) : (
              <button onClick={() => setShowNewColl(true)} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                <Plus className="w-3 h-3" /> New collection
              </button>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Note</label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Your reflection, insight, or prayer…"
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              {existingId ? 'Update' : 'Save'}
            </Button>
            {existingId && (
              <Button onClick={handleDelete} disabled={loading} variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}