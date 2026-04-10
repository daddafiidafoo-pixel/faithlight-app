import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import ProgressBar from '../course/ProgressBar';

export default function LearningPathProgressTracker({
  path,
  userProgress,
  courses = [],
  completedCourses = [],
  currentCourseIndex = null
}) {
  if (!userProgress) {
    return null;
  }

  const progressPercent = userProgress.progress_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg">Path Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">Overall Completion</span>
              <span className="text-2xl font-bold text-indigo-600">{Math.round(progressPercent)}%</span>
            </div>
            <ProgressBar percentage={progressPercent} height="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedCourses.length}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{courses.length - completedCourses.length}</p>
              <p className="text-xs text-gray-600">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{courses.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Sequence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Sequence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses.map((course, index) => {
              const isCompleted = completedCourses.some(c => c.id === course.course_id);
              const isCurrent = index === currentCourseIndex;
              const isLocked = index > (currentCourseIndex || 0) && !isCompleted;

              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isCurrent
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                      : isLocked
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Circle className={`w-6 h-6 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                          {index + 1}. {course.course_title}
                        </h4>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-indigo-100 text-indigo-800 text-xs">Current</Badge>
                        )}
                        {isLocked && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">Locked</Badge>
                        )}
                      </div>

                      {!isLocked && (
                        <p className="text-sm text-gray-600">
                          {course.is_required ? 'Required' : 'Optional'} course
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}