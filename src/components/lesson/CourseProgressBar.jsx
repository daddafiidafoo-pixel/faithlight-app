import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award } from 'lucide-react';

export default function CourseProgressBar({ courseId, userId }) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['course-progress', courseId, userId],
    queryFn: async () => {
      const progressData = await base44.entities.UserCourseProgress.filter(
        { user_id: userId, course_id: courseId },
        '-created_date',
        1
      );
      return progressData[0] || null;
    },
    enabled: !!courseId && !!userId,
  });

  if (isLoading || !progress) {
    return null;
  }

  const progressPercent = progress.progress_percentage || 0;

  const milestones = [
    { percent: 25, label: '25%', icon: '🌱' },
    { percent: 50, label: '50%', icon: '🌿' },
    { percent: 75, label: '75%', icon: '🌳' },
    { percent: 100, label: 'Complete!', icon: '🏆' },
  ];

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Overall Course Progress</h3>
          </div>
          <span className="text-2xl font-bold text-green-600">{Math.round(progressPercent)}%</span>
        </div>

        {/* Main Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {progress.lessons_completed || 0} of {progress.total_lessons || 0} lessons completed
          </p>
        </div>

        {/* Milestone Markers */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-semibold">Milestones</p>
          <div className="grid grid-cols-4 gap-2">
            {milestones.map((milestone) => {
              const isReached = progressPercent >= milestone.percent;
              return (
                <div
                  key={milestone.percent}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isReached
                      ? 'bg-white border border-green-300 shadow-sm'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{milestone.icon}</span>
                  <p className={`text-xs font-semibold mt-1 ${
                    isReached ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {milestone.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        {progressPercent === 100 ? (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-green-900">
              🎉 Course Complete!
            </p>
          </div>
        ) : (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">{100 - Math.round(progressPercent)}%</span> remaining to complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}