/**
 * FaithLight – 6-Month Growth Roadmap
 * Internal strategy page for the team.
 */
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Users, Zap, Globe, GraduationCap, Flame, Share2,
  Bell, Mic2, MessageCircle, TrendingUp, Target, Star, CheckCircle2,
  Calendar, ChevronDown, ChevronRight, Sparkles, Heart, Radio
} from 'lucide-react';

const MONTHS = [
  {
    num: 1,
    label: 'Month 1',
    theme: 'Launch & Stability',
    goal: 'A stable, trustworthy app with daily engagement.',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: BookOpen,
    metrics: { installs: '2,000–5,000', dau: '20–25%', extra: null },
    product: [
      'Finalize Bible reader reliability (offline + audio fallback)',
      'Daily Verse of the Day with AI explanation',
      'Push notification reminders',
      'Verse Share Image feature (viral driver)',
      'Full Oromo translation for core UI',
    ],
    growth: [
      'Launch in Ethiopia, Kenya, Tanzania, Nigeria, USA',
      'Share with churches and Christian groups (WhatsApp, Telegram)',
      'Post demo videos on TikTok / Instagram Reels',
    ],
    keyFeatures: ['Offline Bible', 'Daily Verse', 'Push Notifications', 'Verse Share'],
  },
  {
    num: 2,
    label: 'Month 2',
    theme: 'Viral Growth Features',
    goal: 'Encourage sharing and organic growth.',
    color: 'from-orange-500 to-rose-500',
    bgLight: 'bg-orange-50',
    border: 'border-orange-200',
    badgeClass: 'bg-orange-100 text-orange-800',
    icon: Flame,
    metrics: { installs: '8,000–10,000', dau: '30%+ returning', extra: null },
    product: [
      'Verse Image Generator with custom backgrounds',
      'Reading Streak system (🔥 daily reading)',
      '"Share your streak" social button',
      'Prayer Journal feature',
    ],
    growth: [
      'Encourage social sharing: "Share today\'s verse with friends"',
      'Launch church ambassador program (pastors promote app)',
    ],
    keyFeatures: ['Reading Streak', 'Verse Image Generator', 'Prayer Journal', 'Church Ambassadors'],
  },
  {
    num: 3,
    label: 'Month 3',
    theme: 'Community & Engagement',
    goal: 'Build community inside the app.',
    color: 'from-green-500 to-teal-500',
    bgLight: 'bg-green-50',
    border: 'border-green-200',
    badgeClass: 'bg-green-100 text-green-800',
    icon: MessageCircle,
    metrics: { installs: '15,000–20,000', dau: 'Daily community posts', extra: null },
    product: [
      'Community Questions / Bible Discussion section',
      'Verse commenting for all users',
      'Group Reading Plans (invite friends)',
    ],
    growth: [
      'Create official FaithLight Facebook group',
      'Post daily verse images on social media',
    ],
    keyFeatures: ['Bible Discussion', 'Verse Comments', 'Group Reading Plans'],
  },
  {
    num: 4,
    label: 'Month 4',
    theme: 'AI Leadership Tools',
    goal: 'Make FaithLight essential for pastors and teachers.',
    color: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
    badgeClass: 'bg-purple-100 text-purple-800',
    icon: Sparkles,
    metrics: { installs: '30,000–40,000', dau: '3–5% premium conversion', extra: null },
    product: [
      'Improved AI Sermon Builder (Lallaba)',
      'AI lesson generator for Bible study groups',
      'AI devotional writer',
    ],
    growth: [
      'Promote to churches: "AI tools for pastors"',
      'Premium: unlimited AI, sermon templates, teaching outlines',
    ],
    keyFeatures: ['AI Sermon Builder', 'AI Lesson Generator', 'AI Devotionals', 'Premium Tier'],
  },
  {
    num: 5,
    label: 'Month 5',
    theme: 'Global Expansion',
    goal: 'Reach international Christian audiences.',
    color: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-50',
    border: 'border-cyan-200',
    badgeClass: 'bg-cyan-100 text-cyan-800',
    icon: Globe,
    metrics: { installs: '60,000+', dau: null, extra: null },
    product: [
      'New languages: Hindi, Indonesian, Filipino, Yoruba, Hausa',
      'Expanded audio Bible coverage',
    ],
    growth: [
      'Partner with Christian influencers',
      'Targeted ads $5–$10/day in key markets',
    ],
    keyFeatures: ['Hindi', 'Indonesian', 'Filipino', 'Yoruba / Hausa', 'Audio Expansion'],
  },
  {
    num: 6,
    label: 'Month 6',
    theme: 'FaithLight Academy',
    goal: 'Become a Christian learning platform.',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800',
    icon: GraduationCap,
    metrics: { installs: '100,000+', dau: null, extra: '$5K–$15K/mo revenue potential' },
    product: [
      'Bible Study Courses with certificates',
      'Topics: Life of Jesus, OT Overview, Christian Discipleship',
      'Allow pastors to create and publish their own courses',
    ],
    growth: [
      'Promote as: "Bible learning + AI + study tools"',
    ],
    keyFeatures: ['Courses', 'Certificates', 'Pastor Course Creator', 'Academy Brand'],
  },
];

