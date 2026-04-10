import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Activity, TrendingDown, Clock } from 'lucide-react';

export default function LessonEngagementBreakdown({ courseId, lessonId }) {
  const { data: engagementData = [] } = useQuery({
    queryKey: ['lesson-engagement', courseId, lessonId],
    queryFn: async () => {
      if (!courseId || !lessonId) return [];
      return await base44.entities.LessonEngagementMetric.filter({
        course_id: courseId,
        lesson_id: lessonId,
      }, '-time_spent_seconds');
    },
  });

  // Calculate aggregated metrics
  const stats = React.useMemo(() => {
    if (engagementData.length === 0) return null;

    const avgTimeSpent = Math.round(
      engagementData.reduce((sum, d) => sum + (d.time_spent_seconds || 0), 0) / engagementData.length
    );

    const completionRate = Math.round(
      (engagementData.filter(d => d.completed).length / engagementData.length) * 100
    );

    const avgScrollDepth = Math.round(
      engagementData.reduce((sum, d) => sum + (d.scroll_depth_percent || 0), 0) / engagementData.length
    );

    const avgVideoWatch = Math.round(
      engagementData.reduce((sum, d) => sum + (d.video_watched_percent || 0), 0) / engagementData.length
    );

    const notesTaken = engagementData.filter(d => d.notes_taken).length;

    return {
      avgTimeSpent,
      completionRate,
      avgScrollDepth,
      avgVideoWatch,
      notesTaken,
      totalUsers: engagementData.length,
    };
  }, [engagementData]);

  // Time vs Completion correlation
  const scatterData = engagementData.map(d => ({
    timeSpent: Math.round(d.time_spent_seconds / 60),
    scrollDepth: d.scroll_depth_percent,
    completed: d.completed,
  }));

  // Users by engagement level
  const engagementLevels = React.useMemo(() => {
    const low = engagementData.filter(d => d.time_spent_seconds < 300).length;
    const medium = engagementData.filter(d => d.time_spent_seconds >= 300 && d.time_spent_seconds < 900).length;
    const high = engagementData.filter(d => d.time_spent_seconds >= 900).length;

    return [
      { level: 'Low (<5 min)', count: low },
      { level: 'Medium (5-15 min)', count: medium },
      { level: 'High (>15 min)', count: high },
    ];
  }, [engagementData]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center text-gray-600">
          No engagement data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Time Spent</p>
            <p className="text-3xl font-bold text-indigo-600">
              {Math.floor(stats.avgTimeSpent / 60)}m
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.avgTimeSpent % 60}s</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-3xl font-bold text-green-600">{stats.completionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">of {stats.totalUsers} users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Scroll Depth</p>
            <p className="text-3xl font-bold text-blue-600">{stats.avgScrollDepth}%</p>
            <p className="text-xs text-gray-500 mt-1">content viewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Notes Taken</p>
            <p className="text-3xl font-bold text-purple-600">{stats.notesTaken}</p>
            <p className="text-xs text-gray-500 mt-1">users took notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Engagement Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time vs Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Time Spent vs Content Depth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="timeSpent"
                name="Time (minutes)"
                unit=" min"
              />
              <YAxis
                type="number"
                dataKey="scrollDepth"
                name="Scroll Depth (%)"
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter
                name="Completed"
                data={scatterData.filter(d => d.completed)}
                fill="#10b981"
                fillOpacity={0.8}
              />
              <Scatter
                name="In Progress"
                data={scatterData.filter(d => !d.completed)}
                fill="#f59e0b"
                fillOpacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Engagement Alert */}
      {stats.completionRate < 50 && (
        <Card className="border-l-4 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-900">Low Completion Rate</p>
                <p className="text-sm text-red-800 mt-1">
                  Only {stats.completionRate}% of users completed this lesson. Consider reviewing content clarity or difficulty.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}