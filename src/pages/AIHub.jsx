import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Send, Loader2, Copy, Check, Globe } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';
import { useTranslation } from '@/components/hooks/useTranslation';
import { translations } from '@/components/i18n/translations';
import PrayerCoachResponse from '@/components/ai/PrayerCoachResponse';
import AIFeatureResponse from '@/components/ai/AIFeatureResponse';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const TOOLS = [
  {
    id: 'companion',
    label: 'Bible Q&A',
    emoji: '📖',
    tagline: 'Ask anything about Scripture',
    color: 'from-indigo-500 to-violet-600',
    placeholder: 'What does John 3:16 mean?',
  },
  {
    id: 'prayer_coach',
    label: 'Prayer Coach',
    emoji: '🙏',
    tagline: 'Spiritual guidance for your prayers',
    color: 'from-rose-400 to-pink-600',
    placeholder: 'Pray for my anxiety about exams',
  },
  {
    id: 'emotional',
    label: 'Encouragement',
    emoji: '💛',
    tagline: 'Faith-based support & hope',
    color: 'from-amber-400 to-orange-500',
    placeholder: 'I feel distant from God lately',
  },
  {
    id: 'verse_finder',
    label: 'Verse Finder',
    emoji: '🔍',
    tagline: 'Find Scripture for any situation',
    color: 'from-emerald-500 to-teal-600',
    placeholder: 'Verses about overcoming fear',
  },
];

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'om', label: '🇪🇹 Afaan Oromoo' },
  { code: 'am', label: '🇪🇹 አማርኛ' },
  { code: 'ti', label: '🇪🇷 ትግርኛ' },
  { code: 'sw', label: '🇹🇿 Kiswahili' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'ar', label: '🇸🇦 العربية' },
];

