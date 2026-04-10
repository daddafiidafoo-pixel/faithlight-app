import React from 'react';
import { Highlighter, X } from 'lucide-react';

const COLORS = [
  { key: 'yellow', bg: '#FEF9C3', border: '#FDE047', label: 'Yellow' },
  { key: 'green',  bg: '#DCFCE7', border: '#4ADE80', label: 'Green' },
  { key: 'blue',   bg: '#DBEAFE', border: '#60A5FA', label: 'Blue' },
  { key: 'pink',   bg: '#FCE7F3', border: '#F472B6', label: 'Pink' },
  { key: 'purple', bg: '#EDE9FE', border: '#A78BFA', label: 'Purple' },
];

export const HIGHLIGHT_STYLES = Object.fromEntries(
  COLORS.map(c => [c.key, { bg: c.bg, border: c.border }])
);

export default function VerseHighlightSheet({ verse, existingColor, onHighlight, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full bg-white pb-safe" style={{ borderRadius: '24px 24px 0 0' }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ backgroundColor: '#E5E7EB' }} />
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Highlighter className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <p className="text-sm font-bold" style={{ color: '#1F2937' }}>Highlight Verse</p>
          </div>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>{verse.reference_text}</p>
          <div className="flex gap-3 mb-5">
            {COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => onHighlight(c.key)}
                aria-label={`Highlight ${c.label}`}
                className="w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center"
                style={{
                  backgroundColor: c.bg,
                  borderColor: existingColor === c.key ? c.border : 'transparent',
                  boxShadow: existingColor === c.key ? `0 0 0 3px ${c.border}44` : 'none',
                  transform: existingColor === c.key ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {existingColor && (
            <button
              onClick={onRemove}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold mb-3"
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
            >
              <X className="w-4 h-4" /> Remove Highlight
            </button>
          )}
          <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm font-semibold" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
            Cancel
          </button>
        </div>
        <div style={{ height: '8px' }} />
      </div>
    </div>
  );
}