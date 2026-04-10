import React, { useState } from 'react';
import { Pencil, Trash2, BookOpen, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const MOOD_EMOJI = {
  grateful: '🙏', peaceful: '☮️', joyful: '😊',
  hopeful: '🌟', reflective: '💭', seeking: '🔍', struggling: '💪'
};

export default function VerseJournalCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <BookOpen size={10} /> {entry.reference}
              </span>
              {entry.mood && (
                <span className="text-xs text-gray-500">
                  {MOOD_EMOJI[entry.mood]} {entry.mood}
                </span>
              )}
              {entry.fromFavorite && (
                <span className="text-xs text-rose-500">❤️ from favorites</span>
              )}
            </div>
            {entry.title && (
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{entry.title}</h3>
            )}
            <p className={`text-sm text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
              {entry.notes}
            </p>
            {entry.notes?.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-indigo-500 mt-1 hover:text-indigo-700"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Verse text */}
        {expanded && entry.verseText && (
          <div className="mt-3 bg-indigo-50 rounded-xl p-3 border-l-4 border-indigo-400">
            <p className="text-xs italic text-indigo-800 leading-relaxed">"{entry.verseText}"</p>
          </div>
        )}

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {entry.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-0.5 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                <Tag size={9} /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {entry.entryDate ? format(new Date(entry.entryDate), 'MMMM d, yyyy') : format(new Date(entry.created_date), 'MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}