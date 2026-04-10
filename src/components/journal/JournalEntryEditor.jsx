import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

const MOODS = ['grateful', 'hopeful', 'struggling', 'peaceful', 'curious', 'convicted', 'joyful'];
const MOOD_EMOJI = { grateful: '🙏', hopeful: '✨', struggling: '💙', peaceful: '🕊️', curious: '🔍', convicted: '⚡', joyful: '😊' };
const TYPES = [
  { value: 'reflection', label: '💭 Reflection' },
  { value: 'prayer', label: '🙏 Prayer' },
  { value: 'note', label: '📝 Note' },
  { value: 'question', label: '❓ Question' },
];

export default function JournalEntryEditor({ initialEntry, onSave, onCancel }) {
  const [form, setForm] = useState({
    verseReference: initialEntry?.verseReference || '',
    noteContent: initialEntry?.noteContent || '',
    mood: initialEntry?.mood || '',
    tags: initialEntry?.tags || [],
    isFavorite: initialEntry?.isFavorite || false,
    entryType: initialEntry?.entryType || 'reflection',
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.verseReference.trim() || !form.noteContent.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Verse Reference */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Verse Reference *</label>
        <Input placeholder="e.g. John 3:16 or Romans 8:28" value={form.verseReference}
          onChange={e => setForm(f => ({ ...f, verseReference: e.target.value }))} required />
      </div>

      {/* Entry Type */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Type</label>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, entryType: t.value }))}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${form.entryType === t.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rich Text Content */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          {form.entryType === 'prayer' ? 'Your Prayer' : form.entryType === 'note' ? 'Your Note' : 'Your Reflection'} *
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          placeholder={form.entryType === 'prayer' ? 'Dear Lord...' : 'What does this verse mean to you today?'}
          value={form.noteContent}
          onChange={e => setForm(f => ({ ...f, noteContent: e.target.value }))}
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.noteContent.length} characters</p>
      </div>

      {/* Mood */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">How are you feeling?</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button key={m} type="button" onClick={() => setForm(f => ({ ...f, mood: f.mood === m ? '' : m }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${form.mood === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}>
              {MOOD_EMOJI[m]} {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tags</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {form.tags.map(t => (
            <Badge key={t} variant="secondary" className="gap-1 pl-2.5">
              #{t}
              <button type="button" onClick={() => removeTag(t)} className="ml-1 hover:text-red-500"><X size={12} /></button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Favorite */}
      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
        <input type="checkbox" id="fav" checked={form.isFavorite} onChange={e => setForm(f => ({ ...f, isFavorite: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
        <label htmlFor="fav" className="text-sm text-gray-700 cursor-pointer">⭐ Mark as favorite</label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={saving || !form.verseReference.trim() || !form.noteContent.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          {saving ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
}