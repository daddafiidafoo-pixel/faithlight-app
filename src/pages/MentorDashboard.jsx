import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Users, FileText, Award, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: myAssignments = [] } = useQuery({
    queryKey: ['my-mentor-assignments', user?.id],
    queryFn: () => base44.entities.MentorAssignment.filter({ mentor_id: user.id, status: 'active' }),
    enabled: !!user,
  });

  const { data: myConnections = [] } = useQuery({
    queryKey: ['my-mentorship-connections', user?.id],
    queryFn: () => base44.entities.MentorshipConnection.filter({ mentor_id: user.id }),
    enabled: !!user,
  });

  const { data: connectionRequests = [] } = useQuery({
    queryKey: ['connection-requests', user?.id],
    queryFn: () => base44.entities.MentorshipConnection.filter({ mentor_id: user.id, status: 'pending' }),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['mentorship-sessions', user?.id],
    queryFn: () => base44.entities.MentorshipSession.filter({ mentor_id: user.id }),
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['mentorship-goals'],
    queryFn: () => base44.entities.MentorshipGoal.list(),
    enabled: !!user,
  });

  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['all-assignment-submissions'],
    queryFn: () => base44.entities.UserAssignmentSubmission.list('-created_date'),
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: () => base44.entities.UserTrainingProgress.list('-updated_date'),
    enabled: !!user,
  });

  const { data: certificateApprovals = [] } = useQuery({
    queryKey: ['certificate-approvals'],
    queryFn: () => base44.entities.CertificateApproval.filter({ status: 'pending' }),
    enabled: !!user,
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: ({ id, status, feedback }) => 
      base44.entities.UserAssignmentSubmission.update(id, {
        status,
        mentor_feedback: feedback,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-assignment-submissions'] });
      toast.success('Submission reviewed');
      setReviewDialogOpen(false);
      setFeedback('');
      setSelectedSubmission(null);
    },
  });

  const reviewCertificateMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      base44.entities.CertificateApproval.update(id, {
        status,
        mentor_id: user.id,
        mentor_notes: notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-approvals'] });
      toast.success('Certificate approval updated');
      setCertificateDialogOpen(false);
      setApprovalNotes('');
      setSelectedApproval(null);
    },
  });

  const respondToConnectionMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.MentorshipConnection.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-mentorship-connections', 'connection-requests']);
      toast.success('Connection updated');
    },
  });

  const openReviewDialog = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.mentor_feedback || '');
    setReviewDialogOpen(true);
  };

  const openCertificateDialog = (approval) => {
    setSelectedApproval(approval);
    setApprovalNotes(approval.mentor_notes || '');
    setCertificateDialogOpen(true);
  };

  const handleReviewSubmission = (status) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }
    reviewSubmissionMutation.mutate({
      id: selectedSubmission.id,
      status,
      feedback: feedback.trim(),
    });
  };

  const handleReviewCertificate = (status) => {
    reviewCertificateMutation.mutate({
      id: selectedApproval.id,
      status,
      notes: approvalNotes.trim(),
    });
  };

  const myMenteeIds = [...myAssignments.map(a => a.mentee_id), ...myConnections.filter(c => c.status === 'active').map(c => c.mentee_id)];
  const menteeSubmissions = allSubmissions.filter(s => myMenteeIds.includes(s.user_id));
  const pendingSubmissions = menteeSubmissions.filter(s => s.status === 'pending');
  const reviewedSubmissions = menteeSubmissions.filter(s => s.status !== 'pending');

  const myCertificateApprovals = certificateApprovals.filter(a => 
    myMenteeIds.includes(a.user_id)
  );

  const activeConnections = myConnections.filter(c => c.status === 'active');

  const getMenteeProgress = (menteeId) => {
    const progress = allProgress.filter(p => p.user_id === menteeId && p.completed);
    return progress.length;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-600 mt-1">Guide and review your assigned students</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">My Mentees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-indigo-600" />
                <span className="text-3xl font-bold">{activeConnections.length + myAssignments.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold">{pendingSubmissions.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Certificate Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold">{myCertificateApprovals.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold">{menteeSubmissions.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mentees" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mentees">My Mentees</TabsTrigger>
            <TabsTrigger value="requests">
              Connection Requests {connectionRequests.length > 0 && `(${connectionRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="students">Assigned Students</TabsTrigger>
            <TabsTrigger value="submissions">
              Pending Reviews {pendingSubmissions.length > 0 && `(${pendingSubmissions.length})`}
            </TabsTrigger>
            <TabsTrigger value="certificates">
              Certificate Approvals {myCertificateApprovals.length > 0 && `(${myCertificateApprovals.length})`}
            </TabsTrigger>
          </TabsList>

          {/* My Mentees Tab */}
          <TabsContent value="mentees">
            <Card>
              <CardHeader>
                <CardTitle>My Active Mentees</CardTitle>
              </CardHeader>
              <CardContent>
                {activeConnections.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active mentorship connections</p>
                ) : (
                  <div className="space-y-4">
                    {activeConnections.map(connection => {
                      const menteeProgress = getMenteeProgress(connection.mentee_id);
                      const menteeSessions = sessions.filter(s => s.connection_id === connection.id);
                      const menteeGoals = goals.filter(g => g.connection_id === connection.id);
                      
                      return (
                        <div key={connection.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{connection.mentee_name}</h3>
                              {connection.focus_areas && connection.focus_areas.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {connection.focus_areas.map((area, idx) => (
                                    <Badge key={idx} variant="secondary">{area}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-indigo-600">{menteeProgress}</p>
                              <p className="text-sm text-gray-600">Lessons Completed</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{menteeSessions.length}</p>
                              <p className="text-sm text-gray-600">Sessions</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{menteeGoals.filter(g => g.status === 'completed').length}/{menteeGoals.length}</p>
                              <p className="text-sm text-gray-600">Goals Completed</p>
                            </div>
                          </div>
                          
                          {connection.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">{connection.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Mentorship Connection Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {connectionRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending connection requests</p>
                ) : (
                  <div className="space-y-4">
                    {connectionRequests.map(request => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{request.mentee_name}</h3>
                            <Badge className="mt-2">Pending</Badge>
                          </div>
                        </div>
                        {request.notes && (
                          <div className="bg-gray-50 p-3 rounded mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Request Message:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.notes}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => respondToConnectionMutation.mutate({ id: request.id, status: 'active' })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            onClick={() => respondToConnectionMutation.mutate({ id: request.id, status: 'declined' })}
                            variant="outline"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Students */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Students</CardTitle>
              </CardHeader>
              <CardContent>
                {myAssignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No students assigned yet</p>
                ) : (
                  <div className="space-y-4">
                    {myAssignments.map(assignment => {
                      const studentSubmissions = menteeSubmissions.filter(
                        s => s.user_id === assignment.mentee_id
                      );
                      const pendingCount = studentSubmissions.filter(s => s.status === 'pending').length;
                      const completedLessons = getMenteeProgress(assignment.mentee_id);

                      return (
                        <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{assignment.mentee_name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{assignment.track_name}</p>
                              {assignment.notes && (
                                <p className="text-sm text-gray-600 italic mb-2">{assignment.notes}</p>
                              )}
                              <div className="flex gap-4 mt-3">
                                <div className="text-sm">
                                  <span className="text-gray-600">Completed Lessons:</span>{' '}
                                  <span className="font-semibold">{completedLessons}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-600">Submissions:</span>{' '}
                                  <span className="font-semibold">{studentSubmissions.length}</span>
                                </div>
                                {pendingCount > 0 && (
                                  <Badge variant="outline" className="bg-orange-50">
                                    {pendingCount} Pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Submissions */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Assignment Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSubmissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending submissions</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSubmissions.map(submission => {
                      const assignment = myAssignments.find(a => a.mentee_id === submission.user_id);
                      return (
                        <div key={submission.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{assignment?.mentee_name}</h3>
                              <Badge className="mt-1">Pending Review</Badge>
                            </div>
                            <Button onClick={() => openReviewDialog(submission)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                          {submission.submission_text && (
                            <div className="bg-gray-50 p-3 rounded mb-2">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {submission.submission_text}
                              </p>
                            </div>
                          )}
                          {submission.file_url && (
                            <a 
                              href={submission.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:underline"
                            >
                              View Attached File →
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificate Approvals */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Approval Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {myCertificateApprovals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending certificate requests</p>
                ) : (
                  <div className="space-y-4">
                    {myCertificateApprovals.map(approval => {
                      const assignment = myAssignments.find(a => a.mentee_id === approval.user_id);
                      return (
                        <div key={approval.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{assignment?.mentee_name}</h3>
                              <p className="text-sm text-gray-600">{assignment?.track_name}</p>
                            </div>
                            <Button onClick={() => openCertificateDialog(approval)}>
                              <Award className="w-4 h-4 mr-2" />
                              Review Request
                            </Button>
                          </div>
                          {approval.testimony && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm font-medium text-gray-700 mb-1">Student Testimony:</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {approval.testimony}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewedSubmissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No review history yet</p>
                ) : (
                  <div className="space-y-3">
                    {reviewedSubmissions.map(submission => {
                      const assignment = myAssignments.find(a => a.mentee_id === submission.user_id);
                      return (
                        <div key={submission.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{assignment?.mentee_name}</span>
                                {submission.status === 'approved' ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Needs Revision
                                  </Badge>
                                )}
                              </div>
                              {submission.mentor_feedback && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Your Feedback:</strong> {submission.mentor_feedback}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Submission Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Assignment Submission</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Student Submission:</h4>
                  {selectedSubmission.submission_text && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                      {selectedSubmission.submission_text}
                    </p>
                  )}
                  {selectedSubmission.file_url && (
                    <a 
                      href={selectedSubmission.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View Attached File →
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Feedback</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback to help the student grow..."
                    rows={6}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReviewSubmission('approved')}
                    disabled={reviewSubmissionMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReviewSubmission('needs_revision')}
                    disabled={reviewSubmissionMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Revision
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Certificate Approval Dialog */}
        <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Certificate Approval Request</DialogTitle>
            </DialogHeader>
            {selectedApproval && (
              <div className="space-y-4">
                {selectedApproval.testimony && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium mb-2">Student Testimony:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApproval.testimony}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Mentor Notes</label>
                  <Textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add your notes about this student's readiness for leadership certification..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReviewCertificate('approved')}
                    disabled={reviewCertificateMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Certificate
                  </Button>
                  <Button
                    onClick={() => handleReviewCertificate('rejected')}
                    disabled={reviewCertificateMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}