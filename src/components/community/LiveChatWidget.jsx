import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function LiveChatWidget({ eventId, userId }) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['live-chat', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      // Using Message entity filtered by event/group context
      // This is a simplified approach - you may want to create a dedicated LiveMessage entity
      const msgs = await base44.entities.Message.filter(
        { group_id: eventId },
        'created_date',
        100
      );
      return msgs;
    },
    refetchInterval: 2000,
    enabled: !!eventId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!eventId) return;
    
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data.group_id === eventId && event.type === 'create') {
        refetchMessages();
      }
    });

    return unsubscribe;
  }, [eventId, refetchMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!userId || !eventId) throw new Error('Invalid state');
      
      return base44.entities.Message.create({
        group_id: eventId,
        sender_id: userId,
        content,
        message_type: 'text',
      });
    },
    onSuccess: () => {
      setMessageInput('');
      refetchMessages();
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  return (
    <Card className="flex flex-col h-96">
      <CardHeader className="border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Live Chat
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p className="text-sm">No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-900">
                    {msg.sender_id === userId ? 'You' : `User ${msg.sender_id.slice(0, 6)}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 break-words">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="border-t p-3 bg-white flex gap-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          disabled={sendMessageMutation.isPending}
          className="text-sm"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || sendMessageMutation.isPending}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}