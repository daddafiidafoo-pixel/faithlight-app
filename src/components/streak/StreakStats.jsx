import React from 'react';
import { Flame, Target, Award } from 'lucide-react';

export default function StreakStats({ currentStreak = 0, longestStreak = 0, totalDays = 0 }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-gray-600">Current Streak</span>
        </div>
        <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
        <p className="text-xs text-gray-500 mt-1">days in a row</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-medium text-gray-600">Best Streak</span>
        </div>
        <p className="text-3xl font-bold text-indigo-600">{longestStreak}</p>
        <p className="text-xs text-gray-500 mt-1">days record</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-600">Total Days</span>
        </div>
        <p className="text-3xl font-bold text-green-600">{totalDays}</p>
        <p className="text-xs text-gray-500 mt-1">all-time reads</p>
      </div>
    </div>
  );
}