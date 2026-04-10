import React, { useEffect, useState } from 'react';
import { Flame, Zap, Trophy } from 'lucide-react';
import { getPrayerStreak, getMilestones, getNextMilestone } from '@/lib/prayerStreakService';

export default function PrayerStreakDisplay({ userEmail, uiLang }) {
  const [streak, setStreak] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(null);

  useEffect(() => {
    if (userEmail) {
      const data = getPrayerStreak(userEmail);
      setStreak(data.streak);
      setNextMilestone(getNextMilestone(data.streak));
    }
  }, [userEmail]);

  if (!userEmail || streak === 0) return null;

  const milestones = getMilestones(streak);
  const isMilestone = milestones.length > 0 && milestones[milestones.length - 1] === streak;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
      <Flame size={16} className="text-orange-500 animate-pulse" />
      <span className="font-bold text-sm text-orange-600">{streak}</span>
      {isMilestone && <Trophy size={14} className="text-yellow-500" />}
      {nextMilestone && (
        <span className="text-xs text-orange-400">{nextMilestone > 1000 ? '∞' : `→${nextMilestone}`}</span>
      )}
    </div>
  );
}