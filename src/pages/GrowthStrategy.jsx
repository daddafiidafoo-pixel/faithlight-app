import React, { useState } from 'react';
import { CheckCircle2, Circle, Rocket, TrendingUp, Users, Globe2, Star, ChevronDown, ChevronUp, BookOpen, Bot, Mic, Share2, Heart, Church, Languages, Video, Wifi, Calendar, Zap, Target } from 'lucide-react';

const PHASES = [
  {
    phase: 1,
    emoji: '🚀',
    title: 'Launch',
    range: '0 → 5,000 users',
    duration: '3 months',
    color: '#4F6EF7',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    status: 'active',
    goal: 'Release a stable app and gather real feedback.',
    features: [
      { icon: BookOpen, label: 'Bible Reader' },
      { icon: Star,     label: 'Verse of the Day' },
      { icon: Bot,      label: 'AI Bible Companion' },
      { icon: Target,   label: 'AI Study Plans' },
      { icon: Zap,      label: 'Bible Quiz' },
      { icon: BookOpen, label: 'Journal' },
      { icon: Globe2,   label: 'Multilingual Support' },
    ],
    checklist: [
      'All buttons work correctly',
      'Search & generate buttons functional',
      'No mixed language issues',
      'No broken pages',
      'Legal pages (Privacy + Terms)',
    ],
    distribution: [
      '🍎 Apple App Store',
      '🤖 Google Play Store',
      '⛪ Churches & Christian groups',
      '💬 WhatsApp & Telegram communities',
      '📘 Christian Facebook groups',
      '🇪🇹 Oromo-speaking Christians worldwide',
    ],
  },
  {
    phase: 2,
    emoji: '📈',
    title: 'Growth',
    range: '5,000 → 50,000 users',
    duration: '6 months',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    status: 'upcoming',
    goal: 'Improve retention and daily engagement.',
    features: [
      { icon: Calendar, label: 'Prayer reminders (daily push notifications)' },
      { icon: BookOpen, label: 'Bible highlights, notes & bookmarks' },
      { icon: Mic,      label: 'Audio Bible (Faith Comes By Hearing API)' },
      { icon: Share2,   label: 'Verse sharing image cards (organic growth)' },
    ],
    highlight: '"Every good and perfect gift is from above" — James 1:17\nShared as a beautiful image → organic promotion.',
  },
  {
    phase: 3,
    emoji: '🤝',
    title: 'Community Growth',
    range: '50,000 → 200,000 users',
    duration: '1 year',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    status: 'upcoming',
    goal: 'Turn users into advocates.',
    features: [
      { icon: Share2,   label: 'Verse sharing in feed' },
      { icon: Heart,    label: 'Community prayer request wall' },
      { icon: Users,    label: 'Bible discussion groups' },
      { icon: Church,   label: 'Church-based reading plans' },
    ],
    highlight: 'Example: "Your church group reading plan — Day 12 of 30"\nCreates community retention loops.',
  },
  {
    phase: 4,
    emoji: '🌍',
    title: 'Platform Expansion',
    range: '200,000 → 500,000 users',
    duration: '2 years',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    status: 'upcoming',
    goal: 'Expand internationally.',
    currentLanguages: ['🇬🇧 English', '🇪🇹 Afaan Oromoo', '🇪🇹 Amharic', '🇸🇦 Arabic', '🇹🇿 Swahili', '🇫🇷 French'],
    expandLanguages: ['🇪🇸 Spanish', '🇵🇹 Portuguese', '🇮🇳 Hindi', '🇮🇩 Indonesian'],
  },
  {
    phase: 5,
    emoji: '👑',
    title: 'Global Christian Platform',
    range: '500,000 → 1M users',
    duration: '3–4 years',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    status: 'upcoming',
    goal: 'Become a major Christian digital ministry.',
    features: [
      { icon: Star,     label: 'Daily devotionals — morning & evening' },
      { icon: BookOpen, label: 'Christian courses (Foundations, Leadership, Family)' },
      { icon: Video,    label: 'Pastor messages & sermon uploads' },
      { icon: Wifi,     label: 'Offline Bible downloads for low-bandwidth regions' },
    ],
  },
];

const TIMELINE = [
  { phase: 'Launch',      range: '0–5k',     time: '3 months' },
  { phase: 'Growth',      range: '5k–50k',   time: '6 months' },
  { phase: 'Community',   range: '50k–200k', time: '1 year' },
  { phase: 'Expansion',   range: '200k–500k',time: '2 years' },
  { phase: 'Global 1M',   range: '500k–1M',  time: '3–4 years' },
];

