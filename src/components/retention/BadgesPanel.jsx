import React from 'react';
import { Trophy } from 'lucide-react';

export default function BadgesPanel({ badges = [] }) {
  if (!badges.length) {
    return (
      <div className="p-4 rounded-lg bg-gray-100">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5" /> Your Badges
        </h3>
        <p className="text-sm text-gray-500">
          Complete activities to earn badges.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Your Badges
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl">{badge.icon || '🏆'}</div>
            <div className="text-xs mt-1 font-medium">{badge.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}