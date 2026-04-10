import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, BookOpen, Star, Zap, CheckCircle, Clock, ChevronRight, Target } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

const WEEKLY_CHALLENGES = [
  {
    id: 'week_reader',
    title: 'Week of Scripture',
    description: 'Read at least 5 chapters this week',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    bonus: 50,
    type: 'weekly',
    target: 5,
    metric: 'chapters_read_this_week',
  },
  {
    id: 'week_streak',
    title: 'Unbroken Faith',
    description: 'Maintain a 7-day reading streak',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    bg: 'from-orange-50 to-red-50',
    border: 'border-orange-200',
    bonus: 75,
    type: 'weekly',
    target: 7,
    metric: 'current_streak',
  },
  {
    id: 'week_quiz',
    title: 'Quiz Master',
    description: 'Answer 3 daily challenges correctly',
    icon: Zap,
    color: 'from-amber-500 to-yellow-500',
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    bonus: 40,
    type: 'weekly',
    target: 3,
    metric: 'quiz_correct_this_week',
  },
];

const MONTHLY_CHALLENGES = [
  {
    id: 'month_marathon',
    title: 'Scripture Marathon',
    description: 'Read 50+ chapters this month',
    icon: Trophy,
    color: 'from-purple-500 to-pink-600',
    bg: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    bonus: 300,
    type: 'monthly',
    target: 50,
    metric: 'chapters_read_this_month',
  },
  {
    id: 'month_points',
    title: 'Points Champion',
    description: 'Earn 500+ points this month',
    icon: Star,
    color: 'from-green-500 to-emerald-600',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    bonus: 200,
    type: 'monthly',
    target: 500,
    metric: 'points_this_month',
  },
];

function ChallengeCard({ challenge, userPoints, userStreak, userId, onClaim }) {
  const Icon = challenge.icon;

  let current = 0;
  if (challenge.metric === 'current_streak') current = userStreak?.current_streak || 0;
  else if (userPoints) current = userPoints[challenge.metric] || 0;

  const progress = Math.min(Math.round((current / challenge.target) * 100), 100);
  const completed = current >= challenge.target;
  const claimedKey = `challenge_claimed_${userId}_${challenge.id}_${challenge.type === 'weekly' ? format(startOfWeek(new Date()), 'yyyy-ww') : format(new Date(), 'yyyy-MM')}`;
  const alreadyClaimed = !!localStorage.getItem(claimedKey);

  const daysLeft = challenge.type === 'weekly'
    ? differenceInDays(endOfWeek(new Date()), new Date())
    : differenceInDays(endOfMonth(new Date()), new Date());

  return (
    <div className={`rounded-2xl border p-4 bg-gradient-to-br ${challenge.bg} ${challenge.border} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${challenge.color} shadow-sm`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{challenge.title}</p>
            <p className="text-xs text-gray-500">{challenge.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-bold">
            +{challenge.bonus} pts
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{current} / {challenge.target}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {daysLeft}d left
          </span>
        </div>
        <div className="w-full bg-white/70 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full bg-gradient-to-r ${challenge.color} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {completed && !alreadyClaimed && (
        <Button
          size="sm"
          onClick={() => onClaim(challenge, claimedKey)}
          className={`w-full text-xs h-8 bg-gradient-to-r ${challenge.color} text-white border-0 hover:opacity-90 gap-1 mt-1`}
        >
          <Trophy className="w-3.5 h-3.5" /> Claim Bonus!
        </Button>
      )}
      {alreadyClaimed && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 font-semibold mt-1 bg-green-100 rounded-lg py-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Claimed!
        </div>
      )}
    </div>
  );
}

export default function WeeklyChallenges({ userId }) {
  const [tab, setTab] = useState('weekly');
  const queryClient = useQueryClient();

  const { data: userPoints = null } = useQuery({
    queryKey: ['user-points-challenges', userId],
    queryFn: async () => {
      const res = await base44.entities.UserPoints.filter({ user_id: userId }, '-updated_date', 3).catch(() => []);
      return res[0] || null;
    },
    enabled: !!userId,
    retry: false,
  });

  const { data: userStreak = null } = useQuery({
    queryKey: ['user-streak-challenges', userId],
    queryFn: async () => {
      const res = await base44.entities.UserStreak.filter({ user_id: userId }, '-updated_date', 3).catch(() => []);
      return res[0] || null;
    },
    enabled: !!userId,
    retry: false,
  });

  const handleClaim = async (challenge, claimedKey) => {
    if (!userPoints) return;
    await base44.entities.UserPoints.update(userPoints.id, {
      total_points: (userPoints.total_points || 0) + challenge.bonus,
    });
    localStorage.setItem(claimedKey, '1');
    queryClient.invalidateQueries({ queryKey: ['user-points-challenges'] });
    queryClient.invalidateQueries({ queryKey: ['user-points'] });
    toast.success(`🎉 +${challenge.bonus} bonus points claimed!`);
  };

  const challenges = tab === 'weekly' ? WEEKLY_CHALLENGES : MONTHLY_CHALLENGES;

  return (
    <Card className="border-indigo-100">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Challenges</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
            {['weekly', 'monthly'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${tab === t ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {challenges.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              userPoints={userPoints}
              userStreak={userStreak}
              userId={userId}
              onClaim={handleClaim}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}