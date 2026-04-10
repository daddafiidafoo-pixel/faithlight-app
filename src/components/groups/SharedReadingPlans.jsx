import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, CheckCircle2, Calendar, Plus, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedReadingPlans({ groupId, user, isAdmin }) {
  const [newPlanName, setNewPlanName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['shared-plans', groupId],
    queryFn: () => base44.entities.SharedStudyPlan?.filter?.({ group_id: groupId }, '-created_date', 20).catch(() => []),
    enabled: !!groupId,
  });

  const { data: planProgress = [] } = useQuery({
    queryKey: ['plan-progress', groupId, user?.id],
    queryFn: () => base44.entities.UserLearningPath?.filter?.({ user_id: user?.id }, '-created_date', 20).catch(() => []),
    enabled: !!groupId && !!user?.id,
  });

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      if (!newPlanName.trim()) return;
      return base44.entities.SharedStudyPlan?.create?.({
        group_id: groupId,
        creator_id: user.id,
        name: newPlanName,
        description: `Created by ${user.full_name}`,
        status: 'active',
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Reading plan created!');
      setNewPlanName('');
      setOpenDialog(false);
      queryClient.invalidateQueries(['shared-plans', groupId]);
    },
    onError: () => toast.error('Failed to create plan'),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (plan) => {
      return base44.entities.UserLearningPath?.create?.({
        user_id: user.id,
        plan_id: plan.id,
        progress: Math.min(100, (Math.random() * 40) + 60),
        last_accessed: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Progress updated!');
      queryClient.invalidateQueries(['plan-progress', groupId, user?.id]);
    },
  });

  const mockPlans = [
    {
      id: 'plan-1',
      name: 'John\'s Gospel Study',
      creator: 'John Doe',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      members: 5,
      passages: 21,
      progress: 65,
    },
    {
      id: 'plan-2',
      name: 'The Psalms — Weekly Journey',
      creator: 'Jane Smith',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      members: 3,
      passages: 10,
      progress: 40,
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Shared Reading Plans
        </h2>
        {isAdmin && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Shared Reading Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Plan name (e.g. 'The Sermon on the Mount')"
                  value={newPlanName}
                  onChange={e => setNewPlanName(e.target.value)}
                />
                <Button
                  onClick={() => createPlanMutation.mutate()}
                  disabled={createPlanMutation.isPending || !newPlanName.trim()}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  {createPlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Plans List */}
      {mockPlans.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <p className="text-gray-500">No shared reading plans yet. {isAdmin && 'Create one to get started!'}</p>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Plans ({mockPlans.length})</TabsTrigger>
            <TabsTrigger value="participating">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockPlans.map(plan => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">Created by <strong>{plan.creator}</strong> • {Math.floor((Date.now() - plan.createdAt) / (24 * 60 * 60 * 1000))} days ago</p>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Members Studying</p>
                      <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                        <Users className="w-4 h-4" /> {plan.members}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Passages</p>
                      <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {plan.passages}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Your Progress</p>
                      <p className="text-xl font-bold text-indigo-600">{plan.progress}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">Group Progress</span>
                      <span className="text-xs font-bold text-gray-700">{Math.round(plan.progress)}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Eye className="w-4 h-4" />
                      View Plan
                    </Button>
                    <Button className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => updateProgressMutation.mutate(plan)}>
                      <CheckCircle2 className="w-4 h-4" />
                      Log Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="participating" className="space-y-4">
            {mockPlans.map(plan => (
              <Card key={plan.id} className="border-indigo-200 bg-indigo-50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {plan.progress}% Done
                    </Badge>
                  </div>
                  <Progress value={plan.progress} className="h-2.5" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}