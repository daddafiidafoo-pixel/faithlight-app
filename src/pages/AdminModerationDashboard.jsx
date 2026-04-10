import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Trash2, XCircle, Loader2, Flag, Eye, Clock, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminModerationDashboard() {
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  const isAdmin = user?.role === 'admin';

  // Pending community posts
  const { data: pendingPosts = [], isLoading: loadingPending } = useQuery({
    queryKey: ['admin-pending-posts'],
    queryFn: () => base44.entities.CommunityPost.filter({ status: 'pending' }, 'created_date', 100),
    enabled: isAdmin,
    refetchInterval: 20000,
  });

  // Post reports
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['admin-post-reports'],
    queryFn: () => base44.entities.PostReport.filter({ status: 'pending' }, '-created_date', 100),
    enabled: isAdmin,
    refetchInterval: 20000,
  });

  const postAction = useMutation({
    mutationFn: async ({ post, newStatus }) => {
      await base44.entities.CommunityPost.update(post.id, {
        status: newStatus,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      });
      if (newStatus === 'removed') {
        await base44.entities.Notification.create({
          user_id: post.user_id,
          type: 'moderation',
          title: 'Post Removed',
          content: 'Your community post was removed for violating community guidelines.',
          is_read: false,
        }).catch(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-posts'] });
      setSelectedPost(null);
      toast.success('Done');
    },
  });

  const reportAction = useMutation({
    mutationFn: async ({ report, action }) => {
      await base44.entities.PostReport.update(report.id, { status: 'reviewed' });
      if (action === 'remove_post') {
        const post = await base44.entities.CommunityPost.filter({ id: report.post_id });
        if (post[0]) {
          await base44.entities.CommunityPost.update(post[0].id, {
            status: 'removed',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          });
          await base44.entities.Notification.create({
            user_id: post[0].user_id,
            type: 'moderation',
            title: 'Post Removed',
            content: 'Your community post was removed following a report.',
            is_read: false,
          }).catch(() => {});
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-post-reports'] });
      setSelectedReport(null);
      toast.success('Done');
    },
  });

  if (!user) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="font-semibold">Admin access required</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flag className="w-6 h-6 text-red-500" /> Content Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {pendingPosts.length} post{pendingPosts.length !== 1 ? 's' : ''} pending approval · {reports.length} unreviewed report{reports.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" /> Pending Posts
              {pendingPosts.length > 0 && <Badge className="bg-amber-100 text-amber-800 text-xs ml-1">{pendingPosts.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="w-4 h-4" /> Reports
              {reports.length > 0 && <Badge className="bg-red-100 text-red-800 text-xs ml-1">{reports.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* --- PENDING POSTS --- */}
          <TabsContent value="pending">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {loadingPending ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
                ) : pendingPosts.length === 0 ? (
                  <Card><CardContent className="py-16 text-center">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-500">No pending posts</p>
                  </CardContent></Card>
                ) : pendingPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`p-4 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-sm ${selectedPost?.id === post.id ? 'border-indigo-400 shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0 overflow-hidden">
                        {post.user_photo ? <img src={post.user_photo} alt="" className="w-full h-full object-cover" /> : (post.user_name?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{post.user_name}</span>
                          <Badge className="text-xs bg-amber-100 text-amber-700">{post.category}</Badge>
                          <span className="text-xs text-gray-400">{new Date(post.created_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-0.5">{post.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{post.body}</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail */}
              <div>
                {selectedPost ? (
                  <Card className="sticky top-4">
                    <CardHeader><CardTitle className="text-base">Review Post</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Title</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPost.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Body</p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">{selectedPost.body}</p>
                      </div>
                      {selectedPost.image_url && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Image</p>
                          <img src={selectedPost.image_url} alt="" className="rounded-lg max-h-40 w-full object-cover border" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-gray-400">Author</p><p className="font-medium">{selectedPost.user_name}</p></div>
                        <div><p className="text-gray-400">Category</p><p className="font-medium">{selectedPost.category}</p></div>
                        <div><p className="text-gray-400">Language</p><p className="font-medium">{selectedPost.language || 'en'}</p></div>
                      </div>
                      <div className="space-y-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => postAction.mutate({ post: selectedPost, newStatus: 'published' })}
                          disabled={postAction.isPending}
                          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve & Publish
                        </Button>
                        <Button
                          size="sm" variant="destructive"
                          onClick={() => postAction.mutate({ post: selectedPost, newStatus: 'removed' })}
                          disabled={postAction.isPending}
                          className="w-full gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Remove <Bell className="w-3 h-3 opacity-70" />
                        </Button>
                        <p className="text-xs text-gray-400 text-center">Removing notifies the author</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card><CardContent className="py-10 text-center text-gray-400">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a post to review</p>
                  </CardContent></Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* --- REPORTS --- */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {loadingReports ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
                ) : reports.length === 0 ? (
                  <Card><CardContent className="py-16 text-center">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-500">No pending reports</p>
                  </CardContent></Card>
                ) : reports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-sm ${selectedReport?.id === report.id ? 'border-red-400 shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{report.reporter_name || 'Anonymous'}</span>
                      <Badge className="text-xs bg-red-100 text-red-700">{report.reason?.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">Post ID: {report.post_id}</p>
                    {report.notes && <p className="text-xs text-gray-500 mt-1 italic">"{report.notes}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(report.created_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>

              {/* Report Detail */}
              <div>
                {selectedReport ? (
                  <Card className="sticky top-4">
                    <CardHeader><CardTitle className="text-base">Review Report</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div><p className="text-xs text-gray-400">Reported by</p><p className="font-medium">{selectedReport.reporter_name || '—'}</p></div>
                        <div><p className="text-xs text-gray-400">Reason</p><p className="font-medium capitalize">{selectedReport.reason?.replace('_', ' ')}</p></div>
                        {selectedReport.notes && <div><p className="text-xs text-gray-400">Notes</p><p className="text-sm italic text-gray-600">"{selectedReport.notes}"</p></div>}
                      </div>
                      <div className="space-y-2 pt-2 border-t">
                        <Button
                          size="sm" variant="outline"
                          onClick={() => reportAction.mutate({ report: selectedReport, action: 'dismiss' })}
                          disabled={reportAction.isPending}
                          className="w-full gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Dismiss (post is OK)
                        </Button>
                        <Button
                          size="sm" variant="destructive"
                          onClick={() => reportAction.mutate({ report: selectedReport, action: 'remove_post' })}
                          disabled={reportAction.isPending}
                          className="w-full gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Remove Post & Notify Author
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card><CardContent className="py-10 text-center text-gray-400">
                    <Flag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a report to review</p>
                  </CardContent></Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}