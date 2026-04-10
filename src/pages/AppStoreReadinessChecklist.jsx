import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Star, Zap, BookOpen, Mic, Bot, Target, Heart, HelpCircle, Bell, Highlighter, Share2, ChevronDown, ChevronUp, Trophy, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const STATUS = {
  done:    { label: '✔ Done',     color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: CheckCircle2 },
  partial: { label: '⚠ Partial',  color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: AlertCircle },
  missing: { label: '❌ Missing',  color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', icon: XCircle },
};

const FEATURES = [
  {
    rank: 1,
    icon: Star,
    emoji: '⭐',
    title: 'Verse of the Day',
    status: 'done',
    impact: 'top',
    desc: 'The #1 retention feature — users open the app daily just to see the verse.',
    improvements: ['Shareable verse images', 'Morning push notifications', 'Multiple languages'],
    apps: ['YouVersion', 'Glorify'],
    page: 'Home',
  },
  {
    rank: 2,
    icon: BookOpen,
    emoji: '📖',
    title: 'Bible Reader (Offline)',
    status: 'partial',
    impact: 'high',
    desc: 'Core feature of every successful Bible app. Needs polish and offline reliability.',
    improvements: ['Book/chapter navigation', 'Verse highlighting', 'Dark mode', 'Offline access'],
    apps: ['Bible.is', 'YouVersion'],
    page: 'BibleReader',
  },
  {
    rank: 3,
    icon: Mic,
    emoji: '🎧',
    title: 'Audio Bible',
    status: 'partial',
    impact: 'high',
    desc: 'Huge growth driver — users listen while driving, walking, praying, commuting.',
    improvements: ['BibleBrain API integration', 'Play/pause/seek controls', 'Speed adjustment'],
    apps: ['Bible.is', 'YouVersion'],
    page: 'AudioBibleV2',
  },
  {
    rank: 4,
    icon: Bot,
    emoji: '🤖',
    title: 'AI Bible Assistant',
    status: 'done',
    impact: 'top',
    desc: 'AI-powered explanations, study plans, and Bible Q&A. Already powerful.',
    improvements: ['Afaan Oromoo AI responses', 'Offline AI caching'],
    apps: ['Glorify'],
    page: 'AIEnhancedBibleStudy',
  },
  {
    rank: 5,
    icon: Target,
    emoji: '📅',
    title: 'Bible Study Plans',
    status: 'done',
    impact: 'high',
    desc: '7-day, 30-day plans on topics like faith, prayer, fear, marriage.',
    improvements: ['More plan topics', 'Progress notifications'],
    apps: ['YouVersion', 'Glorify'],
    page: 'BibleStudyPlans',
  },
  {
    rank: 6,
    icon: Heart,
    emoji: '🙏',
    title: 'Prayer Journal',
    status: 'done',
    impact: 'medium',
    desc: 'Daily reflection — users write prayers, gratitude, struggles, answered prayers.',
    improvements: ['PDF export', 'Mood tracking'],
    apps: ['Glorify'],
    page: 'MyJournal',
  },
  {
    rank: 7,
    icon: HelpCircle,
    emoji: '❓',
    title: 'Bible Quiz',
    status: 'done',
    impact: 'medium',
    desc: 'Gamification increases retention — multiple choice, verse completion, Bible trivia.',
    improvements: ['Daily streak for quizzes', 'Leaderboard'],
    apps: ['YouVersion'],
    page: 'DailyBibleQuiz',
  },
  {
    rank: 8,
    icon: Bell,
    emoji: '🔔',
    title: 'Prayer Reminders',
    status: 'missing',
    impact: 'high',
    desc: 'Apps like Glorify grew fast because of daily "🙏 Time to pray" notifications.',
    improvements: ['Daily push at user-chosen time', 'Morning verse notification', 'Evening reflection prompt'],
    apps: ['Glorify', 'YouVersion'],
    page: 'NotificationPreferencesPage',
  },
  {
    rank: 9,
    icon: Highlighter,
    emoji: '🖊️',
    title: 'Bible Highlights & Notes',
    status: 'missing',
    impact: 'high',
    desc: 'Users love marking verses — highlight colors, personal notes, bookmarks, saved verses.',
    improvements: ['Color highlights', 'Verse notes', 'Bookmarks', 'Saved verse library'],
    apps: ['YouVersion', 'Bible.is'],
    page: 'MyHighlights',
  },
  {
    rank: 10,
    icon: Share2,
    emoji: '📸',
    title: 'Shareable Verse Images',
    status: 'partial',
    impact: 'high',
    desc: 'Viral growth driver — users share beautiful scripture images on Instagram, WhatsApp, Facebook.',
    improvements: ['Beautiful image templates', 'One-tap share to WhatsApp', 'Video verse cards'],
    apps: ['YouVersion', 'Glorify'],
    page: 'VerseImageShare',
  },
];

const SCORE = FEATURES.filter(f => f.status === 'done').length;
const PARTIAL = FEATURES.filter(f => f.status === 'partial').length;

export default function AppStoreReadinessChecklist() {
  const [expanded, setExpanded] = useState({});
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #e8eef8 0%, #f0f4fc 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* ── HERO ── */}
        <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#3b5bdb 0%,#4f6ef7 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">Feature Scorecard</span>
          </div>
          <h1 className="text-2xl font-black mb-1">10 Features That Reach 1M+ Downloads</h1>
          <p className="text-blue-200 text-sm mb-4">Compared to YouVersion, Glorify & Bible.is</p>
          {/* Score bar */}
          <div className="bg-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">FaithLight Score</span>
              <span className="text-2xl font-black text-amber-300">{SCORE} / 10</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
              <div className="h-3 rounded-full transition-all" style={{ width: `${(SCORE / 10) * 100}%`, background: 'linear-gradient(90deg,#34D399,#10B981)' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-blue-200">
              <span>✔ {SCORE} Done &nbsp;·&nbsp; ⚠ {PARTIAL} Partial &nbsp;·&nbsp; ❌ {10 - SCORE - PARTIAL} Missing</span>
              <span className="font-bold text-white">Very Strong!</span>
            </div>
          </div>
        </div>

        {/* ── COMPETITIVE ADVANTAGE CALLOUT ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-start gap-3 shadow-sm">
          <span className="text-2xl">🇪🇹</span>
          <div>
            <p className="font-black text-amber-800 text-sm">Unique Competitive Advantage</p>
            <p className="text-amber-700 text-xs mt-0.5">AI + Afaan Oromoo Bible support — almost no Bible apps offer this. This niche alone can bring hundreds of thousands of users.</p>
          </div>
        </div>

        {/* ── FEATURES LIST ── */}
        <div className="space-y-3">
          {FEATURES.map((f, i) => {
            const st = STATUS[f.status];
            const StatusIcon = st.icon;
            const isOpen = expanded[i];
            return (
              <div key={i} className="bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: st.border }}>
                {/* Row */}
                <button onClick={() => toggle(i)} className="w-full flex items-center gap-3 p-4 text-left">
                  {/* Rank */}
                  <span className="w-6 text-xs font-black text-gray-400 text-right flex-shrink-0">{f.rank}</span>
                  {/* Emoji */}
                  <span className="text-xl flex-shrink-0">{f.emoji}</span>
                  {/* Title + status */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm">{f.title}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  {/* Impact badge */}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    f.impact === 'top' ? 'bg-purple-100 text-purple-700' :
                    f.impact === 'high' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {f.impact === 'top' ? '⭐ Top' : f.impact === 'high' ? '🔥 High' : '📌 Medium'}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: st.border }}>
                    {/* Description */}
                    <p className="text-sm text-gray-600">{f.desc}</p>

                    {/* Improvements needed */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        {f.status === 'done' ? 'Extra Improvements' : 'What to Build / Fix'}
                      </p>
                      <div className="space-y-1">
                        {f.improvements.map(item => (
                          <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.color }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competing apps */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium">Used by:</span>
                      {f.apps.map(a => (
                        <span key={a} className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{a}</span>
                      ))}
                    </div>

                    {/* Go to page button */}
                    <Link to={createPageUrl(f.page)}>
                      <button className="w-full py-2.5 rounded-2xl text-sm font-bold text-white mt-1 transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(90deg, ${st.color}, ${st.color}CC)` }}>
                        {f.status === 'missing' ? 'Set Up This Feature →' : 'Open Page →'}
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── SUMMARY TABLE ── */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="font-black text-gray-900 text-base">Summary</h2>
          </div>
          <div className="space-y-2">
            {FEATURES.map(f => {
              const st = STATUS[f.status];
              return (
                <div key={f.rank} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{f.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{f.title}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg,#eff4ff,#e8eef8)' }}>
            <p className="text-sm font-bold text-gray-800">Build the remaining 4 features → FaithLight becomes a full modern Bible platform</p>
            <p className="text-xs text-gray-500 mt-1">Competing with YouVersion, Glorify & Bible.is — especially for African Christians</p>
          </div>
        </div>

      </div>
    </div>
  );
}