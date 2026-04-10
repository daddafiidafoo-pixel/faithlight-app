import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLeaderVerification() {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: pendingApplications = [] } = useQuery({
    queryKey: ['pending-applications'],
    queryFn: () => base44.entities.LeaderApplication.filter({ status: 'pending' }),
  });

  const { data: approvedApplications = [] } = useQuery({
    queryKey: ['approved-applications'],
    queryFn: () => base44.entities.LeaderApplication.filter({ status: 'approved' }),
  });

  const { data: rejectedApplications = [] } = useQuery({
    queryKey: ['rejected-applications'],
    queryFn: () => base44.entities.LeaderApplication.filter({ status: 'rejected' }),
  });

  const generateVerificationId = (role) => {
    const rolePrefix = {
      pastor: 'PASTOR',
      trainer: 'TRAINER',
      ambassador: 'AMB',
    };
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `FL-${rolePrefix[role]}-${year}-${randomNum}`;
  };

  const approveMutation = useMutation({
    mutationFn: async (applicationId) => {
      const application = pendingApplications.find(a => a.id === applicationId);
      const verificationId = generateVerificationId(application.requested_role);
      const badgeTypeMap = {
        pastor: 'verified_pastor',
        trainer: 'verified_trainer',
        ambassador: 'verified_ambassador',
      };

      // Update application
      await base44.entities.LeaderApplication.update(applicationId, {
        status: 'approved',
        reviewed_by: (await base44.auth.me()).id,
        reviewed_at: new Date().toISOString(),
      });

      // Update user
      await base44.auth.updateMe({
        role: application.requested_role,
        verification_status: 'verified',
        verification_id: verificationId,
        badge_type: badgeTypeMap[application.requested_role],
        badge_issued_at: new Date().toISOString(),
        country: application.country,
        city: application.city,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-applications']);
      queryClient.invalidateQueries(['approved-applications']);
      toast.success('Application approved and leader verified!');
      setSelectedApplication(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (applicationId) => {
      await base44.entities.LeaderApplication.update(applicationId, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_by: (await base44.auth.me()).id,
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-applications']);
      queryClient.invalidateQueries(['rejected-applications']);
      toast.success('Application rejected');
      setSelectedApplication(null);
      setRejectionReason('');
      setIsRejecting(false);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leader Verification Admin</h1>
          <p className="text-gray-600 mt-1">Review and approve leader applications</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending {pendingApplications.length > 0 && `(${pendingApplications.length})`}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          {/* Pending Applications */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No pending applications
                  </CardContent>
                </Card>
              ) : (
                pendingApplications.map(application => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{application.full_name}</h3>
                          <Badge className="mt-2">{application.requested_role}</Badge>
                          {application.church_name && (
                            <p className="text-sm text-gray-600 mt-2">{application.church_name}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {application.city}, {application.country}
                          </p>
                        </div>
                        <Button 
                          onClick={() => setSelectedApplication(application)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Approved Applications */}
          <TabsContent value="approved">
            <div className="space-y-4">
              {approvedApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No approved applications yet
                  </CardContent>
                </Card>
              ) : (
                approvedApplications.map(application => (
                  <Card key={application.id} className="border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{application.full_name}</h3>
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            {application.requested_role}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-2">
                            Approved {application.reviewed_at && new Date(application.reviewed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Rejected Applications */}
          <TabsContent value="rejected">
            <div className="space-y-4">
              {rejectedApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No rejected applications
                  </CardContent>
                </Card>
              ) : (
                rejectedApplications.map(application => (
                  <Card key={application.id} className="border-red-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <XCircle className="w-6 h-6 text-red-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{application.full_name}</h3>
                          <Badge className="mt-2 bg-red-100 text-red-800">
                            {application.requested_role}
                          </Badge>
                          {application.rejection_reason && (
                            <p className="text-sm text-red-700 mt-2">
                              <strong>Reason:</strong> {application.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedApplication} onOpenChange={() => {
          setSelectedApplication(null);
          setRejectionReason('');
          setIsRejecting(false);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Full Name</Label>
                    <p className="text-lg font-semibold">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Requested Role</Label>
                    <p className="text-lg font-semibold">{selectedApplication.requested_role}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Location</Label>
                    <p className="text-lg font-semibold">
                      {selectedApplication.city}, {selectedApplication.country}
                    </p>
                  </div>
                  {selectedApplication.church_name && (
                    <div>
                      <Label className="text-sm text-gray-600">Church/Organization</Label>
                      <p className="text-lg font-semibold">{selectedApplication.church_name}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Background & Experience</Label>
                  <div className="bg-gray-50 p-4 rounded mt-2">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.description}</p>
                  </div>
                </div>

                {selectedApplication.reference_contact && (
                  <div>
                    <Label className="text-sm text-gray-600">Reference Contact</Label>
                    <p className="text-gray-700">{selectedApplication.reference_contact}</p>
                  </div>
                )}

                {isRejecting ? (
                  <div>
                    <Label>Rejection Reason</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this application is being rejected..."
                      className="h-24"
                    />
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => approveMutation.mutate(selectedApplication.id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  {isRejecting ? (
                    <>
                      <Button 
                        onClick={() => rejectMutation.mutate(selectedApplication.id)}
                        disabled={rejectMutation.isPending || !rejectionReason}
                        className="bg-red-600 hover:bg-red-700 flex-1"
                      >
                        Confirm Rejection
                      </Button>
                      <Button variant="outline" onClick={() => setIsRejecting(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => setIsRejecting(true)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}