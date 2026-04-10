import React from 'react';

const COLORS = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-200' },
  { value: 'green', label: 'Green', bg: 'bg-green-200' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-200' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-200' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-200' },
];

export default function HighlightColorPicker({ value, onChange, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-xs w-full">
        <h3 className="font-bold text-lg mb-4">Highlight Color</h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => {
                onChange(color.value);
                onClose();
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                value === color.value
                  ? 'border-slate-900'
                  : 'border-slate-200 hover:border-slate-400'
              } ${color.bg}`}
              title={color.label}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}