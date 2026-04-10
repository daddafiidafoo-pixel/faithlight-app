import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Copy, Check, Loader2, BookOpen, RefreshCw, AlertCircle, GitCompare } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../components/i18n/LanguageProvider';
import { isBibleAvailable } from '@/lib/languageConfig';
import VerseShareImageModal from '../components/bible/VerseShareImageModal';
import BibleLanguageFallbackModal from '../components/bible/BibleLanguageFallbackModal';
import { useScreenshotMode } from '@/components/ScreenshotMode';
import TheologicalPerspectivePicker, { THEOLOGICAL_PERSPECTIVES } from '../components/bible/TheologicalPerspectivePicker';
import TheologicalCompareModal from '../components/bible/TheologicalCompareModal';

export default function AIBibleCompanion() {
  useScreenshotMode();
  const { t, lang } = useI18n();
  const { language, bibleLanguage, isBibleAvailable: userHasBible } = useLanguage();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(location.state?.initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [shareImageModalOpen, setShareImageModalOpen] = useState(false);
  const [shareImageData, setShareImageData] = useState(null);
  const [showBibleFallback, setShowBibleFallback] = useState(false);
  const [perspective, setPerspective] = useState('general');
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareQuestion, setCompareQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const lastSentRef = useRef(null); // prevents duplicate sends: { text, ts }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rebuild suggestions when language changes so they show in the current language immediately
  const suggestedQuestions = [
    t('bible.what_fear', 'What does the Bible say about fear?'),
    t('bible.forgiveness', 'Explain forgiveness in Scripture'),
    t('bible.faith', 'How do I strengthen my faith?'),
    t('bible.pray', 'How should I pray?'),
    t('bible.grief', 'What does the Bible say about grief?'),
  ];

  // Single send path — prevents duplicates from suggestion clicks + Enter/button
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    // Guard: prevent double-fire from rapid clicks / StrictMode
    if (lastSentRef.current?.text === trimmed && Date.now() - (lastSentRef.current?.ts ?? 0) < 1500) return;
    lastSentRef.current = { text: trimmed, ts: Date.now() };

    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const perspectiveMeta = THEOLOGICAL_PERSPECTIVES.find(p => p.id === perspective);
      const perspectiveInstruction = perspective !== 'general'
        ? ` Please interpret and respond from a ${perspectiveMeta?.label} theological perspective.`
        : '';

      const result = await base44.functions.invoke('faithlightChat', {
        message: trimmed + perspectiveInstruction,
        language: lang,
        action: 'general',
      });

      const aiReply = result?.data?.reply;

      if (!aiReply || aiReply.trim().length === 0) {
        throw new Error('No response received. Check your connection and try again.');
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiReply.trim(),
      }]);
    } catch (err) {
      console.error('[AIBibleCompanion] Error:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'error',
        content: t('bible.error', 'We could not get a response right now. Please try again in a moment.'),
        retryText: trimmed,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (text) => {
    setMessages(prev => prev.filter(m => m.role !== 'error'));
    sendMessage(text);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Page header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                {t('bible.companion_title', 'AI Bible Companion')}
              </h1>
              <p className="text-xs text-gray-500">
                {t('bible.companion_desc', 'Ask questions about Scripture')}
              </p>
            </div>
          </div>
          {/* Theological perspective toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Perspective:</span>
            <TheologicalPerspectivePicker selected={perspective} onChange={setPerspective} />
            {messages.length > 0 && (
              <button
                onClick={() => {
                  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                  setCompareQuestion(lastUserMsg?.content || input || 'Interpret this passage');
                  setCompareOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                aria-label="Compare theological perspectives"
              >
                <GitCompare className="w-3 h-3" />
                Compare Views
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-40 space-y-4">
          {messages.length === 0 ? (
            <div className="pt-4">
              <div className="text-center mb-6">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {t('bible.start_question', 'Ask me anything about Scripture')}
                </p>
              </div>
              <div className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={`${lang}-${i}`}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    aria-label={`Ask: ${q}`}
                    className="block w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm text-gray-700 bg-white shadow-sm min-h-[44px]"
                  >
                    <span className="text-indigo-400 mr-2">→</span>{q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'error' ? 'bg-red-100' : 'bg-indigo-100'}`}>
                    {msg.role === 'error'
                      ? <span className="text-sm">⚠️</span>
                      : <Sparkles className="w-4 h-4 text-indigo-600" />
                    }
                  </div>
                )}
                <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : msg.role === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {/* Action row */}
                  {msg.role === 'error' && (
                    <button
                      onClick={() => handleRetry(msg.retryText)}
                      disabled={loading}
                      aria-label={t('common.retry', 'Try again')}
                      className="flex items-center justify-center gap-2 text-xs text-red-600 border border-red-200 rounded-lg px-3 py-2.5 h-[44px] bg-white hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('common.retry', 'Try again')}
                    </button>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        aria-label={copied === msg.id ? t('common.copied', 'Copied') : t('common.copy', 'Copy')}
                        className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-2.5 h-[44px] min-w-[44px]"
                      >
                        {copied === msg.id
                          ? <><Check className="w-4 h-4 text-green-500" /><span className="text-green-500">{t('common.copied', 'Copied')}</span></>
                          : <><Copy className="w-4 h-4" /><span>{t('common.copy', 'Copy')}</span></>
                        }
                      </button>
                      <button
                        onClick={() => {
                          const prevUser = messages.slice(0, messages.indexOf(msg)).reverse().find(m => m.role === 'user');
                          setCompareQuestion(prevUser?.content || 'Interpret this passage');
                          setCompareOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors px-3 py-2.5 h-[44px]"
                        aria-label="Compare theological perspectives"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>Compare views</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-500 italic">
                  {t('bible.thinking', 'Thinking...')}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed input bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4 px-4" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white border border-gray-300 rounded-2xl shadow-lg p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder={t('bible.ask_placeholder', 'What does Romans 8:28 mean?')}
                disabled={loading}
                aria-label={t('bible.ask_placeholder', 'What does Romans 8:28 mean?')}
                className="flex-1 px-3 py-2.5 focus:outline-none text-sm bg-transparent min-h-[44px]"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label={t('common.send', 'Send')}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] min-w-[44px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.send', 'Send')}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {t('bible.powered_by', 'Powered by AI • Always consult Scripture')}
            </p>
          </div>
        </div>

        {shareImageData && (
          <VerseShareImageModal
            open={shareImageModalOpen}
            onOpenChange={setShareImageModalOpen}
            verse={shareImageData.verse}
            reference={shareImageData.reference}
            isDarkMode={false}
          />
        )}

        {/* Bible availability notice for UI-only languages */}
        {!userHasBible && language !== 'en' && (
          <div className="fixed bottom-32 left-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-md flex items-start gap-2 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              {t('bible.ui_only_notice', 'Bible content is not yet available in your language, but prayer and guidance will be provided in your selected language.')}
            </p>
          </div>
        )}

        <TheologicalCompareModal
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          question={compareQuestion}
          language={lang}
        />

        <BibleLanguageFallbackModal
          open={showBibleFallback}
          onOpenChange={setShowBibleFallback}
          selectedLanguage={language}
          onConfirmEnglish={() => {
            // User confirmed English Bible usage
            setShowBibleFallback(false);
          }}
        />
      </div>
    </ErrorBoundary>
  );
}