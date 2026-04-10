import React, { useState } from 'react';
import { X, MapPin, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'healing', label: 'Healing', emoji: '💊', color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'peace', label: 'Peace', emoji: '🕊️', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'guidance', label: 'Guidance', emoji: '🧭', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'grief', label: 'Grief', emoji: '🤍', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'salvation', label: 'Salvation', emoji: '✝️', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { id: 'other', label: 'Other', emoji: '💛', color: 'bg-pink-100 text-pink-700 border-pink-300' },
];

export default function DropPrayerModal({ lat, lng, city, country, onSubmit, onClose, loading }) {
  const [category, setCategory] = useState('other');
  const [message, setMessage] = useState('');

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" /> Drop a Prayer
            </h2>
            {(city || country) && (
              <p className="text-xs text-gray-500 mt-0.5">{[city, country].filter(Boolean).join(', ')}</p>
            )}
            {!city && !country && (
              <p className="text-xs text-gray-500 mt-0.5">{lat.toFixed(3)}, {lng.toFixed(3)}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Select what this prayer is for. It will appear anonymously on the global prayer map.</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs font-semibold ${
                category === c.id ? c.color + ' border-current scale-105' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={120}
          placeholder="Optional short note (e.g. 'Praying for a friend') — stays anonymous"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-rose-300 mb-4"
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => onSubmit({ lat, lng, city, country, category, message, is_anonymous: true })}
            disabled={loading}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {loading ? 'Dropping…' : 'Drop Prayer'}
          </Button>
        </div>
      </div>
    </div>
  );
}