const NEXT_STEPS = [
  { n: 1, label: 'Finish UI fixes across all main pages' },
  { n: 2, label: 'Fix language translations & mixed-language issues' },
  { n: 3, label: 'Connect all buttons to correct routes' },
  { n: 4, label: 'Hide / disable unfinished pages (e.g. Audio Bible)' },
  { n: 5, label: 'Publish FaithLight version 1.0' },
];

export default function GrowthStrategy() {
  const [expanded, setExpanded] = useState({ 1: true });

  const toggle = (n) => setExpanded(prev => ({ ...prev, [n]: !prev[n] }));

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #e8eef8 0%, #f0f4fc 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* ── HERO ── */}
        <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#3b5bdb 0%,#4f6ef7 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">Official Roadmap</span>
          </div>
          <h1 className="text-2xl font-black mb-1">FaithLight Growth Roadmap</h1>
          <p className="text-blue-200 text-sm">From Launch → 1 Million Users</p>
          <div className="mt-4 p-3 bg-white/15 rounded-2xl text-sm text-blue-100">
            <span className="font-bold text-white">Unique advantage:</span> AI-powered Bible study + African language support. Very few apps focus on Oromo & African Christian communities — that niche alone can bring hundreds of thousands of users.
          </div>
        </div>

        {/* ── TIMELINE TABLE ── */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-900 text-base mb-4">📅 Estimated Timeline</h2>
          <div className="space-y-2">
            {TIMELINE.map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">{i+1}</span>
                  <span className="font-bold text-gray-800 text-sm">{row.phase}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-xs text-gray-500 font-medium">{row.range} users</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{row.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PHASES ── */}
        {PHASES.map(p => (
          <div key={p.phase}
            className="rounded-3xl border shadow-sm overflow-hidden bg-white"
            style={{ borderColor: p.border }}
          >
            {/* Phase Header */}
            <button
              onClick={() => toggle(p.phase)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                  {p.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-base">Phase {p.phase}: {p.title}</span>
                    {p.status === 'active' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: p.color }}>NOW</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.range} · {p.duration}</p>
                </div>
              </div>
              {expanded[p.phase]
                ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {/* Phase Body */}
            {expanded[p.phase] && (
              <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: p.border }}>
                {/* Goal */}
                <div className="pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Goal</p>
                  <p className="text-sm text-gray-700 font-medium">{p.goal}</p>
                </div>

                {/* Features */}
                {p.features && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      {p.phase === 1 ? 'Must-Have Features' : 'Features to Add'}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {p.features.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl" style={{ background: p.bg }}>
                          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: p.color }} />
                          <span className="text-sm text-gray-700 font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlight box */}
                {p.highlight && (
                  <div className="rounded-2xl p-3 border text-sm text-gray-600 italic whitespace-pre-line" style={{ background: p.bg, borderColor: p.border }}>
                    {p.highlight}
                  </div>
                )}

                {/* Phase 1 Checklist */}
                {p.checklist && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Fix Before Launch</p>
                    <div className="space-y-1.5">
                      {p.checklist.map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Circle className="w-4 h-4 flex-shrink-0" style={{ color: p.color }} />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase 1 Distribution */}
                {p.distribution && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Distribution Channels</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {p.distribution.map(item => (
                        <div key={item} className="text-xs text-gray-700 py-1.5 px-2.5 rounded-xl font-medium" style={{ background: p.bg }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase 4 Languages */}
                {p.currentLanguages && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Already Supported</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.currentLanguages.map(l => (
                          <span key={l} className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: p.color }}>{l}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Expand To</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.expandLanguages.map(l => (
                          <span key={l} className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ color: p.color, borderColor: p.border, background: p.bg }}>{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* ── NEXT STEPS ── */}
        <div className="rounded-3xl p-5 border border-blue-200 shadow-sm" style={{ background: 'linear-gradient(135deg,#eff4ff,#e8eef8)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-blue-600" />
            <h2 className="font-black text-gray-900 text-base">Most Important Next Steps</h2>
          </div>
          <div className="space-y-2.5">
            {NEXT_STEPS.map(({ n, label }) => (
              <div key={n} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#4f6ef7,#6d8aff)' }}>
                  {n}
                </div>
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-2xl bg-white/70 text-sm text-gray-600 italic border border-blue-100">
            Then iterate quickly — ship version 1.0, gather feedback, and improve.
          </div>
        </div>

      </div>
    </div>
  );
}