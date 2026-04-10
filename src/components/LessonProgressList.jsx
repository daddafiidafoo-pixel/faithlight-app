import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function LessonProgressList({ lessons, progress, quizAttempts }) {
  const recentProgress = progress
    .filter(p => p.completed)
    .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))
    .slice(0, 10);
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return '<1m';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Lessons
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentProgress.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No lessons completed yet. Start learning!</p>
        ) : (
          <div className="space-y-3">
            {recentProgress.map((prog) => {
              const lesson = lessons.find(l => l.id === prog.lesson_id);
              const quizAttempt = quizAttempts
                .filter(qa => qa.lesson_id === prog.lesson_id)
                .sort((a, b) => new Date(b.attempt_date) - new Date(a.attempt_date))[0];
              
              return lesson ? (
                <Link 
                  key={prog.id} 
                  to={createPageUrl(`LessonView?id=${lesson.id}`)}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lesson.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-600">
                            {new Date(prog.completed_date).toLocaleDateString()}
                          </p>
                          {prog.time_spent_seconds > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="w-3 h-3" />
                              {formatTime(prog.time_spent_seconds)}
                            </span>
                          )}
                          {quizAttempt && (
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <Award className="w-3 h-3" />
                              {Math.round(quizAttempt.score)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 ml-2">Completed</Badge>
                  </div>
                </Link>
              ) : null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}