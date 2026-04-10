import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';

export default function TheologicalChat({ verseReference, passageText }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load initial context on mount
    if (verseReference && passageText && !contextLoaded) {
      loadContext();
    }
  }, [verseReference, passageText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContext = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateTheologicalContext', {
        verseReference,
        passageText
      });
      setMessages([{
        role: 'assistant',
        content: response.data.context,
        isContext: true
      }]);
      setContextLoaded(true);
    } catch (error) {
      console.error('Error loading context:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('generateTheologicalContext', {
        verseReference,
        passageText,
        question: userMessage
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.context
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-96 flex flex-col bg-gradient-to-b from-purple-50 to-white border-purple-200">
      <div className="bg-purple-600 text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">Theological Insights</h3>
        <p className="text-sm text-purple-100">{verseReference}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : `bg-gray-100 text-gray-900 ${msg.isContext ? 'border-2 border-yellow-300' : ''}`
              }`}
            >
              {msg.isContext && <p className="text-xs font-semibold text-yellow-700 mb-1">📚 Background</p>}
              <p className="leading-relaxed text-xs md:text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a theological question..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          disabled={loading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          className="w-full"
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Ask
        </Button>
      </div>
    </Card>
  );
}