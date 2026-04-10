import React, { useState } from 'react';
import { Copy, Check, Smartphone, Apple, Search, Tag, AlignLeft, List, Globe, FileText, Link, Shield, MessageSquare, Star } from 'lucide-react';

const METADATA = [
  {
    id: 1,
    icon: Smartphone,
    color: 'indigo',
    label: 'App Name / Title',
    platform: 'iOS & Android',
    tip: 'Include top keywords — Bible, Study, Prayer.',
    fields: [
      { key: 'Title', value: 'FaithLight: Bible Study & Prayer', maxLen: 30 },
    ],
  },
  {
    id: 2,
    icon: Tag,
    color: 'violet',
    label: 'Subtitle',
    platform: 'iOS only',
    tip: 'Shown under the title in search results.',
    fields: [
      { key: 'Subtitle', value: 'Daily Bible, Audio Scripture & AI Study Tools', maxLen: 30 },
    ],
  },
  {
    id: 3,
    icon: Search,
    color: 'blue',
    label: 'Keyword Field',
    platform: 'iOS only',
    tip: 'Do not repeat words already in the title or subtitle.',
    fields: [
      { key: 'Keywords', value: 'bible,bible study,audio bible,scripture,christian prayer,daily verse,devotional,bible reader,bible app,church study', maxLen: 100 },
    ],
  },
  {
    id: 4,
    icon: AlignLeft,
    color: 'teal',
    label: 'Short Description',
    platform: 'Google Play',
    tip: 'First thing users read on the Play Store listing.',
    fields: [
      { key: 'Short Description', value: 'Read the Bible, listen to audio Scripture, explore AI-powered Bible study tools, and grow your faith daily with FaithLight.', maxLen: 80 },
    ],
  },
  {
    id: 5,
    icon: List,
    color: 'green',
    label: 'Full App Description',
    platform: 'iOS & Android',
    tip: 'Use feature bullets — scannable and keyword-rich.',
    fields: [
      {
        key: 'Full Description',
        value: `FaithLight is a powerful Bible study companion designed to help you grow in your relationship with God through Scripture, prayer, and daily reflection.

Read the Bible, listen to audio Scripture, explore study plans, and deepen your faith with intelligent study tools.

KEY FEATURES

📖 Bible Reader
Read the full Bible with easy navigation between books, chapters, and verses.

🎧 Audio Bible
Listen to Scripture anytime with immersive audio playback.

🤖 AI Bible Study Tools
Understand Scripture with intelligent explanations, reflections, and study assistance.

📅 Study Plans
Follow structured reading plans to build a consistent Bible reading habit.

🙏 Prayer & Community
Share prayer requests, encourage others, and grow together in faith.

⛪ Church Mode
Join live study sessions with your church and follow sermons in real time.

📊 Spiritual Growth Tracking
Track reading streaks, milestones, and study progress.

FaithLight is designed to make the Word of God accessible, engaging, and meaningful for believers everywhere.

Download FaithLight today and deepen your journey with Scripture.`,
      },
    ],
  },
  {
    id: 6,
    icon: Globe,
    color: 'amber',
    label: 'App Category',
    platform: 'iOS & Android',
    tip: 'Reference gets better placement for Bible apps.',
    fields: [
      { key: 'Primary Category', value: 'Reference' },
      { key: 'Alternative', value: 'Lifestyle' },
    ],
  },
  {
    id: 7,
    icon: Star,
    color: 'orange',
    label: 'Promotional Text',
    platform: 'iOS only · updatable anytime',
    tip: 'Update without resubmitting — use for seasonal messages.',
    fields: [
      { key: 'Promo Text', value: 'Start your daily Bible journey with FaithLight — featuring Scripture reading, audio Bible, prayer tools, and AI-powered study assistance.', maxLen: 170 },
    ],
  },
  {
    id: 8,
    icon: Link,
    color: 'slate',
    label: 'Support URL',
    platform: 'iOS & Android',
    tip: 'Must be a live, accessible URL before submission.',
    fields: [
      { key: 'Support URL', value: 'https://faithlight.app/support' },
    ],
  },
  {
    id: 9,
    icon: Shield,
    color: 'rose',
    label: 'Privacy Policy URL',
    platform: 'iOS & Android · Required',
    tip: 'Required by Apple and Google. Must be live.',
    fields: [
      { key: 'Privacy Policy URL', value: 'https://faithlight.app/privacy' },
    ],
  },
  {
    id: 10,
    icon: MessageSquare,
    color: 'purple',
    label: 'Review Notes',
    platform: 'App Store Connect',
    tip: 'Helps reviewers understand the app and reduces rejection risk.',
    fields: [
      {
        key: 'Notes for Reviewer',
        value: `FaithLight is a Bible study application providing Scripture reading, audio Bible, prayer tools, and AI-assisted study features.

Core Bible reading functionality is available without requiring login.

If login is required for testing, use:
Email: review@faithlight.app
Password: FaithLight123`,
      },
    ],
  },
];

