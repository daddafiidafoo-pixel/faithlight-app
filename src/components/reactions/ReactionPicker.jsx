import React, { useEffect, useRef } from 'react';
import { REACTIONS } from './ReactionConfig';

export default function ReactionPicker({ onSelect, onClose, currentKey }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-2"
      style={{
        animation: 'reactionPickerIn 150ms ease-out both',
        transformOrigin: 'bottom left',
      }}
    >
      <style>{`
        @keyframes reactionPickerIn {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .reaction-btn { transition: transform 120ms ease, background 100ms ease; }
        .reaction-btn:hover { transform: scale(1.25); }
        .reaction-btn:active { transform: scale(1.1); }
      `}</style>

      <div className="grid grid-cols-5 gap-1">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            className={`reaction-btn flex flex-col items-center gap-0.5 p-2 rounded-xl text-center ${currentKey === r.key ? 'bg-indigo-50 ring-1 ring-indigo-300' : 'hover:bg-gray-50'}`}
            onClick={() => { onSelect(r.key); onClose(); }}
            title={r.label_en}
          >
            <span className="text-xl leading-none">{r.emoji}</span>
            <span className="text-[9px] text-gray-500 leading-tight w-10 truncate">{r.label_en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}