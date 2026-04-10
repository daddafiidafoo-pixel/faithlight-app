import React, { useState } from 'react';
import { Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['yellow', 'green', 'blue', 'pink', 'purple'];

export default function VerseHighlighter({ verse, onHighlight }) {
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [showPicker, setShowPicker] = useState(false);

  const handleHighlight = () => {
    onHighlight({ verse, color: selectedColor });
    setShowPicker(false);
  };

  return (
    <div className="inline-flex gap-1 items-center">
      {showPicker && (
        <div className="flex gap-1 bg-white border rounded-lg p-2 shadow-lg">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-5 h-5 rounded cursor-pointer border-2 ${
                color === 'yellow' ? 'bg-yellow-200 border-yellow-400' :
                color === 'green' ? 'bg-green-200 border-green-400' :
                color === 'blue' ? 'bg-blue-200 border-blue-400' :
                color === 'pink' ? 'bg-pink-200 border-pink-400' :
                'bg-purple-200 border-purple-400'
              } ${selectedColor === color ? 'ring-2 ring-offset-1' : ''}`}
            />
          ))}
        </div>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowPicker(!showPicker)}
        className="text-amber-600 hover:bg-amber-50"
      >
        <Highlighter className="w-4 h-4" />
      </Button>
      {showPicker && (
        <Button size="sm" onClick={handleHighlight} className="text-xs">
          Highlight
        </Button>
      )}
    </div>
  );
}