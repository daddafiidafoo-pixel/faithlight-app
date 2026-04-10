import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, BookOpen, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIOrchestrator } from '../components/hooks/useAIOrchestrator';
import ReactMarkdown from 'react-markdown';

const STARTER_QUESTIONS = [
  "What does John 3:16 really mean?",
  "Explain the Sermon on the Mount",
  "What does the Bible say about anxiety?",
  "Who wrote the book of Psalms?",
  "What is the significance of the cross?",
  "Explain the fruit of the Spirit",
];

const CONTEXT_WINDOW = 8; // messages kept in context for follow-up

export default function AIBibleTutor() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { generate, loading } = useAIOrchestrator();

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          setLanguage(localStorage.getItem('fl_bible_lang') || 'en');
        }
      } catch { /* guest */ }
      // Create a new session
      await startNewSession();
    };
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewSession = async () => {
    try {
      const session = await base44.entities.AIChatSession.create({
        context_page: 'AIBibleTutor',
        context_data: {},
        message_count: 0,
      });
      setSessionId(session.id);
      setMessages([]);
    } catch (e) {
      // Fallback: use local-only session
      setSessionId(`local_${Date.now()}`);
      setMessages([]);
    }
  };

  const buildContextPrompt = (question, history) => {
    if (history.length === 0) return question;
    const recent = history.slice(-CONTEXT_WINDOW);
    const ctx = recent.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');
    return `Previous conversation:\n${ctx}\n\nStudent's follow-up: ${question}`;
  };

  const handleSend = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: q, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    // Build prompt with history context
    const contextualPrompt = buildContextPrompt(q, messages);

    let result = null;
    try {
      result = await generate('bible_tutor', {
        question: contextualPrompt,
        language,
      }, { userId: user?.id, isPremium: false });
    } catch { result = null; }

    const assistantMsg = {
      role: 'assistant',
      content: result || '',
      isError: !result,
      id: Date.now() + 1,
    };
    setMessages(prev => [...prev, assistantMsg]);

    // Persist to DB (async, non-blocking)
    if (sessionId && !sessionId.startsWith('local_')) {
      Promise.all([
        base44.entities.AIChatMessage.create({ session_id: sessionId, user_id: user?.id, role: 'user', content: q, context_page: 'AIBibleTutor' }),
        base44.entities.AIChatMessage.create({ session_id: sessionId, user_id: user?.id, role: 'assistant', content: assistantMsg.content, context_page: 'AIBibleTutor', skill_used: 'passage_explanation' }),
        base44.entities.AIChatSession.update(sessionId, { message_count: messages.length + 2, last_message_at: new Date().toISOString(), title: q.slice(0, 60) }),
      ]).catch(() => {});
    }
  };

  const handleReset = async () => {
    await startNewSession();
    setMessages([]);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F7F8FC' }}>

      {/* Header */}
      <div style={{
        background: 'white', borderBottom: '1px solid #F3F4F6',
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>AI Bible Tutor</p>
            <p style={{ fontSize: 12, color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              {messages.length > 0 ? `${Math.ceil(messages.length / 2)} exchanges · context active` : 'Ready to study'}
            </p>
          </div>
        </div>
        <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <RotateCcw size={14} /> New Session
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 430, margin: '0 auto' }}>

          {/* Empty state with starter questions */}
          {isEmpty && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ textAlign: 'center', padding: '32px 0 20px' }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📖</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Ask anything about the Bible</h2>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>
                  I remember our conversation — ask follow-up questions and I'll keep the context.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {STARTER_QUESTIONS.map((q) => (
                  <motion.button
                    key={q}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(q)}
                    style={{
                      background: 'white', border: '1px solid #E5E7EB',
                      borderRadius: 12, padding: '12px 14px',
                      fontSize: 13, color: '#374151', fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left', lineHeight: '18px',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message bubbles */}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ marginBottom: 16, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                    <Sparkles size={14} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: msg.isError ? '#FEF2F2' : msg.role === 'user' ? 'linear-gradient(135deg, #6C5CE7, #8E7CFF)' : 'white',
                  color: msg.isError ? '#DC2626' : msg.role === 'user' ? 'white' : '#111827',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                  border: msg.isError ? '1px solid #FECACA' : msg.role === 'assistant' ? '1px solid #F3F4F6' : 'none',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
                  fontSize: 14,
                  lineHeight: '22px',
                }}>
                  {msg.role === 'assistant'
                    ? <ReactMarkdown className="prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
                    : <p style={{ margin: 0 }}>{msg.content}</p>
                  }
                  {msg.isError && (
                    <div>
                      <p style={{ margin: '0 0 8px', color: '#DC2626', fontSize: 13 }}>
                        Unable to respond right now. Please try again.
                      </p>
                      <button
                        onClick={() => {
                          const lastUser = [...messages].reverse().find(m => m.role === 'user');
                          if (lastUser) handleSend(lastUser.content);
                        }}
                        style={{ fontSize: 12, color: '#DC2626', background: 'none', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ↻ Try Again
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="white" />
              </div>
              <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', padding: '12px 18px', border: '1px solid #F3F4F6', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite alternate` }} />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} style={{ height: 20 }} />
        </div>
      </div>

      {/* Context hint for follow-ups */}
      {messages.length >= 2 && (
        <div style={{ textAlign: 'center', padding: '6px 20px 0', fontSize: 11, color: '#9CA3AF' }}>
          💬 Ask a follow-up — I remember our conversation
        </div>
      )}

      {/* Input bar */}
      <div style={{
        background: 'white', borderTop: '1px solid #F3F4F6',
        padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything about the Bible..."
            rows={1}
            style={{
              flex: 1, borderRadius: 14, border: '1.5px solid #E5E7EB',
              padding: '12px 14px', fontSize: 14, resize: 'none',
              fontFamily: 'inherit', outline: 'none', lineHeight: '20px',
              background: '#F9FAFB', color: '#111827', maxHeight: 120, overflowY: 'auto',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none',
              background: input.trim() ? 'linear-gradient(135deg, #6C5CE7, #8E7CFF)' : '#F3F4F6',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <Send size={18} color={input.trim() ? 'white' : '#9CA3AF'} />
          </motion.button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
        .prose p { margin: 0 0 8px; } .prose p:last-child { margin-bottom: 0; }
        .prose ul { margin: 4px 0; padding-left: 18px; } .prose li { margin-bottom: 4px; }
      `}</style>
    </div>
  );
}