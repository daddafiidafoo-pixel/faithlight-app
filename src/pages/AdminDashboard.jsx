import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle2, XCircle, Eye, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ReactMarkdown from 'react-markdown';
import BibleBulkImporter from '@/components/admin/BibleBulkImporter';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: pendingLessons = [], isLoading } = useQuery({
    queryKey: ['pending-lessons'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'pending' }),
    enabled: !!user,
  });

  const approveMutation = useMutation({
    mutationFn: (lessonId) => 
      base44.entities.Lesson.update(lessonId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-lessons']);
      setSelectedLesson(null);
      setFeedback('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ lessonId, feedback }) => 
      base44.entities.Lesson.update(lessonId, { 
        status: 'rejected',
        admin_feedback: feedback 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-lessons']);
      setSelectedLesson(null);
      setFeedback('');
    },
  });

  const autoApproveMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const oldLessons = pendingLessons.filter(lesson => {
        if (!lesson.submitted_for_review_date) return false;
        const submittedDate = new Date(lesson.submitted_for_review_date);
        return submittedDate < twentyFourHoursAgo;
      });

      const approvePromises = oldLessons.map(lesson =>
        base44.entities.Lesson.update(lesson.id, { status: 'approved' })
      );
      
      return await Promise.all(approvePromises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries(['pending-lessons']);
      alert(`Auto-approved ${results.length} lesson(s) that were pending for over 24 hours`);
    },
  });

  const handleApprove = (lessonId) => {
    if (confirm('Approve this lesson?')) {
      approveMutation.mutate(lessonId);
    }
  };

  const handleReject = (lessonId) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    if (confirm('Reject this lesson with the provided feedback?')) {
      rejectMutation.mutate({ lessonId, feedback });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage lessons, Bible data, and system settings</p>
          </div>
          <Button
            onClick={() => autoApproveMutation.mutate()}
            disabled={autoApproveMutation.isPending || pendingLessons.length === 0}
            variant="outline"
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            {autoApproveMutation.isPending ? 'Processing...' : 'Auto-Approve Old Submissions'}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'lessons'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Lesson Review
          </button>
          <button
            onClick={() => setActiveTab('bible-import')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'bible-import'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Bible Import
          </button>
        </div>

        {activeTab === 'bible-import' ? (
          <BibleBulkImporter />
        ) : isLoading ? (
          <p className="text-center py-12 text-gray-600">Loading lessons...</p>
        ) : pendingLessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No lessons pending review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-semibold text-lg mb-4">Pending Lessons ({pendingLessons.length})</h2>
              {pendingLessons.map((lesson) => (
                <Card 
                  key={lesson.id}
                  className={`cursor-pointer transition-all ${
                    selectedLesson?.id === lesson.id 
                      ? 'ring-2 ring-indigo-600 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setFeedback('');
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{lesson.title}</CardTitle>
                      <Badge variant="outline">{lesson.language}</Badge>
                    </div>
                    {lesson.scripture_references && (
                      <p className="text-xs text-gray-600 mt-1">{lesson.scripture_references}</p>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2">
              {!selectedLesson ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-600">
                    <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    Select a lesson to review
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Badge className="mb-3">{selectedLesson.language}</Badge>
                        <CardTitle className="text-2xl mb-2">{selectedLesson.title}</CardTitle>
                        {selectedLesson.scripture_references && (
                          <p className="text-sm text-gray-600">{selectedLesson.scripture_references}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {selectedLesson.objectives && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Learning Objectives</h3>
                        <p className="text-blue-800 text-sm">{selectedLesson.objectives}</p>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none mb-8">
                      <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Feedback (required for rejection)
                        </label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide feedback to the teacher..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(selectedLesson.id)}
                          disabled={approveMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {approveMutation.isPending ? 'Approving...' : 'Approve Lesson'}
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedLesson.id)}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                          className="flex-1 gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          {rejectMutation.isPending ? 'Rejecting...' : 'Reject Lesson'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}