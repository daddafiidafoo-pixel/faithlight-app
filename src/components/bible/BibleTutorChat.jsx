import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, Lightbulb, Globe, Heart, BookOpen, ChevronDown, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PERSPECTIVES = [
  { id: 'balanced',    label: 'Balanced',    icon: BookOpen,  color: 'text-indigo-600 bg-indigo-50', desc: 'Standard scholarly view' },
  { id: 'historical',  label: 'Historical',  icon: Globe,     color: 'text-amber-600 bg-amber-50',   desc: 'Historical & cultural context' },
  { id: 'theological', label: 'Theological', icon: Lightbulb, color: 'text-purple-600 bg-purple-50', desc: 'Doctrinal interpretation' },
  { id: 'practical',   label: 'Practical',   icon: Heart,     color: 'text-green-600 bg-green-50',   desc: 'Daily life application' },
];

function FollowUpChip({ question, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors text-left"
    >
      {question}
    </button>
  );
}

function Message({ msg, onFollowUp }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className="max-w-[85%]">
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
        }`}>
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <ReactMarkdown className="prose prose-sm prose-indigo max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        {msg.perspective && (
          <p className="text-[10px] text-gray-400 mt-1 ml-1">{PERSPECTIVES.find(p => p.id === msg.perspective)?.label} perspective</p>
        )}
        {!isUser && msg.followUpQuestions?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.followUpQuestions.map((q, i) => (
              <FollowUpChip key={i} question={q} onClick={() => onFollowUp(q)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SermonNotesBanner({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-3 py-2 hover:from-amber-100 hover:to-orange-100 transition-colors"
    >
      <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <span className="text-xs font-semibold text-amber-800">Generate Sermon Notes from this session</span>
      <Sparkles className="w-3 h-3 text-amber-500 ml-auto flex-shrink-0" />
    </button>
  );
}

export default function BibleTutorChat({ currentVerse, studyContext, isDarkMode }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your Bible Tutor. I can explain verses from **historical**, **theological**, or **practical** perspectives — just choose your lens below. What would you like to explore today?",
      followUpQuestions: [
        'What is the historical background of this passage?',
        'How does this verse apply to my daily life?',
        'What are different theological views on this?',
      ],
    }
  ]);
  const [input, setInput] = useState('');
  const [perspective, setPerspective] = useState('balanced');
  const [showSermonNotes, setShowSermonNotes] = useState(false);
  const [sermonNotes, setSermonNotes] = useState(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [showPerspectives, setShowPerspectives] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentPerspective = PERSPECTIVES.find(p => p.id === perspective);

  const askTutor = useMutation({
    mutationFn: async (userInput) => {
      const userMsg = { id: messages.length + 1, role: 'user', content: userInput };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');

      const context = currentVerse
        ? `Current verse: ${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verse} - "${currentVerse.text}"`
        : studyContext || 'General Bible study';

      const perspectiveInstructions = {
        balanced: 'Provide a well-rounded response covering multiple angles including historical context, theological meaning, and practical application.',
        historical: 'Focus primarily on the HISTORICAL context: the culture, customs, language, geography, and political/social situation of the time. What did this mean to the original audience?',
        theological: 'Focus primarily on the THEOLOGICAL interpretation: doctrinal implications, how this fits into the biblical narrative, cross-references to related Scripture, and different denominational perspectives.',
        practical: 'Focus primarily on PRACTICAL APPLICATION: how does this apply to daily life today? Give concrete, actionable insights. Use relatable modern examples.',
      };

      const prompt = `You are an expert, warm Bible tutor.
Context: ${context}
Perspective mode: ${perspective} — ${perspectiveInstructions[perspective]}

User question: "${userInput}"

Provide a rich but concise response (3-5 paragraphs). Use markdown for clarity (bold key terms, use lists when helpful).

Then end with a JSON block formatted exactly like:
<FOLLOW_UP>
["Question 1?", "Question 2?", "Question 3?"]
</FOLLOW_UP>

