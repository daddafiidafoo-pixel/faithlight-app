import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Highlighter, Plus, Trash2, Tag, X, Search } from 'lucide-react';
import { toast } from 'sonner';

const HIGHLIGHT_COLORS = [
  { name: 'yellow', hex: '#FEF08A' },
  { name: 'green', hex: '#BBF7D0' },
  { name: 'blue', hex: '#BAE6FD' },
  { name: 'pink', hex: '#FBCFE8' },
  { name: 'purple', hex: '#E9D5FF' },
  { name: 'orange', hex: '#FED7AA' },
];

export default function HighlightCollection({ user, isDarkMode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(null); // highlight id
  const [tagInput, setTagInput] = useState('');

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: ['highlight-collections', user?.id],
    queryFn: () =>
      base44.entities.VerseHighlight.filter({ user_id: user.id }, '-created_date', 200),
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VerseHighlight.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['highlight-collections', user?.id]);
      toast.success('Highlight updated');
      setShowAddTag(null);
      setTagInput('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VerseHighlight.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['highlight-collections', user?.id]);
      toast.success('Highlight removed');
    },
  });

  const handleAddTag = (highlight) => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    const existingTags = highlight.tags || [];
    if (existingTags.includes(tag)) { toast.error('Tag already added'); return; }
    updateMutation.mutate({ id: highlight.id, data: { tags: [...existingTags, tag] } });
  };

  const handleRemoveTag = (highlight, tag) => {
    const updated = (highlight.tags || []).filter((t) => t !== tag);
    updateMutation.mutate({ id: highlight.id, data: { tags: updated } });
  };

  const handleColorChange = (highlight, colorName) => {
    updateMutation.mutate({ id: highlight.id, data: { color: colorName } });
  };

  // Get all unique tags
  const allTags = [...new Set(highlights.flatMap((h) => h.tags || []))];

  const filtered = highlights.filter((h) => {
    const matchSearch =
      !searchTerm ||
      (h.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.verse_text || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchTag = !filterTag || (h.tags || []).includes(filterTag);
    return matchSearch && matchTag;
  });

  if (!user) return <p className="text-sm text-gray-500 text-center py-4">Sign in to view your highlights.</p>;

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search highlights…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag('')}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${!filterTag ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600'}`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${filterTag === tag ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm py-4" style={{ color: mutedColor }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <Highlighter className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm" style={{ color: mutedColor }}>
            {highlights.length === 0 ? 'No highlights yet. Highlight verses while reading.' : 'No highlights match your filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((h) => {
            const colorHex = HIGHLIGHT_COLORS.find((c) => c.name === h.color)?.hex || '#FEF08A';
            return (
              <div
                key={h.id}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: cardColor, borderColor, borderLeftWidth: 4, borderLeftColor: colorHex }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: mutedColor }}>{h.reference}</p>
                    {h.verse_text && (
                      <p className="text-sm italic leading-relaxed" style={{ color: textColor }}>
                        "{h.verse_text}"
                      </p>
                    )}
                    {h.notes && (
                      <p className="text-xs mt-1" style={{ color: mutedColor }}>{h.notes}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(h.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700"
                        >
                          #{tag}
                          <button onClick={() => handleRemoveTag(h, tag)} className="hover:text-red-500">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      {showAddTag === h.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(h); if (e.key === 'Escape') setShowAddTag(null); }}
                            placeholder="tag…"
                            className="text-xs border rounded px-2 py-0.5 w-20 outline-none"
                          />
                          <button onClick={() => handleAddTag(h)} className="text-xs text-indigo-600">Add</button>
                          <button onClick={() => setShowAddTag(null)} className="text-xs text-gray-400">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setShowAddTag(h.id); setTagInput(''); }}
                          className="text-xs px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500"
                        >
                          <Tag className="w-3 h-3 inline mr-0.5" />tag
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Color swatches */}
                    <div className="flex gap-1">
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => handleColorChange(h, c.name)}
                          className={`w-4 h-4 rounded-full border-2 ${h.color === c.name ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(h.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}