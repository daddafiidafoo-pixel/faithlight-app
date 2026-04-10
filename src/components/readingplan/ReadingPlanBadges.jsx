import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, BookOpen, Star, CheckCircle2, Zap, Heart, Crown } from 'lucide-react';

const BADGE_DEFINITIONS = [
  {
    id: 'first_day',
    label: 'First Step',
    description: 'Complete your first reading day',
    emoji: '🌱',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    check: (progress) => Object.values(progress).some(p => (p.completed || []).length >= 1),
  },
  {
    id: 'streak_3',
    label: '3-Day Warrior',
    description: 'Complete 3 days in any plan',
    emoji: '🔥',
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    check: (progress) => Object.values(progress).some(p => (p.completed || []).length >= 3),
  },
  {
    id: 'streak_7',
    label: 'Week Champion',
    description: 'Complete a full 7-day plan',
    emoji: '⚡',
    color: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    check: (progress) => Object.values(progress).some(p => (p.completed || []).length >= 7),
  },
  {
    id: 'plan_complete',
    label: 'Plan Master',
    description: 'Fully complete any reading plan',
    emoji: '🏆',
    color: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    check: (progress, plans) => {
      return plans.some(plan => {
        const p = progress[plan.id];
        return p && (p.completed || []).length >= plan.days.length;
      });
    },
  },
  {
    id: 'multi_plan',
    label: 'Seeker',
    description: 'Start 2 different reading plans',
    emoji: '📚',
    color: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    check: (progress) => Object.keys(progress).length >= 2,
  },
  {
    id: 'all_plans',
    label: 'Scripture Scholar',
    description: 'Complete all 4 reading plans',
    emoji: '👑',
    color: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    check: (progress, plans) => {
      return plans.every(plan => {
        const p = progress[plan.id];
        return p && (p.completed || []).length >= plan.days.length;
      });
    },
  },
  {
    id: 'anxiety_complete',
    label: 'Peace Finder',
    description: 'Complete the Overcoming Anxiety plan',
    emoji: '🕊️',
    color: 'from-sky-400 to-indigo-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    check: (progress, plans) => {
      const plan = plans.find(p => p.id === 'overcoming_anxiety');
      if (!plan) return false;
      const p = progress[plan.id];
      return p && (p.completed || []).length >= plan.days.length;
    },
  },
  {
    id: 'strength_complete',
    label: 'Mighty in Faith',
    description: 'Complete the Finding Strength plan',
    emoji: '💪',
    color: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    check: (progress, plans) => {
      const plan = plans.find(p => p.id === 'strength');
      if (!plan) return false;
      const p = progress[plan.id];
      return p && (p.completed || []).length >= plan.days.length;
    },
  },
];

export function getBadgesUnlocked(progress, plans) {
  return BADGE_DEFINITIONS.filter(b => b.check(progress, plans));
}

export function BadgeCard({ badge, unlocked, small = false }) {
  return (
    <motion.div
      initial={unlocked ? { scale: 0.8, opacity: 0 } : {}}
      animate={unlocked ? { scale: 1, opacity: 1 } : {}}
      className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
        unlocked
          ? `${badge.bg} ${badge.border}`
          : 'bg-gray-50 border-gray-200 opacity-40 grayscale'
      } ${small ? 'w-20' : 'w-full'}`}
    >
      <div className={`${small ? 'w-10 h-10 text-2xl' : 'w-14 h-14 text-3xl'} rounded-full flex items-center justify-center bg-gradient-to-br ${unlocked ? badge.color : 'from-gray-300 to-gray-400'} shadow-md mb-2`}>
        <span>{badge.emoji}</span>
      </div>
      <p className={`font-bold text-center leading-tight ${small ? 'text-xs' : 'text-sm'} ${unlocked ? badge.text : 'text-gray-400'}`}>{badge.label}</p>
      {!small && <p className={`text-xs text-center mt-0.5 ${unlocked ? badge.text + ' opacity-75' : 'text-gray-400'}`}>{badge.description}</p>}
      {unlocked && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </motion.div>
  );
}

export default function ReadingPlanBadges({ progress, plans }) {
  const unlocked = getBadgesUnlocked(progress, plans);
  const total = BADGE_DEFINITIONS.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Badges & Achievements
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{unlocked.length} of {total} unlocked</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-amber-700">{unlocked.length}/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(unlocked.length / total) * 100}%` }}
          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGE_DEFINITIONS.map(badge => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            unlocked={unlocked.some(b => b.id === badge.id)}
          />
        ))}
      </div>

      {unlocked.length === 0 && (
        <div className="mt-4 text-center py-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Start a reading plan to earn your first badge!</p>
        </div>
      )}
    </div>
  );
}

export { BADGE_DEFINITIONS };