import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2, AlertCircle } from 'lucide-react';


export default function ServiceChatPanel({ roomId, user, isHost }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await base44.entities.ServiceChat.filter(
          { room_id: roomId },
          '-created_date',
          50
        );
        setMessages(msgs.filter((m) => !m.is_deleted).reverse());
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    };
    loadMessages();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = base44.entities.ServiceChat.subscribe((event) => {
      if (event.data.room_id === roomId) {
        if (event.type === 'create') {
          setMessages((prev) => [...prev, event.data]);
        }
        if (event.type === 'update' && event.data.is_deleted) {
          setMessages((prev) => prev.filter((m) => m.id !== event.id));
        }
      }
    });
    return unsubscribe;
  }, [roomId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const modResult = { isFlagged: false };

      await base44.entities.ServiceChat.create({
        room_id: roomId,
        user_id: user.id,
        user_name: user.full_name,
        message: newMessage.trim(),
        is_flagged: modResult.isFlagged,
        flag_reason: modResult.reason,
        flag_severity: modResult.severity,
        sent_at: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await base44.entities.ServiceChat.update(msgId, { is_deleted: true });
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group p-2 rounded-lg ${
                msg.is_flagged
                  ? 'bg-orange-100 border border-orange-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-gray-900">
                      {msg.user_name}
                    </p>
                    {msg.is_flagged && (
                      <AlertCircle className="w-3 h-3 text-orange-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-700 break-words">{msg.message}</p>
                  {msg.is_flagged && (
                    <p className="text-xs text-orange-700 mt-1">
                      Flagged: {msg.flag_reason}
                    </p>
                  )}
                </div>
                {isHost && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-4 h-4"
                    onClick={() => handleDelete(msg.id)}
                  >
                    <Trash2 className="w-2 h-2 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          placeholder="Send a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          className="text-xs"
        />
        <Button size="icon" disabled={loading || !newMessage.trim()} className="bg-indigo-600">
          <Send className="w-3 h-3" />
        </Button>
      </form>
    </div>
  );
}
