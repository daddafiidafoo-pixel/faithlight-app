import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function GroupLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch top streaks from the Streak entity
    base44.entities.Streak.filter({ streakType: 'bible_reading' }, '-currentCount', 10)
      .then(data => {
        // Deduplicate by userEmail, keep highest streak per user
        const seen = new Set();
        const unique = (data || []).filter(s => {
          if (seen.has(s.userEmail)) return false;
          seen.add(s.userEmail);
          return true;
        }).slice(0, 5);
        setLeaders(unique);
      })
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-3" />
        {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse mb-2" />)}
      </div>
    );
  }

  if (!leaders.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-sm font-bold text-gray-800">Group Leaderboard</h3>
        </div>
        <p className="text-xs text-gray-400 text-center py-4">No streaks yet — start reading daily to appear here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-sm font-bold text-gray-800">Group Leaderboard</h3>
        </div>
        <Link to="/GroupReadingPlans" className="text-xs text-indigo-600 font-semibold hover:underline">View Groups →</Link>
      </div>

      <div className="space-y-2">
        {leaders.map((leader, idx) => {
          const name = leader.userEmail?.split('@')[0] || 'Reader';
          const streak = leader.currentCount || 0;
          const isTop = idx === 0;

          return (
            <div key={leader.id || idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${isTop ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
              <span className="text-base w-6 text-center flex-shrink-0">
                {MEDALS[idx] || `${idx + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isTop ? 'text-amber-800' : 'text-gray-800'}`}>
                  {name}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${isTop ? 'text-amber-600' : 'text-gray-600'}`}>
                <Flame size={14} className={isTop ? 'text-orange-500' : 'text-gray-400'} />
                <span>{streak}</span>
                <span className="text-xs font-normal text-gray-400">days</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}