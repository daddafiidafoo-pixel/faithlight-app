import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function GroupChat({ groupId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.GroupChatMessage.filter({ group_id: groupId }, 'created_date', 50);
      setMessages(msgs);
    } catch { setMessages([]); }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    const unsub = base44.entities.GroupChatMessage.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        if (event.type === 'create') setMessages(prev => [...prev, event.data]);
      }
    });
    return unsub;
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    await base44.entities.GroupChatMessage.create({
      group_id: groupId,
      sender_id: user.id,
      sender_name: user.full_name,
      message: text,
    });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-xl mb-3">
        {loading ? (
          <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isMe ? 'bg-indigo-500' : 'bg-purple-400'}`}>
                  {(msg.sender_name || 'U')[0].toUpperCase()}
                </div>
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && <p className="text-xs text-gray-400 mb-0.5 ml-1">{msg.sender_name}</p>}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                    {msg.message}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 mx-1">
                    {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message... (Enter to send)"
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || sending} className="bg-indigo-600 hover:bg-indigo-700">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}