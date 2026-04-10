import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, BookOpen } from 'lucide-react';

const MOODS = [
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'peaceful', label: 'Peaceful', emoji: '☮️' },
  { value: 'joyful', label: 'Joyful', emoji: '😊' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { value: 'reflective', label: 'Reflective', emoji: '💭' },
  { value: 'seeking', label: 'Seeking', emoji: '🔍' },
  { value: 'struggling', label: 'Struggling', emoji: '💪' },
];

export default function VerseJournalForm({ initialData, prefillVerse, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    reference: initialData?.reference || prefillVerse?.reference || '',
    verseText: initialData?.verseText || prefillVerse?.verseText || '',
    notes: initialData?.notes || '',
    mood: initialData?.mood || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      entryDate: new Date().toISOString().slice(0, 10),
      fromFavorite: !!prefillVerse?.fromFavorite
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" />
          {initialData ? 'Edit Journal Entry' : 'New Reflection'}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Verse reference (editable) */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bible Verse Reference</label>
        <input
          type="text"
          value={form.reference}
          onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
          placeholder="e.g. John 3:16"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Verse text preview */}
      {form.verseText && (
        <div className="bg-indigo-50 rounded-xl p-3 border-l-4 border-indigo-400">
          <p className="text-sm italic text-indigo-800 leading-relaxed">"{form.verseText}"</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Entry Title (optional)</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Give this reflection a title…"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">How are you feeling?</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, mood: f.mood === m.value ? '' : m.value }))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                form.mood === m.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Your Reflection *</label>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Write your personal thoughts, what this verse means to you, how it applies to your life today…"
          required
          rows={5}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="faith, prayer, healing…"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          {initialData ? 'Update Entry' : 'Save Reflection'}
        </Button>
      </div>
    </form>
  );
}