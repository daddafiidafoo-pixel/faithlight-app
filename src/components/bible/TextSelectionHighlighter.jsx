import React, { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = [
  { id: 'yellow', label: 'Yellow', bg: '#FCD34D', light: '#FFFAED' },
  { id: 'pink', label: 'Pink', bg: '#F472B6', light: '#FDF2F8' },
  { id: 'green', label: 'Green', bg: '#86EFAC', light: '#F0FDF4' },
  { id: 'blue', label: 'Blue', bg: '#60A5FA', light: '#EFF6FF' },
];

/**
 * Renders a floating color-picker tooltip when user selects text inside a verse.
 * Props:
 *   verseId       – string id of the verse being rendered
 *   currentColor  – existing highlight color (or null)
 *   onHighlight   – (verseId, color) => void
 *   onClear       – (verseId) => void
 *   children      – the verse text node
 */
export default function TextSelectionHighlighter({ verseId, currentColor, onHighlight, onClear, children }) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { x, y }

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
      setTooltip(null);
      return;
    }
    // Only show if selection is inside this verse
    const range = selection.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) {
      setTooltip(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setTooltip({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 48,
    });
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseUp]);

  // Dismiss tooltip on outside click
  useEffect(() => {
    const dismiss = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setTooltip(null);
      }
    };
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, []);

  const handleColorClick = (colorId) => {
    onHighlight(verseId, colorId);
    setTooltip(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleClear = () => {
    onClear(verseId);
    setTooltip(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <span ref={containerRef} className="relative">
      {children}
      {tooltip && (
        <span
          className="absolute z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
          onMouseDown={e => e.preventDefault()} // prevent selection loss
        >
          {COLORS.map(c => (
            <button
              key={c.id}
              title={`Highlight ${c.label}`}
              onClick={() => handleColorClick(c.id)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
              style={{
                backgroundColor: c.bg,
                borderColor: currentColor === c.id ? '#374151' : 'transparent',
              }}
            />
          ))}
          {currentColor && (
            <button
              onClick={handleClear}
              title="Remove highlight"
              className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 text-gray-500 hover:bg-red-100 hover:text-red-600 text-xs flex items-center justify-center font-bold transition-colors"
            >
              ×
            </button>
          )}
        </span>
      )}
    </span>
  );
}