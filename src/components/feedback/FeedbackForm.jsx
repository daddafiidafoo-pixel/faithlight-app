import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackForm({ open, onOpenChange, lessonId, quizId, moduleId, courseId, user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    feedback_type: 'improvement_suggestion',
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
  });

  const submitFeedback = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.TrainingFeedback.create({
        lesson_id: lessonId,
        quiz_id: quizId,
        module_id: moduleId,
        course_id: courseId,
        submitted_by_user_id: user.id,
        submitted_by_name: user.full_name,
        feedback_type: data.feedback_type,
        title: data.title,
        description: data.description,
        priority: data.priority,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        status: 'open',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-feedback'] });
      toast.success('Feedback submitted successfully');
      onOpenChange(false);
      setFormData({
        feedback_type: 'improvement_suggestion',
        title: '',
        description: '',
        priority: 'medium',
        tags: '',
      });
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      toast.error('Fill in all required fields');
      return;
    }
    submitFeedback.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-1 block">Feedback Type *</label>
            <Select value={formData.feedback_type} onValueChange={(val) => setFormData({ ...formData, feedback_type: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content_issue">Content Issue</SelectItem>
                <SelectItem value="improvement_suggestion">Improvement Suggestion</SelectItem>
                <SelectItem value="accuracy_concern">Accuracy Concern</SelectItem>
                <SelectItem value="clarity_issue">Clarity Issue</SelectItem>
                <SelectItem value="engagement">Low Engagement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Title *</label>
            <Input
              placeholder="Brief summary of feedback"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Description *</label>
            <Textarea
              placeholder="Detailed feedback description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Priority</label>
              <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Tags (comma separated)</label>
              <Input
                placeholder="e.g., grammar, outdated, unclear"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitFeedback.isPending} className="flex-1 gap-2">
              {submitFeedback.isPending && <Loader className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}