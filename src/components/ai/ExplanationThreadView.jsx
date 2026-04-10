import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Bookmark, BookmarkCheck, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function ExplanationThreadView({ thread, onSavedChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!thread?.id) return;
    loadMessages();
  }, [thread?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const msgs = await base44.entities.AIExplanationMessage.filter(
      { thread_id: thread.id }, 'created_date', 200
    ).catch(() => []);
    setMessages(msgs);
    setLoading(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setSending(true);

    // Save user message
    await base44.entities.AIExplanationMessage.create({
      thread_id: thread.id,
      role: 'user',
      content: text,
    });
    setMessages(prev => [...prev, { role: 'user', content: text, created_date: new Date().toISOString() }]);

    // Build conversation history for AI
    const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical study assistant. The user is studying this passage:

REFERENCE: ${thread.reference}
PASSAGE TEXT: ${thread.passage_text || '(see passage)'}

IMPORTANT RULES:
- Base your explanations ONLY on the actual passage text provided above.
- Do NOT invent or paraphrase scripture text not provided.
- Provide historical, linguistic, and theological context.
- Be clear and accessible.
- If a follow-up question is outside the passage scope, gently note it and redirect.

CONVERSATION HISTORY:
${history}

User: ${text}

Respond as a thoughtful Bible teacher:`,
      });

      const aiMsg = { role: 'assistant', content: response, created_date: new Date().toISOString() };
      await base44.entities.AIExplanationMessage.create({ thread_id: thread.id, role: 'assistant', content: response });
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      toast.error('AI response failed. Please try again.');
    }
    setSending(false);
  };

  const handleToggleSave = async () => {
    setSaving(true);
    const newVal = !thread.saved;
    await base44.entities.AIExplanationThread.update(thread.id, { saved: newVal });
    onSavedChange?.(newVal);
    toast.success(newVal ? 'Explanation saved!' : 'Removed from saved.');
    setSaving(false);
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">{thread.reference}</h3>
          {thread.passage_text && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 italic">"{thread.passage_text}"</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleSave}
          disabled={saving}
          className={`gap-1 ${thread.saved ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : thread.saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {thread.saved ? 'Saved' : 'Save'}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-[420px] pr-1">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Ask a question about this passage to get started.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-amber-100'}`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-indigo-600" />
                : <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
            </div>
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-800 border border-gray-100'}`}>
              {msg.role === 'assistant'
                ? <div className="prose prose-sm prose-slate max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                : <p>{msg.content}</p>}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-100">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Textarea
          placeholder="Ask a follow-up question about this passage…"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={2}
          className="flex-1 resize-none text-sm"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!sending) handleSend(); } }}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 self-end">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}