import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DirectMessagePanel({ recipientId, recipientName, user, onClose }) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversation
  const { data: messages = [], refetch } = useQuery({
    queryKey: ['direct-messages', user.id, recipientId],
    queryFn: async () => {
      try {
        const sent = await base44.entities.DirectMessage.filter(
          { sender_id: user.id, recipient_id: recipientId },
          'created_date',
          50
        );
        const received = await base44.entities.DirectMessage.filter(
          { sender_id: recipientId, recipient_id: user.id },
          'created_date',
          50
        );

        const allMessages = [...sent, ...received].sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        );

        // Mark received messages as read
        received.forEach((msg) => {
          if (!msg.is_read) {
            base44.entities.DirectMessage.update(msg.id, {
              is_read: true,
              read_at: new Date().toISOString()
            }).catch(() => {});
          }
        });

        return allMessages;
      } catch {
        return [];
      }
    },
    refetchInterval: 2000,
  });

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      const msg = event.data;
      if (
        (msg.sender_id === user.id && msg.recipient_id === recipientId) ||
        (msg.sender_id === recipientId && msg.recipient_id === user.id)
      ) {
        refetch();
      }
    });

    return () => unsubscribe();
  }, [user.id, recipientId, refetch]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await base44.entities.DirectMessage.create({
        sender_id: user.id,
        recipient_id: recipientId,
        sender_name: user.full_name,
        recipient_name: recipientName,
        message: newMessage.trim()
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
    <Card className="h-96 flex flex-col border-blue-200 bg-white">
      {/* Header */}
      <CardHeader className="border-b pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">{recipientName}</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto space-y-3 py-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">Start a conversation with {recipientName}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender_id === user.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words">{msg.message}</p>
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                  {msg.sender_id === user.id && msg.is_read && (
                    <span className="text-[10px]">✓✓</span>
                  )}
                </div>
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
          className="bg-blue-600 hover:bg-blue-700 gap-2"
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