Make the follow-up questions natural, insightful, and tailored to what the user just asked.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });

      // Extract follow-up questions from response
      let content = response;
      let followUpQuestions = [];
      const match = content.match(/<FOLLOW_UP>([\s\S]*?)<\/FOLLOW_UP>/);
      if (match) {
        content = content.replace(/<FOLLOW_UP>[\s\S]*?<\/FOLLOW_UP>/, '').trim();
        try { followUpQuestions = JSON.parse(match[1].trim()); } catch {}
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content,
        followUpQuestions,
        perspective,
      }]);

      // Show sermon notes suggestion after 3+ exchanges
      if (newMessages.filter(m => m.role === 'user').length >= 2) {
        setShowSermonNotes(true);
      }
    },
    onError: () => {
      setMessages(prev => [...prev, { id: prev.length + 1, role: 'assistant', content: 'I encountered an error. Please try again.' }]);
    }
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || askTutor.isPending) return;
    askTutor.mutate(trimmed);
  };

  const handleFollowUp = (question) => {
    if (askTutor.isPending) return;
    askTutor.mutate(question);
  };

  const generateSermonNotes = async () => {
    setGeneratingNotes(true);
    const conversation = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');
    const aiResponses = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n');

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this Bible study conversation, create professional sermon notes in a structured format.

User's questions/topics: ${conversation}
Study content covered: ${aiResponses.slice(0, 2000)}
${currentVerse ? `Key verse: ${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verse}` : ''}

Create sermon notes with: Title, Key Scripture, Introduction hook, 3 main points with sub-points, Illustration suggestion, Application, and Closing prayer prompt. Use clear headers and bullet points.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            key_scripture: { type: 'string' },
            introduction: { type: 'string' },
            main_points: { type: 'array', items: { type: 'object', properties: { point: { type: 'string' }, sub_points: { type: 'array', items: { type: 'string' } } } } },
            illustration: { type: 'string' },
            application: { type: 'string' },
            closing_prayer: { type: 'string' },
          }
        }
      });
      setSermonNotes(result);
    } catch {
      setSermonNotes(null);
    }
    setGeneratingNotes(false);
  };

  return (
    <Card style={{ backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF', borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB' }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Bible Tutor
          </span>
          {/* Perspective selector */}
          <div className="relative">
            <button
              onClick={() => setShowPerspectives(v => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all ${currentPerspective?.color} border-current border-opacity-30`}
            >
              {currentPerspective && <currentPerspective.icon className="w-3 h-3" />}
              {currentPerspective?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPerspectives && (
              <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-52 space-y-1">
                {PERSPECTIVES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setPerspective(p.id); setShowPerspectives(false); }}
                    className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-lg text-left transition-all hover:bg-gray-50 ${perspective === p.id ? 'bg-indigo-50' : ''}`}
                  >
                    <p.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.color.split(' ')[0]}`} />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{p.label}</p>
                      <p className="text-[10px] text-gray-500">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Messages */}
        <div
          className="space-y-3 h-80 overflow-y-auto p-3 rounded-xl"
          style={{ backgroundColor: isDarkMode ? '#0F1412' : '#F9FAFB' }}
        >
          {messages.map(msg => (
            <Message key={msg.id} msg={msg} onFollowUp={handleFollowUp} />
          ))}
          {askTutor.isPending && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sermon Notes CTA */}
        {showSermonNotes && !sermonNotes && (
          <SermonNotesBanner onClick={generateSermonNotes} />
        )}

        {/* Sermon Notes Output */}
        {generatingNotes && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
            <Loader2 className="w-4 h-4 animate-spin" /> Generating sermon notes...
          </div>
        )}

        {sermonNotes && !generatingNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> {sermonNotes.title}
              </p>
              <button onClick={() => setSermonNotes(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <p className="text-amber-700 italic">{sermonNotes.key_scripture}</p>
            <p className="text-gray-700">{sermonNotes.introduction}</p>
            {sermonNotes.main_points?.map((mp, i) => (
              <div key={i}>
                <p className="font-bold text-gray-800">{i + 1}. {mp.point}</p>
                {mp.sub_points?.map((sp, j) => <p key={j} className="ml-4 text-gray-600">• {sp}</p>)}
              </div>
            ))}
            {sermonNotes.application && (
              <p className="text-green-700 bg-green-50 rounded-lg p-2 border border-green-100">
                <span className="font-bold">Application:</span> {sermonNotes.application}
              </p>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={textareaRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Ask in ${currentPerspective?.label?.toLowerCase()} perspective...`}
            className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            style={{ backgroundColor: isDarkMode ? '#1A1F1C' : 'white', color: isDarkMode ? '#E5E7EB' : 'inherit' }}
            disabled={askTutor.isPending}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={askTutor.isPending || !input.trim()}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            {askTutor.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}