import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2, BookOpen, StickyNote, Highlighter, Heart } from 'lucide-react';

const ITEM_TYPE_ICONS = { verse: BookOpen, note: StickyNote, highlight: Highlighter, prayer: Heart };

export default function CollectionDetailModal({ collection, onUpdate, onDelete, onClose }) {
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'verse', ref: '', text: '', source: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAddItem = () => {
    if (!newItem.ref && !newItem.text) return;
    const items = [...(collection.items || []), { ...newItem, id: Date.now().toString() }];
    onUpdate(collection.id, { items, item_count: items.length });
    setNewItem({ type: 'verse', ref: '', text: '', source: '' });
    setAddingItem(false);
  };

  const handleRemoveItem = (idx) => {
    const items = (collection.items || []).filter((_, i) => i !== idx);
    onUpdate(collection.id, { items, item_count: items.length });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: (collection.color || '#6366F1') + '20' }}>
              {collection.icon || '📁'}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{collection.name}</h2>
              <p className="text-xs text-gray-500">{collection.item_count || 0} items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Description */}
        {collection.description && (
          <p className="px-5 pt-3 text-sm text-gray-500">{collection.description}</p>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {(!collection.items || collection.items.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No items yet. Add verses, notes, or highlights.</p>
            </div>
          ) : (
            collection.items.map((item, idx) => {
              const Icon = ITEM_TYPE_ICONS[item.type] || BookOpen;
              return (
                <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <Icon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {item.ref && <p className="font-semibold text-gray-900 text-xs">{item.ref}</p>}
                    {item.text && <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{item.text}</p>}
                    {item.source && <p className="text-gray-400 text-xs mt-0.5">{item.source}</p>}
                  </div>
                  <button onClick={() => handleRemoveItem(idx)} className="text-gray-300 hover:text-red-400 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              );
            })
          )}

          {/* Add Item Form */}
          {addingItem && (
            <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {['verse', 'note', 'highlight', 'prayer'].map(t => (
                  <button key={t} onClick={() => setNewItem(i => ({ ...i, type: t }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${newItem.type === t ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600'}`}>{t}</button>
                ))}
              </div>
              <Input placeholder="Reference (e.g. John 3:16)" value={newItem.ref} onChange={e => setNewItem(i => ({ ...i, ref: e.target.value }))} className="text-sm" />
              <Input placeholder="Text or note content" value={newItem.text} onChange={e => setNewItem(i => ({ ...i, text: e.target.value }))} className="text-sm" />
              <Input placeholder="Source (optional)" value={newItem.source} onChange={e => setNewItem(i => ({ ...i, source: e.target.value }))} className="text-sm" />
              <div className="flex gap-2">
                <Button onClick={handleAddItem} size="sm" className="bg-indigo-700 hover:bg-indigo-800 flex-1">Add</Button>
                <Button onClick={() => setAddingItem(false)} variant="outline" size="sm" className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-2 flex-shrink-0">
          {!addingItem && (
            <Button onClick={() => setAddingItem(true)} variant="outline" className="flex-1 gap-1.5 text-sm"><Plus className="w-4 h-4" /> Add Item</Button>
          )}
          {!confirmDelete ? (
            <Button onClick={() => setConfirmDelete(true)} variant="outline" className="text-red-500 hover:bg-red-50 border-red-200 text-sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => { onDelete(collection.id); onClose(); }} className="bg-red-600 hover:bg-red-700 text-sm">
              Delete Collection
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}