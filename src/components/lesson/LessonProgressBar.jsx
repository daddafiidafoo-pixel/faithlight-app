import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

export default function LessonProgressBar({ currentLessonIndex, totalLessons, completedLessons = [] }) {
  const progressPercent = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
      <CardContent className="p-6 space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">Course Progress</h3>
            <span className="text-sm font-bold text-indigo-600">
              {completedLessons.length}/{totalLessons}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round(progressPercent)}% complete
          </p>
        </div>

        {/* Current Lesson Status */}
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-2">Current Lesson</p>
          <div className="flex items-center gap-2">
            {completedLessons.includes(currentLessonIndex) ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            )}
            <p className="font-medium text-gray-900 text-sm">
              Lesson {currentLessonIndex + 1} of {totalLessons}
            </p>
          </div>
        </div>

        {/* Mini Progress Indicators */}
        <div>
          <p className="text-xs text-gray-600 mb-2">Lessons</p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: totalLessons }).map((_, idx) => {
              const isCompleted = completedLessons.includes(idx);
              const isCurrent = idx === currentLessonIndex;

              return (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  title={`Lesson ${idx + 1}`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}