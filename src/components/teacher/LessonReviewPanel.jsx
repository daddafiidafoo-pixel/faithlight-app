import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function LessonReviewPanel({ courseId }) {
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Fetch lessons pending review for this course
  const { data: pendingLessons, isLoading } = useQuery({
    queryKey: ['pending-lessons', courseId],
    queryFn: async () => {
      const result = await base44.entities.Lesson.filter(
        { course_id: courseId, status: 'pending' },
        '-submitted_for_review_date',
        100
      );
      return result;
    },
  });

  // Approve lesson
  const approveMutation = useMutation({
    mutationFn: (lessonId) =>
      base44.entities.Lesson.update(lessonId, {
        status: 'approved',
        admin_feedback: null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-lessons', courseId]);
      setSelectedLesson(null);
      setReviewFeedback('');
    },
  });

  // Reject lesson
  const rejectMutation = useMutation({
    mutationFn: (lessonId) =>
      base44.entities.Lesson.update(lessonId, {
        status: 'rejected',
        admin_feedback: reviewFeedback,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-lessons', courseId]);
      setSelectedLesson(null);
      setReviewFeedback('');
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Loading pending lessons...</span>
        </CardContent>
      </Card>
    );
  }

  if (!pendingLessons || pendingLessons.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800">All lessons are approved!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {selectedLesson ? (
        // Review Detail View
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>{selectedLesson.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Submitted for review on{' '}
                {new Date(selectedLesson.submitted_for_review_date).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLesson(null);
                setReviewFeedback('');
              }}
            >
              ← Back
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lesson Content Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Content Preview</h4>
              <p className="text-sm text-gray-700 line-clamp-4">{selectedLesson.content}</p>
            </div>

            {selectedLesson.objectives && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Learning Objectives</h4>
                <p className="text-sm text-gray-700">{selectedLesson.objectives}</p>
              </div>
            )}

            {selectedLesson.scripture_references && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Scripture References</h4>
                <p className="text-sm text-gray-700">{selectedLesson.scripture_references}</p>
              </div>
            )}

            {/* Review Actions */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 space-y-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Provide feedback (optional for approval)</span>
              </p>
              <Textarea
                placeholder="Enter feedback or rejection reason..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="text-sm"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => approveMutation.mutate(selectedLesson.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Lesson
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => rejectMutation.mutate(selectedLesson.id)}
                  disabled={rejectMutation.isPending || !reviewFeedback.trim()}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Lesson
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Lessons List
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Review ({pendingLessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="w-full p-3 rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        By {lesson.teacher_id}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Submitted:{' '}
                        {new Date(
                          lesson.submitted_for_review_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100">
                      Pending
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}