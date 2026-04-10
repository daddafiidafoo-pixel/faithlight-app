import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GOAL_TYPES = [
  { value: 'memorization', label: 'Memorization' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'reflection', label: 'Reflection' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'application', label: 'Application' },
];

export default function DailyGoalsPanel({ studyPlanId, dayIndex, userId }) {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [newGoalType, setNewGoalType] = useState('understanding');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, [studyPlanId, dayIndex]);

  const fetchGoals = async () => {
    try {
      const dayGoals = await base44.entities.DailyStudyGoal.filter({
        study_plan_id: studyPlanId,
        day_index: dayIndex,
        user_id: userId,
      });
      setGoals(dayGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    try {
      const createdGoal = await base44.entities.DailyStudyGoal.create({
        user_id: userId,
        study_plan_id: studyPlanId,
        day_index: dayIndex,
        goal_text: newGoal,
        goal_type: newGoalType,
      });
      setGoals([...goals, createdGoal]);
      setNewGoal('');
      setNewGoalType('understanding');
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const toggleGoal = async (goalId, completed) => {
    try {
      await base44.entities.DailyStudyGoal.update(goalId, {
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      });
      setGoals(goals.map(g => g.id === goalId ? { ...g, completed: !completed } : g));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await base44.entities.DailyStudyGoal.delete(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const completionPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Goals</span>
          {goals.length > 0 && (
            <span className="text-sm font-normal text-gray-600">
              {completedCount}/{goals.length} ({completionPercent}%)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Progress */}
        {goals.length > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading goals...</p>
          ) : goals.length > 0 ? (
            goals.map(goal => (
              <div key={goal.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Checkbox
                  checked={goal.completed}
                  onCheckedChange={() => toggleGoal(goal.id, goal.completed)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {goal.goal_text}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">{goal.goal_type}</p>
                </div>
                <Button
                  onClick={() => deleteGoal(goal.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No goals set yet</p>
          )}
        </div>

        {/* Add New Goal */}
        <div className="space-y-2 pt-3 border-t">
          <div className="flex gap-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a goal for today..."
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <Select value={newGoalType} onValueChange={setNewGoalType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map(gt => (
                  <SelectItem key={gt.value} value={gt.value}>
                    {gt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={addGoal}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}