const KEY_FEATURES = [
  { icon: Share2,    label: 'Verse Share Images',     note: 'Viral driver',            color: 'text-rose-500' },
  { icon: Bell,      label: 'Daily Verse Notifications', note: 'Retention loop',        color: 'text-indigo-500' },
  { icon: Flame,     label: 'Reading Streak',          note: 'Habit formation',         color: 'text-orange-500' },
  { icon: Sparkles,  label: 'AI Bible Explanation',    note: 'Core value prop',         color: 'text-purple-500' },
  { icon: Mic2,      label: 'AI Sermon Builder',       note: 'Pastor retention',        color: 'text-violet-600' },
  { icon: Radio,     label: 'Offline Bible',           note: 'Low-connectivity markets', color: 'text-green-600' },
  { icon: Globe,     label: 'Multilingual Support',    note: 'Global reach',            color: 'text-blue-500' },
];

function MonthCard({ month }) {
  const [open, setOpen] = useState(month.num <= 2);
  const Icon = month.icon;

  return (
    <div className={`border rounded-2xl overflow-hidden ${month.border} shadow-sm`}>
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 ${month.bgLight} hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br ${month.color} text-white rounded-xl p-2 shadow`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{month.label}</p>
            <p className="text-base font-bold text-gray-900">{month.theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {month.metrics.installs && (
            <Badge className={`text-xs hidden sm:inline-flex ${month.badgeClass}`}>
              <Users className="w-3 h-3 mr-1" />
              {month.metrics.installs}
            </Badge>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 py-5 bg-white grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Goal */}
          <div className="md:col-span-3">
            <p className="text-sm text-gray-600 italic">🎯 Goal: {month.goal}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Product</h4>
            <ul className="space-y-1.5">
              {month.product.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Growth */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Growth</h4>
            <ul className="space-y-1.5">
              {month.growth.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics & Tags */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Target Metrics</h4>
            <div className="space-y-1 mb-3">
              {month.metrics.installs && (
                <p className="text-sm font-semibold text-gray-800">📲 {month.metrics.installs} installs</p>
              )}
              {month.metrics.dau && (
                <p className="text-sm text-gray-700">📊 {month.metrics.dau}</p>
              )}
              {month.metrics.extra && (
                <p className="text-sm text-gray-700">💰 {month.metrics.extra}</p>
              )}
            </div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-1.5">
              {month.keyFeatures.map((f, i) => (
                <Badge key={i} variant="outline" className={`text-xs ${month.badgeClass} border-0`}>{f}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Roadmap() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 text-indigo-700 text-sm font-medium mb-2">
          <Calendar className="w-4 h-4" /> 6-Month Growth Plan
        </div>
        <h1 className="text-3xl font-bold text-gray-900">FaithLight Growth Roadmap</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          A practical path to 100K+ users, built on daily engagement, viral sharing, and AI tools for church leaders.
        </p>
      </div>

      {/* Vision */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white text-center shadow-lg">
        <Star className="w-8 h-8 mx-auto mb-3 opacity-80" />
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Product Vision</p>
        <h2 className="text-xl font-bold mb-2">"The AI-powered Bible study platform for the global church."</h2>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {['Bible Reading', 'Audio Bible', 'AI Learning Tools', 'Sermons', 'Community', 'Multilingual Access'].map(t => (
            <span key={t} className="bg-white/15 rounded-full px-3 py-1 text-xs font-medium">{t}</span>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Top Growth Drivers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KEY_FEATURES.map(({ icon: Icon, label, note, color }) => (
            <div key={label} className="border rounded-xl p-3 bg-white flex flex-col items-start gap-1 shadow-sm">
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
              <p className="text-xs text-gray-500">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Month Cards */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Month-by-Month Plan</h2>
        <div className="space-y-3">
          {MONTHS.map(m => <MonthCard key={m.num} month={m} />)}
        </div>
      </div>

      {/* Summary targets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Target Users', value: '100K+', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Revenue Potential', value: '$5K–$15K/mo', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Premium Conversion', value: '3–5%', icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Core Languages', value: '10+', icon: Globe, color: 'text-cyan-600 bg-cyan-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color.split(' ')[1]} border-gray-200`}>
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color.split(' ')[0]}`} />
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}