import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp } from 'lucide-react';

export default function LearningStreakDisplay({ userId, currentStreak = 0, longestStreak = 0 }) {
  const streakColor = currentStreak >= 30 ? 'text-purple-600' : 
                     currentStreak >= 14 ? 'text-orange-600' : 
                     currentStreak >= 7 ? 'text-red-600' : 
                     currentStreak >= 3 ? 'text-yellow-600' : 'text-gray-600';

  const streakBgColor = currentStreak >= 30 ? 'bg-purple-50 border-purple-200' : 
                        currentStreak >= 14 ? 'bg-orange-50 border-orange-200' : 
                        currentStreak >= 7 ? 'bg-red-50 border-red-200' : 
                        currentStreak >= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200';

  const nextMilestone = currentStreak >= 30 ? null : 
                        currentStreak >= 14 ? 30 : 
                        currentStreak >= 7 ? 14 : 
                        currentStreak >= 3 ? 7 : 3;

  return (
    <Card className={`border-2 ${streakBgColor}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className={`w-6 h-6 ${streakColor}`} />
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className={`text-3xl font-bold ${streakColor}`}>{currentStreak}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Personal Best</p>
              <p className="text-2xl font-bold text-indigo-600">{longestStreak}</p>
            </div>
          </div>

          {/* Progress Bar to Next Milestone */}
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Keep it up!</span>
                <span className="font-semibold text-gray-700">
                  {nextMilestone - currentStreak} more days to {nextMilestone}-day milestone
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Encouragement Message */}
          <p className="text-sm text-gray-700 italic">
            {currentStreak === 0 && "Start a streak today — complete one lesson to begin! 🎯"}
            {currentStreak > 0 && currentStreak < 7 && `You're building momentum! Keep going! 💪`}
            {currentStreak >= 7 && currentStreak < 14 && `Amazing consistency! You're 7+ days in! 🔥`}
            {currentStreak >= 14 && currentStreak < 30 && `You're unstoppable! A two-week streak is serious! 🚀`}
            {currentStreak >= 30 && `30-day streak! You're a dedicated disciple! 👑`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}