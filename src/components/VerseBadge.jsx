import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function VerseBadge({ verse, onRemove }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 mb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-left w-full hover:opacity-80"
          >
            <p className="text-xs font-semibold text-indigo-600">{verse.reference}</p>
            {expanded && (
              <p className="text-xs text-gray-700 mt-1 line-clamp-3">{verse.text}</p>
            )}
            {!expanded && (
              <p className="text-xs text-gray-600 line-clamp-1">{verse.text}</p>
            )}
          </button>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}