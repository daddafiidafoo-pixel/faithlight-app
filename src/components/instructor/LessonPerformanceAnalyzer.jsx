import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';

export default function LessonPerformanceAnalyzer({ lessons = [], lowPerforming = [] }) {
  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Lesson Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No lessons found</p>
        </CardContent>
      </Card>
    );
  }

  const sortedLessons = [...lessons].sort(
    (a, b) => a.completion_rate - b.completion_rate
  );

  return (
    <div className="space-y-4">
      {lowPerforming.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">
                {lowPerforming.length} Lesson{lowPerforming.length !== 1 ? 's' : ''} Need Attention
              </p>
              <p className="text-sm text-red-700 mt-1">
                These lessons have completion rates below 50%. Consider reviewing content or difficulty.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedLessons.map((lesson) => (
              <div key={lesson.lesson_id} className="space-y-2 pb-3 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 text-sm">{lesson.lesson_title}</p>
                  {lesson.is_low_performing && (
                    <Badge className="bg-red-100 text-red-800">Low Performance</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Completion Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-bold text-gray-900">{lesson.completion_rate}%</p>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            lesson.completion_rate >= 75
                              ? 'bg-green-500'
                              : lesson.completion_rate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${lesson.completion_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs mb-1">Avg Time Spent</p>
                    <p className="font-bold text-gray-900">
                      {Math.round(lesson.avg_time_spent_seconds / 60)} min
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs mb-1">Total Attempts</p>
                    <p className="font-bold text-gray-900">{lesson.total_attempts}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}