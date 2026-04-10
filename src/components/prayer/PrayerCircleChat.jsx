import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PrayerCircleChat({ circle, userEmail, userName, uiLang, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [messageType, setMessageType] = useState('message');
  const scrollRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [circle.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await base44.entities.PrayerCircleMessage?.filter?.(
        { circleId: circle.id },
        'timestamp',
        100
      ) || [];
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      await base44.entities.PrayerCircleMessage.create({
        circleId: circle.id,
        senderEmail: userEmail,
        senderName: userName,
        messageType,
        content: messageInput,
        timestamp: new Date().toISOString(),
      });

      setMessageInput('');
      setMessageType('message');
      loadMessages();
      toast.success(t(uiLang, 'circles.messageSent') || 'Message sent');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(t(uiLang, 'circles.sendError') || 'Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-blue-50">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-lg min-h-[44px]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900">{circle.name}</h2>
          <p className="text-xs text-gray-600">{circle.memberCount} members</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {t(uiLang, 'common.loading') || 'Loading...'}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">{t(uiLang, 'circles.noMessages') || 'No messages yet'}</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderEmail === userEmail ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-2xl ${
                  msg.senderEmail === userEmail
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.senderEmail !== userEmail && (
                  <p className="text-xs font-semibold mb-1 opacity-75">{msg.senderName}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.senderEmail === userEmail ? 'text-blue-100' : 'text-gray-600'}`}>
                  {format(new Date(msg.timestamp), 'p')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white space-y-2">
        <select
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
          className="w-full px-3 py-2 min-h-[44px] border border-gray-200 rounded-xl text-xs"
        >
          <option value="message">{t(uiLang, 'circles.messageType') || 'Message'}</option>
          <option value="encouragement">{t(uiLang, 'circles.encouragement') || 'Encouragement'}</option>
          <option value="prayer_request">{t(uiLang, 'circles.prayerRequest') || 'Prayer Request'}</option>
          <option value="update">{t(uiLang, 'circles.update') || 'Update'}</option>
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t(uiLang, 'circles.typeMessage') || 'Type message...'}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}