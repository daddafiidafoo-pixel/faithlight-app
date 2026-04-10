import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Zap } from 'lucide-react';
import TrackDisplay from '@/components/training/TrackDisplay';
import CertificatePreviewModal from '@/components/training/CertificatePreviewModal';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';

export default function TrainingPathDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [certificateTrack, setCertificateTrack] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch all courses grouped by track
  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ['training-courses'],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter(
        { is_published: true },
        null,
        200
      );
      const grouped = {
        foundation: courses?.filter((c) => c.trackLevel === 'foundation') || [],
        leadership: courses?.filter((c) => c.trackLevel === 'leadership') || [],
        advanced: courses?.filter((c) => c.trackLevel === 'advanced') || [],
      };
      return grouped;
    },
  });

  // Fetch user progress, badges, and points
  const { data: progressData } = useQuery({
    queryKey: ['user-course-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return { progress: [], enrollments: [], badges: [], points: null };
      try {
        const [progress, enrollments, badges, points] = await Promise.all([
          base44.entities.UserCourseProgress.filter({ user_id: user.id }, null, 200).catch(() => []),
          base44.entities.CourseEnrollment.filter({ user_id: user.id }, null, 200).catch(() => []),
          base44.entities.UserBadge.filter({ user_id: user.id }, '-earned_at', 100).catch(() => []),
          base44.entities.UserPoints.filter({ user_id: user.id }, null, 1).catch(() => []),
        ]);
        return {
          progress: progress || [],
          enrollments: enrollments || [],
          badges: badges || [],
          points: points?.[0],
        };
      } catch (error) {
        console.error('Error fetching progress data:', error);
        return { progress: [], enrollments: [], badges: [], points: null };
      }
    },
    enabled: !!user?.id,
  });

  // Enroll in course
  const enrollMutation = useMutation({
    mutationFn: async (courseId) => {
      const course = Object.values(courseData || {})
        .flat()
        .find((c) => c.id === courseId);

      if (!course) throw new Error('Course not found');

      // Create enrollment
      await base44.entities.CourseEnrollment.create({
        user_id: user.id,
        course_id: courseId,
        enrolled_date: new Date().toISOString(),
      });

      // Create progress record
      return await base44.entities.UserCourseProgress.create({
        user_id: user.id,
        course_id: courseId,
        status: 'not_started',
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-course-progress', user?.id]);
    },
  });

  // Continue course
  const continueMutation = useMutation({
    mutationFn: async (courseId) => {
      window.location.href = `/LessonView?course_id=${courseId}`;
    },
  });

  const handleEnroll = (courseId) => {
    enrollMutation.mutate(courseId);
  };

  const handleContinue = (courseId) => {
    continueMutation.mutate(courseId);
  };

  const handleViewCertificate = (track) => {
    setCertificateTrack(track);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const enrolledCourseIds = progressData?.enrollments?.map((e) => e.course_id) || [];

  // Build prerequisite map
  const coursePrerequisites = {};
  if (courseData) {
    Object.values(courseData)
      .flat()
      .forEach((course) => {
        if (course.prerequisiteCourseIds?.length > 0) {
          coursePrerequisites[course.id] = Object.values(courseData)
            .flat()
            .filter((c) => course.prerequisiteCourseIds.includes(c.id));
        }
      });
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            FaithLight Training Path
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A structured journey through Biblical leadership and Christian ministry education. Progress through three tiers of training at your own pace.
          </p>
        </div>

        {/* Stats Bar */}
        {progressData?.points && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Your Points</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {progressData.points.total_points || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Courses</p>
                    <p className="text-xl font-bold text-green-600">
                      {progressData.points.courses_completed || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Tracks</p>
                    <p className="text-xl font-bold text-purple-600">
                      {progressData.points.tracks_completed || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Badges</p>
                    <p className="text-xl font-bold text-amber-600">
                      {progressData.points.badges_earned || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earned Badges Section */}
        {progressData?.badges && progressData.badges.length > 0 && (
          <BadgeDisplay badges={progressData.badges} maxDisplay={12} />
        )}

        {/* Loading State */}
        {coursesLoading ? (
          <Card>
            <CardContent className="py-12 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading training programs...</span>
            </CardContent>
          </Card>
        ) : (
          /* Tracks */
          <div className="space-y-12">
            {/* Foundation Track */}
            {courseData?.foundation && courseData.foundation.length > 0 && (
              <TrackDisplay
                track="foundation"
                courses={courseData.foundation}
                userProgress={progressData?.progress}
                enrolledCourses={enrolledCourseIds}
                coursePrerequisites={coursePrerequisites}
                onEnroll={handleEnroll}
                onContinue={handleContinue}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {/* Leadership Track */}
            {courseData?.leadership && courseData.leadership.length > 0 && (
              <div className="pt-8 border-t-2 border-gray-300">
                <TrackDisplay
                  track="leadership"
                  courses={courseData.leadership}
                  userProgress={progressData?.progress}
                  enrolledCourses={enrolledCourseIds}
                  coursePrerequisites={coursePrerequisites}
                  onEnroll={handleEnroll}
                  onContinue={handleContinue}
                  onViewCertificate={handleViewCertificate}
                />
              </div>
            )}

            {/* Advanced Track */}
            {courseData?.advanced && courseData.advanced.length > 0 && (
              <div className="pt-8 border-t-2 border-gray-300">
                <TrackDisplay
                  track="advanced"
                  courses={courseData.advanced}
                  userProgress={progressData?.progress}
                  enrolledCourses={enrolledCourseIds}
                  coursePrerequisites={coursePrerequisites}
                  onEnroll={handleEnroll}
                  onContinue={handleContinue}
                  onViewCertificate={handleViewCertificate}
                />
              </div>
            )}

            {/* Empty State */}
            {(!courseData?.foundation?.length &&
              !courseData?.leadership?.length &&
              !courseData?.advanced?.length) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">No training programs available yet</p>
                  <Button onClick={() => window.location.href = '/ExploreCourses'}>
                    Browse All Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {certificateTrack && (
        <CertificatePreviewModal
          track={certificateTrack}
          studentName={user.full_name || 'Student'}
          completionDate={new Date().toISOString()}
          onClose={() => setCertificateTrack(null)}
          onDownload={() => {
            // TODO: Implement PDF download
            console.log('Download certificate for', certificateTrack);
          }}
          onShare={() => {
            // TODO: Implement share functionality
            console.log('Share certificate for', certificateTrack);
          }}
        />
      )}
    </div>
  );
}