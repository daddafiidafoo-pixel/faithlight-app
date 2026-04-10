import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LiveChatPanel({ streamId, user, isLive }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['stream-chat', streamId],
    queryFn: async () => {
      const msgs = await base44.entities.LiveStreamChat.filter(
        { stream_id: streamId, is_deleted: false },
        '-created_date',
        200
      );
      return msgs.reverse();
    },
    refetchInterval: isLive ? 3000 : false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg) => {
      if (!user) {
        toast.error('Please log in to chat');
        return;
      }
      return await base44.entities.LiveStreamChat.create({
        stream_id: streamId,
        user_id: user.id,
        user_name: user.full_name || user.email,
        message: msg,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stream-chat', streamId]);
      setMessage('');
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <h3 className="font-bold">
          {isLive ? 'Live Chat' : 'Chat Replay'}
        </h3>
        <p className="text-xs text-gray-600">{messages.length} messages</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`${msg.is_pinned ? 'bg-yellow-50 border border-yellow-200 p-2 rounded' : ''}`}>
              {msg.is_pinned && (
                <Pin className="w-3 h-3 text-yellow-600 inline mr-1" />
              )}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{msg.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(msg.created_date), 'p')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {isLive && user && (
        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message..."
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {isLive && !user && (
        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-sm text-gray-600">Log in to join the chat</p>
        </div>
      )}
    </div>
  );
}