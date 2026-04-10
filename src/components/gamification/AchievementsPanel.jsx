import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, BookOpen, Flame, Target, Award, CheckCircle2, Lock, Zap, TrendingUp, Gift } from 'lucide-react';

// All badge definitions — milestones to earn
const BADGE_DEFS = [
  { id: 'first_plan', icon: '📖', label: 'First Steps', desc: 'Start your first reading plan', color: 'from-blue-400 to-blue-600', check: (s) => s.plans >= 1 },
  { id: 'plan_3', icon: '🏅', label: 'Plan Devotee', desc: 'Complete 3 reading plans', color: 'from-indigo-400 to-indigo-600', check: (s) => s.completedPlans >= 3 },
  { id: 'bookmarks_10', icon: '🔖', label: 'Verse Keeper', desc: 'Bookmark 10 verses', color: 'from-purple-400 to-purple-600', check: (s) => s.bookmarks >= 10 },
  { id: 'bookmarks_100', icon: '📚', label: '100 Verses', desc: 'Bookmark 100 verses', color: 'from-pink-400 to-pink-600', check: (s) => s.bookmarks >= 100 },
  { id: 'streak_7', icon: '🔥', label: 'Week Warrior', desc: '7-day reading streak', color: 'from-orange-400 to-red-500', check: (s) => s.streak >= 7 },
  { id: 'streak_30', icon: '⚡', label: 'Month Strong', desc: '30-day reading streak', color: 'from-yellow-400 to-orange-500', check: (s) => s.streak >= 30 },
  { id: 'quizzes_5', icon: '🧠', label: 'Quiz Master', desc: 'Complete 5 quizzes', color: 'from-green-400 to-teal-500', check: (s) => s.quizzes >= 5 },
  { id: 'quizzes_pass', icon: '🎯', label: 'Sharp Mind', desc: 'Pass 3 quizzes with 80%+', color: 'from-cyan-400 to-blue-500', check: (s) => s.quizzesPassed >= 3 },
  { id: 'groups_1', icon: '🤝', label: 'Community Heart', desc: 'Join a discussion group', color: 'from-teal-400 to-green-500', check: (s) => s.groups >= 1 },
  { id: 'notes_5', icon: '✍️', label: 'Thoughtful Scribe', desc: 'Create 5 verse notes', color: 'from-amber-400 to-orange-500', check: (s) => s.notes >= 5 },
  { id: 'readings_50', icon: '🌟', label: 'Faithful Reader', desc: 'Complete 50 plan readings', color: 'from-violet-400 to-purple-600', check: (s) => s.readings >= 50 },
  { id: 'plan_complete_1', icon: '🏆', label: 'Plan Champion', desc: 'Complete one full plan (100%)', color: 'from-yellow-400 to-yellow-600', check: (s) => s.completedPlans >= 1 },
];

// Compute what the user has earned from their stats
function computeEarnedBadges(stats) {
  return BADGE_DEFS.map(b => ({ ...b, earned: b.check(stats) }));
}

// Award a badge to the user if not already awarded
async function awardIfNew(userId, badgeId, badgeLabel, queryClient) {
  const existing = await base44.entities.UserBadge.filter({ user_id: userId, badge_id: badgeId }).catch(() => []);
  if (existing.length > 0) return;
  await base44.entities.UserBadge.create({
    user_id: userId,
    badge_id: badgeId,
    badge_name: badgeLabel,
    earned_at: new Date().toISOString()
  });
  queryClient.invalidateQueries(['userBadges', userId]);
}

