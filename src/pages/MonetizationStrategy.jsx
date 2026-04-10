import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Heart, Lock, Globe, Gift, Zap, BookOpen, Users, Star,
  CheckCircle, XCircle, ShoppingBag, Handshake, TrendingUp,
  DollarSign, Music, Brain, Download, Award, ChevronDown, ChevronUp
} from 'lucide-react';

const MODELS = [
  {
    id: 'subscription',
    number: '01',
    icon: Lock,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-700',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
    title: 'Optional Premium Subscription',
    subtitle: 'Core Bible stays free — advanced tools unlocked with a subscription',
    examples: ['Glorify', 'Abide', 'Bible Study Tools'],
    principle: 'Scripture access is never paywalled. Premium enhances the experience.',
    features: [
      { icon: Brain, label: 'Advanced AI Bible study explanations' },
      { icon: BookOpen, label: 'Deep theological study plans' },
      { icon: Download, label: 'Offline audio Bible downloads' },
      { icon: Star, label: 'Advanced quiz packs & courses' },
      { icon: TrendingUp, label: 'Personalized reading plans' },
      { icon: Music, label: 'Background audio playlists' },
    ],
    pricing: [
      { tier: 'Free', price: '$0', period: 'forever', desc: 'Bible reading, Verse of Day, Basic AI, Quiz, Journal', highlight: false },
      { tier: 'Premium Monthly', price: '$3–6', period: '/ month', desc: 'All advanced AI tools, offline audio, premium study plans', highlight: true },
      { tier: 'Premium Yearly', price: '$29–39', period: '/ year', desc: 'Best value — save up to 40%', highlight: false },
    ],
    regional: [
      { region: 'Africa & Lower-Income', monthly: '$1.99–2.99', yearly: '$14.99–19.99', flag: '🌍' },
      { region: 'Asia & Latin America', monthly: '$2.99–3.49', yearly: '$21.99–24.99', flag: '🌏' },
      { region: 'North America & Europe', monthly: '$3.99–4.99', yearly: '$29.99–39.99', flag: '🌎' },
    ],
  },
  {
    id: 'donations',
    number: '02',
    icon: Heart,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50',
    border: 'border-pink-200',
    title: 'Donations & Ministry Support',
    subtitle: 'Users voluntarily support the ministry — like YouVersion Bible App',
    examples: ['YouVersion Bible App', 'Bible Gateway', 'Olive Tree'],
    principle: 'All support is voluntary. Every dollar helps expand Bible access globally.',
    donationTiers: [
      { amount: '$2', label: 'Seed a Verse', desc: 'Helps cover one day of server costs', emoji: '🌱' },
      { amount: '$5', label: 'Light a Lamp', desc: 'Supports one language translation update', emoji: '🕯️' },
      { amount: '$10', label: 'Grow the Word', desc: 'Funds AI study content for a community', emoji: '📖' },
      { amount: '$25', label: 'Champion', desc: 'Sponsors Bible access for 10 new users', emoji: '🏆' },
      { amount: 'Custom', label: 'Your Heart', desc: 'Give what feels right for you', emoji: '❤️' },
    ],
    impact: [
      'Translate the Bible into more languages',
      'Support app development & maintenance',
      'Fund offline access for remote communities',
      'Expand Christian resources globally',
    ],
    perks: [
      'Supporter badge on profile',
      'Early access to new features',
      'Optional premium themes',
      'Named in ministry acknowledgements',
    ],
  },
  {
    id: 'courses',
    number: '03',
    icon: BookOpen,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'Premium Courses & Study Content',
    subtitle: 'Free Bible reading, but paid structured courses with real depth',
    examples: ['RightNow Media', 'Bible Project', 'The Bible Recap'],
    principle: 'Courses complement free Bible access — never replace it.',
    courseExamples: [
      { name: '7-Day Faith Foundation', type: 'One-time', price: '$4.99', icon: '🌟', desc: 'Core biblical beliefs for new believers' },
      { name: '30-Day Prayer Journey', type: 'One-time', price: '$7.99', icon: '🙏', desc: 'Transform your prayer life with guided scripture' },
      { name: 'Bible Foundations Course', type: 'One-time', price: '$12.99', icon: '📚', desc: 'Survey of Old & New Testament with AI insights' },
      { name: 'Marriage & Family Studies', type: 'Series', price: '$9.99', icon: '👨‍👩‍👧', desc: 'Biblical principles for family life' },
      { name: 'Christian Leadership Training', type: 'Series', price: '$14.99', icon: '🎓', desc: 'Equip leaders with biblical leadership frameworks' },
      { name: 'Discipleship Program', type: 'Series', price: '$19.99', icon: '✝️', desc: 'Deep discipleship journey with mentor guidance' },
    ],
    models: [
      { label: 'One-time purchase', desc: 'Pay once, own forever' },
      { label: 'Included in Premium', desc: 'All courses unlocked with subscription' },
      { label: 'Course bundles', desc: 'Discounted packs for churches and groups' },
    ],
  },
  {
    id: 'marketplace',
    number: '04',
    icon: ShoppingBag,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Christian Content Marketplace',
    subtitle: 'Optional library of ministry-aligned resources — study, listen, grow',
    examples: ['Logos Bible Software', 'Faithlife', 'Olive Tree'],
    principle: 'Content is always optional and mission-focused, never exploitative.',
    categories: [
      { icon: '📖', name: 'Study Resources', items: ['Bible commentaries', 'Theological dictionaries', 'Concordances'] },
      { icon: '🎧', name: 'Christian Audio', items: ['Devotional audiobooks', 'Bible story narrations', 'Worship readings'] },
      { icon: '📋', name: 'Sermon Series', items: ['Preaching series packs', 'Illustrated sermon notes', 'Topical study guides'] },
      { icon: '🎓', name: 'Learning Modules', items: ['Church history courses', 'Apologetics training', 'Biblical languages intro'] },
    ],
    phases: [
      { phase: 'Phase 1', label: 'Free content library', desc: 'Curated free resources for all users' },
      { phase: 'Phase 2', label: 'Premium resource packs', desc: 'Optional paid commentaries & study tools' },
      { phase: 'Phase 3', label: 'Publisher partnerships', desc: 'Partner with Christian publishers for licensed content' },
    ],
  },
  {
    id: 'partnerships',
    number: '05',
    icon: Handshake,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    border: 'border-violet-200',
    title: 'Ethical Christian Partnerships',
    subtitle: 'Instead of random ads — partner with aligned Christian ministries & churches',
    examples: ['Bible.com', 'Crosswalk', 'FaithGateway'],
    principle: 'No pop-up ads, no targeting. Only mission-aligned partners.',
    partnerTypes: [
      { icon: '⛪', name: 'Churches', desc: 'Local churches can promote their resources & events' },
      { icon: '📖', name: 'Bible Publishers', desc: 'Promote new translations, commentaries, study Bibles' },
      { icon: '🌍', name: 'Christian Charities', desc: 'Highlight Bible translation projects & mission work' },
      { icon: '🎓', name: 'Seminaries & Schools', desc: 'Partner with theological institutions for courses' },
      { icon: '🎵', name: 'Worship Music', desc: 'Feature Christian artists and worship albums' },
    ],
    principles: [
      'Only mission-aligned partners — no secular brands',
      'Partners displayed as "Recommended Resources", not ads',
      'Users can opt out of partner recommendations',
      'Revenue supports translation & development work',
    ],
  },
];

