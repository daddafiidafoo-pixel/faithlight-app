import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, BookOpen, FileText, Heart, MessageCircle,
  Lightbulb, HelpCircle, RotateCcw, AlertTriangle, Sparkles,
  Copy, Check, LogIn, UserPlus, Globe, ChevronDown, Search, X,
} from 'lucide-react';
import AIReportButton from './AIReportButton';
import { toast } from 'sonner';
import { createPageUrl } from '../../utils';
import { useNavigate } from 'react-router-dom';
import {
  LANGUAGES, SUPPORTED_CODES, RTL_CODES,
  getLang, isRtl, t, SKILL_IDS,
  detectBrowserLanguage, detectScriptLanguage, buildSystemPrompt,
  buildPassageExplanationPrompt,
} from './chatLanguages';

// ─── Skill icon map ────────────────────────────────────────────────────────────
const SKILL_ICONS = {
  bible_search: BookOpen, passage_explanation: BookOpen,
  sermon_outline: FileText, study_plan: Lightbulb,
  prayer_points: Heart, discussion: MessageCircle, app_help: HelpCircle,
};
const SKILL_COLORS = {
  bible_search: 'bg-blue-50 text-blue-700 border-blue-200',
  passage_explanation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  sermon_outline: 'bg-purple-50 text-purple-700 border-purple-200',
  study_plan: 'bg-amber-50 text-amber-700 border-amber-200',
  prayer_points: 'bg-pink-50 text-pink-700 border-pink-200',
  discussion: 'bg-green-50 text-green-700 border-green-200',
  app_help: 'bg-gray-50 text-gray-700 border-gray-200',
};

