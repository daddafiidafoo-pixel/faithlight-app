import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { createPageUrl } from '../utils';

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setUser(currentUser);
      } catch {
        window.location.href = createPageUrl('Home');
      }
    };
    fetchUser();
  }, []);

  const { data: snapshots, isLoading, error } = useQuery({
    queryKey: ['analytics', timeframe],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.AnalyticsSnapshot.filter(
        { snapshot_type: timeframe },
        '-snapshot_date',
        30
      );
      return result || [];
    },
    enabled: !!user
  });

  const latestSnapshot = snapshots?.[0];

  // Prepare chart data (last 7 snapshots)
  const chartData = (snapshots || []).slice(0, 7).reverse().map(s => ({
    date: new Date(s.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: s.active_users,
    engagement: s.engagement_rate,
    posts: s.total_posts,
    groups: s.active_groups
  }));

  // Action breakdown
  const actionData = latestSnapshot?.top_actions
    ? Object.entries(latestSnapshot.top_actions).map(([action, count]) => ({
      name: action,
      value: count
    }))
    : [];

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

  const handleExportCSV = () => {
    if (!snapshots) return;

    const headers = ['Date', 'Active Users', 'Engagement Rate (%)', 'Total Posts', 'Active Groups', 'Total Events'];
    const rows = snapshots.map(s => [
      new Date(s.snapshot_date).toLocaleDateString(),
      s.active_users,
      s.engagement_rate,
      s.total_posts,
      s.active_groups,
      s.total_live_events
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!snapshots) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Analytics Report', 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

    // Stats
    if (latestSnapshot) {
      doc.setFontSize(12);
      doc.text('Latest Metrics', 20, 45);

      doc.setFontSize(10);
      let yPos = 55;
      const stats = [
        `Active Users: ${latestSnapshot.active_users}`,
        `Total Users: ${latestSnapshot.total_users}`,
        `Engagement Rate: ${latestSnapshot.engagement_rate}%`,
        `Active Groups: ${latestSnapshot.active_groups}`,
        `Total Posts: ${latestSnapshot.total_posts}`,
        `Live Events: ${latestSnapshot.total_live_events}`
      ];

      stats.forEach(stat => {
        doc.text(stat, 20, yPos);
        yPos += 8;
      });
    }

    doc.addPage();
    doc.setFontSize(12);
    doc.text('Historical Data', 20, 20);

    doc.setFontSize(10);
    const headers = ['Date', 'Active Users', 'Engagement', 'Posts', 'Groups'];
    const rows = snapshots.map(s => [
      new Date(s.snapshot_date).toLocaleDateString(),
      s.active_users.toString(),
      s.engagement_rate.toString(),
      s.total_posts.toString(),
      s.active_groups.toString()
    ]);

    let yPos = 35;
    headers.forEach((header, i) => {
      doc.text(header, 20 + i * 35, yPos);
    });

    yPos += 8;
    rows.slice(0, 20).forEach(row => {
      row.forEach((cell, i) => {
        doc.text(cell, 20 + i * 35, yPos);
      });
      yPos += 8;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track app usage, user activity, and engagement</p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="max-w-xs">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">Error loading analytics</p>
            <p className="text-red-700 text-sm">Please try again later</p>
          </div>
        </div>
      )}

      {!isLoading && !error && latestSnapshot && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Active Users"
              value={latestSnapshot.active_users}
              icon="👥"
            />
            <MetricCard
              label="Engagement Rate"
              value={`${latestSnapshot.engagement_rate}%`}
              icon="📈"
            />
            <MetricCard
              label="Total Posts"
              value={latestSnapshot.total_posts}
              icon="💬"
            />
            <MetricCard
              label="Active Groups"
              value={latestSnapshot.active_groups}
              icon="👫"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Users Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users Trend</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Engagement Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Rate</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Activity Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Type</h3>
              {actionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={actionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {actionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No activity data</p>
              )}
            </div>

            {/* Posts & Groups */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts & Groups Activity</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="posts" fill="#10B981" />
                    <Bar dataKey="groups" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Top Active Entities */}
          {latestSnapshot.most_active_entities && latestSnapshot.most_active_entities.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Content</h3>
              <div className="space-y-3">
                {latestSnapshot.most_active_entities.slice(0, 10).map((entity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entity.entity_type}</p>
                      <p className="text-sm text-gray-600">{entity.entity_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">{entity.activity_count}</p>
                      <p className="text-xs text-gray-600">activities</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}