import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Send, MessageCircle, Loader2, RefreshCw } from 'lucide-react';
import MessageBubble from '@/components/ChatMessage';

const QUICK_ISSUES = [
  { label: '📄 Page not loading', text: 'The page is not loading' },
  { label: '🌐 Language not changing', text: 'The language did not change after I switched it' },
  { label: '🤖 AI response failed', text: 'The AI response failed or is not working' },
  { label: '🧩 Quiz not working', text: 'The quiz is not working' },
  { label: '🎧 Audio Bible problem', text: 'The Audio Bible is not playing' },
  { label: '📤 Verse sharing problem', text: 'I cannot share a verse' },
  { label: '❓ Something else', text: 'I have a different problem' },
];

export default function HelpAgentChat({ onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'faithlight_support',
      metadata: { name: 'Help Session' },
    });
    setConversation(conv);
    const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  };

  const sendMessage = async (text) => {
    if (!conversation || !text.trim() || loading) return;
    setLoading(true);
    setStarted(true);
    setInput('');
    await base44.agents.addMessage(conversation, { role: 'user', content: text.trim() });
    setLoading(false);
  };

  const handleQuickIssue = (text) => sendMessage(text);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const restart = async () => {
    setMessages([]);
    setStarted(false);
    setConversation(null);
    await initConversation();
  };

  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold">FaithLight Support</p>
            <p className="text-xs text-indigo-200">AI Help Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={restart} title="New conversation">
            <RefreshCw className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {/* Greeting */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-700 max-w-[85%]">
          <p className="font-medium text-indigo-700 mb-1">Hi! 👋 I'm the FaithLight Support Assistant.</p>
          <p>How can I help you today? You can pick a common issue below or type your own question.</p>
        </div>

        {/* Quick issue chips — only before first message sent */}
        {!started && (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_ISSUES.map(issue => (
              <button
                key={issue.text}
                onClick={() => handleQuickIssue(issue.text)}
                className="text-xs bg-white border border-indigo-200 text-indigo-700 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-colors font-medium shadow-sm"
              >
                {issue.label}
              </button>
            ))}
          </div>
        )}

        {/* Conversation messages */}
        {visibleMessages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 pl-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Support assistant is typing…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-gray-100 bg-white flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your issue…"
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || loading} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-9 w-9 flex-shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 py-2 bg-white border-t border-gray-50">
        Can't resolve it? Email <a href="mailto:support@faithlight.app" className="text-indigo-500 hover:underline">support@faithlight.app</a>
      </p>
    </div>
  );
}