/**
 * AI Spiritual Mentor
 * Conversational AI mentor that gives personalized spiritual guidance,
 * verse recommendations, and growth plans. Feels like a real mentor, not a chatbot.
 */
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAIOrchestrator } from '../components/hooks/useAIOrchestrator';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../components/I18nProvider';
import { saveContext } from '../components/lib/companionContext';

// Build system prompt with language injection
const buildMentorSystemPrompt = (language) => {
  const systemBase = `You are a warm, wise, and empathetic Christian spiritual mentor in the FaithLight app. Your role is not just to answer questions but to guide, encourage, and walk alongside users in their faith journey.

When responding:
- Be personal, warm, and pastoral — like a trusted mentor, not a textbook
- Always reference Scripture when relevant (give the actual verse text)
- Ask follow-up questions to understand the person's situation
- Suggest practical next steps
- Keep responses focused and readable (2-4 short paragraphs)
- Never be preachy or condemning — always grace-filled
- Respond entirely in the user's language: ${language === 'om' ? 'Afaan Oromoo' : language === 'am' ? 'Amharic' : language === 'sw' ? 'Swahili' : language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : language === 'ti' ? 'Tigrinya' : 'English'}`;
  return systemBase;
};

const CONTEXT_WINDOW = 10;

export default function AISpiritualMentor() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [sessionId, setSessionId] = useState(`mentor_${Date.now()}`);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { generate, loading } = useAIOrchestrator();
  const navigate = useNavigate();

  // Build starter prompts from translations
  const getMentorStarters = () => [
    { emoji: '🌱', text: t('mentor.starter_grow', 'How can I grow spiritually this week?') },
    { emoji: '📖', text: t('mentor.starter_passage', 'What Bible passage should I read today?') },
    { emoji: '😟', text: t('mentor.starter_stress', 'Help me pray about stress and anxiety') },
    { emoji: '💔', text: t('mentor.starter_forgiveness', 'I\'m struggling with forgiveness') },
    { emoji: '🙏', text: t('mentor.starter_prayer', 'How do I build a daily prayer habit?') },
    { emoji: '❓', text: t('mentor.starter_doubts', 'I have doubts about my faith') },
    { emoji: '💪', text: t('mentor.starter_strength', 'Give me a verse for strength today') },
    { emoji: '🤝', text: t('mentor.starter_serve', 'How can I serve others better?') },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
        // Use UI language from i18n provider
        setLanguage(lang);
      } catch { /* guest */ }
    };
    init();
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildContextPrompt = (question, history) => {
    const systemPrompt = buildMentorSystemPrompt(language);
    if (history.length === 0) return `${systemPrompt}\n\nUser: ${question}`;
    const recent = history.slice(-CONTEXT_WINDOW);
    const ctx = recent.map(m => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content}`).join('\n');
    return `${systemPrompt}\n\nPrevious conversation:\n${ctx}\n\nUser: ${question}`;
  };

  const handleSend = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: q, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    // Save context for companion card personalization
    if (/pray|prayer|stress|anxiety|fear|worry|struggle|grief/i.test(q)) saveContext('last_prayer', q.slice(0, 80));
    if (/study|learn|understand|read|passage|book/i.test(q)) saveContext('active_study', q.slice(0, 80));

    const contextualPrompt = buildContextPrompt(q, messages);

    const result = await generate('ask_ai', {
      question: contextualPrompt,
      language,
    }, { userId: user?.id, isPremium: false });

    const assistantMsg = {
      role: 'assistant',
      content: result || t('mentor.error_fallback', 'I\'m here with you. Please try again in a moment.'),
      id: Date.now() + 1,
    };
    setMessages(prev => [...prev, assistantMsg]);
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(`mentor_${Date.now()}`);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isEmpty = messages.length === 0;
  const firstName = user?.full_name?.split(' ')[0] || '';

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F7F8FC' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px 0', fontSize: 14 }}>{t('common.back', '← Back')}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🕊️</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{t('mentor.title', 'AI Spiritual Mentor')}</p>
            <p style={{ fontSize: 12, color: '#10B981', margin: 0 }}>{t('mentor.subtitle', 'Here to guide your faith journey')}</p>
          </div>
        </div>
        <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <RotateCcw size={13} /> {t('mentor.new_chat', 'New')}
        </button>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 430, margin: '0 auto' }}>

          {isEmpty && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🕊️</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                  {firstName ? t('mentor.welcome', `Welcome, ${firstName}`) : t('mentor.intro_title', 'Your Spiritual Mentor')}
                </h2>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 6px' }}>
                  {t('mentor.intro_body', 'I\'m here to walk alongside you in your faith journey.')}
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>
                  {t('mentor.memory_hint', 'Ask me anything — I remember our conversation.')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {getMentorStarters().map(({ emoji, text }) => (
                  <motion.button
                    key={text}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(text)}
                    style={{
                      background: 'white', border: '1px solid #E5E7EB', borderRadius: 14,
                      padding: '12px 14px', fontSize: 13, color: '#374151', fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left', lineHeight: '18px',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.04)',
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{emoji}</span>
                    <span>{text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 16, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>🕊️</div>
                )}
                <div style={{
                  maxWidth: '82%',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6C5CE7, #8E7CFF)' : 'white',
                  color: msg.role === 'user' ? 'white' : '#111827',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                  border: msg.role === 'assistant' ? '1px solid #F3F4F6' : 'none',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
                  fontSize: 14, lineHeight: '22px',
                }}>
                  {msg.role === 'assistant'
                    ? <ReactMarkdown className="prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
                    : <p style={{ margin: 0 }}>{msg.content}</p>
                  }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🕊️</div>
              <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', padding: '12px 18px', border: '1px solid #F3F4F6', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#D97706', animation: `bounce 1s ${i * 0.15}s infinite alternate` }} />
                ))}
              </div>
            </motion.div>
          )}

          {messages.length >= 2 && !loading && (
            <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>
              {t('mentor.memory_hint_long', 'I remember our full conversation — ask anything')}
            </p>
          )}

          <div ref={bottomRef} style={{ height: 20 }} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={t('mentor.input_placeholder', 'Share what\'s on your heart…')}
            rows={1}
            style={{
              flex: 1, borderRadius: 14, border: '1.5px solid #E5E7EB',
              padding: '12px 14px', fontSize: 14, resize: 'none',
              fontFamily: 'inherit', outline: 'none', lineHeight: '20px',
              background: '#F9FAFB', color: '#111827', maxHeight: 100, overflowY: 'auto',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
              background: input.trim() ? 'linear-gradient(135deg, #D97706, #F59E0B)' : '#F3F4F6',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Send size={18} color={input.trim() ? 'white' : '#9CA3AF'} />
          </motion.button>
        </div>
      </div>

      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
        .prose p { margin: 0 0 8px; } .prose p:last-child { margin-bottom: 0; }
        .prose ul { padding-left: 18px; margin: 4px 0; } .prose li { margin-bottom: 3px; }`}
      </style>
      </div>
    </ErrorBoundary>
  );
}