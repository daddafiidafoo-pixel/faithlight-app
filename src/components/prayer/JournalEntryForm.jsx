import React, { useState } from 'react';
import { X } from 'lucide-react';
import { t } from '@/lib/i18n';

const moods = ['grateful', 'hopeful', 'struggling', 'peaceful', 'seeking', 'joyful', 'anxious', 'reflective'];
const categories = ['personal', 'family', 'health', 'work', 'faith', 'gratitude', 'intercession', 'other'];

export default function JournalEntryForm({ initialData, onSubmit, onCancel, uiLang }) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    content: '',
    entryDate: new Date().toISOString().slice(0, 16),
    mood: 'peaceful',
    category: 'personal',
    linkedVerseReference: '',
    tags: [],
    isFavorite: false,
  });

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      <div className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder={t(uiLang, 'journal.entryTitle') || 'Prayer title...'}
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm font-semibold"
        />

        {/* Date */}
        <input
          type="datetime-local"
          value={formData.entryDate}
          onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
          className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm"
        />

        {/* Content */}
        <textarea
          placeholder={t(uiLang, 'journal.entryContent') || 'Write your prayer here...'}
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none h-32"
        />

        {/* Mood & Category */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
            className="px-3 py-2 min-h-[44px] border border-gray-200 rounded-xl text-sm"
          >
            {moods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 min-h-[44px] border border-gray-200 rounded-xl text-sm"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Verse Reference */}
        <input
          type="text"
          placeholder={t(uiLang, 'journal.verseReference') || 'Linked verse (e.g., John 3:16)'}
          value={formData.linkedVerseReference || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, linkedVerseReference: e.target.value }))}
          className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm"
        />

        {/* Tags */}
        <div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder={t(uiLang, 'journal.addTag') || 'Add tag...'}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-3 py-2 min-h-[44px] border border-gray-200 rounded-xl text-sm"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 min-h-[44px] bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold"
            >
              {t(uiLang, 'journal.add') || 'Add'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.tags || []).map((tag, idx) => (
              <div key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                {tag}
                <button onClick={() => handleRemoveTag(idx)} className="hover:opacity-70">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">{t(uiLang, 'journal.markFavorite') || 'Mark as favorite'}</span>
        </label>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50"
          >
            {t(uiLang, 'common.cancel') || 'Cancel'}
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="px-4 py-2 min-h-[44px] bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            {t(uiLang, 'common.save') || 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}