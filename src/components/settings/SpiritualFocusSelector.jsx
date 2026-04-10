import React from 'react';
import { Target } from 'lucide-react';

const FOCUS_AREAS = [
  { id: 'patience', label: 'Patience', emoji: '⏳' },
  { id: 'grief', label: 'Grief & Loss', emoji: '🤍' },
  { id: 'joy', label: 'Joy', emoji: '😊' },
  { id: 'forgiveness', label: 'Forgiveness', emoji: '🕊️' },
  { id: 'anxiety', label: 'Anxiety & Fear', emoji: '🌿' },
  { id: 'faith', label: 'Faith', emoji: '✝️' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { id: 'purpose', label: 'Purpose & Calling', emoji: '🎯' },
  { id: 'healing', label: 'Healing', emoji: '💊' },
  { id: 'peace', label: 'Peace', emoji: '☮️' },
  { id: 'strength', label: 'Strength', emoji: '💪' },
  { id: 'wisdom', label: 'Wisdom', emoji: '📖' },
  { id: 'humility', label: 'Humility', emoji: '🌱' },
  { id: 'love', label: 'Love & Relationships', emoji: '❤️' },
  { id: 'hope', label: 'Hope', emoji: '🌅' },
  { id: 'courage', label: 'Courage', emoji: '🦁' },
];

export default function SpiritualFocusSelector({ selected = [], onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < 5) {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-gray-700">Spiritual Focus Areas</span>
        <span className="text-xs text-gray-400 ml-auto">{selected.length}/5 selected</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        AI will tailor your daily verse reflections to these areas. Choose up to 5.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FOCUS_AREAS.map(area => {
          const sel = selected.includes(area.id);
          const maxReached = !sel && selected.length >= 5;
          return (
            <button
              key={area.id}
              onClick={() => toggle(area.id)}
              disabled={maxReached}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all text-left
                ${sel
                  ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                  : maxReached
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              <span className="text-base">{area.emoji}</span>
              {area.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}