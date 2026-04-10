import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function QuizPerformanceChart({ moduleId }) {
  const { data: performanceData = [] } = useQuery({
    queryKey: ['quiz-performance', moduleId],
    queryFn: async () => {
      const quizzes = await base44.entities.TrainingQuiz.list();
      const results = await base44.entities.UserQuizResult.list();

      return quizzes.map(quiz => {
        const quizResults = results.filter(r => r.quiz_id === quiz.id);
        const avgScore = quizResults.length > 0
          ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
          : 0;
        const passRate = quizResults.length > 0
          ? Math.round((quizResults.filter(r => r.passed).length / quizResults.length) * 100)
          : 0;

        return {
          name: quiz.title.substring(0, 20),
          avg_score: avgScore,
          pass_rate: passRate,
          attempts: quizResults.length,
        };
      }).slice(0, 10);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="avg_score" fill="#f59e0b" name="Avg Score" />
            <Area type="monotone" dataKey="pass_rate" fill="#06b6d4" name="Pass Rate %" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}