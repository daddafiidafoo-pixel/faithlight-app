import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Trash2, CheckCircle, Eye, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function SermonModerationPanel({ user }) {
  const queryClient = useQueryClient();

  // All hooks must be called before any early return
  const { data: flaggedComments = [] } = useQuery({
    queryKey: ['all-flagged-comments'],
    queryFn: () => base44.entities.CommentFlag.filter({ resolved: false }, '-created_date', 100),
    enabled: user?.user_role === 'admin',
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['all-comments'],
    queryFn: () => base44.entities.SermonComment.list('-created_date', 200),
    enabled: user?.user_role === 'admin',
  });

  const { data: sermons = [] } = useQuery({
    queryKey: ['all-sermons-moderation'],
    queryFn: () => base44.entities.SharedSermon.list('-created_date', 100),
    enabled: user?.user_role === 'admin',
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const comment = allComments.find(c => c.id === commentId);
      if (comment) {
        await base44.entities.SermonComment.delete(commentId);
        // Update sermon comment count
        const sermon = sermons.find(s => s.id === comment.sermon_id);
        if (sermon) {
          await base44.entities.SharedSermon.update(sermon.id, {
            comments_count: Math.max((sermon.comments_count || 0) - 1, 0)
          });
        }
        // Resolve all flags for this comment
        const flags = flaggedComments.filter(f => f.comment_id === commentId);
        await Promise.all(flags.map(f => 
          base44.entities.CommentFlag.update(f.id, { resolved: true })
        ));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-flagged-comments'] });
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['all-sermons-moderation'] });
      toast.success('Comment deleted');
    },
  });

  // Resolve flag (keep comment)
  const resolveFlagMutation = useMutation({
    mutationFn: (flagId) => base44.entities.CommentFlag.update(flagId, { resolved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-flagged-comments'] });
      toast.success('Flag resolved');
    },
  });

  if (user?.user_role !== 'admin') {
    return null;
  }

  const flaggedCommentsWithDetails = flaggedComments.map(flag => {
    const comment = allComments.find(c => c.id === flag.comment_id);
    const sermon = sermons.find(s => s.id === flag.sermon_id);
    return { flag, comment, sermon };
  }).filter(item => item.comment);

  // Get recent comments for monitoring
  const recentComments = allComments.slice(0, 20).map(comment => {
    const sermon = sermons.find(s => s.id === comment.sermon_id);
    return { comment, sermon };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-600" />
          Moderation Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flagged">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flagged" className="gap-2">
              <Flag className="w-4 h-4" />
              Flagged ({flaggedCommentsWithDetails.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Eye className="w-4 h-4" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged" className="space-y-4 mt-4">
            {flaggedCommentsWithDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No flagged comments to review</p>
              </div>
            ) : (
              flaggedCommentsWithDetails.map(({ flag, comment, sermon }) => (
                <Card key={flag.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive" className="text-xs">
                              {flag.reason}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Flagged {formatDistanceToNow(new Date(flag.created_date), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            On sermon: <strong>{sermon?.title || 'Unknown'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm">{comment.author_name}</p>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Comment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => resolveFlagMutation.mutate(flag.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Keep & Resolve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-3 mt-4">
            {recentComments.map(({ comment, sermon }) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{comment.author_name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    On: <strong>{sermon?.title || 'Unknown sermon'}</strong>
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {comment.likes_count || 0} likes
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}