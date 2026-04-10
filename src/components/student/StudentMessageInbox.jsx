import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Reply, ChevronDown, ChevronUp } from 'lucide-react';

export default function StudentMessageInbox({ studentId }) {
  const queryClient = useQueryClient();
  const [expandedThread, setExpandedThread] = useState(null);
  const [replyContent, setReplyContent] = useState({});

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['student-messages', studentId],
    queryFn: () =>
      base44.entities.CourseMessage.filter(
        { recipient_ids: studentId },
        '-created_date'
      ),
    enabled: !!studentId,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ parentMessageId, courseId, content }) => {
      const threadId = messages.find((m) => m.id === parentMessageId)?.thread_id;
      await base44.entities.CourseMessage.create({
        course_id: courseId,
        sender_id: studentId,
        sender_type: 'student',
        recipient_ids: [messages.find((m) => m.id === parentMessageId)?.sender_id],
        thread_id: threadId,
        content,
        is_reply: true,
        parent_message_id: parentMessageId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-messages', studentId]);
      setReplyContent({});
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      const message = messages.find((m) => m.id === messageId);
      const updatedReadBy = [...(message.read_by || []), studentId];
      await base44.entities.CourseMessage.update(messageId, {
        read_by: updatedReadBy,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-messages', studentId]);
    },
  });

  const handleReply = (messageId, courseId) => {
    if (replyContent[messageId]?.trim()) {
      replyMutation.mutate({
        parentMessageId: messageId,
        courseId,
        content: replyContent[messageId],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
      </div>
    );
  }

  const threadedMessages = messages.reduce((acc, msg) => {
    if (!msg.is_reply) {
      acc.push({
        main: msg,
        replies: messages.filter((m) => m.parent_message_id === msg.id),
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      {threadedMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No messages yet</p>
          </CardContent>
        </Card>
      ) : (
        threadedMessages.map((thread) => (
          <Card key={thread.main.id}>
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                setExpandedThread(
                  expandedThread === thread.main.id ? null : thread.main.id
                );
                if (!thread.main.read_by?.includes(studentId)) {
                  markAsReadMutation.mutate(thread.main.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <CardTitle className="text-lg">{thread.main.subject}</CardTitle>
                    {!thread.main.read_by?.includes(studentId) && (
                      <Badge className="bg-blue-600">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {thread.main.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(thread.main.created_date).toLocaleDateString()}
                  </p>
                </div>
                {expandedThread === thread.main.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
              </div>
            </CardHeader>

            {expandedThread === thread.main.id && (
              <CardContent className="pt-0 space-y-4 border-t">
                {/* Original Message */}
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    From Your Teacher
                  </p>
                  <p className="text-sm text-gray-700">{thread.main.content}</p>
                </div>

                {/* Replies */}
                {thread.replies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Replies
                    </p>
                    {thread.replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Your reply</p>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(reply.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-xs font-semibold text-gray-700">
                    Reply
                  </label>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyContent[thread.main.id] || ''}
                    onChange={(e) =>
                      setReplyContent({
                        ...replyContent,
                        [thread.main.id]: e.target.value,
                      })
                    }
                    rows={3}
                  />
                  <Button
                    onClick={() =>
                      handleReply(thread.main.id, thread.main.course_id)
                    }
                    disabled={
                      !replyContent[thread.main.id]?.trim() ||
                      replyMutation.isPending
                    }
                    className="gap-2"
                    size="sm"
                  >
                    {replyMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Reply className="w-3 h-3" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}