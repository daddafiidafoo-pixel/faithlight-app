import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function GroupChatPanel({ groupId, user, onClose }) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages with real-time subscription
  const { data: messages = [], refetch } = useQuery({
    queryKey: ['group-chat', groupId],
    queryFn: async () => {
      try {
        return await base44.entities.GroupChatMessage.filter(
          { group_id: groupId },
          'created_date',
          100
        );
      } catch {
        return [];
      }
    },
    refetchInterval: 2000, // Poll every 2 seconds for real-time feel
  });

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.GroupChatMessage.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        refetch();
      }
    });

    return () => unsubscribe();
  }, [groupId, refetch]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await base44.entities.GroupChatMessage.create({
        group_id: groupId,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        message: newMessage.trim(),
        message_type: 'text'
      });

      setNewMessage('');
      refetch();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="h-96 flex flex-col border-indigo-200 bg-white">
      {/* Header */}
      <CardHeader className="border-b pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Group Chat</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      {/* Messages Container */}
      <CardContent className="flex-1 overflow-y-auto space-y-3 py-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender_id !== user.id && msg.sender_avatar && (
                <img
                  src={msg.sender_avatar}
                  alt={msg.sender_name}
                  className="w-7 h-7 rounded-full flex-shrink-0"
                />
              )}
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender_id === user.id
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {msg.sender_id !== user.id && (
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.sender_name}
                  </p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isSending}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          size="sm"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}