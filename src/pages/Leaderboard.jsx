import React, { useState, useEffect, useCallback } from 'react';
import PullToRefresh from '@/components/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { getQuizAttempts } from '@/lib/quizzes';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // For now, just show the current user's stats
      const attempts = getQuizAttempts(u.email);
      const totalPoints = attempts.reduce((sum, a) => sum + a.score * 10, 0);
      const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

      setLeaderboard([
        {
          rank: 1,
          name: u.full_name || 'You',
          points: totalPoints,
          level: Math.floor(totalPoints / 100) + 1,
          streak: 7,
          avgScore,
        },
      ]);
    });
  }, []);

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <PullToRefresh onRefresh={() => {}}>
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="w-8 h-8" />
          Leaderboard
        </h1>
        <p className="text-yellow-100">Track your progress and compete</p>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Complete some quizzes to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <div key={idx} className="card p-6 rounded-xl flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                  {idx === 0 && <Trophy className="w-6 h-6 text-yellow-600" />}
                  {idx === 1 && <Medal className="w-6 h-6 text-slate-400" />}
                  {idx === 2 && <Medal className="w-6 h-6 text-orange-600" />}
                  {idx > 2 && <span className="font-bold text-slate-600">#{entry.rank}</span>}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{entry.name}</h3>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>Level {entry.level}</span>
                    <span>{entry.avgScore}% avg</span>
                    <span>{entry.streak} day streak</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{entry.points}</div>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}