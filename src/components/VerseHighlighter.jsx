import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Highlighter } from 'lucide-react';

const HIGHLIGHT_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-400' },
  { name: 'green', bg: 'bg-green-200', border: 'border-green-400' },
  { name: 'blue', bg: 'bg-blue-200', border: 'border-blue-400' },
  { name: 'pink', bg: 'bg-pink-200', border: 'border-pink-400' },
  { name: 'orange', bg: 'bg-orange-200', border: 'border-orange-400' }
];

export default function VerseHighlighter({ book, chapter, verse, verseText }) {
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [personalNote, setPersonalNote] = useState('');

  const handleHighlight = async () => {
    try {
      const user = await base44.auth.me();
      await base44.entities.VerseHighlight.create({
        user_email: user.email,
        book,
        chapter,
        verse,
        verse_text: verseText,
        color: selectedColor,
        personal_note: personalNote
      });
      setPersonalNote('');
      setShowColorPicker(false);
    } catch (error) {
      console.error('Failed to highlight verse:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {showColorPicker ? (
          <div className="flex gap-2">
            {HIGHLIGHT_COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-6 h-6 rounded ${color.bg} border-2 ${
                  selectedColor === color.name ? color.border : 'border-gray-300'
                }`}
              />
            ))}
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowColorPicker(true)}
            className="gap-2"
          >
            <Highlighter className="w-4 h-4" />
            Highlight
          </Button>
        )}
      </div>

      {showColorPicker && (
        <div className="flex flex-col gap-2 p-2 border rounded bg-gray-50">
          <input
            type="text"
            placeholder="Add a note..."
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleHighlight}>
              Save Highlight
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowColorPicker(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}