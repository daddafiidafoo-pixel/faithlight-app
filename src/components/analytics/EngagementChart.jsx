import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function EngagementChart({ moduleId, days = 30 }) {
  const { data: engagementData = [] } = useQuery({
    queryKey: ['engagement-analytics', moduleId, days],
    queryFn: async () => {
      const sessions = await base44.entities.LiveSession.list('-created_date', 1000);
      
      // Group by date for last 30 days
      const data = {};
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        data[dateStr] = { date: dateStr, active_users: 0, sessions: 0 };
      }

      sessions.forEach(session => {
        if (moduleId && session.group_id !== moduleId) return;
        const date = session.created_date.split('T')[0];
        if (data[date]) {
          data[date].sessions += 1;
          data[date].active_users = Math.min(data[date].sessions, session.current_participants || 1);
        }
      });

      return Object.values(data);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Engagement Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="active_users" stroke="#8b5cf6" name="Active Users" />
            <Line type="monotone" dataKey="sessions" stroke="#3b82f6" name="Sessions" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}