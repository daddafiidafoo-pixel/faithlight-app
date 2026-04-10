import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorshipRequestModal({ open, onOpenChange, mentor, menteeProfile, userId }) {
  const queryClient = useQueryClient();
  const [focusAreas, setFocusAreas] = useState(menteeProfile.interest_areas.join(', '));
  const [goals, setGoals] = useState(menteeProfile.spiritual_goals);

  const requestMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MentorshipConnection.create({
        mentor_id: mentor.user_id,
        mentee_id: userId,
        status: 'pending',
        focus_areas: focusAreas.split(',').map(a => a.trim()),
        goals: goals.trim(),
      });
    },
    onSuccess: () => {
      toast.success('Mentorship request sent!');
      queryClient.invalidateQueries(['my-mentorship-connections']);
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to send request');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Mentorship</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Focus Areas</Label>
            <Textarea
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="What areas do you want to focus on?"
              className="h-20 mt-2"
            />
          </div>

          <div>
            <Label>Your Goals for this Mentorship</Label>
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What do you hope to achieve?"
              className="h-24 mt-2"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => requestMutation.mutate()}
              disabled={!focusAreas.trim() || !goals.trim() || requestMutation.isPending}
              className="gap-2"
            >
              {requestMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}