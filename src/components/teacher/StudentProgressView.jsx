import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function StudentProgressView({ courseId }) {
  // Fetch enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      const result = await base44.entities.CourseEnrollment.filter(
        { course_id: courseId },
        '-created_date',
        100
      );
      return result;
    },
  });

  // Fetch progress for all students
  const { data: progressMap, isLoading: progressLoading } = useQuery({
    queryKey: ['student-progress', courseId, enrollments],
    queryFn: async () => {
      if (!enrollments?.length) return {};

      const map = {};
      await Promise.all(
        enrollments.map(async (enrollment) => {
          const progress = await base44.entities.UserCourseProgress.filter(
            { user_id: enrollment.user_id, course_id: courseId },
            null,
            1
          );
          if (progress.length > 0) {
            map[enrollment.user_id] = progress[0];
          }
        })
      );
      return map;
    },
    enabled: !!enrollments?.length,
  });

  // Fetch user details
  const { data: userMap } = useQuery({
    queryKey: ['student-details', enrollments],
    queryFn: async () => {
      if (!enrollments?.length) return {};

      const map = {};
      const uniqueUserIds = [...new Set(enrollments.map((e) => e.user_id))];

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const users = await base44.entities.User.filter({ id: userId }, null, 1);
          if (users.length > 0) {
            map[userId] = users[0];
          }
        })
      );
      return map;
    },
    enabled: !!enrollments?.length,
  });

  const isLoading = enrollmentsLoading || progressLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Loading student progress...</span>
        </CardContent>
      </Card>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6 text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No students enrolled yet</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const completedCount = enrollments.filter(
    (e) => progressMap[e.user_id]?.status === 'completed'
  ).length;
  const averageProgress =
    enrollments.reduce((sum, e) => sum + (progressMap[e.user_id]?.progress_percentage || 0), 0) /
    enrollments.length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
              <p className="text-xs text-gray-600 mt-1">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-gray-600 mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{Math.round(averageProgress)}%</p>
              <p className="text-xs text-gray-600 mt-1">Avg Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const progress = progressMap[enrollment.user_id];
              const user = userMap?.[enrollment.user_id];
              const progressPercentage = progress?.progress_percentage || 0;

              return (
                <div key={enrollment.id} className="p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {user?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Badge
                      variant={
                        progress?.status === 'completed'
                          ? 'default'
                          : progress?.status === 'in_progress'
                            ? 'outline'
                            : 'secondary'
                      }
                    >
                      {progress?.status || 'not_started'}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Engagement Info */}
                  {progress?.last_accessed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last accessed:{' '}
                      {new Date(progress.last_accessed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}