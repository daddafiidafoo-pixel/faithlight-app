import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ReviewTeacherApplications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showDialog, setShowDialog] = useState(false);

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
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: applications = [] } = useQuery({
    queryKey: ['teacher-applications'],
    queryFn: () => base44.entities.TeacherApplication.list('-created_date'),
    enabled: !!user,
  });

  const approveMutation = useMutation({
    mutationFn: async (appId) => {
      const app = applications.find(a => a.id === appId);
      await base44.entities.TeacherApplication.update(appId, {
        status: 'approved',
        admin_feedback: feedback || null
      });
      
      // Update user role
      const users = await base44.entities.User.filter({ email: app.email });
      if (users.length > 0) {
        const roleMap = {
          'pastor': 'pastor',
          'bible_teacher': 'teacher',
          'lecturer': 'teacher'
        };
        await base44.entities.User.update(users[0].id, {
          user_role: roleMap[app.role_type]
        });
      }

      // Send approval email
      await base44.integrations.Core.SendEmail({
        to: app.email,
        subject: 'Your FaithLight Teacher Application Has Been Approved!',
        body: `Hello ${app.full_name},\n\nCongratulations! Your application to become a teacher on FaithLight has been approved.\n\nYou now have access to:\n• Lesson creation tools\n• Teaching program generator\n• Approval authority for your content\n\nLog in to FaithLight to get started: https://faithlight.app\n\n${feedback ? `Feedback from our team:\n${feedback}\n\n` : ''}Best regards,\nThe FaithLight Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-applications']);
      setSelectedApp(null);
      setFeedback('');
      setShowDialog(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (appId) => {
      const app = applications.find(a => a.id === appId);
      await base44.entities.TeacherApplication.update(appId, {
        status: 'rejected',
        admin_feedback: feedback || 'Application not approved at this time.'
      });

      // Send rejection email
      await base44.integrations.Core.SendEmail({
        to: app.email,
        subject: 'Your FaithLight Teacher Application',
        body: `Hello ${app.full_name},\n\nThank you for your interest in becoming a teacher on FaithLight. After careful review, we're unable to approve your application at this time.\n\n${feedback ? `Here's some feedback:\n${feedback}\n\n` : ''}We encourage you to reapply in the future. If you have questions, please contact us at support@faithlight.com.\n\nBest regards,\nThe FaithLight Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-applications']);
      setSelectedApp(null);
      setFeedback('');
      setShowDialog(false);
    },
  });

  const pending = applications.filter(a => a.status === 'pending');
  const approved = applications.filter(a => a.status === 'approved');
  const rejected = applications.filter(a => a.status === 'rejected');

  const roleLabels = {
    pastor: 'Pastor',
    bible_teacher: 'Bible Teacher',
    lecturer: 'Lecturer'
  };

  const ApplicationCard = ({ app }) => (
    <Card className={app.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                {app.status}
              </Badge>
              <Badge variant="outline">{roleLabels[app.role_type]}</Badge>
            </div>
            <CardTitle className="text-lg">{app.full_name}</CardTitle>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>{app.email}</p>
              <p>{app.country}</p>
              {app.church_organization && <p>{app.church_organization}</p>}
            </div>
          </div>
          {app.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedApp(app);
                setFeedback('');
                setShowDialog(true);
              }}
            >
              Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Teaching Description:</p>
          <p className="text-sm text-gray-600">{app.teaching_description}</p>
        </div>
        {app.admin_feedback && (
          <div className="p-3 bg-white rounded border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Admin Feedback
            </p>
            <p className="text-sm text-gray-600">{app.admin_feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Applications</h1>
          <p className="text-gray-600">Review and approve teacher applications</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{pending.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{approved.length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{rejected.length}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No pending applications
                </CardContent>
              </Card>
            ) : (
              pending.map(app => <ApplicationCard key={app.id} app={app} />)
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approved.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No approved applications
                </CardContent>
              </Card>
            ) : (
              approved.map(app => <ApplicationCard key={app.id} app={app} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejected.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No rejected applications
                </CardContent>
              </Card>
            ) : (
              rejected.map(app => <ApplicationCard key={app.id} app={app} />)
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        {selectedApp && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Application: {selectedApp.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-gray-900">{roleLabels[selectedApp.role_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-medium text-gray-900">{selectedApp.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teaching Description</p>
                    <p className="text-gray-900 mt-1">{selectedApp.teaching_description}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Optional Feedback Message</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Include any feedback to share with the applicant..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      setSelectedApp(null);
                    }}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(selectedApp.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(selectedApp.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}