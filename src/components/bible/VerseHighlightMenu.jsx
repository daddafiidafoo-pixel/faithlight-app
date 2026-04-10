import { useState } from 'react';
import { highlightStorage } from '@/lib/highlightStorage';

const HIGHLIGHT_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300' },
  { name: 'green', bg: 'bg-green-200', border: 'border-green-300' },
  { name: 'blue', bg: 'bg-blue-200', border: 'border-blue-300' },
  { name: 'pink', bg: 'bg-pink-200', border: 'border-pink-300' },
  { name: 'purple', bg: 'bg-purple-200', border: 'border-purple-300' }
];

export default function VerseHighlightMenu({ verse, book, chapter, onClose, onHighlightChange }) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const currentColor = highlightStorage.getHighlightColor(book, chapter, verse.number);
  const highlight = currentColor ? highlightStorage.getHighlight(`${book}-${chapter}-${verse.number}`) : null;

  const handleColorSelect = (color) => {
    highlightStorage.saveHighlight(book, chapter, verse.number, verse.text, color, note);
    onHighlightChange?.();
    onClose();
  };

  const handleRemoveHighlight = () => {
    highlightStorage.removeHighlight(`${book}-${chapter}-${verse.number}`);
    onHighlightChange?.();
    onClose();
  };

  return (
    <div className="absolute bg-white rounded-lg shadow-lg border p-3 z-50 w-56">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          {book} {chapter}:{verse.number}
        </p>

        {/* Color picker */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Highlight Color</p>
          <div className="grid grid-cols-5 gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color.name)}
                className={`h-8 rounded-lg border-2 transition ${
                  color.bg
                } ${currentColor === color.name ? color.border : 'border-gray-200'}`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Note section */}
        {highlight && (
          <div className="pt-2 border-t">
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {showNoteInput ? 'Hide' : 'Add Note'}
            </button>
            {showNoteInput && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Personal note..."
                className="w-full text-xs p-2 mt-2 border rounded-lg"
                rows="3"
              />
            )}
            {highlight.note && !showNoteInput && (
              <p className="text-xs text-gray-600 mt-1 italic">"{highlight.note}"</p>
            )}
          </div>
        )}

        {/* Remove button */}
        {currentColor && (
          <button
            onClick={handleRemoveHighlight}
            className="w-full text-xs text-red-600 hover:bg-red-50 p-2 rounded-lg"
          >
            Remove Highlight
          </button>
        )}
      </div>
    </div>
  );
}