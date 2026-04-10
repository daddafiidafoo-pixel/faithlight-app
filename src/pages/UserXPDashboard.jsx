import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader, Zap, Trophy, Flame, BookOpen, Heart, Target } from 'lucide-react';
import { getUserXP, BADGE_THRESHOLDS } from '../components/gamification/xpService';

const LEVEL_NAMES = ['Seeker', 'Learner', 'Student', 'Disciple', 'Scholar', 'Sage', 'Apostle', 'Prophet', 'Elder', 'Champion'];

export default function UserXPDashboard() {
  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState({ total_xp: 0, level: 1, streak: null });
  const [badges, setBadges] = useState([]);
  const [plans, setPlans] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { base44.auth.redirectToLogin(); return; }
        const me = await base44.auth.me();
        setUser(me);

        const [xp, badgesData, plansData, habitsData] = await Promise.all([
          getUserXP(me.id),
          base44.entities.UserBadge.filter({ user_id: me.id }, '-unlocked_date', 50),
          base44.entities.BibleStudyPlanSubscription.filter({ user_id: me.id }, '-created_date', 20),
          base44.entities.HabitGoal.filter({ user_id: me.id, is_active: true }, null, 20),
        ]);

        setXpData(xp);
        setBadges(badgesData || []);
        setPlans(plansData || []);
        setHabits(habitsData || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  const { total_xp, level, streak } = xpData;
  const xpForNextLevel = level * 200;
  const xpInCurrentLevel = total_xp - ((level - 1) * 200);
  const levelProgress = Math.min(Math.round((xpInCurrentLevel / 200) * 100), 100);
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];

  const allBadgeTypes = BADGE_THRESHOLDS.map(b => b.type);
  const earnedTypes = badges.map(b => b.badge_type);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-500 text-sm mt-1">Your spiritual growth journey</p>
      </div>

      {/* XP Card */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-sm">Level {level}</p>
              <h2 className="text-3xl font-bold">{levelName}</h2>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Total XP</p>
              <p className="text-3xl font-bold flex items-center gap-1">
                <Zap className="w-6 h-6 text-yellow-300" />{total_xp}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-indigo-200">
              <span>{xpInCurrentLevel} / 200 XP to Level {level + 1}</span>
              <span>{levelProgress}%</span>
            </div>
            <Progress value={levelProgress} className="h-3 bg-indigo-400" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{streak?.current_streak || 0}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{plans.filter(p => p.is_completed).length}</p>
            <p className="text-xs text-gray-500">Plans Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
            <p className="text-xs text-gray-500">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-yellow-500" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {BADGE_THRESHOLDS.map(badge => {
              const earned = earnedTypes.includes(badge.type);
              return (
                <div
                  key={badge.type}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    earned
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-100 bg-gray-50 opacity-40'
                  }`}
                >
                  <span className={`text-3xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
                  <span className="text-xs font-medium text-center text-gray-700 leading-tight">{badge.name}</span>
                  {!earned && (
                    <span className="text-xs text-gray-400">{badge.xp} XP</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* XP How-to */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> How to earn XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { icon: <BookOpen className="w-4 h-4 text-indigo-500" />, label: 'Complete a study day', xp: 15 },
              { icon: <Target className="w-4 h-4 text-green-500" />, label: 'Subscribe to a plan', xp: 10 },
              { icon: <Heart className="w-4 h-4 text-red-500" />, label: 'Complete a prayer request', xp: 20 },
              { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Complete a daily habit', xp: 10 },
              { icon: <Trophy className="w-4 h-4 text-yellow-500" />, label: 'Finish an entire plan', xp: 100 },
            ].map(({ icon, label, xp }) => (
              <div key={label} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {icon} {label}
                </div>
                <span className="text-sm font-bold text-indigo-600">+{xp} XP</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Plans */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Plan Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.map(plan => {
              const pct = plan.total_days > 0
                ? Math.round((plan.days_completed / plan.total_days) * 100)
                : 0;
              return (
                <div key={plan.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800 truncate">{plan.plan_title}</span>
                    <span className="text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-gray-400">{plan.days_completed} / {plan.total_days} days</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}