import React from 'react';

export default function ProgressBar({ percentage = 0, height = 'h-2', animated = true }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
      <div
        className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all ${
          animated ? 'duration-500' : ''
        }`}
        style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
      />
    </div>
  );
}