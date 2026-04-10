import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight,
  Rocket, Star, ArrowLeft, ExternalLink, Info
} from 'lucide-react';

const PHASES = [
  {
    id: 'v1',
    label: 'V1.0 — First Release (Do This First)',
    subtitle: 'These 7 items are your entire first launch',
    color: 'from-violet-500 to-indigo-600',
    icon: '🚀',
    sections: [
      {
        title: '7 Core Features for Launch',
        items: [
          { id: 'auth',          label: 'Sign-in (email / Google / Apple)', page: null },
          { id: 'daily_verse',   label: 'Daily verse + devotion',            page: '/DailyDevotional' },
          { id: 'ai_assistant',  label: 'AI Bible assistant (Ask any question)', page: '/AIHub' },
          { id: 'prayer_journal',label: 'Prayer journal',                    page: '/MyPrayerJournal' },
          { id: 'push_notif',   label: 'Push reminders (daily habit)',       page: '/NotificationsHub' },
          { id: 'subscription', label: 'Monthly + yearly premium plan',      page: '/SupportFaithLight' },
          { id: 'bible_reader', label: 'Bible reader (WEB translation)',     page: '/BibleReaderPage' },
        ],
      },
      {
        title: 'Store Compliance (Apple requires these)',
        items: [
          { id: 'account_delete', label: 'Account deletion inside the app (Profile > Account)', page: '/UserProfile' },
          { id: 'subscription_manage', label: 'Manage subscription link in app', page: '/UserProfile' },
          { id: 'export_data',   label: 'Export my data option', page: '/UserProfile' },
          { id: 'privacy_policy',label: 'Privacy policy page in-app', page: '/PrivacyPolicy' },
          { id: 'notif_settings',label: 'Notification opt-out settings', page: '/NotificationsHub' },
        ],
      },
      {
        title: 'App Store Publishing',
        items: [
          { id: 'app_icon',     label: 'App icon (1024×1024) + screenshots' },
          { id: 'store_desc',   label: 'App Store description written', page: '/AppStoreDescription' },
          { id: 'ios_submit',   label: 'Submitted to Apple App Store', link: 'https://appstoreconnect.apple.com' },
          { id: 'android_submit', label: 'Submitted to Google Play Store', link: 'https://play.google.com/console' },
        ],
      },
    ],
  },
  {
    id: 'stage1',
    label: 'Stage 1 — First 1,000 Users',
    subtitle: '0–3 months · YouTube + church outreach',
    color: 'from-emerald-500 to-teal-600',
    icon: '📣',
    sections: [
      {
        title: 'YouTube Channel (Bible Flame Animations)',
        items: [
          { id: 'yt_verse_60',   label: '"Bible verse explained in 60 seconds" series' },
          { id: 'yt_prayer',     label: '"Prayer for today" short-form videos' },
          { id: 'yt_ai_demo',    label: '"AI answers this Bible question" demos' },
          { id: 'yt_cta',        label: 'Add FaithLight CTA + link to every video' },
        ],
      },
      {
        title: 'Church Outreach',
        items: [
          { id: 'church_email',  label: 'Email 10+ churches offering free access' },
          { id: 'church_partner',label: 'Partner with 3+ churches or youth groups' },
          { id: 'feedback',      label: 'Collect feedback + fix top 3 usability issues' },
        ],
      },
      {
        title: 'Social Media (Daily Posts)',
        items: [
          { id: 'instagram',     label: 'Instagram: verse of the day card daily' },
          { id: 'tiktok',        label: 'TikTok: short-form Bible content' },
          { id: 'yt_shorts',     label: 'YouTube Shorts: 30-second devotions' },
          { id: 'verse_cta',     label: 'Every post includes app download link' },
        ],
      },
    ],
  },
  {
    id: 'stage2',
    label: 'Stage 2 — 1,000 → 10,000 Users',
    subtitle: '3–9 months · One killer use case, deep retention',
    color: 'from-amber-500 to-orange-500',
    icon: '⚡',
    sections: [
      {
        title: 'Focus on ONE Core Hook (pick one)',
        items: [
          { id: 'hook_ai',       label: '🤖 "Ask any Bible question" — market this only', page: '/AIHub' },
          { id: 'hook_streak',   label: '🔥 "Daily prayer + devotion streak" — gamify it', page: '/MyPrayerJournal' },
        ],
      },
      {
        title: 'Retention Loops',
        items: [
          { id: 'streak_notif',  label: 'Streak reminder push at user\'s preferred time' },
          { id: 'shareable_cards',label: 'Shareable verse image cards for social', page: '/VerseImageGenerator' },
          { id: 'reading_plans', label: '7/30/90-day reading plans live', page: '/ReadingPlans' },
          { id: 'prayer_wall',   label: 'Community prayer wall live', page: '/PrayerCircles' },
        ],
      },
      {
        title: 'Christian Community Growth',
        items: [
          { id: 'christian_fb',  label: 'Share in Christian Facebook groups' },
          { id: 'reddit',        label: 'Post in r/Christianity, r/Bible communities' },
          { id: 'bible_forums',  label: 'Engage in Bible study forums' },
        ],
      },
    ],
  },
  {
    id: 'stage3',
    label: 'Stage 3 — 10,000 → 100,000 Users',
    subtitle: '9–18 months · Viral loops + monetization',
    color: 'from-sky-500 to-blue-600',
    icon: '🌍',
    sections: [
      {
        title: 'Viral Growth Loops',
        items: [
          { id: 'referral',      label: 'Referral reward: invite friends → unlock premium week' },
          { id: 'church_group',  label: 'Church group onboarding flow', page: '/ChurchMode' },
          { id: 'streak_share',  label: 'Shareable streak & testimony screenshots' },
          { id: 'verse_cards',   label: 'Verse cards shared on social link back to app', page: '/VerseImageGenerator' },
        ],
      },
      {
        title: 'Premium Monetization (in order)',
        items: [
          { id: 'stripe_web',    label: 'Web: monthly + yearly plan via Stripe', page: '/SupportFaithLight' },
          { id: 'apple_iap',     label: 'Apple In-App Purchase (iOS subscriptions)' },
          { id: 'google_billing',label: 'Google Play Billing (Android subscriptions)' },
          { id: 'premium_ai',    label: 'Premium: unlimited AI questions' },
          { id: 'premium_plans', label: 'Premium: deep devotional study plans', page: '/ReadingPlans' },
          { id: 'premium_sermon',label: 'Premium: sermon/small-group outlines', page: '/AIHub' },
        ],
      },
      {
        title: 'Platform Expansion',
        items: [
          { id: 'multilang',     label: '6+ language Bible studies (Oromo, Swahili, French…)', page: '/BibleSearch' },
          { id: 'audio',         label: 'Audio Bible + devotionals', page: '/AudioBible' },
          { id: 'church_events', label: 'Church events & group management', page: '/ChurchMode' },
        ],
      },
    ],
  },
];

