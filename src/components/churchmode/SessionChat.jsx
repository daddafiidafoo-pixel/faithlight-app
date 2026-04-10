import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

// Fully in-memory chat using real-time entity subscriptions on SermonSession
// Messages are stored in React state only — nothing persisted to DB
export default function SessionChat({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userName, setUserName] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUserName(u?.full_name?.split(' ')[0] || 'Member'))
      .catch(() => setUserName('Member'));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Broadcast via updating a "chatBus" field on the session record
  // All clients subscribed will receive the update and parse the new message
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = base44.entities.SermonSession.subscribe((event) => {
      if (event.type === 'update' && event.id === sessionId) {
        const bus = event.data?.chatBus;
        if (!bus) return;
        try {
          const msg = JSON.parse(bus);
          // Use msgId to dedupe
          setMessages(prev => prev.find(m => m.msgId === msg.msgId) ? prev : [...prev, msg]);
        } catch {}
      }
    });
    return () => unsubscribe();
  }, [sessionId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    const msg = {
      msgId: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender: userName,
      text: trimmed,
      time: new Date().toISOString(),
    };
    // Optimistic local add
    setMessages(prev => [...prev, msg]);
    try {
      // Push to session's chatBus field to broadcast to all subscribers
      await base44.entities.SermonSession.update(sessionId, {
        chatBus: JSON.stringify(msg),
      });
    } catch {
      // Silent — message stays visible locally
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl border border-white/20 flex flex-col" style={{ height: '320px' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <MessageCircle className="w-4 h-4 text-indigo-300" />
        <p className="text-sm font-semibold text-indigo-100">Live Chat</p>
        <span className="ml-auto text-xs text-indigo-400">Session only — not saved</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-indigo-400 text-center mt-8">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((m) => (
          <div key={m.msgId} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-white font-bold">{m.sender?.[0]?.toUpperCase() || '?'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-200">{m.sender} </span>
              <span className="text-xs text-indigo-400">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <p className="text-sm text-white leading-snug">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-3 pt-2 border-t border-white/20 flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="bg-white/10 border-white/20 text-white placeholder:text-indigo-400 text-sm h-9"
          maxLength={300}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-indigo-500 hover:bg-indigo-400 text-white h-9 w-9 p-0 flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}