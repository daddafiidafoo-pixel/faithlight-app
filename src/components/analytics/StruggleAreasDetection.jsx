import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export default function StruggleAreasDetection() {
  const { data: strugglingAreas = [] } = useQuery({
    queryKey: ['struggle-areas'],
    queryFn: async () => {
      const quizzes = await base44.entities.TrainingQuiz.list();
      const results = await base44.entities.UserQuizResult.list();
      const questions = await base44.entities.TrainingQuizQuestion.list();

      const areaMetrics = {};

      quizzes.forEach(quiz => {
        const quizResults = results.filter(r => r.quiz_id === quiz.id);
        if (quizResults.length === 0) return;

        const avgScore = Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length);
        const passRate = Math.round((quizResults.filter(r => r.passed).length / quizResults.length) * 100);
        
        if (avgScore < 70 || passRate < 60) {
          areaMetrics[quiz.title] = {
            title: quiz.title,
            avg_score: avgScore,
            pass_rate: passRate,
            attempts: quizResults.length,
            difficulty: 'high',
            risk_level: avgScore < 50 ? 'critical' : 'warning',
          };
        }
      });

      return Object.values(areaMetrics)
        .sort((a, b) => a.avg_score - b.avg_score)
        .slice(0, 8);
    },
  });

  const getRiskColor = (level) => {
    return level === 'critical' ? 'bg-red-100 border-red-300' : 'bg-yellow-100 border-yellow-300';
  };

  const getRiskBadge = (level) => {
    return level === 'critical' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  if (strugglingAreas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            Struggle Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 py-8">✓ All areas performing well!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Areas Requiring Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {strugglingAreas.map((area, idx) => (
          <Alert key={idx} className={`border-2 ${getRiskColor(area.risk_level)}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{area.title}</p>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span>Avg Score: <strong className="text-red-600">{area.avg_score}%</strong></span>
                    <span>Pass Rate: <strong className="text-red-600">{area.pass_rate}%</strong></span>
                    <span className="text-gray-600">{area.attempts} attempts</span>
                  </div>
                </div>
                <Badge className={getRiskBadge(area.risk_level)}>
                  {area.risk_level === 'critical' ? 'CRITICAL' : 'WARNING'}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}