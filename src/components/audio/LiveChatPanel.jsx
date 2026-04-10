import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pin, Trash2, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ReportUserModal from '@/components/moderation/ReportUserModal';

export default function LiveChatPanel({
  sessionId,
  userId,
  userName,
  isHost,
  isCoHost,
  maxHeight = 'h-96',
}) {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingUser, setReportingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['live-chat-messages', sessionId],
    queryFn: () => base44.entities.LiveSessionChat.filter({ session_id: sessionId }),
    refetchInterval: 1000, // Real-time polling
  });

  const { data: userMute } = useQuery({
    queryKey: ['user-mute', sessionId, userId],
    queryFn: async () => {
      const mutes = await base44.entities.ParticipantMute.filter({
        session_id: sessionId,
        user_id: userId,
        is_active: true,
      });
      return mutes[0];
    },
  });

  const pinnedMessages = messages.filter(m => m.is_pinned);
  const regularMessages = messages.filter(m => !m.is_pinned);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!messageText.trim()) return;
      return await base44.entities.LiveSessionChat.create({
        session_id: sessionId,
        user_id: userId,
        user_name: userName,
        message: messageText,
        message_type: 'text',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-chat-messages', sessionId]);
      setMessageText('');
      scrollToBottom();
    },
  });

  const pinMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const message = messages.find(m => m.id === messageId);
      return await base44.entities.LiveSessionChat.update(messageId, {
        is_pinned: true,
        pinned_by_user_id: userId,
        pinned_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-chat-messages', sessionId]);
      toast.success('Message pinned');
    },
  });

  const unpinMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      return await base44.entities.LiveSessionChat.update(messageId, {
        is_pinned: false,
        pinned_by_user_id: null,
        pinned_at: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-chat-messages', sessionId]);
      toast.success('Message unpinned');
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      return await base44.entities.LiveSessionChat.delete(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-chat-messages', sessionId]);
      toast.success('Message deleted');
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    sendMessageMutation.mutate();
  };

  const canModerate = isHost || isCoHost;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Live Chat
          <Badge variant="outline">{messages.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4 p-4">
        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="space-y-2 pb-3 border-b">
            {pinnedMessages.map(msg => (
              <div
                key={msg.id}
                className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Pin className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                      <p className="text-xs font-semibold text-yellow-900 truncate">
                        {msg.user_name}
                      </p>
                    </div>
                    <p className="text-xs text-yellow-800 mt-1 break-words">
                      {msg.message}
                    </p>
                  </div>
                  {canModerate && (
                    <Button
                      onClick={() => unpinMessageMutation.mutate(msg.id)}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0"
                    >
                      <Pin className="w-3 h-3 text-yellow-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages Scroll Area */}
        <ScrollArea className={`flex-1 ${maxHeight}`}>
          <div className="space-y-2 pr-4">
            {regularMessages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">
                No messages yet
              </p>
            ) : (
              regularMessages.map(msg => (
                <div key={msg.id} className="group p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">
                        {msg.user_name}
                      </p>
                      <p className="text-sm text-gray-800 break-words">
                        {msg.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.created_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Message Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {canModerate && (
                        <>
                          <Button
                            onClick={() => pinMessageMutation.mutate(msg.id)}
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            title="Pin message"
                          >
                            <Pin className="w-3 h-3 text-gray-400" />
                          </Button>
                          <Button
                            onClick={() => deleteMessageMutation.mutate(msg.id)}
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        </>
                      )}
                      {!canModerate && userId !== msg.user_id && (
                        <Button
                          onClick={() => {
                            setReportingUser({ user_id: msg.user_id, user_name: msg.user_name });
                            setReportModalOpen(true);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          title="Report user"
                        >
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        {userMute ? (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-center">
            <p className="text-sm text-red-800 font-semibold">
              You've been muted for {userMute.mute_duration_minutes} minutes
            </p>
            <p className="text-xs text-red-600">
              {userMute.reason && `Reason: ${userMute.reason}`}
            </p>
          </div>
        ) : (
          <div className="flex gap-2 flex-shrink-0 pt-2 border-t">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="text-sm"
              maxLength={200}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !messageText.trim()}
              size="sm"
              className="flex-shrink-0"
            >
              Send
            </Button>
          </div>
        )}
      </CardContent>

      {/* Report Modal */}
      <ReportUserModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        sessionId={sessionId}
        reportedUserId={reportingUser?.user_id}
        reportedUserName={reportingUser?.user_name}
        reporterUserId={userId}
        reporterName={userName}
      />
    </Card>
  );
}