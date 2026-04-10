import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Plus, Trash2, ChevronRight, Highlighter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

const COLLECTION_COLORS = [
  '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'
];
const COLLECTION_ICONS = ['📚', '🙏', '🌅', '✨', '❤️', '🔥', '🌿', '💎'];

const COLOR_DOT = {
  yellow: 'bg-yellow-400', green: 'bg-green-400', blue: 'bg-blue-400',
  pink: 'bg-pink-400', purple: 'bg-purple-400', orange: 'bg-orange-400'
};

export default function CollectionsPanel({ userId }) {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLLECTION_COLORS[0]);
  const [newIcon, setNewIcon] = useState(COLLECTION_ICONS[0]);
  const [expandedId, setExpandedId] = useState(null);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections', userId],
    queryFn: () => base44.entities.HighlightCollection.filter({ user_id: userId }, 'name', 100),
    enabled: !!userId,
  });

  const { data: allHighlights = [] } = useQuery({
    queryKey: ['all-highlights', userId],
    queryFn: () => base44.entities.VerseHighlight.filter({ user_id: userId }, '-created_date', 500),
    enabled: !!userId,
  });

  const createCollection = useMutation({
    mutationFn: () => base44.entities.HighlightCollection.create({
      user_id: userId, name: newName.trim(), color: newColor, icon: newIcon,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['collections', userId]);
      setCreating(false); setNewName(''); setNewColor(COLLECTION_COLORS[0]); setNewIcon(COLLECTION_ICONS[0]);
      toast.success('Collection created');
    },
  });

  const deleteCollection = useMutation({
    mutationFn: (id) => base44.entities.HighlightCollection.delete(id),
    onSuccess: () => { qc.invalidateQueries(['collections', userId]); toast.success('Collection deleted'); },
  });

  const getHighlightsForCollection = (collId) =>
    allHighlights.filter(h => h.collection_ids?.includes(collId));

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Create button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Collection
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Morning Devotion, Promises of God…"
            className="bg-white"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && newName.trim() && createCollection.mutate()}
          />
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Icon</p>
            <div className="flex gap-2 flex-wrap">
              {COLLECTION_ICONS.map(icon => (
                <button key={icon} onClick={() => setNewIcon(icon)}
                  className={`text-lg w-9 h-9 rounded-lg border-2 transition-all ${newIcon === icon ? 'border-indigo-500 bg-white shadow' : 'border-transparent bg-white/60'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Color</p>
            <div className="flex gap-2">
              {COLLECTION_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? 'border-gray-700 scale-110' : 'border-transparent'}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createCollection.mutate()} disabled={!newName.trim()} className="bg-indigo-600">Create</Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Empty */}
      {collections.length === 0 && !creating && (
        <div className="text-center py-14 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No collections yet</p>
          <p className="text-sm text-gray-400 mt-1">Group highlights into devotional folders</p>
        </div>
      )}

      {/* Collection cards */}
      <div className="space-y-3">
        {collections.map(col => {
          const verses = getHighlightsForCollection(col.id);
          const isExpanded = expandedId === col.id;
          return (
            <div key={col.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : col.id)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: col.color + '22' }}>
                  {col.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{col.name}</p>
                  {col.description && <p className="text-xs text-gray-400 truncate">{col.description}</p>}
                </div>
                <Badge variant="secondary" className="text-xs">{verses.length}</Badge>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <button
                  onClick={e => { e.stopPropagation(); deleteCollection.mutate(col.id); }}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-2">
                  {verses.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">No verses in this collection yet.</p>
                  ) : verses.map(h => (
                    <div key={h.id} className="bg-white rounded-lg p-3 border border-gray-100 flex items-start gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${COLOR_DOT[h.color] || 'bg-yellow-400'}`} />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={createPageUrl(`BibleReader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}`)}
                          className="text-xs font-bold text-indigo-600 hover:underline block"
                        >
                          {h.reference || `${h.book} ${h.chapter}:${h.verse}`}
                        </Link>
                        <p className="text-xs text-gray-600 leading-relaxed mt-0.5 line-clamp-2">{h.verse_text}</p>
                        {h.note && <p className="text-xs text-amber-600 italic mt-1">"{h.note}"</p>}
                        {h.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {h.tags.map(t => <Badge key={t} className="text-xs bg-indigo-50 text-indigo-600 border-0 px-1.5 py-0">#{t}</Badge>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}