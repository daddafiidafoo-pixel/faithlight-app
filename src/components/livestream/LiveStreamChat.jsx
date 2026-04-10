import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Heart, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LiveStreamChat({ stream, user }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('chat');
  const messagesEndRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['stream-messages', stream.id],
    queryFn: async () => {
      return await base44.entities.LiveStreamMessage.filter(
        { stream_id: stream.id, is_deleted: false },
        'created_date',
        200
      );
    },
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, type }) => {
      if (!user) {
        toast.error('Please log in to chat');
        return;
      }
      
      return await base44.entities.LiveStreamMessage.create({
        stream_id: stream.id,
        user_id: user.id,
        user_name: user.display_name || user.full_name || user.email,
        message,
        message_type: type,
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['stream-messages', stream.id]);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate({ message: message.trim(), type: messageType });
  };

  const getMessageBadge = (type) => {
    const badges = {
      prayer_request: <Badge className="bg-purple-100 text-purple-800 text-xs">🙏 Prayer</Badge>,
      question: <Badge className="bg-blue-100 text-blue-800 text-xs">❓ Question</Badge>,
      announcement: <Badge className="bg-yellow-100 text-yellow-800 text-xs">📢 Announcement</Badge>,
    };
    return badges[type] || null;
  };

  return (
    <div className="h-[600px] flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold">Live Chat</h3>
        <p className="text-xs text-gray-600">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.is_pinned ? 'bg-yellow-50 p-2 rounded-lg' : ''}>
            {msg.is_pinned && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs mb-1">📌 Pinned</Badge>
            )}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{msg.user_name}</span>
                  {getMessageBadge(msg.message_type)}
                  <span className="text-xs text-gray-500">
                    {format(new Date(msg.created_date), 'HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {user ? (
        <form onSubmit={handleSend} className="p-4 border-t bg-white">
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              size="sm"
              variant={messageType === 'chat' ? 'default' : 'outline'}
              onClick={() => setMessageType('chat')}
            >
              Chat
            </Button>
            <Button
              type="button"
              size="sm"
              variant={messageType === 'prayer_request' ? 'default' : 'outline'}
              onClick={() => setMessageType('prayer_request')}
            >
              🙏 Prayer
            </Button>
            <Button
              type="button"
              size="sm"
              variant={messageType === 'question' ? 'default' : 'outline'}
              onClick={() => setMessageType('question')}
            >
              ❓ Question
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim() || sendMessageMutation.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t bg-white text-center">
          <p className="text-sm text-gray-600">Log in to participate in chat</p>
        </div>
      )}
    </div>
  );
}