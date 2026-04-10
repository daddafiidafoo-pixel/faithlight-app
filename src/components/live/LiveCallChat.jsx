import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, X, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function LiveCallChat({ roomId, user, isPrivateChat = false, recipientId = null }) {
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(!isPrivateChat);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Load messages
  const { data: messages = [] } = useQuery({
    queryKey: ['callChat', roomId, isPrivateChat ? recipientId : null],
    queryFn: async () => {
      const query = {
        room_id: roomId,
        message_type: 'text'
      };
      if (isPrivateChat) {
        query.recipient_id = recipientId;
      }
      return base44.entities.LiveCallChat.filter(query);
    },
    refetchInterval: 2000
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (msg) =>
      base44.entities.LiveCallChat.create({
        room_id: roomId,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        recipient_id: isPrivateChat ? recipientId : null,
        message: msg,
        message_type: 'text'
      }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['callChat'] });
    }
  });

  // Send reaction
  const sendReactionMutation = useMutation({
    mutationFn: (emoji) =>
      base44.entities.LiveCallChat.create({
        room_id: roomId,
        sender_id: user.id,
        sender_name: user.full_name,
        recipient_id: isPrivateChat ? recipientId : null,
        message: emoji,
        message_type: 'reaction'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callChat'] });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  if (!expanded) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setExpanded(true)}
        className="gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        Chat
      </Button>
    );
  }

  return (
    <Card className="flex flex-col h-96 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">
          {isPrivateChat ? 'Private Message' : 'Room Chat'}
        </h3>
        <button onClick={() => setExpanded(false)}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            {msg.message_type === 'text' ? (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-300 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs">{msg.sender_name}</p>
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              </div>
            ) : (
              <div className="text-2xl text-center">{msg.message}</div>
            )}
          </div>
        ))}
      </div>

      {/* Reactions */}
      <div className="px-3 py-2 border-t flex gap-1">
        {['❤️', '👍', '😂', '🙏'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReactionMutation.mutate(emoji)}
            className="text-lg hover:scale-125 transition"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sendMutation.isPending || !message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}