import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, BookOpen, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function CourseAnalyticsDashboard({ courseId, onSelectStudent }) {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateCourseAnalytics', {
        course_id: courseId,
      });
      return response.data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-600">
          No analytics available yet
        </CardContent>
      </Card>
    );
  }

  const { summary, lesson_statistics, student_analytics, struggling_students, at_risk_students } = analytics;

  const enrollmentData = [
    { name: 'Completed', value: summary.completed, color: '#10b981' },
    { name: 'In Progress', value: summary.in_progress, color: '#4f46e5' },
    { name: 'Not Started', value: summary.not_started, color: '#d1d5db' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-indigo-600">{summary.total_enrolled}</div>
            <p className="text-sm text-gray-600 mt-1">Total Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{summary.completion_rate}%</div>
            <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{summary.avg_progress}%</div>
            <p className="text-sm text-gray-600 mt-1">Avg Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{summary.avg_time_spent_minutes}m</div>
            <p className="text-sm text-gray-600 mt-1">Avg Time Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lesson Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lesson Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={lesson_statistics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="lesson_title"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion_rate" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students Alert */}
      {(struggling_students.length > 0 || at_risk_students.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg">Students Needing Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {struggling_students.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-900 mb-2">
                  🔴 Struggling ({struggling_students.length})
                </h4>
                <div className="space-y-2">
                  {struggling_students.slice(0, 5).map((student) => (
                    <StudentProgressItem
                      key={student.user_id}
                      student={student}
                      onSelect={onSelectStudent}
                      severity="critical"
                    />
                  ))}
                </div>
              </div>
            )}

            {at_risk_students.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">
                  🟡 At Risk ({at_risk_students.length})
                </h4>
                <div className="space-y-2">
                  {at_risk_students.slice(0, 5).map((student) => (
                    <StudentProgressItem
                      key={student.user_id}
                      student={student}
                      onSelect={onSelectStudent}
                      severity="warning"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Students Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Students Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {student_analytics.map((student) => (
              <StudentProgressItem
                key={student.user_id}
                student={student}
                onSelect={onSelectStudent}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentProgressItem({ student, onSelect, severity }) {
  const getStatusColor = (progress) => {
    if (progress >= 100) return 'bg-green-100 text-green-800';
    if (progress >= 60) return 'bg-blue-100 text-blue-800';
    if (progress >= 30) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div
      onClick={() => onSelect(student.user_id)}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">Student #{student.user_id.slice(0, 8)}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${student.progress_percentage}%` }}
            />
          </div>
          <Badge className={getStatusColor(student.progress_percentage)}>
            {student.progress_percentage}%
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {student.lessons_completed}/{student.total_lessons} lessons • {student.total_time_minutes}min
        </p>
      </div>
    </div>
  );
}