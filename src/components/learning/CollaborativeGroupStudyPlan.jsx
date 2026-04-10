import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, CheckCircle, Clock, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborativeGroupStudyPlan({ group, user }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: groupPlans = [] } = useQuery({
    queryKey: ['group-study-plans', group?.id],
    queryFn: async () => {
      if (!group?.id) return [];
      const plans = await base44.entities.StudyPlan.filter({ group_id: group.id }, '-created_date', 20);
      return plans;
    },
    enabled: !!group?.id
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', group?.id],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: group.id }),
    enabled: !!group?.id
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      return await base44.entities.StudyPlan.create({
        user_id: user.id,
        group_id: group?.id || null,
        title: planData.title || 'Untitled Plan',
        description: planData.description || '',
        duration_days: planData.duration_days || 21,
        topics: planData.topics || [],
        is_collaborative: true,
        created_by: user.id,
        collaborators: [user.id],
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-study-plans']);
      setShowCreateForm(false);
      setPlanTitle('');
      setPlanDescription('');
      toast.success('Group study plan created!');
    }
  });

  const joinPlanMutation = useMutation({
    mutationFn: async (plan) => {
      const updatedCollaborators = [...(plan.collaborators || []), user.id];
      return await base44.entities.StudyPlan.update(plan.id, {
        collaborators: updatedCollaborators
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-study-plans']);
      toast.success('Joined study plan!');
    }
  });

  const generateAIPlan = async () => {
    if (!user || !group) {
      toast.error('Missing required data');
      return;
    }
    
    setIsGenerating(true);
    try {
      const memberInterests = members.flatMap(m => m.interests || []);
      const topInterests = [...new Set(memberInterests)].slice(0, 5).join(', ');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a collaborative group Bible study plan for a study group:

Group: ${group.name}
Group Focus: ${group.study_focus || 'General Bible study'}
Member Count: ${members.length}
Common Interests: ${topInterests || 'General biblical studies'}

Generate a 4-week collaborative study plan with:
- Week-by-week topics
- Daily readings for individual study
- Weekly group discussion questions
- Collaborative activities (e.g., research together, teach each other)
- Shared reflection prompts
- Group milestones

Make it engaging and foster collaboration between members.

Format as markdown.`
      });

      const aiPlan = await base44.entities.StudyPlan.create({
        user_id: user.id,
        group_id: group.id,
        title: `AI Group Study: ${group.study_focus || 'Bible Study'}`,
        description: 'AI-generated collaborative plan',
        duration_days: 28,
        topics: [group.study_focus],
        generated_content: response,
        is_collaborative: true,
        created_by: user.id,
        collaborators: [user.id],
        status: 'active'
      });

      queryClient.invalidateQueries(['group-study-plans']);
      toast.success('AI group plan generated!');
    } catch (error) {
      toast.error('Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Group Study Plans
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={generateAIPlan}
                disabled={isGenerating}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'AI Plan'}
              </Button>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border space-y-3">
              <Input
                placeholder="Study plan title..."
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
              />
              <Textarea
                placeholder="What will the group study together?"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => createPlanMutation.mutate({
                    title: planTitle,
                    description: planDescription,
                    duration_days: 21,
                    topics: [group.study_focus]
                  })}
                  disabled={!planTitle || createPlanMutation.isPending}
                  size="sm"
                >
                  Create Plan
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {groupPlans.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-sm">
              No group study plans yet. Create one to study together!
            </p>
          ) : (
            <div className="space-y-3">
              {groupPlans.map(plan => {
                const isParticipant = plan.collaborators?.includes(user.id);
                const participantCount = plan.collaborators?.length || 0;

                return (
                  <div key={plan.id} className="p-4 border rounded-lg hover:shadow-sm transition">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                      {isParticipant && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Joined
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {participantCount} participants
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.duration_days} days
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Target className="w-3 h-3" />
                        {plan.progress_percentage || 0}% complete
                      </Badge>
                    </div>
                    {!isParticipant && (
                      <Button
                        onClick={() => joinPlanMutation.mutate(plan)}
                        disabled={joinPlanMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Join This Plan
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}