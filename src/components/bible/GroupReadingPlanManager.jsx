import React, { useState } from 'react';
import { Users, Plus, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GroupReadingPlanManager({ user }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['groupReadingPlanMemberships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.GroupReadingPlanMember.filter({ user_id: user.id }, '-created_date', 50);
    },
    enabled: !!user
  });

  const { data: publicPlans = [] } = useQuery({
    queryKey: ['publicGroupReadingPlans'],
    queryFn: async () => {
      return await base44.entities.GroupReadingPlan.filter({ is_public: true }, '-created_date', 20);
    }
  });

  const joinPlanMutation = useMutation({
    mutationFn: async (plan) => {
      await base44.entities.GroupReadingPlanMember.create({
        plan_id: plan.id,
        user_id: user.id,
        user_name: user.full_name
      });
      await base44.entities.GroupReadingPlan.update(plan.id, {
        member_count: (plan.member_count || 1) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groupReadingPlanMemberships']);
      queryClient.invalidateQueries(['publicGroupReadingPlans']);
      toast.success('Joined reading plan!');
    }
  });

  const myPlanIds = myMemberships.map(m => m.plan_id);
  const availablePlans = publicPlans.filter(p => !myPlanIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Group Reading Plans</h3>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Create Plan
        </Button>
      </div>

      {myMemberships.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">My Plans</h4>
          <div className="grid gap-3">
            {myMemberships.map(membership => {
              const plan = publicPlans.find(p => p.id === membership.plan_id);
              if (!plan) return null;
              
              return (
                <Card key={membership.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold">{plan.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{plan.member_count} members</span>
                        <span>Day {membership.current_day || 1}</span>
                        <span>{membership.progress_percentage || 0}% complete</span>
                      </div>
                    </div>
                    <Link to={createPageUrl(`GroupReadingPlan?id=${plan.id}`)}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {availablePlans.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Discover Plans</h4>
          <div className="grid gap-3">
            {availablePlans.map(plan => (
              <Card key={plan.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold">{plan.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{plan.member_count} members</span>
                      <span>{plan.schedule?.length || 0} days</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => joinPlanMutation.mutate(plan)}
                    disabled={joinPlanMutation.isPending}
                  >
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Reading Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Plan title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-gray-600">
              After creating your plan, you can add a daily reading schedule and invite members.
            </p>
            <Button className="w-full" disabled>
              Coming Soon - Full Builder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}