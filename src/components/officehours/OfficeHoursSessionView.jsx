import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Video, PhoneOff, MessageCircle, Loader, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function OfficeHoursSessionView({ sessionId, user }) {
  const queryClient = useQueryClient();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const { data: session } = useQuery({
    queryKey: ['office-hours-session', sessionId],
    queryFn: () => base44.entities.OfficeHoursSession.filter({ id: sessionId }).then(r => r[0]),
  });

  const endSession = useMutation({
    mutationFn: () =>
      base44.entities.OfficeHoursSession.update(sessionId, {
        status: 'completed',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours-session'] });
      setShowFeedbackDialog(true);
    },
  });

  const submitFeedback = useMutation({
    mutationFn: () =>
      base44.entities.OfficeHoursSession.update(sessionId, {
        feedback_rating: feedbackRating,
        feedback_text: feedbackText,
      }),
    onSuccess: () => {
      toast.success('Feedback submitted');
      setShowFeedbackDialog(false);
    },
  });

  const copyMeetingLink = () => {
    if (session?.meeting_link) {
      navigator.clipboard.writeText(session.meeting_link);
      toast.success('Meeting link copied');
    }
  };

  if (!session) return null;

  const isInstructor = user.id === session.instructor_user_id;
  const isStarted = new Date(session.start_time) <= new Date();
  const isEnded = session.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span>{isInstructor ? `With ${session.booked_by_name}` : `With ${session.instructor_name}`}</span>
            <Badge variant={session.status === 'in_progress' ? 'default' : 'outline'}>
              {session.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {new Date(session.start_time).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Session Type</p>
              <p className="font-semibold text-gray-900">
                {session.session_type === 'one_on_one' ? '1-on-1' : 'Group'}
              </p>
            </div>
          </div>

          {session.participants && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Participants</p>
              <div className="space-y-1">
                {session.participants.map(p => (
                  <p key={p.user_id} className="text-sm text-gray-900">
                    {p.name} {p.user_id === user.id && <span className="text-xs text-gray-600">(You)</span>}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Conference Area */}
      {isStarted && !isEnded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Conference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.meeting_link ? (
              <div className="bg-gray-100 rounded p-8 text-center">
                <p className="text-gray-700 mb-4">
                  Click below to join the video conference
                </p>
                <a
                  href={session.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Join Meeting
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyMeetingLink}
                  className="ml-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 p-8 text-center">Meeting link will be generated when the session starts</p>
            )}

            {isInstructor && session.status === 'in_progress' && (
              <Button
                onClick={() => endSession.mutate()}
                disabled={endSession.isPending}
                variant="destructive"
                className="w-full gap-2"
              >
                {endSession.isPending && <Loader className="w-4 h-4 animate-spin" />}
                <PhoneOff className="w-4 h-4" />
                End Session
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Session */}
      {isEnded && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              ✓ Session completed on {new Date(session.created_date).toLocaleDateString()}
            </p>
            {session.recording_url && (
              <a
                href={session.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                View Recording
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`text-2xl ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Comments</label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How was this session? Any suggestions?"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Skip
              </Button>
              <Button
                onClick={() => submitFeedback.mutate()}
                disabled={submitFeedback.isPending}
                className="flex-1 gap-2"
              >
                {submitFeedback.isPending && <Loader className="w-4 h-4 animate-spin" />}
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}