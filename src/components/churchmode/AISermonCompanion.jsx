import React, { useState } from 'react';
import { Sparkles, MessageCircle, Heart, BookOpen, ChevronDown, ChevronUp, Loader2, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const ACTIONS = [
  { id: 'explain',    icon: BookOpen,      label: 'Explain Today\'s Message',  color: 'bg-indigo-500' },
  { id: 'reflect',    icon: Sparkles,      label: 'Reflection Questions',       color: 'bg-purple-500' },
  { id: 'prayer',     icon: Heart,         label: 'Generate a Prayer',          color: 'bg-rose-500'   },
  { id: 'ask',        icon: MessageCircle, label: 'Ask a Question',             color: 'bg-amber-500'  },
];

export default function AISermonCompanion({ session }) {
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  const sermonData = {
    sermonTitle: session?.title || 'Today\'s Sermon',
    mainVerse: (session?.verseRefs || [])[0] || '',
    allVerses: (session?.verseRefs || []).join(', '),
    outline: session?.outlineJson
      ? (session.outlineJson.sections || session.outlineJson.points || [])
          .map(s => s.title || s.heading || s.content || '').filter(Boolean)
      : [],
    churchName: session?.churchName || '',
    language: session?.language || 'en',
  };

  const invoke = async (action, customQuestion = '') => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('sermonCompanion', {
        action,
        ...sermonData,
        question: customQuestion,
      });
      if (res.data?.result) {
        setResult(res.data.result);
      } else {
        setError(res.data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionId) => {
    if (actionId === 'ask') {
      setActiveAction('ask');
      setResult(null);
      return;
    }
    setActiveAction(actionId);
    invoke(actionId);
  };

  const handleAskSubmit = () => {
    if (!question.trim()) return;
    invoke('ask', question);
  };

  const handleClose = () => {
    setActiveAction(null);
    setResult(null);
    setQuestion('');
    setError('');
  };

  return (
    <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Sermon Companion</p>
            <p className="text-xs text-indigo-300">Deepen your understanding of today's message</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 grid grid-cols-2 gap-2">
        {ACTIONS.map(({ id, icon: Icon, label, color }) => (
          <button
            key={id}
            onClick={() => handleAction(id)}
            disabled={loading && activeAction === id}
            className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-all ${
              activeAction === id
                ? 'bg-white/20 border-2 border-white/40'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
              {loading && activeAction === id
                ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                : <Icon className="w-3.5 h-3.5 text-white" />
              }
            </div>
            <span className="text-xs font-medium text-white leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* Ask a question input */}
      {activeAction === 'ask' && !result && (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskSubmit()}
              placeholder="e.g. How can I apply this message this week?"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-indigo-300 outline-none focus:border-amber-400 transition-colors"
              autoFocus
            />
            <button
              onClick={handleAskSubmit}
              disabled={!question.trim() || loading}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
          {/* Suggested questions */}
          <div className="space-y-1">
            {[
              `What does ${sermonData.mainVerse || 'this verse'} mean today?`,
              'How can I apply this message this week?',
              'What other Bible verses relate to this sermon?',
            ].map(q => (
              <button
                key={q}
                onClick={() => { setQuestion(q); }}
                className="w-full text-left text-xs text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mx-4 mb-4 bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {(() => { const a = ACTIONS.find(x => x.id === activeAction); return a ? <a.icon className="w-4 h-4 text-amber-300" /> : null; })()}
              <p className="text-xs font-semibold text-white">
                {ACTIONS.find(a => a.id === activeAction)?.label}
              </p>
            </div>
            <button onClick={handleClose} className="text-indigo-300 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 py-4 max-h-72 overflow-y-auto">
            <p className="text-sm text-indigo-100 leading-relaxed whitespace-pre-line">{result}</p>
          </div>
          {/* Share nudge */}
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                const text = `📖 ${sermonData.sermonTitle}${sermonData.mainVerse ? `\n${sermonData.mainVerse}` : ''}\n\n${result.slice(0, 200)}...\n\nStudied with FaithLight`;
                if (navigator.share) navigator.share({ text }).catch(() => {});
                else navigator.clipboard.writeText(text);
              }}
              className="w-full text-xs text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl py-2.5 transition-colors font-medium"
            >
              Share this insight ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}