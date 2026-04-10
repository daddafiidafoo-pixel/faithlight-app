import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackResponseManager() {
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [actionTaken, setActionTaken] = useState('none');
  const [resolutionDate, setResolutionDate] = useState('');

  const { data: openFeedback = [] } = useQuery({
    queryKey: ['open-feedback'],
    queryFn: async () => {
      const feedback = await base44.entities.TrainingFeedback.filter({ status: 'open' }, '-created_date');
      return feedback;
    },
  });

  const respondMutation = useMutation({
    mutationFn: async (data) => {
      // Create response
      await base44.entities.FeedbackResponse.create({
        feedback_id: selectedFeedback.id,
        responded_by_user_id: (await base44.auth.me()).id,
        responded_by_name: (await base44.auth.me()).full_name,
        response_text: data.responseText,
        action_taken: data.actionTaken,
        expected_resolution_date: data.resolutionDate,
        is_resolution: false,
      });

      // Update feedback status
      const newStatus = data.actionTaken === 'none' ? 'under_review' : 'planned';
      await base44.entities.TrainingFeedback.update(selectedFeedback.id, {
        status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-feedback'] });
      toast.success('Response submitted');
      setSelectedFeedback(null);
      setResponseText('');
      setActionTaken('none');
      setResolutionDate('');
    },
  });

  const resolveFeedback = useMutation({
    mutationFn: (feedbackId) =>
      base44.entities.TrainingFeedback.update(feedbackId, { status: 'resolved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-feedback'] });
      toast.success('Feedback marked as resolved');
    },
  });

  const handleSubmitResponse = () => {
    if (!responseText) {
      toast.error('Enter a response');
      return;
    }
    respondMutation.mutate({
      responseText,
      actionTaken,
      resolutionDate,
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback Management</h2>
        <p className="text-gray-600">Open feedback items: {openFeedback.length}</p>
      </div>

      <div className="grid gap-4">
        {openFeedback.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-gray-600">
              ✓ All feedback addressed
            </CardContent>
          </Card>
        ) : (
          openFeedback.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feedback.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge className={getPriorityColor(feedback.priority)}>
                        {feedback.priority}
                      </Badge>
                      <Badge variant="outline">
                        {feedback.feedback_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        by {feedback.submitted_by_name}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedFeedback(feedback)}
                    size="sm"
                  >
                    Respond
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Response Dialog */}
      {selectedFeedback && (
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Respond to Feedback</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold text-gray-900">{selectedFeedback.title}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedFeedback.description}</p>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Response</label>
                <Textarea
                  placeholder="Your response to this feedback..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Action Taken</label>
                  <Select value={actionTaken} onValueChange={setActionTaken}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No action yet</SelectItem>
                      <SelectItem value="content_updated">Content Updated</SelectItem>
                      <SelectItem value="module_revised">Module Revised</SelectItem>
                      <SelectItem value="scheduled_for_update">Scheduled</SelectItem>
                      <SelectItem value="needs_more_info">Need More Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Resolution Date</label>
                  <input
                    type="date"
                    value={resolutionDate}
                    onChange={(e) => setResolutionDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={respondMutation.isPending}
                  className="flex-1 gap-2"
                >
                  {respondMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Submit Response
                </Button>
                {actionTaken !== 'none' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      resolveFeedback.mutate(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}