// ─── Language Picker Modal ─────────────────────────────────────────────────────
function LanguagePickerModal({ current, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="absolute inset-0 bg-white z-20 rounded-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Select Language</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
      </div>
      <p className="px-4 py-1.5 text-xs text-gray-500">FaithLight AI will respond in your selected language.</p>
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search language…"
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {filtered.map(lang => (
          <button
            key={lang.code}
            onClick={() => { onSelect(lang.code); onClose(); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${current === lang.code ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{lang.nativeName}</span>
              {lang.nativeName !== lang.name && (
                <span className={`text-xs ${current === lang.code ? 'text-indigo-200' : 'text-gray-400'}`}>{lang.name}</span>
              )}
            </div>
            {lang.rtl && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${current === lang.code ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>RTL</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No languages found</p>}
      </div>
    </div>
  );
}

// ─── Suggest-switch banner ─────────────────────────────────────────────────────
function SwitchSuggestionBar({ suggestedCode, currentLang, onSwitch, onDismiss }) {
  const lang = getLang(suggestedCode);
  const body = t(currentLang, 'switchSuggestBody', { lang: lang.name });
  return (
    <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-2 flex-shrink-0">
      <p className="text-xs text-indigo-700 flex-1">{body}</p>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onSwitch} className="px-2 py-0.5 rounded text-xs bg-indigo-600 text-white hover:bg-indigo-700">{t(currentLang, 'switch')}</button>
        <button onClick={onDismiss} className="px-2 py-0.5 rounded text-xs text-indigo-500 hover:bg-indigo-100">{t(currentLang, 'keep')}</button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function FaithLightAIChat({ user, contextPage = null, contextData = null, compact = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showSignInGate, setShowSignInGate] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  // Language state — persisted in localStorage + user profile
  const [langCode, setLangCode] = useState(() => localStorage.getItem('fl_ai_language') || 'en');
  const [autoDetectDone, setAutoDetectDone] = useState(() => !!localStorage.getItem('fl_ai_language'));

  // Suggest-switch state
  const [suggestSwitch, setSuggestSwitch] = useState(null);
  const mismatchRef = useRef({ code: null, count: 0 });

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const rtl = isRtl(langCode);
  const langMeta = getLang(langCode);

  // Auto-detect browser language once on first open
  useEffect(() => {
    if (!autoDetectDone) {
      const detected = detectBrowserLanguage();
      persistLang(detected);
      setAutoDetectDone(true);
    }
  }, [autoDetectDone]);

  // Sync from user profile (if logged in and profile has preference)
  useEffect(() => {
    if (user?.preferred_language_code && SUPPORTED_CODES.has(user.preferred_language_code)) {
      setLangCode(user.preferred_language_code);
      localStorage.setItem('fl_ai_language', user.preferred_language_code);
    }
  }, [user?.preferred_language_code]);

  useEffect(() => {
    if (user === null) setShowSignInGate(true);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const persistLang = (code) => {
    setLangCode(code);
    localStorage.setItem('fl_ai_language', code);
    if (user) base44.auth.updateMe({ preferred_language_code: code, rtl: isRtl(code) }).catch(() => {});
  };

  const handleLangSelect = (code) => {
    persistLang(code);
    setSuggestSwitch(null);
    mismatchRef.current = { code: null, count: 0 };
    setMessages([]);
    setSessionId(null);
  };

  // Track language mismatches and suggest switch after 3 consistent messages in another language
  const trackMismatch = (text) => {
    const detected = detectScriptLanguage(text);
    if (!detected || detected === langCode) {
      mismatchRef.current = { code: null, count: 0 };
      return;
    }
    if (mismatchRef.current.code === detected) {
      mismatchRef.current.count += 1;
      if (mismatchRef.current.count >= 2 && !suggestSwitch) {
        setSuggestSwitch(detected);
      }
    } else {
      mismatchRef.current = { code: detected, count: 1 };
    }
  };

  const getOrCreateSession = async (firstMessage) => {
    if (sessionId) return sessionId;
    const session = await base44.entities.AIChatSession.create({
      user_id: user?.id || null,
      title: firstMessage.slice(0, 60),
      context_page: contextPage,
      context_data: contextData || {},
      message_count: 0,
      last_message_at: new Date().toISOString(),
    }).catch(() => ({ id: 'temp_' + Date.now() }));
    setSessionId(session.id);
    return session.id;
  };

  const saveMessage = async (sid, role, content, skill = 'general') => {
    if (!sid || sid.startsWith('temp_')) return;
    await base44.entities.AIChatMessage.create({
      session_id: sid, user_id: user?.id || null,
      role, content, context_page: contextPage, skill_used: skill,
    }).catch(() => {});
    await base44.entities.AIChatSession.update(sid, {
      message_count: messages.length + 1,
      last_message_at: new Date().toISOString(),
    }).catch(() => {});
  };

  const detectSkill = (text) => {
    const tx = text.toLowerCase();
    if (/sermon|lallaba|ስብከት|عظة|موعظه|خطبہ/.test(tx)) return 'sermon_outline';
    if (/study plan|karoora|እቅድ|خطة|منصوبہ/.test(tx)) return 'study_plan';
    if (/explain|ibsi|አብራራ|اشرح|توضیح|[a-z]+ \d+:\d+/.test(tx)) return 'passage_explanation';
    if (/find verse|barbaadi|ፈልግ|ابحث|تلاش/.test(tx)) return 'bible_search';
    if (/how do i|download|offline|akkamitti|كيف|چگونه/.test(tx)) return 'app_help';
    if (/discussion|marii|ውይይት|نقاش/.test(tx)) return 'group_helper';
    return 'general';
  };

  // Try to extract a Bible reference from the message (e.g. "Mark 5:10", "John 3:16-17")
  const extractBibleRef = (text) => {
    const match = text.match(/(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);
    if (!match) return null;
    return { book: match[1].trim(), chapter: match[2], verse: match[3], endVerse: match[4] || match[3] };
  };

  // Fetch verse text from DB
  const fetchVerseText = async (book, chapter, verse, endVerse) => {
    const chap = parseInt(chapter);
    const vStart = parseInt(verse);
    const vEnd = parseInt(endVerse || verse);
    const all = await base44.entities.BibleVerse.filter({ book, chapter: chap }).catch(() => []);
    const matching = (all || []).filter(v => v.verse >= vStart && v.verse <= vEnd);
    if (matching.length === 0) return null;
    return matching.map(v => `${v.verse}. ${v.text}`).join(' ');
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    if (!user) { setShowSignInGate(true); return; }

    trackMismatch(msg);

    const skill = detectSkill(msg);
    setMessages(prev => [...prev, { role: 'user', content: msg, skill }]);
    setInput('');
    setLoading(true);

    const sid = await getOrCreateSession(msg);
    await saveMessage(sid, 'user', msg, skill);

    let fullPrompt;

    // For passage explanation: fetch actual verse text and use grounded prompt
    if (skill === 'passage_explanation') {
      const ref = extractBibleRef(msg);
      if (ref) {
        const verseText = await fetchVerseText(ref.book, ref.chapter, ref.verse, ref.endVerse);
        if (verseText) {
          const reference = `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse !== ref.verse ? '-' + ref.endVerse : ''}`;
          fullPrompt = buildPassageExplanationPrompt(langCode, reference, verseText);
          // Prepend a quote block to messages so user sees the exact verse
          const quotedVerse = `**Macaafa Qulqulluu — ${reference}**\n> ${verseText}`;
          setMessages(prev => [...prev, { role: 'assistant', content: quotedVerse, skill: 'verse_quote', isQuote: true }]);
        }
      }
    }

    if (!fullPrompt) {
      const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
      const contextHint = contextPage ? `\n\nUser is currently on page: "${contextPage}".` : '';
      const langName = getLang(langCode).name;
      const langHint = `\n\n[LANGUAGE ENFORCEMENT] The user's selected language is: ${langCode} (${langName}). You MUST respond exclusively in ${langName}. Do NOT respond in English or any other language unless langCode is "en". This is a strict requirement.`;
      const systemPrompt = buildSystemPrompt(langCode);
      fullPrompt = `${systemPrompt}${langHint}${contextHint}\n\n${history ? `Conversation so far:\n${history}\n\n` : ''}User: ${msg}\n\nAssistant:`;
    }

    const response = await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt });
    const reply = typeof response === 'string' ? response : JSON.stringify(response);

    setMessages(prev => [...prev, { role: 'assistant', content: reply, skill }]);
    await saveMessage(sid, 'assistant', reply, skill);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const copyMessage = async (content, idx) => {
    await navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const reset = () => { setMessages([]); setSessionId(null); setInput(''); setSuggestSwitch(null); };

  const saveAsSermonDraft = async (content) => {
    if (!user) { toast.error(t(langCode, 'signInTitle')); return; }
    await base44.entities.SermonNote.create({
      user_id: user.id, title: 'AI Draft: ' + content.slice(0, 50),
      full_content: content, content_plain: content.replace(/[#*_`]/g, ''),
      outline: content, language: langCode, style: 'teaching', audience: 'mixed',
    }).catch(() => {});
    toast.success(t(langCode, 'saveSermon') + '!');
  };

  const saveAsStudyPlan = async (content) => {
    if (!user) { toast.error(t(langCode, 'signInTitle')); return; }
    await base44.entities.StudyPlan.create({
      user_id: user.id, title: 'AI Study Plan: ' + content.slice(0, 40),
      generated_content: content, status: 'active', created_by: user.id,
    }).catch(() => {});
    toast.success(t(langCode, 'savePlan') + '!');
  };

  const isEmpty = messages.length === 0;

  // ─── Sign-in gate ────────────────────────────────────────────────────────────
  if (showSignInGate) {
    return (
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className={`flex flex-col items-center justify-center ${compact ? 'h-full' : 'h-[calc(100vh-200px)] min-h-[500px]'} bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center`}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-5 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t(langCode, 'signInTitle')}</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">{t(langCode, 'signInDesc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <LogIn className="w-4 h-4" /> {t(langCode, 'signIn')}
          </Button>
          <Button onClick={() => base44.auth.redirectToLogin()} variant="outline" className="gap-2">
            <UserPlus className="w-4 h-4" /> {t(langCode, 'createAccount')}
          </Button>
        </div>
        <p className="text-xs text-gray-400 max-w-xs">{t(langCode, 'warning')}</p>
        {compact && (
          <button onClick={() => setShowSignInGate(false)} className="mt-3 text-xs text-gray-400 underline">
            {t(langCode, 'keep')}
          </button>
        )}
      </div>
    );
  }

  // ─── Chat UI ─────────────────────────────────────────────────────────────────
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ textAlign: rtl ? 'right' : 'left' }}
      className={`flex flex-col relative ${compact ? 'h-full' : 'h-[calc(100vh-200px)] min-h-[500px]'} bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden`}
    >
      {/* Language picker overlay */}
      {showLangModal && (
        <LanguagePickerModal current={langCode} onSelect={handleLangSelect} onClose={() => setShowLangModal(false)} />
      )}

      {/* Language bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50/80 flex-shrink-0 ${rtl ? 'flex-row-reverse' : ''}`}>
        <span className="text-xs text-gray-500">{t(langCode, 'language')}:</span>
        <button
          onClick={() => setShowLangModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
        >
          <Globe className="w-3 h-3" />
          {langMeta.nativeName}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </div>

      {/* Suggest-switch banner */}
      {suggestSwitch && (
        <SwitchSuggestionBar
          suggestedCode={suggestSwitch}
          currentLang={langCode}
          onSwitch={() => { handleLangSelect(suggestSwitch); }}
          onDismiss={() => { setSuggestSwitch(null); mismatchRef.current = { code: null, count: 0 }; }}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t(langCode, 'title')}</h2>
            <p className="text-gray-500 text-xs max-w-xs mb-1">{t(langCode, 'subtitle')}</p>
            <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {t(langCode, 'warning')}
            </p>

            {/* Skill buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg mb-4">
              {SKILL_IDS.map(s => {
                const Icon = SKILL_ICONS[s.id] || HelpCircle;
                const label = `${s.emoji} ${t(langCode, s.i18nKey)}`;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setInput(langCode === 'om' && s.prompt_om ? s.prompt_om : s.prompt_en); textareaRef.current?.focus(); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:shadow-sm ${SKILL_COLORS[s.id] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Example chips */}
            <div className="w-full max-w-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t(langCode, 'tryAsking')}</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {(t(langCode, 'examples') || []).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          // In LTR: user=right, assistant=left. In RTL: flip.
          const userRight = !rtl;
          const isUser = msg.role === 'user';
          const justify = isUser
            ? (userRight ? 'justify-end' : 'justify-start')
            : (userRight ? 'justify-start' : 'justify-end');

          return (
            <div key={idx} className={`flex gap-2 group ${justify}`}>
              {msg.role === 'assistant' && !rtl && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
                <div
                  dir={rtl ? 'rtl' : 'ltr'}
                  className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                >
                  {isUser ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className={`my-1 list-disc ${rtl ? 'mr-4' : 'ml-4'}`}>{children}</ul>,
                        ol: ({ children }) => <ol className={`my-1 list-decimal ${rtl ? 'mr-4' : 'ml-4'}`}>{children}</ol>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        h1: ({ children }) => <h1 className="text-base font-bold my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold my-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold my-1">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Action buttons (assistant only) */}
                {msg.role === 'assistant' && (
                  <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${rtl ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => copyMessage(msg.content, idx)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copiedIdx === idx ? t(langCode, 'copied') : t(langCode, 'copy')}
                    </button>
                    <AIReportButton user={user} aiResponse={msg.content} prompt={messages[idx - 1]?.content || ''} sessionId={sessionId} language={langCode} />
                    {msg.skill === 'sermon_outline' && (
                      <button onClick={() => saveAsSermonDraft(msg.content)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
                        <FileText className="w-3 h-3" /> {t(langCode, 'saveSermon')}
                      </button>
                    )}
                    {msg.skill === 'study_plan' && (
                      <button onClick={() => saveAsStudyPlan(msg.content)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                        <BookOpen className="w-3 h-3" /> {t(langCode, 'savePlan')}
                      </button>
                    )}
                    {msg.skill === 'bible_search' && (
                      <button onClick={() => navigate(createPageUrl('BibleReader'))}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <BookOpen className="w-3 h-3" /> {t(langCode, 'openBible')}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {msg.role === 'assistant' && rtl && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className={`flex gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-sm text-gray-400">{t(langCode, 'thinking')}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Disclaimer bar */}
      {!isEmpty && (
        <div className="px-4 py-1.5 border-t border-gray-100 bg-amber-50 flex items-center gap-1.5 flex-shrink-0">
          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">{t(langCode, 'warning')}</p>
        </div>
      )}

      {/* Input row */}
      <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className={`flex gap-2 items-end ${rtl ? 'flex-row-reverse' : ''}`}>
          {!isEmpty && (
            <button onClick={reset} title={t(langCode, 'newConversation')} className="text-gray-300 hover:text-gray-500 transition-colors mb-1 flex-shrink-0">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(langCode, 'placeholder')}
            dir={rtl ? 'rtl' : 'ltr'}
            className={`flex-1 min-h-[44px] max-h-[120px] resize-none text-sm border-gray-200 focus-visible:ring-indigo-500 rounded-xl ${rtl ? 'text-right' : ''}`}
            rows={1}
          />
          {/* Send button — on the LEFT when RTL */}
          <Button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0 rounded-xl flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}