const FREE_FEATURES = [
  'Bible reading (all books & chapters)',
  'Verse of the Day',
  'Basic AI verse explanations',
  'Daily quiz',
  'Personal journal',
  'Basic highlights & notes',
  'Community prayer wall',
  'Audio Bible streaming',
];

const PREMIUM_FEATURES = [
  'Advanced AI theological study',
  'Offline audio Bible downloads',
  'Advanced personalized study plans',
  'Premium courses & content',
  'Unlimited highlights & collections',
  'AI sermon builder',
  'AI devotional generator',
  'Growth dashboards & analytics',
];

const LAUNCH_PHASES = [
  { phase: 'Phase 1', milestone: 'Launch', color: 'blue', strategy: 'All features free while user base grows. Build trust and adoption globally.' },
  { phase: 'Phase 2', milestone: '~10,000 users', color: 'purple', strategy: 'Introduce FaithLight Plus subscription. Optional donations page goes live.' },
  { phase: 'Phase 3', milestone: '~50,000 users', color: 'pink', strategy: 'Add premium courses, content marketplace, and ethical ministry partnerships.' },
  { phase: 'Phase 4', milestone: '~200,000 users', color: 'amber', strategy: 'Full marketplace, publisher partnerships, and global scholarship program for low-income users.' },
];

