import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Clock } from 'lucide-react';
import CourseTrackCard from './CourseTrackCard';

export default function TrackDisplay({
  track,
  courses,
  userProgress,
  enrolledCourses,
  coursePrerequisites,
  onEnroll,
  onContinue,
  onViewCertificate,
}) {
  if (!courses || courses.length === 0) {
    return null;
  }

  // Calculate track completion
  const requiredCourses = courses.filter((c) => c.isRequired);
  const completedRequired = requiredCourses.filter((c) => {
    const progress = userProgress?.find((p) => p.course_id === c.id);
    return progress?.status === 'completed';
  }).length;

  const trackCompletion = requiredCourses.length > 0
    ? Math.round((completedRequired / requiredCourses.length) * 100)
    : 0;

  const isTrackComplete = trackCompletion === 100;

  // Calculate total estimated time
  const totalMinutes = courses.reduce(
    (sum, c) => sum + (c.estimatedMinutes || 0),
    0
  );

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTrackTitle = () => {
    switch (track) {
      case 'foundation':
        return '📘 Foundations of Biblical Leadership';
      case 'leadership':
        return '🧭 Leadership & Ministry';
      case 'advanced':
        return '📖 Advanced Theological Studies';
      default:
        return 'Learning Track';
    }
  };

  const getTrackDescription = () => {
    switch (track) {
      case 'foundation':
        return 'Build a solid foundation in Biblical knowledge, Christian doctrine, and spiritual growth principles.';
      case 'leadership':
        return 'Develop leadership skills and practical ministry competencies for church and community impact.';
      case 'advanced':
        return 'Deepen theological understanding and prepare for advanced ministry roles.';
      default:
        return '';
    }
  };

  // Sorted courses by orderInTrack
  const sortedCourses = [...courses].sort(
    (a, b) => (a.orderInTrack || 999) - (b.orderInTrack || 999)
  );

  return (
    <div className="space-y-6">
      {/* Track Header */}
      <Card className={isTrackComplete ? 'border-green-300 bg-green-50' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{getTrackTitle()}</CardTitle>
              <p className="text-gray-600 mb-4">{getTrackDescription()}</p>

              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline">{courses.length} Courses</Badge>
                {totalMinutes > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(totalMinutes)}
                  </Badge>
                )}
              </div>
            </div>

            {isTrackComplete && (
              <Button
                onClick={() => onViewCertificate?.(track)}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Award className="w-4 h-4" />
                View Certificate
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Track Progress</span>
              <span className="font-bold text-lg text-indigo-600">{trackCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isTrackComplete ? 'bg-green-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${trackCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {completedRequired} of {requiredCourses.length} required courses completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-lg">Courses</h3>

        {sortedCourses.map((course) => {
          const isEnrolled = enrolledCourses?.includes(course.id);
          const progress = userProgress?.find((p) => p.course_id === course.id);

          // Check if prerequisites are met
          const prerequisites = coursePrerequisites?.[course.id] || [];
          const isLocked = prerequisites.length > 0
            ? prerequisites.some((prereq) => {
                const prereqProgress = userProgress?.find(
                  (p) => p.course_id === prereq.id
                );
                return !prereqProgress || prereqProgress.status !== 'completed';
              })
            : false;

          const missingPrerequisites = isLocked
            ? prerequisites.filter((prereq) => {
                const prereqProgress = userProgress?.find(
                  (p) => p.course_id === prereq.id
                );
                return !prereqProgress || prereqProgress.status !== 'completed';
              })
            : [];

          return (
            <CourseTrackCard
              key={course.id}
              course={course}
              isEnrolled={isEnrolled}
              userProgress={progress}
              isLocked={isLocked}
              missingPrerequisites={missingPrerequisites}
              onEnroll={onEnroll}
              onContinue={onContinue}
            />
          );
        })}
      </div>
    </div>
  );
}