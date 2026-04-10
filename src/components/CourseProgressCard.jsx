import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Award } from 'lucide-react';

export default function CourseProgressCard({ course, lessons, progress, quizAttempts }) {
  const courseLessons = lessons.filter(l => l.course_id === course.id);
  const completedLessons = progress.filter(p => 
    courseLessons.some(l => l.id === p.lesson_id) && p.completed
  );
  
  const totalTimeSpent = progress
    .filter(p => courseLessons.some(l => l.id === p.lesson_id))
    .reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
  
  const courseQuizzes = quizAttempts.filter(qa => 
    courseLessons.some(l => l.id === qa.lesson_id)
  );
  
  const avgScore = courseQuizzes.length > 0
    ? Math.round(courseQuizzes.reduce((sum, qa) => sum + qa.score, 0) / courseQuizzes.length)
    : 0;
  
  const progressPercent = courseLessons.length > 0 
    ? Math.round((completedLessons.length / courseLessons.length) * 100)
    : 0;
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{course.difficulty}</Badge>
              <Badge className="bg-indigo-100 text-indigo-800">
                {completedLessons.length}/{courseLessons.length} Lessons
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold text-indigo-600">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold">{formatTime(totalTimeSpent)}</div>
              <div className="text-xs text-gray-600">Time Spent</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold">{avgScore}%</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}