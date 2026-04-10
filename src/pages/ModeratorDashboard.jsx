import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';

export default function ModeratorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
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
    checkAuth();
  }, [navigate]);

  const { data: openReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports-open'],
    queryFn: () => base44.entities.Report.filter({ status: 'open' }, '-created_date'),
    enabled: !!user,
  });

  const { data: allSafetyProfiles = [] } = useQuery({
    queryKey: ['safety-profiles'],
    queryFn: () => base44.entities.UserSafetyProfile.list(),
    enabled: !!user,
  });

  const { data: allActions = [] } = useQuery({
    queryKey: ['moderation-actions'],
    queryFn: () => base44.entities.ModerationAction.list('-created_date', 50),
    enabled: !!user,
  });

  const suspendedUsers = allSafetyProfiles.filter((p) => p.status === 'suspended');
  const bannedUsers = allSafetyProfiles.filter((p) => p.status === 'banned');

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, actionTaken }) => {
      return await base44.entities.Report.update(reportId, {
        status,
        action_taken: actionTaken,
        reviewed_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-open'] });
      setSelectedReport(null);
    },
  });

  const createActionMutation = useMutation({
    mutationFn: async ({ targetUserId, actionType, duration, reason, reportId }) => {
      await base44.entities.ModerationAction.create({
        target_user_id: targetUserId,
        action_type: actionType,
        duration_minutes: duration,
        reason,
        context_type: 'platform',
        performed_by: user.id,
        related_report_id: reportId,
      });

      // Update safety profile
      const safety = allSafetyProfiles.find((s) => s.user_id === targetUserId);
      if (actionType === 'ban') {
        await base44.entities.UserSafetyProfile.update(safety?.id || '', {
          status: 'banned',
          strikes: 3,
          ban_reason: reason,
          last_action_at: new Date().toISOString(),
          last_action_by: user.id,
        });
      } else if (actionType === 'suspend') {
        await base44.entities.UserSafetyProfile.update(safety?.id || '', {
          status: 'suspended',
          suspended_until: new Date(Date.now() + (duration || 24 * 60) * 60 * 1000).toISOString(),
          ban_reason: reason,
          last_action_at: new Date().toISOString(),
          last_action_by: user.id,
        });
      } else if (actionType === 'warn') {
        const newStrikes = (safety?.strikes || 0) + 1;
        await base44.entities.UserSafetyProfile.update(safety?.id || '', {
          strikes: newStrikes,
          status: newStrikes >= 3 ? 'banned' : safety?.status || 'active',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-actions'] });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const handleActionOnReport = (report, actionType, duration = null) => {
    createActionMutation.mutate(
      {
        targetUserId: report.reported_user_id,
        actionType,
        duration,
        reason: `Report: ${report.reason} - ${report.details}`,
        reportId: report.id,
      },
      {
        onSuccess: () => {
          updateReportMutation.mutate({
            reportId: report.id,
            status: 'actioned',
            actionTaken: actionType,
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Moderator Dashboard</h1>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">
              Reports
              {openReports.length > 0 && (
                <Badge className="ml-2 bg-red-600">{openReports.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions">Moderation Actions</TabsTrigger>
            <TabsTrigger value="users">User Status</TabsTrigger>
          </TabsList>

          {/* Reports Queue */}
          <TabsContent value="reports" className="m-0">
            {reportsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
              </div>
            ) : openReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <p className="text-gray-600">No open reports</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {openReports.map((report) => (
                  <Card
                    key={report.id}
                    className={`cursor-pointer transition-colors ${
                      selectedReport?.id === report.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">{report.reason}</Badge>
                            <Badge variant="outline">{report.context_type}</Badge>
                            <span className="text-xs text-gray-600">
                              {new Date(report.created_date).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900">
                            Reported by: {report.reporter_id.substring(0, 8)}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{report.details}</p>
                        </div>
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>

                    {selectedReport?.id === report.id && (
                      <CardContent className="border-t pt-4 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <p className="text-sm font-semibold text-gray-900">Take Action:</p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleActionOnReport(report, 'warn')
                              }
                              disabled={createActionMutation.isPending}
                            >
                              ⚠️ Warn
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleActionOnReport(report, 'suspend', 24 * 60)
                              }
                              disabled={createActionMutation.isPending}
                            >
                              🔒 Suspend 24h
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleActionOnReport(report, 'suspend', 72 * 60)
                              }
                              disabled={createActionMutation.isPending}
                            >
                              🔒 Suspend 72h
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleActionOnReport(report, 'ban')
                              }
                              disabled={createActionMutation.isPending}
                            >
                              ⛔ Ban
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateReportMutation.mutate({
                                  reportId: report.id,
                                  status: 'dismissed',
                                  actionTaken: 'dismissed',
                                })
                              }
                              disabled={updateReportMutation.isPending}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Moderation Actions Log */}
          <TabsContent value="actions" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allActions.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No actions yet</p>
                  ) : (
                    allActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {action.action_type.toUpperCase()}: {action.target_user_id.substring(0, 8)}
                          </p>
                          <p className="text-xs text-gray-600">{action.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(action.created_date).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            action.action_type === 'ban'
                              ? 'destructive'
                              : action.action_type === 'suspend'
                                ? 'outline'
                                : 'secondary'
                          }
                        >
                          {action.action_type}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Status Overview */}
          <TabsContent value="users" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suspended Users ({suspendedUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suspendedUsers.length === 0 ? (
                      <p className="text-gray-600 text-sm">None</p>
                    ) : (
                      suspendedUsers.map((profile) => (
                        <div key={profile.id} className="p-2 border rounded text-sm">
                          <p className="font-semibold text-gray-900">{profile.user_id.substring(0, 8)}</p>
                          <p className="text-xs text-gray-600">
                            Until: {new Date(profile.suspended_until).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{profile.ban_reason}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Banned Users ({bannedUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bannedUsers.length === 0 ? (
                      <p className="text-gray-600 text-sm">None</p>
                    ) : (
                      bannedUsers.map((profile) => (
                        <div key={profile.id} className="p-2 border rounded text-sm">
                          <p className="font-semibold text-gray-900">{profile.user_id.substring(0, 8)}</p>
                          <p className="text-xs text-gray-600">
                            Strikes: {profile.strikes}/3
                          </p>
                          <p className="text-xs text-gray-500">{profile.ban_reason}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}