import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function QuizLeaderboard() {
  const [period, setPeriod] = useState('all');

  const { data: allAttempts = [], isLoading } = useQuery({
    queryKey: ['all-quiz-attempts'],
    queryFn: () => base44.entities.QuizAttempt.list('-score', 500).catch(() => []),
  });

  // Aggregate scores by user
  const aggregatedScores = allAttempts.reduce((acc, attempt) => {
    const key = attempt.user_id || 'unknown';
    if (!acc[key]) {
      acc[key] = { user_id: key, scores: [], count: 0, total: 0 };
    }
    acc[key].scores.push(attempt.score || 0);
    acc[key].count += 1;
    acc[key].total += (attempt.score || 0);
    return acc;
  }, {});

  const leaderboard = Object.values(aggregatedScores)
    .map(item => ({
      ...item,
      avgScore: Math.round(item.total / item.count),
      bestScore: Math.max(...item.scores),
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 20);

  const getMedalIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="font-bold text-gray-600">#{rank + 1}</span>;
  };

  const getMedalColor = (rank) => {
    if (rank === 0) return 'bg-amber-50 border-amber-200';
    if (rank === 1) return 'bg-gray-50 border-gray-200';
    if (rank === 2) return 'bg-orange-50 border-orange-200';
    return 'bg-white';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900">Quiz Leaderboard</h1>
        </div>
        <p className="text-gray-600">See how you stack up against other Bible quiz enthusiasts.</p>
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-600">No quiz scores yet. Start taking quizzes!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((user, idx) => (
            <Card key={user.user_id} className={`border ${getMedalColor(idx)}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-8 text-center">
                      {getMedalIcon(idx)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {user.user_id === localStorage.getItem('user_id') ? `You` : `User ${idx + 1}`}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{user.count} quizzes</Badge>
                        <Badge className="text-xs">{user.bestScore}% best</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{user.avgScore}%</p>
                    <p className="text-xs text-gray-600">avg score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Scores are calculated based on your average performance across all quizzes taken. The more quizzes you take, the higher your potential ranking!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}