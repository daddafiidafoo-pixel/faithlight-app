import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Award, Clock } from 'lucide-react';

export default function CourseProgressCard({ course, lessons = [], progress = [], quizResults = [] }) {
  const completedLessons = progress.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  const hasPassedQuiz = quizResults.some(r => r.passed);
  const bestScore = quizResults.length > 0 
    ? Math.max(...quizResults.map(r => r.score)) 
    : 0;
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
  
  const isComplete = completedLessons === totalLessons && hasPassedQuiz;

  return (
    <Card className={isComplete ? 'border-green-500 bg-green-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {course.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Lessons Progress</span>
            <span className="font-semibold">{completedLessons}/{totalLessons}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">{Math.round(progressPercent)}% complete</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <p className="text-xl font-bold">{completedLessons}</p>
          </div>

          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Best Score</span>
            </div>
            <p className="text-xl font-bold">{Math.round(bestScore)}%</p>
          </div>

          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Time</span>
            </div>
            <p className="text-xl font-bold">{totalTimeSpent}m</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isComplete ? (
            <Badge className="bg-green-600 w-full justify-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Course Completed
            </Badge>
          ) : hasPassedQuiz ? (
            <Badge className="bg-blue-600 w-full justify-center">
              Quiz Passed - {completedLessons}/{totalLessons} Lessons
            </Badge>
          ) : (
            <Badge variant="outline" className="w-full justify-center">
              In Progress - {completedLessons}/{totalLessons} Lessons
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}