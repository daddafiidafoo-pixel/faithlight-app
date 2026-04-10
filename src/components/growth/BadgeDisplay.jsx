import React from 'react';
import { Card } from '@/components/ui/card';

export default function BadgeDisplay({ badge, earned = false }) {
  return (
    <Card className={`p-4 text-center ${earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
      <div className={`text-4xl mb-2 ${earned ? 'animate-bounce' : ''}`}>
        {badge.icon}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm">{badge.name}</h4>
      <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
      {!earned && <p className="text-xs text-gray-400 mt-2">Locked</p>}
    </Card>
  );
}