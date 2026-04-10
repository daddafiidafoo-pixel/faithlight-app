import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, BookOpen, Lightbulb, GitBranch, HelpCircle, Heart, BookMarked, Check, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// ── Topic → Verses map ──────────────────────────────────────────────────────
const TOPICS = [
  { id: 'anxiety',     emoji: '😮‍💨', label: 'Anxiety',     color: 'bg-blue-100 text-blue-700 border-blue-200',     activeColor: 'bg-blue-600 text-white border-blue-600',
    verses: [
      { reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
      { reference: 'Isaiah 41:10',      text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.' },
      { reference: '1 Peter 5:7',       text: 'Cast all your anxiety on him because he cares for you.' },
      { reference: 'Matthew 6:34',      text: 'Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.' },
    ]
  },
  { id: 'faith',       emoji: '🙏', label: 'Faith',       color: 'bg-purple-100 text-purple-700 border-purple-200', activeColor: 'bg-purple-600 text-white border-purple-600',
    verses: [
      { reference: 'Hebrews 11:1',      text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
      { reference: 'Romans 10:17',      text: 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.' },
      { reference: 'Proverbs 3:5-6',    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
      { reference: 'Mark 11:24',        text: 'Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.' },
    ]
  },
  { id: 'strength',    emoji: '💪', label: 'Strength',    color: 'bg-orange-100 text-orange-700 border-orange-200', activeColor: 'bg-orange-500 text-white border-orange-500',
    verses: [
      { reference: 'Philippians 4:13',  text: 'I can do all things through Christ who strengthens me.' },
      { reference: 'Isaiah 40:31',      text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
      { reference: 'Psalm 46:1',        text: 'God is our refuge and strength, an ever-present help in trouble.' },
      { reference: '2 Corinthians 12:9',text: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness."' },
    ]
  },
  { id: 'purpose',     emoji: '🌟', label: 'Purpose',     color: 'bg-yellow-100 text-yellow-700 border-yellow-200', activeColor: 'bg-yellow-500 text-white border-yellow-500',
    verses: [
      { reference: 'Jeremiah 29:11',    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
      { reference: 'Romans 8:28',       text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
      { reference: 'Ephesians 2:10',    text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.' },
    ]
  },
  { id: 'forgiveness', emoji: '🕊️', label: 'Forgiveness', color: 'bg-green-100 text-green-700 border-green-200',   activeColor: 'bg-green-600 text-white border-green-600',
    verses: [
      { reference: '1 John 1:9',        text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.' },
      { reference: 'Ephesians 4:32',    text: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.' },
      { reference: 'Colossians 3:13',   text: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.' },
    ]
  },
  { id: 'prayer',      emoji: '🙌', label: 'Prayer',      color: 'bg-indigo-100 text-indigo-700 border-indigo-200', activeColor: 'bg-indigo-600 text-white border-indigo-600',
    verses: [
      { reference: 'Matthew 7:7',       text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.' },
      { reference: 'James 5:16',        text: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.' },
      { reference: 'Psalm 46:10',       text: 'He says, "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."' },
    ]
  },
  { id: 'hope',        emoji: '🌅', label: 'Hope',        color: 'bg-rose-100 text-rose-700 border-rose-200',       activeColor: 'bg-rose-500 text-white border-rose-500',
    verses: [
      { reference: 'Romans 15:13',      text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
      { reference: 'Psalm 31:24',       text: 'Be strong and take heart, all you who hope in the Lord.' },
      { reference: 'Lamentations 3:22-23', text: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.' },
    ]
  },
];

// ── Multi-day study plans ───────────────────────────────────────────────────
const STUDY_PLANS = [
  {
    id: 'anxiety7',
    title: 'Overcoming Anxiety',
    days: 7,
    emoji: '😮‍💨',
    color: 'from-blue-500 to-indigo-600',
    description: 'Find God\'s peace in every worry',
    verses: [
      { reference: 'Philippians 4:6-7',   text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
      { reference: 'Isaiah 41:10',         text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.' },
      { reference: '1 Peter 5:7',          text: 'Cast all your anxiety on him because he cares for you.' },
      { reference: 'Matthew 6:25-26',      text: 'Therefore I tell you, do not worry about your life, what you will eat or drink; or about your body, what you will wear. Is not life more than food, and the body more than clothes?' },
      { reference: 'Psalm 94:19',          text: 'When anxiety was great within me, your consolation brought me joy.' },
      { reference: 'John 14:27',           text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.' },
      { reference: 'Romans 8:38-39',       text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.' },
    ],
  },
  {
    id: 'prayer5',
    title: 'Growing in Prayer',
    days: 5,
    emoji: '🙏',
    color: 'from-purple-500 to-pink-600',
    description: 'Deepen your conversation with God',
    verses: [
      { reference: 'Matthew 7:7-8',        text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you. For everyone who asks receives; the one who seeks finds; and to the one who knocks, the door will be opened.' },
      { reference: 'Luke 18:1',            text: 'Then Jesus told his disciples a parable to show them that they should always pray and not give up.' },
      { reference: 'James 5:16',           text: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.' },
      { reference: '1 Thessalonians 5:17', text: 'Pray continually.' },
      { reference: 'Psalm 46:10',          text: 'He says, "Be still, and know that I am God."' },
    ],
  },
  {
    id: 'faith7',
    title: 'Walking by Faith',
    days: 7,
    emoji: '🌟',
    color: 'from-amber-500 to-orange-600',
    description: 'Trust God\'s plan for your life',
    verses: [
      { reference: 'Hebrews 11:1',         text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
      { reference: 'Proverbs 3:5-6',       text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
      { reference: '2 Corinthians 5:7',    text: 'For we live by faith, not by sight.' },
      { reference: 'Romans 10:17',         text: 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.' },
      { reference: 'Matthew 17:20',        text: 'Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, "Move from here to there," and it will move.' },
      { reference: 'James 2:17',           text: 'In the same way, faith by itself, if it is not accompanied by action, is dead.' },
      { reference: 'Galatians 2:20',       text: 'I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God.' },
    ],
  },
  {
    id: 'purpose5',
    title: 'Finding Your Purpose',
    days: 5,
    emoji: '🎯',
    color: 'from-green-500 to-teal-600',
    description: 'Discover God\'s calling for your life',
    verses: [
      { reference: 'Jeremiah 29:11',       text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
      { reference: 'Ephesians 2:10',       text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.' },
      { reference: 'Romans 12:6-8',        text: 'We have different gifts, according to the grace given to each of us. If your gift is prophesying, then prophesy in accordance with your faith.' },
      { reference: '1 Corinthians 10:31',  text: 'So whether you eat or drink or whatever you do, do it all for the glory of God.' },
      { reference: 'Colossians 3:23',      text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
    ],
  },
];

// ── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'verse',      icon: BookOpen,    label: 'Verse',       color: 'bg-indigo-500' },
  { id: 'explain',    icon: Lightbulb,   label: 'Explanation', color: 'bg-purple-500' },
  { id: 'context',    icon: BookMarked,  label: 'Historical',  color: 'bg-blue-500'   },
  { id: 'crossref',   icon: GitBranch,   label: 'Cross-Refs',  color: 'bg-teal-500'   },
  { id: 'reflection', icon: HelpCircle,  label: 'Reflection',  color: 'bg-orange-500' },
  { id: 'prayer',     icon: Heart,       label: 'Prayer',      color: 'bg-rose-500'   },
  { id: 'journal',    icon: Check,       label: 'Journal',     color: 'bg-green-500'  },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
              isDone ? 'bg-green-500' : isActive ? step.color : 'bg-gray-200'
            }`}>
              {isDone ? <Check size={14} className="text-white" /> : <Icon size={14} className={isActive ? 'text-white' : 'text-gray-400'} />}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-0.5 transition-all duration-300 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoadingCard({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{label || 'Generating…'}</p>
    </div>
  );
}

// ── Topic Picker ─────────────────────────────────────────────────────────────
function TopicPicker({ onSelectVerse }) {
  const [activeTopic, setActiveTopic] = useState(null);

  const topic = TOPICS.find(t => t.id === activeTopic);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-900">Study by Topic</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TOPICS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTopic(activeTopic === t.id ? null : t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeTopic === t.id ? t.activeColor : t.color
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {topic && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-2">Pick a verse to study:</p>
          {topic.verses.map(v => (
            <button
              key={v.reference}
              onClick={() => onSelectVerse(v)}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm"
            >
              <span className="font-semibold text-indigo-700">{v.reference}</span>
              <span className="text-gray-400 ml-2 text-xs">— {v.text.slice(0, 55)}…</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Study Plans ──────────────────────────────────────────────────────────────
function StudyPlansTab({ onStartPlan }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="text-sm text-gray-500">Multi-day journeys through Scripture</p>
      </div>
      {STUDY_PLANS.map(plan => (
        <div key={plan.id} className={`rounded-2xl bg-gradient-to-r ${plan.color} p-5 text-white shadow-md`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-2xl">{plan.emoji}</span>
              <h3 className="font-bold text-lg mt-1">{plan.title}</h3>
              <p className="text-white/80 text-sm">{plan.description}</p>
            </div>
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold">
              {plan.days} Days
            </span>
          </div>

          {/* Day previews */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {plan.verses.map((v, i) => (
              <div key={i} className="flex-shrink-0 bg-white/15 rounded-lg px-2.5 py-1.5 text-center min-w-[56px]">
                <p className="text-xs font-bold text-white/60">Day {i + 1}</p>
                <p className="text-xs text-white font-medium leading-tight">{v.reference.split(' ').slice(-1)[0]}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => onStartPlan(plan)}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold"
            size="sm"
          >
            Start {plan.days}-Day Study →
          </Button>
        </div>
      ))}
    </div>
  );
}

// ── Active Plan Progress ─────────────────────────────────────────────────────
function ActivePlanBanner({ plan, dayIndex, onPickDay, onClear }) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Active Plan</p>
          <p className="font-bold text-gray-900">{plan.emoji} {plan.title}</p>
        </div>
        <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">✕ Exit</button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {plan.verses.map((v, i) => (
          <button
            key={i}
            onClick={() => onPickDay(i)}
            className={`flex-shrink-0 rounded-lg px-2.5 py-1.5 text-center min-w-[52px] border transition-all ${
              i === dayIndex
                ? 'bg-indigo-600 text-white border-indigo-600'
                : i < dayIndex
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <p className="text-xs font-bold">{i < dayIndex ? '✓' : `D${i + 1}`}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GuidedStudy() {
  const [tab, setTab] = useState('study'); // 'study' | 'plans'
  const [step, setStep] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [customRef, setCustomRef] = useState('');
  const [aiData, setAiData] = useState({});
  const [loading, setLoading] = useState(false);
  const [journalNote, setJournalNote] = useState('');
  const [saved, setSaved] = useState(false);

  // Active study plan state
  const [activePlan, setActivePlan] = useState(null);
  const [planDayIndex, setPlanDayIndex] = useState(0);

  const verse = selectedVerse;

  useEffect(() => {
    const today = new Date();
    const dateKey = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    base44.entities.DailyVerse.filter({ dateKey, language: 'en' })
      .then(r => { if (r?.[0] && !selectedVerse) setSelectedVerse({ reference: r[0].reference, text: r[0].verseText }); })
      .catch(() => {});
  }, []);

  const generate = async (key, prompt) => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
      });
      setAiData(prev => ({ ...prev, [key]: result.content }));
    } finally {
      setLoading(false);
    }
  };

  const goNext = async () => {
    const nextStep = step + 1;
    setStep(nextStep);
    if (!verse) return;
    if (nextStep === 1 && !aiData.explain)    await generate('explain',    `Explain the Bible verse "${verse.reference}: ${verse.text}" in a warm, accessible way. 3-4 sentences. Focus on the core spiritual meaning and practical relevance for today.`);
    if (nextStep === 2 && !aiData.context)    await generate('context',    `Give the historical and cultural context for the Bible verse "${verse.reference}". Who wrote it, when, and what was happening? 3-4 sentences.`);
    if (nextStep === 3 && !aiData.crossref)   await generate('crossref',   `List 3-4 cross-reference Bible verses that complement "${verse.reference}". For each, give the reference and one sentence explaining the connection. Format as a plain list.`);
    if (nextStep === 4 && !aiData.reflection) await generate('reflection', `Write 2 thoughtful reflection questions based on "${verse.reference}: ${verse.text}" that help a believer apply this verse to their daily life.`);
    if (nextStep === 5 && !aiData.prayer)     await generate('prayer',     `Write a sincere, personal prayer (8-10 sentences) inspired by "${verse.reference}: ${verse.text}". Address God directly, reference the verse's themes, and close with thanksgiving.`);
  };

  const goPrev = () => setStep(s => Math.max(0, s - 1));

  const handleVerseSelect = (v) => {
    setSelectedVerse(v);
    setAiData({});
    setSaved(false);
    setStep(0);
  };

  const handleCustomVerse = async () => {
    if (!customRef.trim()) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Give me the exact text of Bible verse "${customRef}" in the World English Bible translation. Respond with JSON only.`,
        response_json_schema: { type: 'object', properties: { reference: { type: 'string' }, text: { type: 'string' } } }
      });
      setSelectedVerse({ reference: result.reference || customRef, text: result.text || '' });
      setAiData({});
      setSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = (plan) => {
    setActivePlan(plan);
    setPlanDayIndex(0);
    handleVerseSelect(plan.verses[0]);
    setTab('study');
  };

  const handlePickPlanDay = (i) => {
    setPlanDayIndex(i);
    handleVerseSelect(activePlan.verses[i]);
  };

  const handleSaveJournal = async () => {
    // Fire streak for completing a guided study
    const localDate = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
    base44.functions.invoke('streakManager', { activityType: 'guided_study', localDate }).catch(() => {});

    try {
      const user = await base44.auth.me().catch(() => null);
      await base44.entities.JournalEntry.create({
        user_id: user?.id || 'anonymous',
        entry_date: new Date().toISOString().split('T')[0],
        content: `Study: ${verse?.reference}\n\n${aiData.prayer ? 'Prayer:\n' + aiData.prayer + '\n\n' : ''}${journalNote ? 'My reflection:\n' + journalNote : ''}`,
        related_verse: verse?.reference,
        mood: 'peaceful',
      });
    } catch {}
    setSaved(true);

    // Advance plan day if active
    if (activePlan && planDayIndex < activePlan.verses.length - 1) {
      const next = planDayIndex + 1;
      setPlanDayIndex(next);
    }
  };

  const restart = () => { setStep(0); setAiData({}); setSaved(false); setJournalNote(''); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900">📖 Guided Study</h1>
          <p className="text-gray-500 text-sm mt-1">A step-by-step journey through Scripture</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-5">
          <button
            onClick={() => setTab('study')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'study' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={15} /> Study Session
          </button>
          <button
            onClick={() => setTab('plans')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'plans' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar size={15} /> Study Plans
          </button>
        </div>

        {/* Study Plans tab */}
        {tab === 'plans' && <StudyPlansTab onStartPlan={handleStartPlan} />}

        {/* Study Session tab */}
        {tab === 'study' && (
          <>
            {/* Active plan banner */}
            {activePlan && (
              <ActivePlanBanner
                plan={activePlan}
                dayIndex={planDayIndex}
                onPickDay={handlePickPlanDay}
                onClear={() => setActivePlan(null)}
              />
            )}

            <StepIndicator currentStep={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* STEP 0: Verse Selection */}
                {step === 0 && (
                  <div className="space-y-4">
                    {/* Topic picker */}
                    <TopicPicker onSelectVerse={v => { handleVerseSelect(v); }} />

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium">or choose directly</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={18} className="text-indigo-600" />
                        <h2 className="font-semibold text-gray-900">Quick Picks</h2>
                      </div>
                      <div className="space-y-2 mb-4">
                        {[
                          { reference: 'Isaiah 41:10',   text: 'Fear not, for I am with you; be not dismayed, for I am your God...' },
                          { reference: 'John 3:16',       text: 'For God so loved the world that he gave his one and only Son...' },
                          { reference: 'Romans 8:28',     text: 'And we know that in all things God works for the good of those who love him...' },
                          { reference: 'Psalm 23:1',      text: 'The LORD is my shepherd; I shall not want.' },
                          { reference: 'Jeremiah 29:11',  text: 'For I know the plans I have for you, declares the Lord...' },
                        ].map(v => (
                          <button
                            key={v.reference}
                            onClick={() => handleVerseSelect(v)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                              verse?.reference === v.reference
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-semibold">{v.reference}</span>
                            <span className="text-gray-400 ml-2 text-xs">— {v.text.slice(0, 55)}…</span>
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-500 mb-2">Or enter any reference:</p>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                            placeholder="e.g. Romans 8:38"
                            value={customRef}
                            onChange={e => setCustomRef(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCustomVerse()}
                          />
                          <Button onClick={handleCustomVerse} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Go'}
                          </Button>
                        </div>
                      </div>

                      {verse && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-600 mb-1">{verse.reference}</p>
                          <p className="text-sm text-gray-700 italic">"{verse.text}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 1: Explanation */}
                {step === 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1"><Lightbulb size={20} className="text-purple-600" /><h2 className="font-semibold text-gray-900">Explanation</h2></div>
                    <p className="text-xs text-indigo-600 font-medium mb-4">{verse?.reference}</p>
                    <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-gray-600 text-sm mb-5">"{verse?.text}"</blockquote>
                    {loading && !aiData.explain ? <LoadingCard label="Generating explanation…" /> : <p className="text-gray-700 leading-relaxed text-sm">{aiData.explain}</p>}
                  </div>
                )}

                {/* STEP 2: Historical Context */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1"><BookMarked size={20} className="text-blue-600" /><h2 className="font-semibold text-gray-900">Historical Context</h2></div>
                    <p className="text-xs text-blue-600 font-medium mb-4">{verse?.reference}</p>
                    {loading && !aiData.context ? <LoadingCard label="Loading context…" /> : <p className="text-gray-700 leading-relaxed text-sm">{aiData.context}</p>}
                  </div>
                )}

                {/* STEP 3: Cross References */}
                {step === 3 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1"><GitBranch size={20} className="text-teal-600" /><h2 className="font-semibold text-gray-900">Cross References</h2></div>
                    <p className="text-xs text-teal-600 font-medium mb-4">{verse?.reference}</p>
                    {loading && !aiData.crossref ? <LoadingCard label="Finding related verses…" /> : <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{aiData.crossref}</div>}
                  </div>
                )}

                {/* STEP 4: Reflection */}
                {step === 4 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1"><HelpCircle size={20} className="text-orange-600" /><h2 className="font-semibold text-gray-900">Reflection Questions</h2></div>
                    <p className="text-xs text-orange-600 font-medium mb-4">{verse?.reference}</p>
                    {loading && !aiData.reflection ? <LoadingCard label="Crafting questions…" /> : <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{aiData.reflection}</div>}
                  </div>
                )}

                {/* STEP 5: Prayer */}
                {step === 5 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1"><Heart size={20} className="text-rose-600" /><h2 className="font-semibold text-gray-900">Generated Prayer</h2></div>
                    <p className="text-xs text-rose-600 font-medium mb-4">{verse?.reference}</p>
                    {loading && !aiData.prayer ? <LoadingCard label="Writing your prayer…" /> : <p className="text-gray-700 text-sm leading-relaxed italic">{aiData.prayer}</p>}
                  </div>
                )}

                {/* STEP 6: Journal */}
                {step === 6 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1"><Check size={20} className="text-green-600" /><h2 className="font-semibold text-gray-900">Save to Journal</h2></div>
                    <p className="text-xs text-green-600 font-medium mb-4">{verse?.reference} — Study Complete 🎉</p>
                    {!saved ? (
                      <>
                        <p className="text-xs text-gray-500 mb-2">Add a personal reflection (optional):</p>
                        <Textarea className="mb-4 text-sm resize-none" rows={4} placeholder="What stood out to you today? How will you apply this verse?" value={journalNote} onChange={e => setJournalNote(e.target.value)} />
                        <Button onClick={handleSaveJournal} className="w-full bg-green-600 hover:bg-green-700">💾 Save to Journal</Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="font-semibold text-gray-800 mb-1">Saved to your journal!</p>
                        <p className="text-sm text-gray-500 mb-6">Great study of {verse?.reference}</p>
                        {activePlan && planDayIndex < activePlan.verses.length - 1 ? (
                          <Button onClick={() => handlePickPlanDay(planDayIndex + 1)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                            Next Day → {activePlan.verses[planDayIndex + 1]?.reference}
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={restart} className="gap-2">
                            <RefreshCw size={14} /> Start Another Study
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {!(step === 6 && saved) && (
              <div className="flex items-center justify-between mt-5">
                <Button variant="outline" onClick={goPrev} disabled={step === 0} className="gap-1">
                  <ChevronLeft size={16} /> Back
                </Button>
                <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>
                {step < 6 ? (
                  <Button onClick={goNext} disabled={step === 0 && !verse} className="gap-1 bg-indigo-600 hover:bg-indigo-700">
                    {step === 5 ? 'Finish' : 'Next'} <ChevronRight size={16} />
                  </Button>
                ) : <div />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}