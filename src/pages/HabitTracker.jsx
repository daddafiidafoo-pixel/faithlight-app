import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '../components/I18nProvider';
import { Plus, Check, Trash2, Loader } from 'lucide-react';
import HabitCalendar from '../components/habits/HabitCalendar.jsx';
import HabitForm from '../components/habits/HabitForm.jsx';

export default function HabitTracker() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          base44.auth.redirectToLogin();
          return;
        }
        const me = await base44.auth.me();
        setUser(me);
        loadGoals(me.id);
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initUser();
  }, []);

  const loadGoals = async (userId) => {
    try {
      const data = await base44.entities.HabitGoal.filter({ user_id: userId, is_active: true }, '-created_date', 100);
      setGoals(data || []);
      
      const comps = await base44.entities.HabitCompletion.filter({ user_id: userId }, '-completion_date', 500);
      setCompletions(comps || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (goalData) => {
    try {
      const newGoal = await base44.entities.HabitGoal.create({
        user_id: user.id,
        ...goalData,
        created_date: new Date().toISOString(),
      });
      setGoals([...goals, newGoal]);
      setShowForm(false);
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create goal');
    }
  };

  const handleCompleteGoal = async (goalId) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const existing = completions.find(c => c.goal_id === goalId && c.completion_date === today);
      if (existing) return;

      const goal = goals.find(g => g.id === goalId);
      const completion = await base44.entities.HabitCompletion.create({
        user_id: user.id,
        goal_id: goalId,
        completion_date: today,
        value_completed: goal.target_value,
      });
      setCompletions([...completions, completion]);
    } catch (err) {
      console.error('Complete error:', err);
      alert('Failed to mark as complete');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await base44.entities.HabitGoal.update(goalId, { is_active: false });
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[var(--faith-light-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[var(--faith-light-primary-dark)] mb-2">
            {t('habit.title', 'Spiritual Habits')}
          </h1>
          <p className="text-gray-600">{t('habit.subtitle', 'Track your daily spiritual growth')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[var(--faith-light-primary)] gap-2">
          <Plus className="w-4 h-4" />
          {t('habit.addgoal', 'Add Goal')}
        </Button>
      </div>

      {showForm && (
        <HabitForm
          onSubmit={handleAddGoal}
          onCancel={() => setShowForm(false)}
          lang={lang}
        />
      )}

      {goals.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center text-gray-500">
            {t('habit.nogoals', 'No goals yet. Create one to get started!')}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="calendar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">{t('habit.calendar', 'Heat Map')}</TabsTrigger>
            <TabsTrigger value="list">{t('habit.list', 'Goals')}</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {goals.map(goal => (
              <HabitCalendar
                key={goal.id}
                goal={goal}
                completions={completions.filter(c => c.goal_id === goal.id)}
                onComplete={() => handleCompleteGoal(goal.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {goals.map(goal => {
              const today = new Date().toISOString().split('T')[0];
              const completedToday = completions.some(c => c.goal_id === goal.id && c.completion_date === today);
              const streak = calculateStreak(goal.id, completions);

              return (
                <Card key={goal.id}>
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>{goal.goal_name}</CardTitle>
                      <p className="text-sm text-gray-600">{goal.target_value} {goal.target_unit}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('habit.streak', 'Streak')}: <span className="font-bold">{streak}</span> {t('habit.days', 'days')}
                      </span>
                      <Button
                        onClick={() => handleCompleteGoal(goal.id)}
                        disabled={completedToday}
                        className={completedToday ? 'bg-green-600' : ''}
                      >
                        <Check className="w-4 h-4" />
                        {completedToday ? t('habit.done', 'Done Today') : t('habit.complete', 'Mark Complete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function calculateStreak(goalId, completions) {
  const goalCompletions = completions.filter(c => c.goal_id === goalId);
  if (goalCompletions.length === 0) return 0;

  let streak = 0;
  let current = new Date();

  while (true) {
    const dateStr = current.toISOString().split('T')[0];
    const exists = goalCompletions.some(c => c.completion_date === dateStr);
    if (!exists) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}