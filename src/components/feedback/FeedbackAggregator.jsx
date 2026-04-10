import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function FeedbackAggregator() {
  const { data: allFeedback = [] } = useQuery({
    queryKey: ['all-training-feedback'],
    queryFn: () => base44.entities.TrainingFeedback.list('-created_date'),
  });

  // Calculate metrics
  const feedbackByType = {};
  const feedbackByPriority = {};
  const feedbackByStatus = {};
  let criticalCount = 0;
  const recentFeedback = [];

  allFeedback.forEach((f) => {
    feedbackByType[f.feedback_type] = (feedbackByType[f.feedback_type] || 0) + 1;
    feedbackByPriority[f.priority] = (feedbackByPriority[f.priority] || 0) + 1;
    feedbackByStatus[f.status] = (feedbackByStatus[f.status] || 0) + 1;
    if (f.priority === 'critical') criticalCount++;
  });

  const typeChartData = Object.entries(feedbackByType).map(([type, count]) => ({
    name: type.replace('_', ' '),
    value: count,
  }));

  const priorityChartData = Object.entries(feedbackByPriority).map(([priority, count]) => ({
    name: priority,
    count,
  }));

  const statusChartData = Object.entries(feedbackByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    count,
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const topIssues = allFeedback
    .filter(f => f.priority === 'high' || f.priority === 'critical')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Feedback</p>
            <p className="text-3xl font-bold text-indigo-600">{allFeedback.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Critical Issues</p>
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Open Feedback</p>
            <p className="text-3xl font-bold text-blue-600">
              {feedbackByStatus['open'] || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600">
              {feedbackByStatus['resolved'] || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Issues */}
      {topIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Critical & High Priority Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIssues.map((issue) => (
                <div key={issue.id} className="p-3 border rounded bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{issue.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{issue.description.substring(0, 80)}...</p>
                    </div>
                    <Badge className={issue.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}>
                      {issue.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}