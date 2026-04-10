import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Clock, BookOpen, ChevronDown } from 'lucide-react';

export default function CourseTrackCard({
  course,
  isEnrolled,
  userProgress,
  isLocked,
  missingPrerequisites,
  onEnroll,
  onContinue,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getButtonText = () => {
    if (isLocked) return 'Locked';
    if (!isEnrolled) return 'Enroll';
    if (!userProgress) return 'Start';
    if (userProgress.status === 'completed') return 'Review';
    return 'Continue';
  };

  const getButtonVariant = () => {
    if (isLocked) return 'outline';
    if (userProgress?.status === 'completed') return 'outline';
    return 'default';
  };

  const handleButtonClick = () => {
    if (isLocked) return;
    if (!isEnrolled) {
      onEnroll?.(course.id);
    } else {
      onContinue?.(course.id);
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const progressPercent = userProgress?.progress_percentage || 0;

  return (
    <Card className={`hover:shadow-md transition-all ${isLocked ? 'opacity-60' : ''}`}>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
              {course.isRequired && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
              {!course.isRequired && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Optional
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
          {course.estimatedMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(course.estimatedMinutes)}
            </div>
          )}
          {course.instructor_name && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.instructor_name}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-700">Progress</span>
              <span className="text-xs text-gray-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleButtonClick}
            variant={getButtonVariant()}
            disabled={isLocked}
            className="flex-1"
          >
            {getButtonText()}
          </Button>

          {!isLocked && isEnrolled && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && isEnrolled && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs text-gray-600">
              <strong>Status:</strong> {userProgress?.status || 'Not started'}
            </p>
            {userProgress?.completed_at && (
              <p className="text-xs text-gray-600">
                <strong>Completed:</strong>{' '}
                {new Date(userProgress.completed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Locked Prerequisite Info */}
        {isLocked && missingPrerequisites && missingPrerequisites.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Complete these first:
            </p>
            <ul className="space-y-1">
              {missingPrerequisites.map((prereq) => (
                <li key={prereq.id} className="text-xs text-gray-600">
                  • {prereq.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}