import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareStudyPlanModal({ open, onOpenChange, studyPlan, user }) {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [shareNote, setShareNote] = useState('');
  const queryClient = useQueryClient();

  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups-for-sharing', user?.id],
    queryFn: async () => {
      const memberships = await base44.entities.GroupMember.filter({ user_id: user.id });
      const groupIds = memberships.map(m => m.group_id);
      if (groupIds.length === 0) return [];
      
      const groups = await base44.entities.Group.filter({ is_active: true });
      return groups.filter(g => groupIds.includes(g.id));
    },
    enabled: !!user?.id && open
  });

  const shareStudyPlanMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGroupId || !studyPlan) {
        throw new Error('Missing required data');
      }

      return base44.entities.SharedStudyPlan.create({
        study_plan_id: studyPlan.id,
        group_id: selectedGroupId,
        shared_by_user_id: user.id,
        title: studyPlan.title,
        description: shareNote || studyPlan.description,
        plan_data: {
          duration_days: studyPlan.duration_days,
          topics: studyPlan.topics,
          daily_goals: studyPlan.daily_goals
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shared-study-plans']);
      toast.success('Study plan shared with group!');
      onOpenChange(false);
      setSelectedGroupId(null);
      setShareNote('');
    },
    onError: () => {
      toast.error('Failed to share study plan');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Study Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {studyPlan && (
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-1">{studyPlan.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{studyPlan.description}</p>
              <Badge variant="outline">{studyPlan.duration_days} days</Badge>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group
            </label>
            {userGroups.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">
                You need to join a group first to share study plans
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedGroupId === group.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.member_count} members</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedGroupId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a note (optional)
              </label>
              <Textarea
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                placeholder="Share why you recommend this study plan..."
                className="h-20"
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => shareStudyPlanMutation.mutate()}
              disabled={!selectedGroupId || shareStudyPlanMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {shareStudyPlanMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}