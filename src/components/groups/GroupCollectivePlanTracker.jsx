import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Plus, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function PlanProgressBar({ value, className = '' }) {
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export default function GroupCollectivePlanTracker({ groupId, user, isAdmin, members = [] }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planDays, setPlanDays] = useState('21');
  const [creating, setCreating] = useState(false);

  // Fetch collaborative study plans for this group
  const { data: groupPlans = [], isLoading } = useQuery({
    queryKey: ['group-plans', groupId],
    queryFn: () => base44.entities.StudyPlan.filter({ group_id: groupId }, '-updated_date', 20).then(r => r.filter(p => p.is_collaborative)).catch(() => []),
    enabled: !!groupId, retry: false,
  });

  // Fetch all user progresses for group members
  const memberIds = members.map(m => m.user_id);

  const createPlan = async () => {
    if (!planTitle.trim()) return;
    setCreating(true);
    try {
      await base44.entities.StudyPlan.create({
        user_id: user.id,
        group_id: groupId,
        title: planTitle,
        description: planDesc,
        duration_days: parseInt(planDays),
        status: 'active',
        is_collaborative: true,
        collaborators: memberIds,
        progress_percentage: 0,
        created_by: user.id,
      });
      queryClient.invalidateQueries(['group-plans', groupId]);
      toast.success('Collaborative study plan created!');
      setShowCreate(false);
      setPlanTitle('');
      setPlanDesc('');
    } catch {
      toast.error('Failed to create plan');
    }
    setCreating(false);
  };

  const joinPlan = useMutation({
    mutationFn: async (planId) => {
      // Add user as collaborator by updating plan
      const plan = groupPlans.find(p => p.id === planId);
      const collaborators = [...new Set([...(plan?.collaborators || []), user.id])];
      await base44.entities.StudyPlan.update(planId, { collaborators });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-plans', groupId]);
      toast.success('Joined study plan!');
    },
  });

  const markProgress = useMutation({
    mutationFn: async ({ planId, currentProgress }) => {
      const newProgress = Math.min(currentProgress + 10, 100);
      await base44.entities.StudyPlan.update(planId, { progress_percentage: newProgress });
    },
    onSuccess: () => queryClient.invalidateQueries(['group-plans', groupId]),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">Collective Study Plans</h3>
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" className="gap-1.5 text-indigo-600 border-indigo-200" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-3.5 h-3.5" /> New Plan
          </Button>
        )}
      </div>

      {/* Create Plan Form */}
      {showCreate && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 space-y-3">
            <input value={planTitle} onChange={e => setPlanTitle(e.target.value)} placeholder="Plan title..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            <textarea value={planDesc} onChange={e => setPlanDesc(e.target.value)} placeholder="Description..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600">Duration:</label>
              <select value={planDays} onChange={e => setPlanDays(e.target.value)} className="px-2 py-1 border border-gray-200 rounded text-sm">
                {['7','14','21','30','60'].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createPlan} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan List */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : groupPlans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No collective study plans yet.</p>
          {isAdmin && <p className="text-xs text-indigo-500 mt-1">Create one to get the group started!</p>}
        </div>
      ) : (
        groupPlans.map(plan => {
          const isParticipant = (plan.collaborators || []).includes(user?.id);
          const participantCount = (plan.collaborators || []).filter(id => memberIds.includes(id)).length;
          const progress = plan.progress_percentage || 0;

          return (
            <Card key={plan.id} className={`border ${progress === 100 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">{plan.title}</h4>
                      {progress === 100 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    {plan.description && <p className="text-xs text-gray-500 mb-2">{plan.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{participantCount} participants</span>
                      <span>{plan.duration_days || '?'}d plan</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-indigo-700">{progress}%</p>
                    <p className="text-[10px] text-gray-400">complete</p>
                  </div>
                </div>

                <PlanProgressBar value={progress} className="mb-3" />

                <div className="flex gap-2 flex-wrap">
                  {!isParticipant ? (
                    <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 text-xs gap-1"
                      onClick={() => joinPlan.mutate(plan.id)} disabled={joinPlan.isPending}>
                      <Plus className="w-3 h-3" /> Join Plan
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 text-xs gap-1"
                      onClick={() => markProgress.mutate({ planId: plan.id, currentProgress: progress })}
                      disabled={progress === 100 || markProgress.isPending}>
                      <CheckCircle className="w-3 h-3" /> Log Progress +10%
                    </Button>
                  )}
                  {isParticipant && <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">Joined</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}