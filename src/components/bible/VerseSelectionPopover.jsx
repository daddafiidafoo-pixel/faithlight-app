import React, { useState } from 'react';
import { Copy, Heart, MessageCircle } from 'lucide-react';

/**
 * Popover for selected Bible verse text with save/share options
 */
export default function VerseSelectionPopover({ selectedText, onSave, onCopy, isSaving }) {
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  if (!selectedText) return null;

  const handleSave = () => {
    onSave(notes);
    setNotes('');
    setShowNotesInput(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText.text);
    onCopy();
  };

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 max-w-xs"
      style={{
        left: `${selectedText.x}px`,
        top: `${selectedText.y - 60}px`,
      }}
    >
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50 transition min-h-[32px]"
        >
          <Copy size={14} />
          Copy
        </button>
        
        <button
          onClick={() => setShowNotesInput(!showNotesInput)}
          title="Save to favorites"
          className="flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 transition min-h-[32px]"
        >
          <Heart size={14} />
          Save
        </button>
      </div>

      {showNotesInput && (
        <div className="border-t pt-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add personal notes..."
            className="w-full text-xs p-1.5 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-2 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition min-h-[32px]"
          >
            {isSaving ? 'Saving...' : 'Save to Favorites'}
          </button>
        </div>
      )}
    </div>
  );
}