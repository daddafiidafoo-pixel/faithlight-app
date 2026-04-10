import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Play, Pause, Volume2, RefreshCw, BookOpen, Heart, Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

function Section({ icon, label, color, children }) {
  return (
    <div className={`rounded-2xl p-3 border ${color}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-base">{icon}</span>
        <p className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function DailyStreamWidget({ user }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [wordIndex, setWordIndex] = useState(-1);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const generateBriefing = async () => {
    if (!user) return;
    setLoading(true);
    setBriefing(null);

    try {
      // Fetch context data in parallel
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().split('T')[0];

      const [sessions, prayers, memVerses, goals] = await Promise.all([
        base44.entities.ReadingSession.filter({ user_id: user.id }, '-created_date', 10).catch(() => []),
        base44.entities.PrayerJournal.filter({ user_id: user.id, status: 'active' }, '-created_date', 5).catch(() => []),
        base44.entities.MemoryVerse.filter({ user_id: user.id }, '-created_date', 5).catch(() => []),
        base44.entities.ReadingGoal.filter({ user_id: user.id, is_active: true }, '-created_date', 3).catch(() => []),
      ]);

      const yesterdaySessions = sessions.filter(s => (s.completed_date_local || s.created_date?.split('T')[0]) === yKey);
      const readSummary = yesterdaySessions.length > 0
        ? yesterdaySessions.map(s => `${s.book_id} chapter ${s.chapter_number}`).join(', ')
        : sessions.length > 0 ? `${sessions[0].book_id} chapter ${sessions[0].chapter_number}` : null;

      const prayerList = prayers.slice(0, 3).map(p => p.title || p.content?.slice(0, 60));
      const memVerse = memVerses.find(v => v.mastery_level !== 'mastered');
      const goal = goals[0];

      const prompt = `You are a warm, encouraging spiritual companion creating a brief 3-minute morning audio briefing for a Bible app user named ${user.full_name?.split(' ')[0] || 'friend'}.

Context:
- Today: ${today}
- What they studied recently: ${readSummary || 'Just getting started with Bible reading'}
- Active prayer requests: ${prayerList.length > 0 ? prayerList.join('; ') : 'None logged yet'}
- Memory verse in progress: ${memVerse ? `"${memVerse.verse_text?.slice(0, 80)}..." (${memVerse.verse_ref})` : 'None active'}
- Reading goal: ${goal ? `${goal.title} — ${goal.target} ${goal.goal_type}` : 'No active goal'}

Create a warm, personal 3-minute morning briefing with exactly these 4 sections:
1. "greeting" — A warm 2-sentence good morning greeting referencing today's date and encouraging them
2. "yesterday_study" — A 2-3 sentence reflection on what they studied, with a key insight or takeaway
3. "prayer_focus" — List up to 3 priority prayers for today with a brief encouraging word for each
4. "scripture_prompt" — One specific verse suggestion tied to their reading goals, with a short reflection prompt question

Return JSON: {"greeting":"...","yesterday_study":"...","prayer_focus":["...","...","..."],"scripture_prompt":{"verse_ref":"...","verse_text":"...","prompt":"..."}}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            greeting: { type: 'string' },
            yesterday_study: { type: 'string' },
            prayer_focus: { type: 'array', items: { type: 'string' } },
            scripture_prompt: {
              type: 'object',
              properties: {
                verse_ref: { type: 'string' },
                verse_text: { type: 'string' },
                prompt: { type: 'string' },
              }
            }
          }
        }
      });
      setBriefing(result);
    } catch (e) {
      setBriefing({
        greeting: `Good morning! Today is ${today}. May your time in God's Word be rich and nourishing.`,
        yesterday_study: "Keep pressing forward in your study — every chapter brings you closer to understanding God's heart.",
        prayer_focus: ["Continue lifting your heart to God in prayer today."],
        scripture_prompt: { verse_ref: "Psalm 119:105", verse_text: "Your word is a lamp to my feet and a light to my path.", prompt: "How does God's Word illuminate a decision you're facing today?" }
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) generateBriefing();
  }, [user?.id]);

  const fullScript = briefing ? [
    briefing.greeting,
    'Yesterday\'s study: ' + briefing.yesterday_study,
    'Today\'s prayers: ' + (briefing.prayer_focus || []).join('. '),
    `Scripture for today, ${briefing.scripture_prompt?.verse_ref}: ${briefing.scripture_prompt?.verse_text} — ${briefing.scripture_prompt?.prompt}`,
  ].join(' ... ') : '';

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window) || !fullScript) return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setWordIndex(-1);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(fullScript);
    utter.rate = 0.92;
    utter.pitch = 1.0;
    utter.onend = () => { setPlaying(false); setWordIndex(-1); };
    utter.onerror = () => { setPlaying(false); setWordIndex(-1); };
    window.speechSynthesis.speak(utter);
    utteranceRef.current = utter;
    setPlaying(true);
  };

  if (!user) return null;

  return (
    <div className="mb-5 rounded-3xl overflow-hidden border border-indigo-100 shadow-lg"
      style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)' }}>
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-3.5 h-3.5 text-amber-900" />
            </div>
            <p className="text-white font-extrabold text-sm">Morning Briefing</p>
          </div>
          <p className="text-indigo-300 text-xs ml-9">{today}</p>
        </div>
        <button onClick={generateBriefing} disabled={loading}
          className="text-indigo-300 hover:text-white transition-colors p-1">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Player bar */}
      <div className="mx-4 mb-3 bg-white/10 rounded-2xl p-3 flex items-center gap-3">
        <button onClick={handlePlayPause} disabled={loading || !briefing}
          className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all shadow-lg">
          {playing ? <Pause className="w-5 h-5 text-amber-900" /> : <Play className="w-5 h-5 text-amber-900 ml-0.5" />}
        </button>
        <div className="flex-1">
          <p className="text-white text-xs font-bold">
            {loading ? 'Preparing your briefing…' : playing ? 'Playing…' : 'Your 3-min morning stream'}
          </p>
          <div className="h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
            {playing && <div className="h-full bg-amber-400 rounded-full animate-pulse w-1/3" />}
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
      </div>

      {/* Content preview */}
      {loading && (
        <div className="px-4 pb-4 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
          <p className="text-indigo-300 text-xs">Gathering your spiritual context…</p>
        </div>
      )}

      {briefing && (
        <div className="px-4 pb-4 space-y-2">
          {/* Greeting always shown */}
          <p className="text-indigo-100 text-xs leading-relaxed">{briefing.greeting}</p>

          {/* Expand toggle */}
          <button onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-indigo-300 hover:text-white transition-colors font-bold">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Collapse' : 'View full briefing'}
          </button>

          {expanded && (
            <div className="space-y-2 mt-1">
              <Section icon="📖" label="Yesterday's Study" color="bg-white/10 border-white/10">
                <p className="text-indigo-100 text-xs leading-relaxed">{briefing.yesterday_study}</p>
              </Section>

              <Section icon="🙏" label="Priority Prayers Today" color="bg-white/10 border-white/10">
                <ul className="space-y-1">
                  {(briefing.prayer_focus || []).map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-indigo-100">
                      <span className="text-rose-300 font-bold flex-shrink-0">{i + 1}.</span> {p}
                    </li>
                  ))}
                </ul>
              </Section>

              {briefing.scripture_prompt && (
                <Section icon="✨" label="Scripture Prompt" color="bg-amber-400/20 border-amber-300/30">
                  <p className="text-amber-200 text-xs font-bold mb-0.5">{briefing.scripture_prompt.verse_ref}</p>
                  <p className="text-amber-100 text-xs italic mb-1.5">"{briefing.scripture_prompt.verse_text}"</p>
                  <p className="text-amber-200 text-xs">💬 {briefing.scripture_prompt.prompt}</p>
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}