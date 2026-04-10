import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CircleModerationQueue() {
  const [userRole, setUserRole] = useState(null);
  const queryClient = useQueryClient();

  // Get current user role
  useEffect(() => {
    base44.auth.me().then((user) => {
      if (user?.role === 'admin') {
        setUserRole('admin');
      }
    });
  }, []);

  // Fetch flagged posts
  const { data: flaggedPosts = [] } = useQuery({
    queryKey: ['flaggedPosts'],
    queryFn: async () => {
      if (userRole !== 'admin') return [];
      return await base44.entities.CirclePrayerRequest.filter(
        { is_reported: true },
        '-report_count'
      );
    },
    enabled: userRole === 'admin',
  });

  const approveMutation = useMutation({
    mutationFn: (postId) =>
      base44.functions.invoke('deletePrayerRequest', {
        prayer_request_id: postId,
        circle_id: flaggedPosts.find((p) => p.id === postId)?.circle_id,
        is_admin: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedPosts'] });
      toast.success('Post removed');
    },
    onError: (err) => toast.error(err.message),
  });

  const dismissMutation = useMutation({
    mutationFn: async (postId) => {
      const post = flaggedPosts.find((p) => p.id === postId);
      await base44.entities.CirclePrayerRequest.update(postId, {
        is_reported: false,
        reported_by: [],
        report_count: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedPosts'] });
      toast.success('Report dismissed');
    },
    onError: (err) => toast.error(err.message),
  });

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 text-center">
            <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Admin access only</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Prayer Circle Moderation
        </h1>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({flaggedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {flaggedPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No flagged posts</p>
              </Card>
            ) : (
              flaggedPosts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.user_name}
                      </p>
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <Flag className="w-4 h-4" />
                        {post.report_count} report(s)
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-800 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                    {post.text}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => dismissMutation.mutate(post.id)}
                      disabled={dismissMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Dismiss Report
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(post.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Post
                    </Button>
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