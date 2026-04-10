import React, { useState } from 'react';
import { Rocket, Users, Share2, TrendingUp, Bell, Star, CheckCircle2, ChevronDown, ChevronUp, Target, BarChart3, MessageCircle, Video, Heart } from 'lucide-react';

const WEEKS = [
  {
    week: 1,
    emoji: '🧪',
    title: 'Soft Launch & Early Feedback',
    days: 'Days 1–7',
    goal: 'Ensure the app works smoothly and collect initial reviews.',
    color: '#3B5BDB',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    icon: Rocket,
    actions: [
      'Release FaithLight quietly to friends, church members & beta testers',
      'Ask testers to test every feature and report bugs',
      'Ask testers to leave honest ratings & reviews in the store',
      'Monitor crashes, AI responses, translation issues, broken buttons',
    ],
    tip: 'Even 10–20 positive reviews early on help store algorithms trust the app.',
  },
  {
    week: 2,
    emoji: '📣',
    title: 'Community Promotion',
    days: 'Days 8–14',
    goal: 'Reach the first 1,000 users.',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: Users,
    actions: [
      'Share the app in church WhatsApp groups',
      'Post in Christian Telegram channels',
      'Share in Facebook Bible study groups',
      'Encourage members to share with their church friends',
    ],
    message: 'We launched a Christian Bible study app called FaithLight.\n\nFeatures:\n📖 Bible reading\n🤖 AI Bible explanations\n🧠 Bible quiz\n✍️ Faith journal\n\nDownload and grow in faith with Scripture.',
  },
  {
    week: 3,
    emoji: '🎬',
    title: 'Content Marketing',
    days: 'Days 15–21',
    goal: 'Expand visibility beyond your immediate community.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: Video,
    actions: [
      'Post daily verse images with the FaithLight name on social media',
      'Upload short videos explaining Bible topics or demoing the app',
      'Add the app download link in every description',
    ],
    videoTopics: [
      '"What does the Bible say about hope?"',
      '"AI explains John 3:16"',
      '"Bible Quiz Challenge"',
    ],
  },
  {
    week: 4,
    emoji: '🔁',
    title: 'Engagement & Retention',
    days: 'Days 22–30',
    goal: 'Keep users coming back every day.',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: Heart,
    actions: [
      'Enable Verse of the Day push notifications',
      'Encourage daily journal reflections',
      'Run quiz challenges to bring users back',
      'Ask users to share verses and invite friends',
      'Prompt users to leave a review inside the app',
    ],
    reviewMessage: 'If FaithLight blesses you, please consider leaving a review. 🙏',
  },
];

const METRICS = [
  { icon: '📥', label: 'Downloads',         target: '1,000 – 5,000' },
  { icon: '⭐', label: 'User Reviews',       target: '30 – 50' },
  { icon: '👤', label: 'Daily Active Users', target: '30 – 40%' },
  { icon: '🐛', label: 'Bug Reports',        target: 'Minimal' },
];

const TRACK = [
  'Downloads',
  'Active users',
  'Daily verse views',
  'AI question usage',
  'Quiz participation',
  'User reviews',
];

export default function LaunchStrategy() {
  const [expanded, setExpanded] = useState({ 0: true });
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg,#e8eef8 0%,#f0f4fc 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* ── HERO ── */}
        <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#3b5bdb 0%,#4f6ef7 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">Launch Plan</span>
          </div>
          <h1 className="text-2xl font-black mb-1">FaithLight 30-Day Launch Strategy</h1>
          <p className="text-blue-200 text-sm mb-4">Organic growth & community engagement from Day 1</p>
          <div className="grid grid-cols-4 gap-2">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => (
              <div key={i} className="bg-white/15 rounded-2xl p-2.5 text-center">
                <p className="text-xs font-bold text-white">{w}</p>
                <p className="text-[10px] text-blue-200 mt-0.5">Days {i*7+1}–{i===3?30:(i+1)*7}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WEEKS ── */}
        {WEEKS.map((w, i) => (
          <div key={i} className="bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: w.border }}>
            <button onClick={() => toggle(i)} className="w-full flex items-center gap-3 p-4 text-left">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: w.bg, border: `1px solid ${w.border}` }}>
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900 text-sm">Week {w.week}: {w.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{w.days}</p>
              </div>
              {expanded[i]
                ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {expanded[i] && (
              <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: w.border }}>
                {/* Goal */}
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: w.color }} />
                  <p className="text-sm font-semibold text-gray-700">{w.goal}</p>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Actions</p>
                  <div className="space-y-2">
                    {w.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: w.color }} />
                        <span className="text-sm text-gray-700">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tip */}
                {w.tip && (
                  <div className="rounded-2xl p-3 text-sm" style={{ background: w.bg }}>
                    <span className="font-bold" style={{ color: w.color }}>💡 Tip: </span>
                    <span className="text-gray-700">{w.tip}</span>
                  </div>
                )}

                {/* Sample message */}
                {w.message && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sample Promo Message</p>
                    <div className="rounded-2xl p-3 text-sm text-gray-700 font-mono whitespace-pre-line border" style={{ background: w.bg, borderColor: w.border }}>
                      {w.message}
                    </div>
                  </div>
                )}

                {/* Video topics */}
                {w.videoTopics && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Video Ideas</p>
                    <div className="space-y-1.5">
                      {w.videoTopics.map((v, j) => (
                        <div key={j} className="flex items-center gap-2 py-1.5 px-3 rounded-xl text-sm" style={{ background: w.bg }}>
                          <Video className="w-3.5 h-3.5 flex-shrink-0" style={{ color: w.color }} />
                          <span className="text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review prompt */}
                {w.reviewMessage && (
                  <div className="rounded-2xl p-3 border text-sm text-gray-600 italic text-center" style={{ background: w.bg, borderColor: w.border }}>
                    {w.reviewMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* ── METRICS TO TRACK ── */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h2 className="font-black text-gray-900 text-base">Metrics to Track</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {TRACK.map((m, i) => (
              <div key={i} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TARGET NUMBERS ── */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-black text-gray-900 text-base">Month 1 Targets</h2>
          </div>
          <div className="space-y-2">
            {METRICS.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                </div>
                <span className="text-sm font-black text-blue-600">{m.target}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center italic">Even small numbers are great for a first release — just keep iterating.</p>
        </div>

        {/* ── ADVANTAGE CALLOUT ── */}
        <div className="rounded-3xl p-5 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#3b5bdb,#6d8aff)' }}>
          <p className="font-black text-base mb-2">🇪🇹 Biggest Competitive Advantage</p>
          <p className="text-blue-200 text-sm leading-relaxed">AI-powered Bible study + Afaan Oromoo & Amharic support. Very few Bible apps serve these communities well — this is FaithLight's strongest differentiator for reaching millions of African Christians.</p>
        </div>

      </div>
    </div>
  );
}