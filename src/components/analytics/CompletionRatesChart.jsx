import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CompletionRatesChart({ moduleId }) {
  const { data: completionData = [] } = useQuery({
    queryKey: ['completion-rates', moduleId],
    queryFn: async () => {
      const courses = await base44.entities.TrainingCourse.list();
      const progress = await base44.entities.UserTrainingProgress.list();

      return courses.map(course => {
        const courseProgress = progress.filter(p => p.course_id === course.id);
        const completed = courseProgress.filter(p => p.status === 'completed').length;
        const total = courseProgress.length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          name: course.title.substring(0, 20),
          completion_rate: Math.round(completionRate),
          enrolled: total,
          completed: completed,
        };
      }).slice(0, 10);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Completion Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completion_rate" fill="#10b981" name="Completion %" />
            <Bar dataKey="enrolled" fill="#6366f1" name="Enrolled" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}