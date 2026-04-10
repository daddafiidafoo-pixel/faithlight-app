import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { useUITranslation } from '../useUITranslation';

// Simple rate limit: 1 message per 2s per user
const lastSent = {};

export default function RoomChat({ roomId, user, isHost, isCohost, allowChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const { t } = useUITranslation();

  useEffect(() => {
    base44.entities.LiveRoomChat.filter({ room_id: roomId }, 'created_date', 100)
      .then(msgs => setMessages(msgs.filter(m => !m.is_deleted)));
  }, [roomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const unsub = base44.entities.LiveRoomChat.subscribe(event => {
      if (event.data?.room_id !== roomId) return;
      if (event.type === 'create' && !event.data.is_deleted) {
        setMessages(prev => [...prev, event.data]);
      }
      if (event.type === 'update' && event.data.is_deleted) {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });
    return unsub;
  }, [roomId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !allowChat) return;
    const now = Date.now();
    if (lastSent[user.id] && now - lastSent[user.id] < 2000) return; // rate-limit
    lastSent[user.id] = now;

    setSending(true);
    await base44.entities.LiveRoomChat.create({
      room_id: roomId,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
      message: text.trim(),
      message_type: 'text',
    });
    setText('');
    setSending(false);
  };

  const handleDelete = (msgId) => {
    base44.entities.LiveRoomChat.update(msgId, { is_deleted: true });
  };

  return (
    <Card className="flex flex-col" style={{ height: '360px' }}>
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4" /> Live Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 pt-0">
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
          {messages.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">No messages yet. Say hello! 👋</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className="group flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {msg.sender_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-indigo-700 mr-1">{msg.sender_name}</span>
                <span className="text-xs text-gray-700 break-words">{msg.message}</span>
              </div>
              {(isHost || isCohost) && (
                <Button size="icon" variant="ghost" className="w-5 h-5 opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={() => handleDelete(msg.id)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {allowChat ? (
          <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
            <Input
              className="text-xs h-8"
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={sending}
            />
            <Button type="submit" size="icon" className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 flex-shrink-0" disabled={!text.trim() || sending}>
              <Send className="w-3 h-3" />
            </Button>
          </form>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2 flex-shrink-0">
            {t('live.chat.disabled', 'Chat has been disabled by the host.')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}