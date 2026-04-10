import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PathProgressTracker({ path, lessons, onComplete }) {
  const completedCount = path.lessons.filter(l => l.is_completed).length;
  const totalCount = path.lessons.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const currentLesson = path.lessons.find(l => !l.is_completed);
  const currentLessonData = currentLesson ? lessons.find(l => l.id === currentLesson.lesson_id) : null;

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{path.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{path.description}</p>
          </div>
          <Badge variant={path.difficulty_level === 'advanced' ? 'destructive' : path.difficulty_level === 'intermediate' ? 'default' : 'secondary'}>
            {path.difficulty_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold">{completedCount} / {totalCount} lessons</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Estimated Time</p>
              <p className="text-sm font-semibold">{path.estimated_duration_days} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Interests</p>
              <p className="text-sm font-semibold">{path.interests_matched?.length || 0} matched</p>
            </div>
          </div>
        </div>

        {/* Current Lesson */}
        {currentLessonData && (
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="text-xs text-indigo-600 font-semibold mb-2">📚 UP NEXT</p>
            <h4 className="font-semibold text-gray-900 mb-2">{currentLessonData.title}</h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{currentLessonData.description}</p>
            <Link to={createPageUrl(`LessonView?id=${currentLessonData.id}`)}>
              <Button className="w-full gap-2">
                Continue Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Lesson List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Learning Sequence</h4>
          <div className="space-y-2">
            {path.lessons.map((pathLesson, idx) => {
              const lessonData = lessons.find(l => l.id === pathLesson.lesson_id);
              if (!lessonData) return null;

              return (
                <div
                  key={pathLesson.lesson_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    pathLesson.is_completed
                      ? 'bg-green-50 border-green-200'
                      : idx === path.current_lesson_index
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {pathLesson.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {idx + 1}. {lessonData.title}
                    </p>
                    {pathLesson.completed_at && (
                      <p className="text-xs text-gray-500">
                        Completed {new Date(pathLesson.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {!pathLesson.is_completed && idx === path.current_lesson_index && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Reasoning */}
        {path.ai_reasoning && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-xs text-purple-600 font-semibold mb-1">🤖 AI RECOMMENDATION</p>
            <p className="text-sm text-gray-700">{path.ai_reasoning}</p>
          </div>
        )}

        {/* Completion Message */}
        {completedCount === totalCount && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-900">Path Completed! 🎉</p>
            <p className="text-sm text-gray-600 mt-1">You've finished all lessons in this path</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}