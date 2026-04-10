import React from 'react';
import { Flame } from 'lucide-react';

export default function StreakCounter({ count = 0, className = '' }) {
  if (!count) return null;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 ${className}`}>
      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
      <span className="text-sm font-semibold text-orange-600">{count}</span>
      <span className="text-xs text-orange-500">days</span>
    </div>
  );
}