import React, { useState } from 'react';
import { Heart, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { t } from '@/lib/i18n';
import { format } from 'date-fns';

export default function JournalEntryCard({ entry, onEdit, onDelete, onAddReflection, uiLang }) {
  const [expanded, setExpanded] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');

  const handleAddReflection = () => {
    if (reflectionInput.trim()) {
      onAddReflection(reflectionInput);
      setReflectionInput('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {entry.isFavorite && <Heart size={16} className="text-red-500 fill-red-500" />}
              <h3 className="font-bold text-gray-900">{entry.title}</h3>
            </div>
            <p className="text-xs text-gray-500">
              {format(new Date(entry.entryDate), 'MMM d, yyyy p')} • {entry.mood}
            </p>
            {entry.linkedVerseReference && (
              <p className="text-xs text-indigo-600 font-semibold mt-1">{entry.linkedVerseReference}</p>
            )}
          </div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

          {/* Tags */}
          {(entry.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Reflections */}
          {(entry.reflections || []).length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-900 uppercase">Reflections</p>
              {entry.reflections.map((refl, idx) => (
                <div key={idx} className="text-xs text-blue-800">
                  <p className="font-semibold">{refl.date}</p>
                  <p>{refl.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Reflection */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Add Reflection</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="How has this evolved?"
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddReflection()}
                className="flex-1 px-2 py-1.5 min-h-[44px] border border-gray-200 rounded-lg text-xs"
              />
              <button
                onClick={handleAddReflection}
                className="px-3 py-1.5 min-h-[44px] bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="min-h-[44px] px-3 py-1 flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Edit2 size={16} />
              <span className="text-xs font-semibold">{t(uiLang, 'common.edit') || 'Edit'}</span>
            </button>
            <button
              onClick={onDelete}
              className="min-h-[44px] px-3 py-1 flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
              <span className="text-xs font-semibold">{t(uiLang, 'common.delete') || 'Delete'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}