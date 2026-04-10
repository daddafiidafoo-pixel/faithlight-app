import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  open: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  reviewing: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  actioned: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  dismissed: { icon: Shield, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function ModerationDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterReason, setFilterReason] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', filterStatus, filterReason],
    queryFn: async () => {
      const allReports = await base44.entities.Report.filter({}, '-created_date', 100);
      return allReports.filter((r) => {
        const statusMatch = filterStatus === 'all' || r.status === filterStatus;
        const reasonMatch = filterReason === 'all' || r.reason === filterReason;
        return statusMatch && reasonMatch;
      });
    },
    enabled: !!user?.id,
  });

  const { data: userVerifications = [] } = useQuery({
    queryKey: ['verifications'],
    queryFn: async () => {
      return base44.entities.UserVerification.filter({ is_verified: true }, '-created_date', 100);
    },
    enabled: !!user?.id,
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, adminNotes }) => {
      await base44.entities.Report.update(reportId, {
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Report updated');
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ userId, isVerified, verifiedType, verifiedLabel }) => {
      const existingVerification = userVerifications.find((v) => v.user_id === userId);
      if (existingVerification) {
        await base44.entities.UserVerification.update(existingVerification.id, {
          is_verified: isVerified,
          verified_type: verifiedType,
          verified_label: verifiedLabel,
          verified_by: user.id,
        });
      } else {
        await base44.entities.UserVerification.create({
          user_id: userId,
          is_verified: isVerified,
          verified_type: verifiedType,
          verified_label: verifiedLabel,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verifications']);
      toast.success('Verification status updated');
    },
  });

  // Only admins can access
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <h2 className="text-xl font-bold text-red-900">Access Denied</h2>
              <p className="text-red-800 mt-2">Only admins can access the moderation dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const openCount = reports.filter((r) => r.status === 'open').length;
  const reviewingCount = reports.filter((r) => r.status === 'reviewing').length;
  const actionedCount = reports.filter((r) => r.status === 'actioned').length;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Moderation Dashboard</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">{openCount}</div>
              <p className="text-sm text-gray-600 mt-1">Open Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{reviewingCount}</div>
              <p className="text-sm text-gray-600 mt-1">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{actionedCount}</div>
              <p className="text-sm text-gray-600 mt-1">Actioned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{userVerifications.length}</div>
              <p className="text-sm text-gray-600 mt-1">Verified Users</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="verified">Verified Users</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <CardTitle>User Reports</CardTitle>
                  <div className="flex gap-3 flex-wrap">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="actioned">Actioned</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterReason} onValueChange={setFilterReason}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reasons</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="scam">Scam</SelectItem>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="impersonation">Impersonation</SelectItem>
                        <SelectItem value="inappropriate">Inappropriate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <p className="text-center text-gray-600 py-12">No reports found</p>
                  ) : (
                    reports.map((report) => {
                      const StatusIcon = STATUS_CONFIG[report.status].icon;
                      return (
                        <div key={report.id} className={`p-4 rounded-lg border ${STATUS_CONFIG[report.status].bg}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <StatusIcon className={`h-4 w-4 ${STATUS_CONFIG[report.status].color}`} />
                                <h3 className="font-semibold text-gray-900">{report.reason}</h3>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{report.status}</span>
                              </div>
                              <p className="text-sm text-gray-700">
                                <strong>Reported:</strong> {report.reported_user_id}
                              </p>
                              <p className="text-sm text-gray-700">
                                <strong>Reporter:</strong> {report.reporter_id}
                              </p>
                              {report.details && (
                                <p className="text-sm text-gray-600 mt-2 italic">"{report.details}"</p>
                              )}
                              {report.admin_notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Admin Notes:</strong> {report.admin_notes}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {format(new Date(report.created_date), 'PPpp')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Select
                                value={report.status}
                                onValueChange={(newStatus) =>
                                  updateReportMutation.mutate({
                                    reportId: report.id,
                                    status: newStatus,
                                    adminNotes: report.admin_notes,
                                  })
                                }
                              >
                                <SelectTrigger className="w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="reviewing">Reviewing</SelectItem>
                                  <SelectItem value="actioned">Actioned</SelectItem>
                                  <SelectItem value="dismissed">Dismissed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Users Tab */}
          <TabsContent value="verified" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verified Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userVerifications.length === 0 ? (
                    <p className="text-center text-gray-600 py-12">No verified users yet</p>
                  ) : (
                    userVerifications.map((verification) => (
                      <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{verification.user_id}</p>
                          <p className="text-sm text-gray-600">
                            {verification.verified_label} ({verification.verified_type})
                          </p>
                          <p className="text-xs text-gray-500">
                            Verified {format(new Date(verification.verified_at), 'PPp')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleVerificationMutation.mutate({
                              userId: verification.user_id,
                              isVerified: false,
                            })
                          }
                          className="text-red-600"
                        >
                          Remove Badge
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}