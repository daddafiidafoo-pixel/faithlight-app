import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const LEVELS = [
  { level: 1, title: 'Rooted in Christ', icon: '🌱', color: 'from-green-400 to-emerald-600' },
  { level: 2, title: 'Growing Strong', icon: '🌿', color: 'from-lime-400 to-green-600' },
  { level: 3, title: 'Deep Study', icon: '📚', color: 'from-blue-400 to-indigo-600' },
  { level: 4, title: 'Leadership', icon: '👑', color: 'from-purple-400 to-pink-600' },
  { level: 5, title: 'Spiritual Master', icon: '✨', color: 'from-yellow-400 to-red-600' },
];

export default function GrowthLevelCard({ currentLevel = 1, totalPoints = 0, pointsToNextLevel = 500 }) {
  const levelData = LEVELS[currentLevel - 1] || LEVELS[0];
  const nextLevelData = LEVELS[currentLevel] || LEVELS[4];
  const progressPercent = Math.min((totalPoints / pointsToNextLevel) * 100, 100);

  return (
    <Card className={`bg-gradient-to-r ${levelData.color} text-white p-6 mb-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-5xl mb-2">{levelData.icon}</div>
          <h2 className="text-2xl font-bold">{levelData.title}</h2>
          <p className="text-sm opacity-90">Level {currentLevel}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg font-bold">
            <Zap className="w-5 h-5" />
            {totalPoints}
          </div>
          <p className="text-xs opacity-75">points</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress to {nextLevelData.title}</span>
          <span>{totalPoints} / {pointsToNextLevel}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </Card>
  );
}