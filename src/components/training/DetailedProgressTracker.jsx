import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Award, TrendingUp, Clock, Target } from 'lucide-react';

export default function DetailedProgressTracker({ 
  lessons = [], 
  progress = [], 
  quizResults = [],
  course 
}) {
  const getLessonProgress = (lessonId) => {
    return progress.find(p => p.lesson_id === lessonId);
  };

  const completedLessons = progress.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
  const avgTimePerLesson = completedLessons > 0 ? Math.round(totalTimeSpent / completedLessons) : 0;
  
  const sortedQuizResults = [...quizResults].sort((a, b) => b.score - a.score);
  const bestQuizScore = sortedQuizResults[0]?.score || 0;
  const hasPassedQuiz = quizResults.some(r => r.passed);
  const quizAttempts = quizResults.length;

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <p className="text-2xl font-bold">{completedLessons}/{totalLessons}</p>
              <p className="text-xs text-gray-500">lessons</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Best Score</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(bestQuizScore)}%</p>
              <p className="text-xs text-gray-500">{quizAttempts} attempts</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total Time</span>
              </div>
              <p className="text-2xl font-bold">{totalTimeSpent}m</p>
              <p className="text-xs text-gray-500">avg {avgTimePerLesson}m/lesson</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Pass Score</span>
              </div>
              <p className="text-2xl font-bold">{course?.pass_score}%</p>
              <p className="text-xs text-gray-500">required</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {hasPassedQuiz && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Quiz Passed with {Math.round(bestQuizScore)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Lesson Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson-by-Lesson Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const lessonProgress = getLessonProgress(lesson.id);
              const isCompleted = lessonProgress?.completed;
              const timeSpent = lessonProgress?.time_spent_minutes || 0;

              return (
                <div 
                  key={lesson.id} 
                  className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{lesson.title}</h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant={isCompleted ? "default" : "outline"} className="text-xs">
                          {isCompleted ? 'Completed' : 'Not Started'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Est. {lesson.estimated_minutes} min
                        </span>
                        {timeSpent > 0 && (
                          <span className="text-xs text-gray-600 font-medium">
                            Spent: {timeSpent} min
                          </span>
                        )}
                      </div>
                      {lessonProgress?.completed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed: {new Date(lessonProgress.completed_at).toLocaleDateString()}
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

      {/* Quiz Performance */}
      {quizResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Quiz Performance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedQuizResults.map((result, index) => (
                <div 
                  key={result.id} 
                  className={`border rounded-lg p-3 ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Attempt {result.attempt_number || index + 1}</span>
                        <Badge className={result.passed ? 'bg-green-600' : 'bg-red-600'}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(result.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(result.score)}%</p>
                      <p className="text-xs text-gray-600">
                        {course?.pass_score}% to pass
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}