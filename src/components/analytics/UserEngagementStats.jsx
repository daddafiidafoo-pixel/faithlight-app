import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

export default function UserEngagementStats() {
  const { data: stats = {} } = useQuery({
    queryKey: ['engagement-stats'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      const progress = await base44.entities.UserTrainingProgress.list();
      const points = await base44.entities.UserPoints.list();
      const sessions = await base44.entities.LiveSession.list();

      const activeUsers = users.filter(u => {
        const userProgress = progress.filter(p => p.user_id === u.id);
        return userProgress.length > 0;
      }).length;

      const totalEnrollments = progress.length;
      const completedLessons = progress.filter(p => p.status === 'completed').length;
      const avgPointsPerUser = points.length > 0
        ? Math.round(points.reduce((sum, p) => sum + p.total_points, 0) / points.length)
        : 0;

      return {
        total_users: users.length,
        active_users: activeUsers,
        engagement_rate: Math.round((activeUsers / users.length) * 100),
        total_enrollments: totalEnrollments,
        completed_lessons: completedLessons,
        completion_rate: totalEnrollments > 0 ? Math.round((completedLessons / totalEnrollments) * 100) : 0,
        avg_points_per_user: avgPointsPerUser,
        live_sessions: sessions.length,
      };
    },
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.active_users || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.engagement_rate || 0}% engaged</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_enrollments || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Lesson Completion</p>
              <p className="text-2xl font-bold text-green-600">{stats.completion_rate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">{stats.completed_lessons || 0} completed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg Points/User</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avg_points_per_user || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}