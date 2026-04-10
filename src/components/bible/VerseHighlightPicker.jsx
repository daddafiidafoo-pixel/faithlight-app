import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Link2, X } from 'lucide-react';

const COLORS = [
  { id: 'yellow', hex: '#FEF08A', label: 'Yellow' },
  { id: 'green',  hex: '#BBF7D0', label: 'Green' },
  { id: 'blue',   hex: '#BAE6FD', label: 'Blue' },
  { id: 'pink',   hex: '#FBCFE8', label: 'Pink' },
  { id: 'purple', hex: '#DDD6FE', label: 'Purple' },
  { id: 'orange', hex: '#FED7AA', label: 'Orange' },
];

export default function VerseHighlightPicker({ verse, onHighlight, onSaveJournal, onCrossReference, onClose, existingColor }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Verse {verse.number}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Color Swatches */}
        <p className="text-xs text-gray-500 mb-2">Highlight color</p>
        <div className="flex gap-2 mb-4">
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => onHighlight(c.id)}
              title={c.label}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.hex,
                borderColor: existingColor === c.id ? '#6366F1' : 'transparent',
                boxShadow: existingColor === c.id ? '0 0 0 2px #6366F1' : 'none',
              }}
            />
          ))}
          {existingColor && (
            <button
              onClick={() => onHighlight(null)}
              className="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400 hover:border-red-300"
              title="Remove highlight"
            >✕</button>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSaveJournal}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save to Journal
          </button>
          <button
            onClick={onCrossReference}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-medium transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Cross References
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { COLORS };