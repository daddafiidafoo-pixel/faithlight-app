import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MentorshipProgressTracker({ connection, isMentor }) {
  const queryClient = useQueryClient();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '' });

  const { data: goals = [] } = useQuery({
    queryKey: ['mentorship-goals', connection.id],
    queryFn: () => base44.entities.MentorshipGoal.filter({ connection_id: connection.id }, '-created_date', 50),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['mentorship-sessions', connection.id],
    queryFn: () => base44.entities.MentorshipSession.filter({ connection_id: connection.id }, '-session_date', 50),
  });

  const addGoalMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MentorshipGoal.create({
        connection_id: connection.id,
        ...newGoal,
      });
    },
    onSuccess: () => {
      toast.success('Goal added!');
      queryClient.invalidateQueries(['mentorship-goals']);
      setShowAddGoal(false);
      setNewGoal({ title: '', description: '', target_date: '' });
    },
  });

  const completeGoalMutation = useMutation({
    mutationFn: async (goalId) => {
      return base44.entities.MentorshipGoal.update(goalId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Goal completed! 🎉');
      queryClient.invalidateQueries(['mentorship-goals']);
    },
  });

  const activeGoals = goals.filter(g => g.status === 'in_progress');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals ({activeGoals.length} active)
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddGoal(!showAddGoal)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddGoal && (
            <div className="p-4 border rounded-lg space-y-3 bg-blue-50">
              <Input
                placeholder="Goal title..."
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Goal description..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="h-20"
              />
              <Input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => addGoalMutation.mutate()}
                  disabled={!newGoal.title.trim() || addGoalMutation.isPending}
                  size="sm"
                >
                  {addGoalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {activeGoals.length === 0 && !showAddGoal ? (
            <p className="text-center text-gray-500 py-4">No active goals yet</p>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeGoalMutation.mutate(goal.id)}
                      className="gap-1 shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </Button>
                  </div>
                  {goal.target_date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Completed Goals ({completedGoals.length})
              </h4>
              <div className="space-y-2">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{goal.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No sessions recorded yet</p>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {format(new Date(session.session_date), 'MMM d, yyyy')}
                    </span>
                    {session.duration_minutes && (
                      <Badge variant="outline">{session.duration_minutes} min</Badge>
                    )}
                  </div>
                  {session.topics_discussed && (
                    <p className="text-sm text-gray-600">{session.topics_discussed}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}