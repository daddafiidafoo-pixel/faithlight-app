import React, { useState } from 'react';
import { XCircle, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Circle, Rocket, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const MISTAKES = [
  {
    n: 1,
    emoji: '🧩',
    title: 'Too Many Features at Launch',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    problem: 'Developers try to build everything before publishing. The app becomes complicated, buggy, or delayed.',
    fix: 'Launch with a clean core set — Bible Reader, Verse of the Day, AI Bible Companion, Quiz, Journal — then add features gradually.',
    faithlight: 'good',
    faithlightNote: 'Core features are already built. Resist adding more before v1.0.',
  },
  {
    n: 2,
    emoji: '🔘',
    title: 'Broken User Experience',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    problem: 'Buttons don\'t respond, search doesn\'t work, or pages are confusing. Users leave within 30 seconds.',
    fix: 'Test every page before launch. Every button must do something. Every search must return a result.',
    faithlight: 'improving',
    faithlightNote: 'Many UX issues already fixed — keep testing every page.',
  },
  {
    n: 3,
    emoji: '🌐',
    title: 'Poor Language Localization',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    problem: 'Users notice immediately if translations are unnatural or mixed with English words.',
    fix: 'Review Afaan Oromoo and Amharic translations carefully. Accurate localization is a major competitive advantage for FaithLight.',
    faithlight: 'warning',
    faithlightNote: 'Some translations like "Abjuubaa", "Jilbeena", "Wariin" need correction by a native speaker.',
  },
  {
    n: 4,
    emoji: '📅',
    title: 'No Daily Engagement Feature',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    problem: 'Apps fail when users open them once and never return. No habit = no retention.',
    fix: 'Include daily habits: Verse of the Day, prayer reminders, reading streaks, daily devotionals.',
    faithlight: 'good',
    faithlightNote: 'Verse of the Day and Journal already implemented. Add prayer reminders in Phase 2.',
  },
  {
    n: 5,
    emoji: '📤',
    title: 'No Sharing Feature',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    problem: 'Without sharing, the app can\'t grow organically. Users have no way to invite others.',
    fix: 'Let users share verse images to WhatsApp, Instagram, Facebook — this spreads the app naturally.',
    faithlight: 'improving',
    faithlightNote: 'Verse sharing is partially implemented. Prioritize finishing it.',
  },
  {
    n: 6,
    emoji: '⚡',
    title: 'Poor Performance',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    problem: 'Slow loading, crashes, or freezing causes users to uninstall immediately.',
    fix: 'Bible pages must load instantly. AI responses within a few seconds. No freezing. Test on both Android and iPhone.',
    faithlight: 'improving',
    faithlightNote: 'Test on real devices. Check AI response times and Bible chapter load speed.',
  },
  {
    n: 7,
    emoji: '🤝',
    title: 'No Community or Feedback Loop',
    color: '#3B5BDB',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    problem: 'Users don\'t feel involved and don\'t return. No sense of community = low loyalty.',
    fix: 'Not needed at launch. Add prayer requests, community reading plans, and discussion questions in Phase 3.',
    faithlight: 'good',
    faithlightNote: 'Prayer Wall and community features already planned for Phase 3.',
  },
];

const QA_CHECKS = [
  'Every button works and has an action',
  'Every page loads without errors',
  'Language switch works everywhere',
  'No English text appears in other languages',
  'No page shows an "error" message',
  'Search and AI responses work correctly',
  'Navigation works correctly on all screens',
  'Bible pages load within 2 seconds',
  'AI responds within 5 seconds',
  'App tested on both Android and iPhone',
];

const DOING_RIGHT = [
  '✔ AI Bible study tools',
  '✔ Multilingual support',
  '✔ Quiz system',
  '✔ Verse sharing',
  '✔ Journaling',
  '✔ Clean UI design',
];

const STATUS_CONFIG = {
  good:      { label: '✔ FaithLight is good here',     color: '#10B981', bg: '#ECFDF5' },
  improving: { label: '⚠ In progress — keep going',    color: '#F59E0B', bg: '#FFFBEB' },
  warning:   { label: '❌ Needs attention before launch', color: '#EF4444', bg: '#FEF2F2' },
};

const STORAGE_KEY = 'faithlight_qa_checks';

export default function AppReviewAudit() {
  const [expanded, setExpanded] = useState({ 0: true });
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });

  const toggleSection = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const toggleCheck = (item) => {
    setChecked(prev => {
      const next = { ...prev, [item]: !prev[item] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const checkedCount = QA_CHECKS.filter(c => checked[c]).length;
  const qaReady = checkedCount === QA_CHECKS.length;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg,#e8eef8 0%,#f0f4fc 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* HERO */}
        <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#3b5bdb 0%,#4f6ef7 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-300" />
            <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">Failure Prevention</span>
          </div>
          <h1 className="text-2xl font-black mb-1">7 Mistakes That Kill Bible Apps</h1>
          <p className="text-blue-200 text-sm">And how FaithLight avoids each one</p>
        </div>

        {/* MISTAKES */}
        {MISTAKES.map((m, i) => {
          const st = STATUS_CONFIG[m.faithlight];
          const isOpen = expanded[i];
          return (
            <div key={i} className="bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: m.border }}>
              <button onClick={() => toggleSection(i)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                  {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">#{m.n} {m.title}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: m.border }}>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">The Problem</p>
                    <p className="text-sm text-gray-600">{m.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">What to Do</p>
                    <p className="text-sm text-gray-700 font-medium">{m.fix}</p>
                  </div>
                  <div className="rounded-2xl p-3 text-sm font-medium" style={{ background: st.bg, color: st.color }}>
                    {m.faithlightNote}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* DOING RIGHT */}
        <div className="bg-white rounded-3xl p-5 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <h2 className="font-black text-gray-900 text-base">What FaithLight Is Doing Right</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DOING_RIGHT.map(item => (
              <div key={item} className="text-sm font-medium text-green-700 bg-green-50 rounded-xl px-3 py-2">{item}</div>
            ))}
          </div>
        </div>

        {/* FORMULA */}
        <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm">
          <h2 className="font-black text-gray-900 text-base mb-3">🏆 Success Formula</h2>
          <div className="space-y-2">
            {['Simple launch', 'Daily engagement features', 'Shareable content', 'Gradual expansion'].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#4f6ef7,#6d8aff)' }}>{i + 1}</div>
                <span className="text-sm font-medium text-gray-800">{step}</span>
                <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 italic text-center">FaithLight already follows this structure.</p>
        </div>

        {/* 30-MIN QA CHECKLIST */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600" />
              <h2 className="font-black text-gray-900 text-base">Final 30-Min QA Test</h2>
            </div>
            <span className="text-sm font-black text-blue-600">{checkedCount}/{QA_CHECKS.length}</span>
          </div>
          <div className="space-y-2">
            {QA_CHECKS.map(item => (
              <button key={item} onClick={() => toggleCheck(item)}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-2xl text-left transition-all"
                style={{ background: checked[item] ? '#ECFDF5' : '#F9FAFB', border: `1px solid ${checked[item] ? '#A7F3D0' : '#F3F4F6'}` }}>
                {checked[item]
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                <span className={`text-sm font-medium ${checked[item] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* READY STATE */}
        {qaReady && (
          <div className="rounded-3xl p-6 text-white text-center shadow-md" style={{ background: 'linear-gradient(135deg,#10B981,#34D399)' }}>
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-black text-xl mb-1">All checks passed!</p>
            <p className="text-green-100 text-sm">FaithLight is ready for App Store submission.</p>
          </div>
        )}

      </div>
    </div>
  );
}