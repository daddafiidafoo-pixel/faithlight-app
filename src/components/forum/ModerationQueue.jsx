import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, AlertCircle, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ModerationQueue() {
  const queryClient = useQueryClient();
  const [selectedReply, setSelectedReply] = useState(null);

  const { data: pendingTopics = [] } = useQuery({
    queryKey: ['pending-topics'],
    queryFn: () => base44.entities.ForumTopic.filter({ status: 'pending' }),
  });

  const { data: pendingReplies = [] } = useQuery({
    queryKey: ['pending-replies'],
    queryFn: () => base44.entities.ForumReply.filter({ status: 'pending' }),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ type, id, currentStatus }) => {
      if (type === 'topic') {
        await base44.entities.ForumTopic.update(id, { status: 'active' });
      } else {
        await base44.entities.ForumReply.update(id, { status: 'active' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-topics']);
      queryClient.invalidateQueries(['pending-replies']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      if (type === 'topic') {
        await base44.entities.ForumTopic.update(id, { status: 'rejected' });
      } else {
        await base44.entities.ForumReply.update(id, { status: 'rejected' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-topics']);
      queryClient.invalidateQueries(['pending-replies']);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          Moderation Queue
        </h2>
      </div>

      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="topics">
            Topics ({pendingTopics.length})
          </TabsTrigger>
          <TabsTrigger value="replies">
            Replies ({pendingReplies.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Topics */}
        <TabsContent value="topics" className="space-y-4">
          {pendingTopics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-600">
                No pending topics to review
              </CardContent>
            </Card>
          ) : (
            pendingTopics.map(topic => (
              <Card key={topic.id} className="border-amber-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{topic.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        By {topic.author_name} • {new Date(topic.created_date).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                    <ReactMarkdown>{topic.content}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectMutation.mutate({ type: 'topic', id: topic.id })}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate({ type: 'topic', id: topic.id })}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Replies */}
        <TabsContent value="replies" className="space-y-4">
          {pendingReplies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-600">
                No pending replies to review
              </CardContent>
            </Card>
          ) : (
            pendingReplies.map(reply => (
              <Card key={reply.id} className="border-amber-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-sm">{reply.author_name}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(reply.created_date).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                    <ReactMarkdown>{reply.content}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectMutation.mutate({ type: 'reply', id: reply.id })}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate({ type: 'reply', id: reply.id })}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}