function ModelCard({ model }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = model.icon;
  const colorMap = {
    indigo: { btn: 'bg-indigo-600 hover:bg-indigo-700', badge: 'bg-indigo-100 text-indigo-700', header: 'text-indigo-700', dot: 'bg-indigo-500' },
    pink: { btn: 'bg-pink-600 hover:bg-pink-700', badge: 'bg-pink-100 text-pink-700', header: 'text-pink-700', dot: 'bg-pink-500' },
    emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700', badge: 'bg-emerald-100 text-emerald-700', header: 'text-emerald-700', dot: 'bg-emerald-500' },
    amber: { btn: 'bg-amber-600 hover:bg-amber-700', badge: 'bg-amber-100 text-amber-700', header: 'text-amber-700', dot: 'bg-amber-500' },
    violet: { btn: 'bg-violet-600 hover:bg-violet-700', badge: 'bg-violet-100 text-violet-700', header: 'text-violet-700', dot: 'bg-violet-500' },
  };
  const c = colorMap[model.color];

  return (
    <div className={`bg-white rounded-2xl shadow-md border ${model.border} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${model.gradient} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">Model {model.number}</div>
              <h2 className="text-xl font-bold leading-tight">{model.title}</h2>
            </div>
          </div>
        </div>
        <p className="mt-3 text-white/85 text-sm leading-relaxed">{model.subtitle}</p>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Principle */}
        <div className={`${model.lightBg} ${model.border} border rounded-xl px-4 py-3 mb-5 flex items-start gap-2`}>
          <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.header}`} />
          <p className={`text-sm font-medium ${c.header}`}>{model.principle}</p>
        </div>

        {/* Examples */}
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Used by</p>
          <div className="flex flex-wrap gap-2">
            {model.examples.map((ex, i) => (
              <span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${c.badge}`}>{ex}</span>
            ))}
          </div>
        </div>

        {/* Model-specific content */}
        {model.id === 'subscription' && (
          <>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Premium Features</p>
              <div className="grid grid-cols-2 gap-2">
                {model.features.map(({ icon: FIcon, label }, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <FIcon className={`w-4 h-4 flex-shrink-0 ${c.header}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 transition mb-4">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Hide pricing' : 'Show regional pricing'}
            </button>
            {expanded && (
              <div className="space-y-3 mb-2">
                {model.regional.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between ${model.lightBg} rounded-xl px-4 py-3`}>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.flag} {r.region}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{r.monthly}/mo · {r.yearly}/yr</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {model.id === 'donations' && (
          <>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Donation Tiers</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {model.donationTiers.map((t, i) => (
                  <div key={i} className={`${model.lightBg} rounded-xl p-3 text-center ${model.border} border`}>
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <div className={`text-base font-bold ${c.header}`}>{t.amount}</div>
                    <div className="text-xs font-semibold text-gray-700">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Supporter Perks</p>
              <div className="space-y-1.5">
                {model.perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className={`w-4 h-4 ${c.header}`} />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {model.id === 'courses' && (
          <>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Example Courses</p>
              <div className="space-y-2">
                {model.courseExamples.map((course, i) => (
                  <div key={i} className={`flex items-center justify-between ${model.lightBg} rounded-xl px-4 py-3 ${model.border} border`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{course.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{course.name}</p>
                        <p className="text-xs text-gray-500">{course.desc}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-sm font-bold ${c.header}`}>{course.price}</p>
                      <p className="text-xs text-gray-400">{course.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {model.id === 'marketplace' && (
          <>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Content Categories</p>
              <div className="grid grid-cols-2 gap-3">
                {model.categories.map((cat, i) => (
                  <div key={i} className={`${model.lightBg} rounded-xl p-3 ${model.border} border`}>
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <p className="text-sm font-bold text-gray-800 mb-1">{cat.name}</p>
                    {cat.items.map((item, j) => (
                      <p key={j} className="text-xs text-gray-500">• {item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {model.id === 'partnerships' && (
          <>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Partner Types</p>
              <div className="space-y-2">
                {model.partnerTypes.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl">{pt.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{pt.name}</p>
                      <p className="text-xs text-gray-500">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Our Principles</p>
              <div className="space-y-1.5">
                {model.principles.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className={`w-4 h-4 ${c.header}`} />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MonetizationStrategy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white px-4 pt-16 pb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-200 mb-6">
            <DollarSign className="w-4 h-4" /> Ministry-First Monetization
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Sustainable Funding for a<br />
            <span className="text-amber-400">Ministry-Focused</span> Bible App
          </h1>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto leading-relaxed">
            How FaithLight balances ministry impact with sustainable funding — while keeping core Bible access free for everyone, everywhere.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">

        {/* Core Principle Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl text-white mb-12 text-center">
          <p className="text-xl font-bold">🔑 Our Core Principle</p>
          <p className="mt-2 text-white/90 text-base">
            <strong>Core Bible reading must always remain free.</strong> Monetization supports the ministry — it never restricts Scripture access.
          </p>
        </div>

        {/* Free vs Premium overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-gray-800">Always Free</h3>
            </div>
            <ul className="p-5 space-y-2.5">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-white">FaithLight Premium</h3>
            </div>
            <ul className="p-5 space-y-2.5">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5 Models */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">The 5 Revenue Models</h2>
          <p className="text-gray-500 text-sm mb-8">Inspired by major Christian apps — adapted for FaithLight's mission</p>
        </div>
        <div className="space-y-6 mb-12">
          {MODELS.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {/* No Ads Policy */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> No Advertising Policy
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">We will never use</p>
              {['Banner ads', 'Video interstitials', 'Pop-up ads', 'Behavioral targeting', 'Third-party ad networks'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">Revenue comes from</p>
              {['Optional subscriptions', 'Voluntary donations', 'Premium course purchases', 'Ministry partnerships', 'Content marketplace'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-sm text-green-800">This keeps the Bible reading experience clean, sacred, and distraction-free.</p>
          </div>
        </div>

        {/* Launch Phases */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Launch Strategy
          </h2>
          <div className="space-y-4">
            {LAUNCH_PHASES.map((lp, i) => {
              const colorClasses = {
                blue: 'border-blue-500 bg-blue-50 text-blue-900',
                purple: 'border-purple-500 bg-purple-50 text-purple-900',
                pink: 'border-pink-500 bg-pink-50 text-pink-900',
                amber: 'border-amber-500 bg-amber-50 text-amber-900',
              };
              const badgeColors = {
                blue: 'bg-blue-500',
                purple: 'bg-purple-500',
                pink: 'bg-pink-500',
                amber: 'bg-amber-500',
              };
              return (
                <div key={i} className={`flex gap-4 border-l-4 rounded-xl p-4 ${colorClasses[lp.color]}`}>
                  <div className="flex-shrink-0">
                    <span className={`inline-block text-white text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[lp.color]}`}>{lp.phase}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-0.5">{lp.milestone}</p>
                    <p className="text-sm opacity-80">{lp.strategy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why it works */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Why This Approach Works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🌍', title: 'Global accessibility', desc: 'Free core keeps Scripture accessible everywhere, including low-income regions' },
              { icon: '💰', title: 'Sustainable funding', desc: 'Multiple revenue streams support long-term development and maintenance' },
              { icon: '🤝', title: 'Trust & integrity', desc: 'No ads or paywalled Scripture maintains trust as a ministry-first platform' },
              { icon: '📈', title: 'Scalable growth', desc: 'Revenue grows with the user base without compromising the mission' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold mb-1">{item.title}</p>
                <p className="text-sm text-indigo-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">Ready to support the FaithLight mission?</p>
          <Link to={createPageUrl('SupportFaithLight')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:from-pink-700 hover:to-rose-700 transition">
            <Heart className="w-5 h-5" /> Support FaithLight Ministry
          </Link>
        </div>
      </div>
    </div>
  );
}