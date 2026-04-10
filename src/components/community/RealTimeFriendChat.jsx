import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Check, CheckCheck } from 'lucide-react';

/**
 * Real-time chat for friends
 * Supports read receipts, typing indicators (via polling)
 */
export default function RealTimeFriendChat({ friendUserId, friendName, currentUser }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef(null);

  // Get or create chat session
  const { data: chatSession } = useQuery({
    queryKey: ['friend-chat', friendUserId],
    queryFn: async () => {
      // Get RealTimeChat between current user and friend
      const chats = await base44.entities.RealTimeChat.filter(
        {
          $or: [
            { user_id_a: currentUser.id, user_id_b: friendUserId },
            { user_id_a: friendUserId, user_id_b: currentUser.id }
          ]
        }
      );
      
      if (chats.length > 0) return chats[0];

      // Create new chat if doesn't exist
      const newChat = await base44.entities.RealTimeChat.create({
        user_id_a: [currentUser.id, friendUserId].sort()[0],
        user_id_b: [currentUser.id, friendUserId].sort()[1],
      });
      return newChat;
    },
  });

  // Load messages (poll every 2 seconds for real-time effect)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', chatSession?.id],
    queryFn: async () => {
      if (!chatSession) return [];
      const msgs = await base44.entities.ChatMessage.filter(
        { chat_id: chatSession.id },
        '-created_at',
        100
      );
      return msgs.reverse();
    },
    enabled: !!chatSession,
    refetchInterval: 2000, // Poll for new messages
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const msg = await base44.entities.ChatMessage.create({
        chat_id: chatSession.id,
        sender_id: currentUser.id,
        content,
      });

      // Update chat last message
      await base44.entities.RealTimeChat.update(chatSession.id, {
        last_message: content.substring(0, 50),
        last_message_at: new Date().toISOString(),
      });

      // Create notification for recipient
      await base44.functions.invoke('createCommunityNotification', {
        user_id: friendUserId,
        type: 'friend_message',
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        title: `Message from ${currentUser.full_name}`,
        message: content.substring(0, 100),
        related_id: chatSession.id,
        related_type: 'chat',
        action_url: `/DirectMessages?friend=${friendUserId}`,
      });

      return msg;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (!messages.length) return;
    
    messages.forEach(msg => {
      if (msg.sender_id === friendUserId && !msg.is_read) {
        base44.entities.ChatMessage.update(msg.id, { 
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
    });

    queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
  }, [messages, friendUserId]);

  // Handle typing indicator
  const handleTyping = (text) => {
    setMessage(text);
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">{friendName}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === currentUser.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-75">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                  {msg.sender_id === currentUser.id && (
                    msg.is_read ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-xs text-gray-500 italic">
          {friendName} is typing...
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="submit"
          disabled={!message.trim() || sendMutation.isPending}
          className="gap-2"
        >
          {sendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}