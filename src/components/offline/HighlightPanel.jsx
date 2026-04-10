import React, { useState } from 'react';
import { Highlighter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = [
  { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-200', border: 'border-yellow-400' },
  { id: 'green', label: 'Green', bg: 'bg-green-200', border: 'border-green-400' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-200', border: 'border-blue-400' },
  { id: 'pink', label: 'Pink', bg: 'bg-pink-200', border: 'border-pink-400' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-200', border: 'border-purple-400' },
];

export default function HighlightPanel({ selectedText, onHighlight, onClose }) {
  const [selectedColor, setSelectedColor] = useState('yellow');

  if (!selectedText) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3 z-50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-indigo-600" />
          <p className="text-sm font-semibold text-gray-800">Highlight text</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500 italic line-clamp-2">"{selectedText}"</p>

      <div className="flex gap-2">
        {COLORS.map(col => (
          <button
            key={col.id}
            onClick={() => setSelectedColor(col.id)}
            className={`w-6 h-6 rounded border-2 transition-all ${col.bg} ${
              selectedColor === col.id ? col.border : 'border-transparent'
            }`}
            title={col.label}
          />
        ))}
      </div>

      <Button
        onClick={() => onHighlight(selectedColor)}
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-sm"
      >
        <Highlighter className="w-3.5 h-3.5" />
        Highlight with {COLORS.find(c => c.id === selectedColor)?.label}
      </Button>
    </div>
  );
}