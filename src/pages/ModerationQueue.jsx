import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ModerationQueue() {
  const [selectedReport, setSelectedReport] = useState(null);
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Fetch flagged content
  const { data: flaggedPosts = [] } = useQuery({
    queryKey: ['flaggedPosts'],
    queryFn: async () => {
      try {
        return await base44.entities.PrayerPostFlag.filter(
          { status: 'pending' },
          '-created_date'
        );
      } catch {
        return [];
      }
    },
  });

  // Approve report (remove content)
  const approveMutation = useMutation({
    mutationFn: async (flagId) => {
      return base44.entities.PrayerPostFlag.update(flagId, {
        status: 'approved',
        resolved_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedPosts'] });
      toast.success('Content removed');
    },
  });

  // Reject report (no action)
  const rejectMutation = useMutation({
    mutationFn: async (flagId) => {
      return base44.entities.PrayerPostFlag.update(flagId, {
        status: 'rejected',
        resolved_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedPosts'] });
      toast.success('Report dismissed');
    },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-gray-600">Admin access required</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600">Review and manage reported content</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({flaggedPosts.filter(f => f.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({flaggedPosts.filter(f => f.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({flaggedPosts.filter(f => f.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {flaggedPosts.filter(f => f.status === 'pending').length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No pending reports</p>
              </Card>
            ) : (
              flaggedPosts.filter(f => f.status === 'pending').map((flag) => (
                <Card key={flag.id} className="p-6 border-l-4 border-l-yellow-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Report #{flag.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600 mt-1">Reason: {flag.reason}</p>
                        <p className="text-sm text-gray-600">Preview: "{flag.content_preview}"</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reported by: {flag.reported_by_email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {new Date(flag.created_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => approveMutation.mutate(flag.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Content
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate(flag.id)}
                      disabled={rejectMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      No Action
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {flaggedPosts.filter(f => f.status === 'approved').length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No approved reports</p>
              </Card>
            ) : (
              flaggedPosts.filter(f => f.status === 'approved').map((flag) => (
                <Card key={flag.id} className="p-6 border-l-4 border-l-red-500 bg-red-50">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Content Removed</h3>
                      <p className="text-sm text-gray-600 mt-1">{flag.reason}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Resolved: {new Date(flag.resolved_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {flaggedPosts.filter(f => f.status === 'rejected').length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No rejected reports</p>
              </Card>
            ) : (
              flaggedPosts.filter(f => f.status === 'rejected').map((flag) => (
                <Card key={flag.id} className="p-6 border-l-4 border-l-green-500 bg-green-50">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Report Dismissed</h3>
                      <p className="text-sm text-gray-600 mt-1">{flag.reason}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Resolved: {new Date(flag.resolved_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}