const COLOR_MAP = {
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

const ICON_BG = {
  indigo: 'bg-indigo-100', violet: 'bg-violet-100', blue: 'bg-blue-100',
  teal: 'bg-teal-100', green: 'bg-green-100', amber: 'bg-amber-100',
  orange: 'bg-orange-100', slate: 'bg-slate-100', rose: 'bg-rose-100', purple: 'bg-purple-100',
};

const ICON_TEXT = {
  indigo: 'text-indigo-600', violet: 'text-violet-600', blue: 'text-blue-600',
  teal: 'text-teal-600', green: 'text-green-600', amber: 'text-amber-600',
  orange: 'text-orange-600', slate: 'text-slate-600', rose: 'text-rose-600', purple: 'text-purple-600',
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-500'}`}
    >
      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

export default function AppStoreMetadata() {
  const [copiedAll, setCopiedAll] = useState(false);

  const copyAll = async () => {
    const all = METADATA.map(s =>
      `=== ${s.label} (${s.platform}) ===\n` +
      s.fields.map(f => `${f.key}:\n${f.value}`).join('\n\n')
    ).join('\n\n---\n\n');
    await navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-4 shadow-sm">
            <Apple className="w-4 h-4" /> App Store Metadata
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">FaithLight Submission Metadata</h1>
          <p className="text-gray-500 text-sm mb-4">Optimized for App Store &amp; Google Play search discovery.</p>
          <button
            onClick={copyAll}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow ${copiedAll ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {copiedAll ? <><Check className="w-4 h-4" /> All Copied!</> : <><Copy className="w-4 h-4" /> Copy All Fields</>}
          </button>
        </div>

        {/* Search keywords chip preview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Will rank for these searches</div>
          <div className="flex flex-wrap gap-1.5">
            {['bible app', 'bible study', 'audio bible', 'daily verse', 'christian prayer', 'devotional', 'scripture', 'bible reader', 'church study'].map(k => (
              <span key={k} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                <Search className="w-2.5 h-2.5" /> {k}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata cards */}
        <div className="space-y-4">
          {METADATA.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ICON_BG[section.color]}`}>
                    <Icon className={`w-5 h-5 ${ICON_TEXT[section.color]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{section.id}. {section.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${COLOR_MAP[section.color]}`}>{section.platform}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{section.tip}</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="divide-y divide-gray-50">
                  {section.fields.map((field) => (
                    <div key={field.key} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{field.key}</span>
                        <div className="flex items-center gap-2">
                          {field.maxLen && (
                            <span className={`text-xs font-semibold ${field.value.length > field.maxLen ? 'text-red-500' : 'text-gray-400'}`}>
                              {field.value.length}/{field.maxLen}
                            </span>
                          )}
                          <CopyButton text={field.value} />
                        </div>
                      </div>
                      <div className={`bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap select-all`}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-amber-800 mb-1">💡 Before Submitting</p>
          <p className="text-xs text-amber-700">Make sure <strong>faithlight.app/support</strong> and <strong>faithlight.app/privacy</strong> are live URLs. Apple and Google will visit them during review.</p>
        </div>

      </div>
    </div>
  );
}