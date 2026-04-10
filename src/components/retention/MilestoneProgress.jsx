import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

export default function MilestoneProgress({ completedLessons, totalRequired, totalCourses }) {
  const milestones = [
    { label: 'First Lesson', required: 1, emoji: '📖', color: 'blue' },
    { label: 'First Week', required: 7, emoji: '📚', color: 'yellow' },
    { label: 'Course Complete', required: 20, emoji: '🎓', color: 'green' },
    { label: 'Level 2 Unlock', required: 50, emoji: '⭐', color: 'purple' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Your Growth Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, idx) => {
            const isCompleted = completedLessons >= milestone.required;
            const progress = Math.min((completedLessons / milestone.required) * 100, 100);

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-900">{milestone.emoji} {milestone.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {completedLessons}/{milestone.required}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCompleted ? 'bg-green-600' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Encouragement */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              You've completed <strong>{completedLessons}</strong> lessons. 
              {completedLessons < 50 && ` Keep going—you're on your way to Level 2! 🚀`}
              {completedLessons >= 50 && ` You're ready for advanced leadership training! 👏`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { TrendingUp } from 'lucide-react';