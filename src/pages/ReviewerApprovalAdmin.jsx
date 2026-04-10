import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ReviewerApprovalAdmin() {
  const [user, setUser] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          alert('Access denied. Admin role required.');
          window.location.href = '/';
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: reviewerProfiles = [] } = useQuery({
    queryKey: ['reviewer-profiles'],
    queryFn: () => base44.entities.ReviewerProfile.filter({}),
    enabled: !!user,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  const pendingReviewers = reviewerProfiles.filter(r => r.status === 'pending_approval');
  const approvedReviewers = reviewerProfiles.filter(r => r.status === 'approved');
  const rejectedReviewers = reviewerProfiles.filter(r => r.status === 'rejected');

  const getReviewerUser = (userId) => users.find(u => u.id === userId);

  const approveMutation = useMutation({
    mutationFn: (profileId) =>
      base44.entities.ReviewerProfile.update(profileId, {
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviewer-profiles']);
      setSelectedReviewer(null);
      setShowApprovalDialog(false);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (profileId) =>
      base44.entities.ReviewerProfile.update(profileId, {
        status: 'rejected',
        rejection_reason: rejectionReason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviewer-profiles']);
      setSelectedReviewer(null);
      setShowApprovalDialog(false);
      setRejectionReason('');
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reviewer Approvals</h1>
          <p className="text-gray-600">Review and approve reviewer applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{pendingReviewers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{approvedReviewers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">{rejectedReviewers.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending {pendingReviewers.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingReviewers.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {/* Pending Reviewers */}
          <TabsContent value="pending">
            {pendingReviewers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending reviewer applications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingReviewers.map(profile => {
                  const reviewerUser = getReviewerUser(profile.user_id);
                  return (
                    <ReviewerCard
                      key={profile.id}
                      profile={profile}
                      user={reviewerUser}
                      onSelect={() => {
                        setSelectedReviewer(profile);
                        setShowApprovalDialog(true);
                      }}
                      status="pending"
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Approved Reviewers */}
          <TabsContent value="approved">
            {approvedReviewers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No approved reviewers yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedReviewers.map(profile => {
                  const reviewerUser = getReviewerUser(profile.user_id);
                  return (
                    <ReviewerCard
                      key={profile.id}
                      profile={profile}
                      user={reviewerUser}
                      status="approved"
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Rejected Reviewers */}
          <TabsContent value="rejected">
            {rejectedReviewers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No rejected reviewers</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedReviewers.map(profile => {
                  const reviewerUser = getReviewerUser(profile.user_id);
                  return (
                    <ReviewerCard
                      key={profile.id}
                      profile={profile}
                      user={reviewerUser}
                      status="rejected"
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Approval Dialog */}
        {selectedReviewer && (
          <ApprovalDialog
            open={showApprovalDialog}
            onOpenChange={setShowApprovalDialog}
            profile={selectedReviewer}
            user={getReviewerUser(selectedReviewer.user_id)}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            onApprove={() => approveMutation.mutate(selectedReviewer.id)}
            onReject={() => rejectMutation.mutate(selectedReviewer.id)}
            isLoading={approveMutation.isPending || rejectMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

function ReviewerCard({ profile, user, onSelect, status }) {
  const statusConfig = {
    pending: { icon: <Clock className="w-5 h-5 text-yellow-600" />, badge: 'pending' },
    approved: { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, badge: 'success' },
    rejected: { icon: <AlertCircle className="w-5 h-5 text-red-600" />, badge: 'destructive' }
  };

  return (
    <Card className={status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              {statusConfig[status].icon}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{user?.full_name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600">Role:</span>
                <p className="font-medium text-gray-900">{profile.role_title}</p>
              </div>
              <div>
                <span className="text-gray-600">Country:</span>
                <p className="font-medium text-gray-900">{profile.country}</p>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <p className="font-medium text-gray-900">{profile.years_of_ministry} years</p>
              </div>
              <div>
                <span className="text-gray-600">Theology:</span>
                <p className="font-medium text-gray-900 capitalize">{profile.theological_background}</p>
              </div>
              <div>
                <span className="text-gray-600">Languages:</span>
                <p className="font-medium text-gray-900">{profile.languages.join(', ')}</p>
              </div>
              {profile.denominational_tradition && (
                <div>
                  <span className="text-gray-600">Denomination:</span>
                  <p className="font-medium text-gray-900">{profile.denominational_tradition}</p>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="bg-white rounded p-3 text-sm text-gray-700 mb-3">
                <p className="font-semibold text-gray-900 mb-1">Bio</p>
                <p>{profile.bio}</p>
              </div>
            )}

            {profile.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                <p className="font-semibold mb-1">Rejection Reason</p>
                <p>{profile.rejection_reason}</p>
              </div>
            )}
          </div>

          {status === 'pending' && onSelect && (
            <Button onClick={onSelect} className="whitespace-nowrap">
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalDialog({ open, onOpenChange, profile, user, rejectionReason, setRejectionReason, onApprove, onReject, isLoading }) {
  const [mode, setMode] = useState('review');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Reviewer Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold text-gray-900 mb-2">{user?.full_name}</p>
            <p className="text-sm text-gray-600 mb-3">{profile.role_title} • {profile.country}</p>
            <p className="text-sm text-gray-700">{profile.bio}</p>
          </div>

          {mode === 'reject' && (
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected (optional)"
                rows={4}
                className="mt-2"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => (mode === 'reject' ? onReject() : setMode('reject'))}
              disabled={isLoading}
            >
              {mode === 'reject' ? 'Confirm Rejection' : 'Reject'}
            </Button>
            <Button
              onClick={onApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}