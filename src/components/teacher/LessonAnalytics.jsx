import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

export default function LessonAnalytics({ lesson, progress, quizAttempts }) {
  const studentsStarted = progress.filter(p => p.lesson_id === lesson.id).length;
  const studentsCompleted = progress.filter(p => p.lesson_id === lesson.id && p.completed).length;
  const completionRate = studentsStarted > 0 ? (studentsCompleted / studentsStarted) * 100 : 0;
  
  const avgTimeSpent = studentsStarted > 0
    ? progress
        .filter(p => p.lesson_id === lesson.id)
        .reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0) / studentsStarted / 60
    : 0;

  const lessonQuizAttempts = quizAttempts.filter(a => a.lesson_id === lesson.id);
  const avgQuizScore = lessonQuizAttempts.length > 0
    ? lessonQuizAttempts.reduce((acc, a) => acc + a.score, 0) / lessonQuizAttempts.length
    : 0;
  const passRate = lessonQuizAttempts.length > 0
    ? (lessonQuizAttempts.filter(a => a.passed).length / lessonQuizAttempts.length) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentsStarted}</p>
                <p className="text-xs text-gray-600">Students Engaged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgTimeSpent.toFixed(0)}</p>
                <p className="text-xs text-gray-600">Avg Minutes Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgQuizScore.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Avg Quiz Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Completion Rate</span>
              <span className="text-sm font-semibold">{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Quiz Pass Rate</span>
              <span className="text-sm font-semibold">{passRate.toFixed(0)}%</span>
            </div>
            <Progress value={passRate} className={passRate < 50 ? 'bg-red-100' : ''} />
          </div>

          <div className="pt-3 border-t">
            <p className="text-sm text-gray-700 mb-2">Performance Status</p>
            <div className="flex gap-2 flex-wrap">
              {completionRate >= 70 && (
                <Badge className="bg-green-100 text-green-800">High Completion</Badge>
              )}
              {completionRate < 50 && (
                <Badge className="bg-red-100 text-red-800">Low Completion</Badge>
              )}
              {avgQuizScore >= 80 && (
                <Badge className="bg-blue-100 text-blue-800">Strong Understanding</Badge>
              )}
              {avgQuizScore < 60 && (
                <Badge className="bg-orange-100 text-orange-800">Needs Review</Badge>
              )}
              {passRate < 50 && (
                <Badge className="bg-red-100 text-red-800 gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Low Pass Rate
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}