export default function AIHub() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const t = useTranslation();
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(uiLanguage || 'en');
  const [copied, setCopied] = useState(null);
  const [showLang, setShowLang] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const requestAbortRef = useRef(null);

  React.useEffect(() => {
    setLanguage(uiLanguage || 'en');
    setMessages([]);
  }, [uiLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const switchTool = (tool) => {
    setActiveTool(tool);
    setMessages([]);
    setInput('');
  };

  const getErrorMessage = (errorType) => {
    if (errorType === 'timeout') {
      return t('aiHub.error_timeout');
    }
    if (errorType === 'offline') {
      return t('aiHub.error_offline');
    }
    const errorKey = {
      prayer_coach: 'aiHub.error_prayer',
      verse_finder: 'aiHub.error_verse',
      companion: 'aiHub.error_explanation',
      emotional: 'aiHub.error_encouragement',
    }[activeTool.id];
    return t(errorKey || 'aiHub.error_general');
  };

  const handleSend = async (text = input) => {
    const q = text.trim();
    if (!q || loading) return;
    
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    requestAbortRef.current = controller;

    try {
      let data;

      if (activeTool.id === 'prayer_coach') {
        const res = await base44.functions.invoke('prayerCoach', {
          prayerRequest: q,
          language: language,
        });
        data = res.data;
        if (!data?.success) throw new Error(data?.error || 'Prayer guidance failed');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data,
          isPrayerCoach: true,
          uiLanguage: language,
        }]);
      } else {
        const res = await base44.functions.invoke('faithAIEngine', {
          input: q,
          language: language,
          feature: activeTool.id,
        });
        data = res.data;
        if (!data?.success) throw new Error(data?.error || 'AI response failed');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          feature: data.feature,
          uiLanguage: language,
          oromoFallback: data.oromoFallback || false,
        }]);
      }
    } catch (err) {
      let errorType = 'general';
      if (err.name === 'AbortError') {
        errorType = 'timeout';
      } else if (!navigator.onLine) {
        errorType = 'offline';
      }
      
      console.error('[AIHub] Error:', err.message);
      setError(getErrorMessage(errorType));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: getErrorMessage(errorType),
        isError: true,
        isRetryable: true,
      }]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      requestAbortRef.current = null;
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ErrorBoundary>
    <div className="flex min-h-screen flex-col bg-background">
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">{t('aiHub.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('aiHub.subtitle')}
            </p>
          </div>
          <button 
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1 bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-muted/80 transition-colors min-h-[44px] min-w-[44px]"
          >
            <Globe size={14} /> {language.toUpperCase()}
          </button>
        </div>

        {/* Language picker */}
        {showLang && (
          <div className="mx-auto max-w-5xl px-4 pb-4 flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { setLanguage(l.code); setShowLang(false); }}
                className={`min-h-[44px] px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === l.code ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Mode chips */}
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {TOOLS.map(tool => {
              const toolLabel = t(`aiHub.tool_${tool.id}`);
              return (
                <button 
                  key={tool.id}
                  onClick={() => switchTool(tool)}
                  className={`min-h-[44px] rounded-full px-4 whitespace-nowrap font-medium text-sm transition-all ${
                    activeTool.id === tool.id
                      ? `bg-gradient-to-r ${tool.color} text-white`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tool.emoji} {toolLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4">
          
          {/* Empty State */}
           {messages.length === 0 && (
            <div className="rounded-3xl border bg-card p-6">
              <h2 className="text-lg font-semibold">{t('aiHub.empty_placeholder')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('aiHub.empty_description')}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeTool.id === 'companion' && [
                  t('aiHub.example_companion_1'),
                  t('aiHub.example_companion_2'),
                  t('aiHub.example_companion_3'),
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors">
                    {s}
                  </button>
                ))}
                {activeTool.id === 'prayer_coach' && [
                  t('aiHub.example_prayer_1'),
                  t('aiHub.example_prayer_2'),
                  t('aiHub.example_prayer_3'),
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors">
                    {s}
                  </button>
                ))}
                {activeTool.id === 'emotional' && [
                  t('aiHub.example_encouragement_1'),
                  t('aiHub.example_encouragement_2'),
                  t('aiHub.example_encouragement_3'),
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors">
                    {s}
                  </button>
                ))}
                {activeTool.id === 'verse_finder' && [
                  t('aiHub.example_verse_1'),
                  t('aiHub.example_verse_2'),
                  t('aiHub.example_verse_3'),
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              
              {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center flex-shrink-0 text-sm`}>
                  {activeTool.emoji}
                </div>
              )}

              <div className="max-w-[88%]">
                {msg.role === 'user' ? (
                  <div className={`bg-gradient-to-r ${activeTool.color} text-white rounded-2xl px-4 py-3 text-sm leading-relaxed`}>
                    {msg.content}
                  </div>
                ) : msg.isError ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-4 text-sm text-destructive space-y-2">
                    <p>{msg.content}</p>
                    {msg.isRetryable && (
                      <button
                        onClick={() => {
                          const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                          if (lastUserMsg) handleSend(lastUserMsg.content);
                        }}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-destructive text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        ↻ Retry
                      </button>
                    )}
                  </div>
                ) : msg.isPrayerCoach ? (
                  <div className="bg-card border rounded-2xl px-4 py-4 shadow-sm">
                    {msg.uiLanguage === 'om' && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mb-3">
                        📖 Deebiin AI Afaan Ingliffaatiin dhiyaata — qulqullina eeggachuuf.
                      </p>
                    )}
                    <PrayerCoachResponse data={msg.content} />
                     <button
                       onClick={() => copy(JSON.stringify(msg.content), i)}
                       className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                     >
                       {copied === i ? <><Check size={11} aria-hidden="true" /> {t('aiHub.copied')}</> : <><Copy size={11} aria-hidden="true" /> {t('aiHub.copy')}</>}
                     </button>
                  </div>
                ) : (
                  <div className="bg-card border rounded-2xl px-4 py-4 shadow-sm">
                    <AIFeatureResponse feature={msg.feature || activeTool.id} content={msg.content} uiLanguage={msg.uiLanguage} oromoFallback={msg.oromoFallback} />
                    <button
                      onClick={() => copy(JSON.stringify(msg.content), i)}
                      className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === i ? <><Check size={11} aria-hidden="true" /> Copied</> : <><Copy size={11} aria-hidden="true" /> Copy</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3 items-start">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center flex-shrink-0`}>
                <Loader2 size={14} className="text-white animate-spin" />
              </div>
              <div className="bg-card border rounded-2xl px-4 py-3 shadow-sm">
                <p className="text-xs text-muted-foreground mb-2 font-medium">{t('aiHub.thinking') || 'FaithLight is thinking…'}</p>
                <div className="flex gap-1.5">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-5xl px-4 py-3 pb-[calc(0.75rem+56px)] md:pb-3">
      <div className="flex gap-3">
       <input
         ref={inputRef}
         type="text"
         maxLength={500}
         value={input}
         onChange={e => setInput(e.target.value)}
         onKeyDown={e => e.key === 'Enter' && !loading && input.trim() && handleSend()}
         placeholder={activeTool.placeholder}
         disabled={loading}
         className="h-12 flex-1 rounded-2xl border px-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
       />
       <button
         onClick={() => handleSend()}
         disabled={!input.trim() || loading}
         className="h-12 rounded-2xl px-5 bg-primary text-primary-foreground disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 font-semibold text-sm hover:opacity-90 transition-opacity"
       >
         {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
         <span className="hidden sm:inline">{loading ? t('aiHub.thinking') : t('aiHub.ask')}</span>
       </button>
       </div>
       <p className="mt-2 text-center text-xs text-muted-foreground">
       {t('aiHub.disclaimer')}
       </p>
      </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}