const MONETIZATION = [
  { tier: 'Free', color: 'bg-gray-100 text-gray-700', items: ['Daily verse', 'Limited AI questions (5/day)', 'Prayer journal', 'Basic reading plans'] },
  { tier: 'Premium', color: 'bg-indigo-600 text-white', items: ['Unlimited AI Bible study', 'Premium devotional plans', 'Sermon / small-group outlines', 'Saved chat history', 'Advanced prayer reminders'] },
];

const STORAGE_KEY = 'faithlight_launch_checklist_v2';
function loadChecked() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveChecked(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

export default function AppLaunchDashboard() {
  const [checked, setChecked] = useState(loadChecked);
  const [expanded, setExpanded] = useState({ v1: true });

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveChecked(next);
  };

  const togglePhase = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const phaseProgress = (phase) => {
    const all = phase.sections.flatMap(s => s.items);
    const done = all.filter(i => checked[i.id]).length;
    return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
  };

  const allItems = PHASES.flatMap(p => p.sections.flatMap(s => s.items));
  const overallDone = allItems.filter(i => checked[i.id]).length;
  const overallTotal = allItems.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link to="/Home" className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Rocket size={20} className="text-indigo-600" /> FaithLight Launch Spec
            </h1>
            <p className="text-xs text-gray-500">From 0 → 100,000 users · Technical roadmap</p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white mb-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Overall Progress</p>
              <p className="text-3xl font-bold">{overallDone} <span className="text-indigo-300 text-lg font-normal">/ {overallTotal} tasks</span></p>
            </div>
            <p className="text-4xl font-bold">{Math.round((overallDone / overallTotal) * 100)}%</p>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.round((overallDone / overallTotal) * 100)}%` }} />
          </div>
          <p className="text-indigo-200 text-xs mt-2">
            {overallDone === 0 ? "Start with V1.0 — just 7 core features 🚀"
              : overallDone < 12 ? "Building V1.0 — you're on the right track 💪"
              : overallDone < 30 ? "Great momentum! Growing your user base 🔥"
              : overallDone < overallTotal ? "Scaling phase — almost there ✨"
              : "🎉 Full launch stack complete!"}
          </p>
        </div>

        {/* Monetization plan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💰</span> Monetization Plan
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MONETIZATION.map(tier => (
              <div key={tier.tier} className={`rounded-xl p-3 ${tier.color}`}>
                <p className="text-xs font-bold mb-2">{tier.tier}</p>
                <ul className="space-y-1">
                  {tier.items.map(item => (
                    <li key={item} className="text-xs flex items-start gap-1.5">
                      <span className="mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-4">
          {PHASES.map(phase => {
            const { done, total, pct } = phaseProgress(phase);
            const isOpen = expanded[phase.id];
            return (
              <div key={phase.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => togglePhase(phase.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{phase.label}</p>
                    <p className="text-xs text-gray-500">{phase.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${phase.color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{done}/{total}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {phase.sections.map(section => (
                      <div key={section.title} className="p-4 border-b border-gray-50 last:border-0">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{section.title}</p>
                        <div className="space-y-2">
                          {section.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                              <button onClick={() => toggle(item.id)} className="flex-shrink-0">
                                {checked[item.id]
                                  ? <CheckCircle2 size={20} className="text-emerald-500" />
                                  : <Circle size={20} className="text-gray-300" />}
                              </button>
                              <span className={`text-sm flex-1 leading-snug ${checked[item.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {item.label}
                              </span>
                              {item.page && (
                                <Link to={item.page} className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100">
                                  <ExternalLink size={12} className="text-indigo-400" />
                                </Link>
                              )}
                              {item.link && (
                                <a href={item.link} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100">
                                  <ExternalLink size={12} className="text-indigo-400" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key insight */}
        <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
          <Info size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-indigo-900 mb-1">The strongest V1.0 is minimal</p>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Launch with just the 7 core features. Market one hook — either "Ask any Bible question" or "Daily prayer streak." Everything else is Stage 2+. User trust builds through daily spiritual value, not feature count.
            </p>
          </div>
        </div>

        {/* Growth tips */}
        <div className="mt-4 bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <p className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2"><Star size={14} /> Your Highest-Leverage Actions</p>
          <ul className="space-y-2">
            {[
              'Every YouTube video ends with "Download FaithLight — Daily Bible + AI Study"',
              'Free tier is generous — 5 AI questions/day keeps users engaged before upgrading',
              'Church onboarding is your fastest path to 10k: one church = hundreds of users',
              'Verse image cards shared on Instagram drive organic installs — build them beautifully',
            ].map(tip => (
              <li key={tip} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}