import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Target, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProgressBar from '../course/ProgressBar';

export default function LearningPathCard({ 
  path, 
  userProgress, 
  courseCount = 0,
  onEnroll,
  isEnrolled = false 
}) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      {path.cover_image_url && (
        <div className="h-48 overflow-hidden rounded-t-lg">
          <img
            src={path.cover_image_url}
            alt={path.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl">{path.title}</CardTitle>
          <Badge className={difficultyColors[path.difficulty]}>
            {path.difficulty}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {path.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Path Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{courseCount} courses</span>
          </div>
          {path.estimated_hours && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{path.estimated_hours}h total</span>
            </div>
          )}
        </div>

        {/* Learning Objectives Preview */}
        {path.learning_objectives && path.learning_objectives.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" />
              You'll learn:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              {path.learning_objectives.slice(0, 2).map((obj, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
              {path.learning_objectives.length > 2 && (
                <li className="text-indigo-600 text-xs font-medium">
                  +{path.learning_objectives.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Progress Display */}
        {isEnrolled && userProgress && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-indigo-600">
                {Math.round(userProgress.progress_percentage)}%
              </span>
            </div>
            <ProgressBar percentage={userProgress.progress_percentage || 0} height="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {userProgress.courses_completed || 0} of {userProgress.total_courses || courseCount} courses completed
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isEnrolled ? (
            <Link to={createPageUrl(`LearningPathDetail?id=${path.id}`)}>
              <Button className="w-full gap-2" variant="default">
                <CheckCircle2 className="w-4 h-4" />
                Continue Path
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full"
              onClick={() => onEnroll?.(path.id)}
              variant="outline"
            >
              Enroll in Path
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}