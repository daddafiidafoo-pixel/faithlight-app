import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteHighlight, updateHighlightColor } from '@/lib/highlights';
import HighlightColorPicker from './HighlightColorPicker';

const COLOR_BG = {
  yellow: 'bg-yellow-200',
  green: 'bg-green-200',
  blue: 'bg-blue-200',
  pink: 'bg-pink-200',
  purple: 'bg-purple-200',
};

export default function HighlightedVerse({ highlight, userEmail, onDelete }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState(highlight.color);

  const handleChangeColor = (newColor) => {
    setColor(newColor);
    updateHighlightColor(userEmail, highlight.id, newColor);
  };

  const handleDelete = () => {
    if (deleteHighlight(userEmail, highlight.id)) {
      onDelete(highlight.id);
    }
  };

  return (
    <>
      <div
        className={`${COLOR_BG[color]} p-2 rounded-lg border-l-4 border-slate-400 my-2 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => setShowColorPicker(true)}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 italic">{highlight.textSnippet}</p>
            <p className="text-xs text-slate-500 mt-1">{highlight.verseReference}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-slate-400 hover:text-red-500 flex-shrink-0 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showColorPicker && (
        <HighlightColorPicker
          value={color}
          onChange={handleChangeColor}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
}