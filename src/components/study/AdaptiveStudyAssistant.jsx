import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, Bot, User, ChevronDown, ChevronUp, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';

// Analyzes a plan's localStorage progress and returns stats
function analyzePlanProgress(plans) {
  const stats = { totalReadings: 0, completedReadings: 0, activePlans: 0, strugglingTopics: [], masteredTopics: [] };
  plans.forEach(plan => {
    const progress = (() => { try { return JSON.parse(localStorage.getItem(`plan_progress_${plan.id}`) || '{}'); } catch { return {}; } })();
    const days = plan.days || [];
    const total = days.reduce((a, d) => a + (d.readings?.length || 0), 0);
    const done = Object.values(progress).filter(Boolean).length;
    stats.totalReadings += total;
    stats.completedReadings += done;
    if (total > 0) stats.activePlans++;
    const pct = total > 0 ? done / total : 0;
    if (pct < 0.2 && total > 3) stats.strugglingTopics.push(...(plan.topics || plan.tags || []));
    if (pct > 0.7) stats.masteredTopics.push(...(plan.topics || plan.tags || []));
  });
  return stats;
}

// ── Chat Bubble ────────────────────────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-amber-100'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-amber-700" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
        {msg.content}
        {msg.suggestions?.length > 0 && (
          <div className="mt-3 space-y-1">
            {msg.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs bg-white/20 rounded-lg px-2 py-1">
                <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" /> {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Progress Insight Bar ───────────────────────────────────────────────────────
function ProgressInsights({ stats }) {
  const pct = stats.totalReadings > 0 ? Math.round((stats.completedReadings / stats.totalReadings) * 100) : 0;
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-indigo-50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-indigo-700">{pct}%</p>
        <p className="text-xs text-indigo-500">Overall Progress</p>
      </div>
      <div className="bg-green-50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-green-700">{stats.completedReadings}</p>
        <p className="text-xs text-green-500">Readings Done</p>
      </div>
      <div className="bg-amber-50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-amber-700">{stats.activePlans}</p>
        <p className="text-xs text-amber-500">Active Plans</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdaptiveStudyAssistant({ user, plans = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef(null);

  const stats = analyzePlanProgress(plans);

  const systemContext = `You are a compassionate AI Bible study coach inside the FaithLight app. 
The user has ${stats.activePlans} active reading plan(s), completed ${stats.completedReadings}/${stats.totalReadings} readings (${stats.totalReadings > 0 ? Math.round(stats.completedReadings / stats.totalReadings * 100) : 0}% overall).
${stats.strugglingTopics.length > 0 ? `Potential struggle areas: ${[...new Set(stats.strugglingTopics)].join(', ')}.` : ''}
${stats.masteredTopics.length > 0 ? `Strong areas: ${[...new Set(stats.masteredTopics)].join(', ')}.` : ''}

Your role:
- Encourage the user with their progress
- Suggest specific Bible passages if they are struggling
- Recommend simpler or deeper plans based on their pace
- Offer proactive spiritual guidance and accountability
- Answer Bible study questions
- Be warm, encouraging, and Scripture-grounded
Keep replies concise (3-4 sentences max). If recommending readings, list them clearly.`;

  const initChat = async () => {
    if (initialized) return;
    setInitialized(true);
    setLoading(true);
    try {
      const greeting = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemContext}\n\nGenerate a warm, personalized greeting for the user. Reference their actual progress stats. Offer one specific encouragement or recommendation. End with an open question to start a conversation.`,
      });
      setMessages([{ role: 'assistant', content: greeting }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !initialized) initChat();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemContext}\n\nConversation so far:\n${history}\n\nUser: ${userMsg.content}\n\nCoach (respond helpfully and concisely):`,
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            suggestions: { type: 'array', items: { type: 'string' }, description: 'Optional list of specific Bible passages or reading recommendations' }
          }
        }
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message || response,
        suggestions: response.suggestions?.length > 0 ? response.suggestions : []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Why am I falling behind?",
    "Suggest a next reading",
    "Help me stay motivated",
    "What should I focus on?",
  ];

  return (
    <div className="mt-6">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">AI Study Coach</span>
          <Badge className="bg-white/20 text-white border-0 text-xs">Adaptive</Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <Card className="mt-2 border-indigo-200 shadow-lg">
          <CardContent className="p-4">
            <ProgressInsights stats={stats} />

            {stats.strugglingTopics.length > 0 && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Low progress detected in: {[...new Set(stats.strugglingTopics)].slice(0, 3).join(', ')}. Your coach can help!
              </div>
            )}

            {/* Chat window */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-3 pr-1">
              {loading && messages.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Preparing your personalized coach...
                </div>
              ) : (
                messages.map((m, i) => <ChatBubble key={i} msg={m} />)
              )}
              {loading && messages.length > 0 && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-400">Thinking...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickPrompts.map(p => (
                  <button key={p} onClick={() => { setInput(p); }}
                    className="text-xs px-2.5 py-1 border border-indigo-200 text-indigo-700 rounded-full hover:bg-indigo-50 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask your study coach anything..." rows={1} className="flex-1 resize-none text-sm" />
              <Button size="sm" onClick={sendMessage} disabled={loading || !input.trim()} className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}