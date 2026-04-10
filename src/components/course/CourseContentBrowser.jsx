import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Loader2, AlertCircle, BookOpen, Lock } from 'lucide-react';
import LessonMaterialPanel from './LessonMaterialPanel';

export default function CourseContentBrowser({ courseId, enrollmentStatus = 'enrolled' }) {
  const [expandedLessons, setExpandedLessons] = useState({});
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const isEnrolled = enrollmentStatus === 'enrolled';

  // Fetch course info
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }, null, 1),
    select: (data) => data[0],
  });

  // Fetch lessons for course
  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      const result = await base44.entities.Lesson.filter(
        { course_id: courseId, status: 'approved' },
        'order_index',
        100
      );
      return result;
    },
    enabled: isEnrolled,
  });

  // Fetch user progress for lessons
  const { data: userProgress } = useQuery({
    queryKey: ['user-lesson-progress', courseId],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      const progress = await base44.entities.UserLessonProgress.filter(
        { user_id: currentUser.id, course_id: courseId },
        null,
        100
      );
      return progress;
    },
    enabled: isEnrolled,
  });

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  if (!isEnrolled) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">
            Enroll in this course to access materials
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Loading course content...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-800">Failed to load course content</span>
        </CardContent>
      </Card>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No lessons available in this course yet</p>
        </CardContent>
      </Card>
    );
  }

  // Build progress map for quick lookup
  const progressMap = {};
  userProgress?.forEach((p) => {
    progressMap[p.lesson_id] = p;
  });

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const progress = progressMap[lesson.id];
        const isExpanded = expandedLessons[lesson.id];
        const isSelected = selectedLessonId === lesson.id;
        const progressPercentage = progress?.progress_percentage || 0;
        const isCompleted = progress?.status === 'completed';

        return (
          <div key={lesson.id}>
            <button
              onClick={() => {
                toggleLesson(lesson.id);
                setSelectedLessonId(lesson.id);
              }}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLesson(lesson.id);
                  }}
                  className="mt-1 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {lesson.title}
                    </h3>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    )}
                  </div>

                  {lesson.objectives && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                      {lesson.objectives}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(progressPercentage)}% complete
                  </p>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-2 ml-8 space-y-3">
                {/* Lesson Preview */}
                {lesson.content && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Lesson Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {lesson.content}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Scripture References */}
                {lesson.scripture_references && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Scripture References</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        {lesson.scripture_references}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Materials */}
                <LessonMaterialPanel lessonId={lesson.id} courseId={courseId} />

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedLessonId(lesson.id)}
                  >
                    View Lesson
                  </Button>
                  {!isCompleted && (
                    <Button size="sm" className="flex-1">
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}