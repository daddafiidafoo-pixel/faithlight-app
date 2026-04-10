import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, BookOpen } from 'lucide-react';

export default function AddVerseModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ verse_ref: '', verse_text: '', translation: 'WEB', tags: [] });
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-600" /> Add Memory Verse</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Verse Reference *</label>
            <Input placeholder="e.g. John 3:16" value={form.verse_ref} onChange={e => setForm(f => ({ ...f, verse_ref: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Verse Text *</label>
            <Textarea
              placeholder="Type or paste the verse text here..."
              value={form.verse_text}
              onChange={e => setForm(f => ({ ...f, verse_text: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Translation</label>
            <Input placeholder="WEB, NIV, KJV..." value={form.translation} onChange={e => setForm(f => ({ ...f, translation: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Tags (optional)</label>
            <div className="flex gap-2 mb-2">
              <Input placeholder="e.g. faith, grace..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 text-sm" />
              <Button onClick={addTag} variant="outline" size="sm">Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                    {tag}<button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => form.verse_ref && form.verse_text && onAdd(form)}
            disabled={!form.verse_ref || !form.verse_text}
            className="flex-1 bg-indigo-700 hover:bg-indigo-800"
          >
            Add Verse
          </Button>
        </div>
      </div>
    </div>
  );
}