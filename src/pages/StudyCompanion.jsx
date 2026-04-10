import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, BookOpen, Send, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EXAMPLE_PASSAGES = [
  'John 3:16', 'Romans 8:28', 'Psalm 23', 'Philippians 4:13',
  'Isaiah 40:31', 'Jeremiah 29:11', 'Matthew 5:3-12', 'Proverbs 3:5-6',
];

const EXAMPLE_QUESTIONS = [
  'What does this verse mean in context?',
  'What is the theological significance?',
  'How does this connect to Jesus?',
  'What did this mean to the original audience?',
  'How should I apply this today?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-indigo-700 text-white rounded-tr-sm'
          : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function StudyCompanion() {
  const [passage, setPassage] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async (q, p) => {
    const activePassage = p || passage;
    const activeQuestion = q || question;
    if (!activeQuestion.trim()) return;

    const userMsg = activePassage
      ? `Passage: ${activePassage}\n\nQuestion: ${activeQuestion}`
      : activeQuestion;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuestion('');
    setLoading(true);
    setShowExamples(false);

    try {
      const prompt = `You are a knowledgeable and pastoral Bible Study Companion. A user is asking about the following${activePassage ? ` passage: "${activePassage}"` : ''}.

Their question: "${activeQuestion}"

Instructions:
- Ground your answer in the biblical text
- Provide historical and cultural context where relevant
- Explain theological significance clearly without being preachy
- Connect to the broader biblical narrative when helpful
- Be warm, pastoral, and accessible — not academic jargon
- Keep the response concise (3-5 short paragraphs max)
- If the question is not about the Bible, gently redirect to scripture-related topics`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process your question right now. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-gray-900 text-lg">Study Companion</h1>
            <p className="text-xs text-gray-500">AI-powered Bible Q&A grounded in the text</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto px-4 py-6">

        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Ask about any verse or passage</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Get theological explanations, historical context, and practical applications grounded in scripture.
            </p>

            {/* Example passages */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quick passage</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PASSAGES.map(p => (
                  <button key={p} onClick={() => setPassage(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      passage === p ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Example questions */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Try asking</p>
              <div className="space-y-2">
                {EXAMPLE_QUESTIONS.map(q => (
                  <button key={q} onClick={() => ask(q, passage)}
                    className="w-full text-left px-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Passage input */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Passage (e.g. John 3:16) — optional"
              value={passage}
              onChange={e => setPassage(e.target.value)}
              className="text-sm h-9 bg-gray-50 border-gray-200"
            />
          </div>
          {/* Question input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask your question about this passage..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
              disabled={loading}
            />
            <Button
              onClick={() => ask()}
              disabled={loading || !question.trim()}
              className="bg-indigo-700 hover:bg-indigo-800 px-3 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}