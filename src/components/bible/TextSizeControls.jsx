import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

const sizes = ['small', 'medium', 'large', 'xlarge'];

export default function TextSizeControls({ currentSize, onChange }) {
  const currentIndex = sizes.indexOf(currentSize);

  const handleIncrease = () => {
    if (currentIndex < sizes.length - 1) {
      onChange(sizes[currentIndex + 1]);
    }
  };

  const handleDecrease = () => {
    if (currentIndex > 0) {
      onChange(sizes[currentIndex - 1]);
    }
  };

  const sizeLabels = {
    small: 'A-',
    medium: 'A',
    large: 'A+',
    xlarge: 'A++',
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrease}
        disabled={currentIndex === 0}
        className="h-8 w-8 p-0"
        title="Decrease text size"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <div className="h-8 px-2 flex items-center bg-slate-100 rounded text-xs font-medium text-slate-700">
        {sizeLabels[currentSize]}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrease}
        disabled={currentIndex === sizes.length - 1}
        className="h-8 w-8 p-0"
        title="Increase text size"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}