// ── Badge Card ────────────────────────────────────────────────────────────────
function BadgeCard({ badge }) {
  return (
    <div className={`relative rounded-2xl p-4 text-center transition-all ${badge.earned ? '' : 'opacity-40 grayscale'}`}>
      {badge.earned && (
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${badge.color} opacity-10`} />
      )}
      <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-2 ${
        badge.earned ? `bg-gradient-to-br ${badge.color} shadow-md` : 'bg-gray-100'
      }`}>
        {badge.earned ? badge.icon : <Lock className="w-5 h-5 text-gray-400" />}
      </div>
      <p className={`text-xs font-bold mb-0.5 ${badge.earned ? 'text-gray-900' : 'text-gray-400'}`}>{badge.label}</p>
      <p className="text-xs text-gray-400 leading-tight">{badge.desc}</p>
      {badge.earned && (
        <div className="mt-1.5 flex justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        </div>
      )}
    </div>
  );
}

// Points per action
const POINTS_TABLE = [
  { label: 'Daily Reading', points: 10, statKey: 'readings', per: 1 },
  { label: 'Bookmark a Verse', points: 5, statKey: 'bookmarks', per: 1 },
  { label: 'Complete a Quiz', points: 15, statKey: 'quizzes', per: 1 },
  { label: 'Join a Group', points: 20, statKey: 'groups', per: 1 },
  { label: 'Write a Note', points: 8, statKey: 'notes', per: 1 },
];

function computePoints(stats) {
  return POINTS_TABLE.reduce((total, row) => {
    return total + (stats[row.statKey] || 0) * row.points;
  }, 0);
}

// Next milestone progress bars
function NextMilestones({ stats, badges }) {
  const locked = badges.filter(b => !b.earned);
  if (locked.length === 0) return null;

  // For each locked badge, compute progress %
  const withProgress = locked.slice(0, 3).map(badge => {
    let current = 0, target = 1, label = '';
    if (badge.id === 'bookmarks_10') { current = stats.bookmarks; target = 10; label = `${Math.max(0, 10 - stats.bookmarks)} more bookmarks`; }
    else if (badge.id === 'bookmarks_100') { current = stats.bookmarks; target = 100; label = `${Math.max(0, 100 - stats.bookmarks)} more bookmarks`; }
    else if (badge.id === 'streak_7') { current = stats.streak; target = 7; label = `${Math.max(0, 7 - stats.streak)} more days`; }
    else if (badge.id === 'streak_30') { current = stats.streak; target = 30; label = `${Math.max(0, 30 - stats.streak)} more days`; }
    else if (badge.id === 'quizzes_5') { current = stats.quizzes; target = 5; label = `${Math.max(0, 5 - stats.quizzes)} more quizzes`; }
    else if (badge.id === 'quizzes_pass') { current = stats.quizzesPassed; target = 3; label = `${Math.max(0, 3 - stats.quizzesPassed)} more 80%+ quizzes`; }
    else if (badge.id === 'plan_3') { current = stats.completedPlans; target = 3; label = `${Math.max(0, 3 - stats.completedPlans)} more plans`; }
    else if (badge.id === 'notes_5') { current = stats.notes; target = 5; label = `${Math.max(0, 5 - stats.notes)} more notes`; }
    else if (badge.id === 'readings_50') { current = stats.readings; target = 50; label = `${Math.max(0, 50 - stats.readings)} more readings`; }
    else if (badge.id === 'groups_1') { current = stats.groups; target = 1; label = 'Join a group'; }
    else if (badge.id === 'first_plan') { current = stats.plans; target = 1; label = 'Start a reading plan'; }
    else if (badge.id === 'plan_complete_1') { current = stats.completedPlans; target = 1; label = 'Complete a full plan'; }
    const pct = Math.min(100, Math.round((current / target) * 100));
    return { ...badge, current, target, pct, label };
  }).filter(b => b.pct < 100);

  if (withProgress.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
        <TrendingUp className="w-3.5 h-3.5" /> Progress Towards Next
      </p>
      {withProgress.map(b => (
        <div key={b.id} className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base">{b.icon}</span>
              <span className="text-sm font-medium text-gray-800">{b.label}</span>
            </div>
            <span className="text-xs font-bold text-indigo-600">{b.pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${b.pct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{b.label} to unlock <strong>{b.label}</strong></p>
        </div>
      ))}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function AchievementsPanel({ user }) {
  const queryClient = useQueryClient();

  const { data: savedVerses = [] } = useQuery({
    queryKey: ['saved-verses-count', user?.id],
    queryFn: () => base44.entities.SavedVerse.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: myPlans = [] } = useQuery({
    queryKey: ['reading-plans-ach', user?.id],
    queryFn: () => base44.entities.StudyPlan.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts-ach', user?.id],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: groupMems = [] } = useQuery({
    queryKey: ['group-mems-ach', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: verseNotes = [] } = useQuery({
    queryKey: ['verse-notes-ach', user?.id],
    queryFn: () => base44.entities.VerseNote.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  // Calculate total readings completed across all plans
  const totalReadings = myPlans.reduce((acc, plan) => {
    const progress = (() => { try { return JSON.parse(localStorage.getItem(`plan_progress_${plan.id}`) || '{}'); } catch { return {}; } })();
    return acc + Object.values(progress).filter(Boolean).length;
  }, 0);

  const completedPlans = myPlans.filter(plan => {
    const days = plan.days || [];
    const total = days.reduce((a, d) => a + (d.readings?.length || 0), 0);
    if (total === 0) return false;
    const progress = (() => { try { return JSON.parse(localStorage.getItem(`plan_progress_${plan.id}`) || '{}'); } catch { return {}; } })();
    const done = Object.values(progress).filter(Boolean).length;
    return done >= total;
  });

  const stats = {
    plans: myPlans.length,
    completedPlans: completedPlans.length,
    bookmarks: savedVerses.length,
    streak: user?.learning_streak || 0,
    quizzes: quizAttempts.length,
    quizzesPassed: quizAttempts.filter(a => a.score >= 80 && a.passed).length,
    groups: groupMems.length,
    notes: verseNotes.length,
    readings: totalReadings
  };

  const badges = computeEarnedBadges(stats);
  const earnedCount = badges.filter(b => b.earned).length;
  const totalPoints = computePoints(stats);

  // Auto-award earned badges
  useEffect(() => {
    if (!user) return;
    badges.filter(b => b.earned).forEach(b => {
      awardIfNew(user.id, b.id, b.label, queryClient);
    });
  }, [earnedCount, user?.id]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements & Points
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 border-0">
            {earnedCount}/{badges.length} earned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Points Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-medium">Total Points Earned</p>
              <p className="text-3xl font-bold">{totalPoints.toLocaleString()} <span className="text-lg text-indigo-200">pts</span></p>
            </div>
            <div className="text-right">
              <Zap className="w-8 h-8 text-yellow-300 mx-auto mb-1" />
              <p className="text-xs text-indigo-200">Level {Math.floor(totalPoints / 100) + 1}</p>
            </div>
          </div>
          {/* Mini points breakdown */}
          <div className="mt-3 flex flex-wrap gap-2">
            {POINTS_TABLE.filter(r => stats[r.statKey] > 0).map(r => (
              <span key={r.statKey} className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                {r.label}: +{stats[r.statKey] * r.points}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { icon: BookOpen, val: totalReadings, label: 'Readings', color: 'text-indigo-600' },
            { icon: Flame, val: stats.streak, label: 'Day Streak', color: 'text-orange-500' },
            { icon: Star, val: savedVerses.length, label: 'Bookmarks', color: 'text-purple-600' },
            { icon: Target, val: quizAttempts.length, label: 'Quizzes', color: 'text-green-600' },
          ].map(({ icon: Icon, val, label, color }) => (
            <div key={label} className="text-center p-2 rounded-xl bg-gray-50">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className={`text-lg font-bold ${color}`}>{val}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Badges grid */}
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1">
          <Award className="w-3.5 h-3.5" /> Badges & Milestones
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {badges.map(b => <BadgeCard key={b.id} badge={b} />)}
        </div>

        {/* Progress towards next badges */}
        <NextMilestones stats={stats} badges={badges} />

        {/* Points perks hint */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-bold text-amber-800">Points Unlock</p>
          </div>
          <div className="space-y-1 text-xs text-amber-700">
            <p>• 50 pts — Unlock custom profile badge 🎖️</p>
            <p>• 200 pts — Premium AI study content access ✨</p>
            <p>• 500 pts — Exclusive devotional themes 🌟</p>
          </div>
        </div>

        {earnedCount > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-sm font-semibold text-yellow-800">
              {earnedCount === badges.length ? '🎉 All achievements unlocked!' : `Keep going! ${badges.length - earnedCount} more to unlock.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}