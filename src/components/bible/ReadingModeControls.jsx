import React from 'react';
import { Maximize2, Type, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function ReadingModeControls({ 
  isReadingMode, 
  onToggleReadingMode,
  fontSize,
  onFontSizeChange,
  bgColor,
  onBgColorChange
}) {
  const fontSizes = [
    { value: 'text-sm', label: 'Small' },
    { value: 'text-base', label: 'Medium' },
    { value: 'text-lg', label: 'Large' },
    { value: 'text-xl', label: 'Extra Large' },
  ];

  const bgColors = [
    { value: 'bg-white', label: 'White', color: '#FFFFFF' },
    { value: 'bg-gray-50', label: 'Light Gray', color: '#F9FAFB' },
    { value: 'bg-amber-50', label: 'Warm', color: '#FFFBEB' },
    { value: 'bg-blue-50', label: 'Cool', color: '#EFF6FF' },
    { value: 'bg-slate-900', label: 'Dark', color: '#0F172A' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isReadingMode ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleReadingMode}
        title="Reading Mode"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" title="Font Size">
            <Type className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Font Size</p>
            {fontSizes.map(size => (
              <button
                key={size.value}
                onClick={() => onFontSizeChange(size.value)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                  fontSize === size.value ? 'bg-indigo-50 text-indigo-600 font-semibold' : ''
                }`}
              >
                <span className={size.value}>{size.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" title="Background Color">
            <Palette className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Background</p>
            {bgColors.map(color => (
              <button
                key={color.value}
                onClick={() => onBgColorChange(color.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 ${
                  bgColor === color.value ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-sm">{color.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}