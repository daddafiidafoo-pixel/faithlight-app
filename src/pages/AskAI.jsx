import React, { useState, useEffect, useRef } from 'react';
import { askBibleQuestion, trackAIUsage, getCurrentUser } from '@/components/services/api';
import { logEvent, Events } from '@/components/services/analytics/eventLogger';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Send, AlertTriangle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useI18n } from '../components/I18nProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

export default function AskAI() {
  const { lang, t } = useI18n();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [copied, setCopied] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    if (!user) {
      import('@/api/base44Client').then(m => m.base44.auth.redirectToLogin());
      return;
    }

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    logEvent(Events.AI_QUESTION_ASKED, { lang, messageCount: messages.length + 1 });

    try {
      const response = await askBibleQuestion(query, lang);
      const aiResponse = typeof response === 'string' ? response : (response?.content ?? JSON.stringify(response));
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      await trackAIUsage(user?.id);
    } catch (error) {
      toast.error(t('ai.error', 'Failed to get response. Please try again.'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (index) => {
    navigator.clipboard.writeText(messages[index].content);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('ai.signInTitle', 'Sign in to Ask AI')}</h2>
          <p className="text-gray-500 text-sm">{t('ai.signInDesc', 'Get biblical insights, study guidance, and AI-powered learning.')}</p>
          <Button onClick={() => import('@/api/base44Client').then(m => m.base44.auth.redirectToLogin())} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {t('common.signIn', 'Sign In')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <SafeAreaWrapper>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
          <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ai.headerTitle', 'Ask AI')}</h1>
          <p className="text-gray-500 mb-6">{t('ai.headerDesc', 'Ask biblical questions, explore Scripture, and deepen your faith.')}</p>

          {/* Language Selector */}
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>{t('ai.disclaimer', 'AI Assistance:')}</strong> {t('ai.disclaimerText', 'Always verify biblical interpretations with Scripture and consult your pastor for significant theological questions.')}
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[600px] w-full max-w-3xl mx-auto">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-gray-500 text-sm max-w-xs">{t('ai.emptyState', "Ask any biblical question. I'm here to help explore Scripture.")}</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                )}

                <div className={`max-w-xl rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="my-1">{children}</p>,
                          ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                          li: ({ children }) => <li className="my-0.5">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(idx)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors mt-1 flex-shrink-0"
                  >
                    {copied === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
                <div className="bg-gray-100 rounded-2xl p-4">
                  <p className="text-sm text-gray-500">{t('ai.thinking', 'Thinking…')}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && e.ctrlKey && handleAsk()}
                placeholder={t('ai.placeholder', 'Ask a biblical question…')}
                className="resize-none min-h-10 max-h-24"
              />
              <Button
                onClick={handleAsk}
                disabled={loading || !query.trim()}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 mt-auto"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">{t('ai.inputHelper', 'Ctrl/Cmd + Enter to send')}</p>
          </div>
        </div>
      </div>
      </div>
      </ErrorBoundary>
      </SafeAreaWrapper>
      );
      }