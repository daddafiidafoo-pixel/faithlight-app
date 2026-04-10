import React, { useState } from 'react';
import { Copy, Check, Music, Eye, Zap, Calendar, Flame, AlertCircle } from 'lucide-react';

const scripts = [
  {
    num: 1,
    lang: '🇪🇹 OROMO',
    title: 'AI Prayer Generator',
    vibe: 'HIGH VIRAL',
    hook: "Appiin kun kadhannaa Afaan Oromoon siif uuma 😳",
    show: [
      "Open app",
      "Tap 'Prayer'",
      "Show Oromo prayer output"
    ],
    voice: "Kun appii kadhannaa siif uumu dha… Afaan Oromoon!",
    cta: "FaithLight barbaadi",
    timing: "15-20 sec",
  },
  {
    num: 2,
    lang: '🇪🇹 AMHARIC',
    title: 'AI Prayer Generator',
    vibe: 'HIGH VIRAL',
    hook: "ይህ አፕ በአማርኛ ጸሎት ይፈጥራል 😳",
    show: [
      "Generate prayer",
      "Scroll slowly",
      "Highlight text"
    ],
    voice: "በአማርኛ ጸሎት በሰከንዶች ይሰጥሃል",
    cta: "FaithLight ፈልግ",
    timing: "15-20 sec",
  },
  {
    num: 3,
    lang: '🇪🇹 OROMO',
    title: 'Language Pride + Bible',
    vibe: 'VERY STRONG',
    hook: "Dhumarratti… appii Kiristaanaa Afaan Oromoon 🙌",
    show: [
      "Switch language to Oromo",
      "Show Bible UI",
      "Show verses in Oromo"
    ],
    voice: "Amma Waaqayyoon Afaan keetiin barachuu dandeessa",
    cta: "FaithLight download godhi",
    timing: "20-25 sec",
  },
  {
    num: 4,
    lang: '🇪🇹 AMHARIC',
    title: 'Bible Verse for Peace',
    vibe: 'EMOTIONAL',
    hook: "ጭንቀት ካለብህ ይህን አንብብ 🙏",
    show: [
      "Show verse slowly (zoom effect)",
      "Highlight key text",
      "Pause for impact"
    ],
    voice: "ይህ ቃል ያረጋግጥሃል",
    cta: "FaithLight ውስጥ ተመልከት",
    timing: "15-18 sec",
  },
  {
    num: 5,
    lang: '🇪🇹 OROMO',
    title: 'Sermon Builder (30 sec)',
    vibe: 'POWER',
    hook: "Lallaba sekondii 30 keessatti qopheessi 🤯",
    show: [
      "Type topic quickly",
      "Click generate",
      "Show sermon result fast"
    ],
    voice: "Kun pastorootaaf baay'ee barbaachisaa dha",
    cta: "FaithLight fayyadami",
    timing: "20-25 sec",
  },
  {
    num: 6,
    lang: '🇪🇹 AMHARIC',
    title: 'Sermon Builder (30 sec)',
    vibe: 'POWER',
    hook: "ስብከት በ30 ሰከንድ 🤯",
    show: [
      "Generate sermon",
      "Show output",
      "Highlight key points"
    ],
    voice: "እንዲህ በፍጥነት ማዘጋጀት ትችላለህ",
    cta: "FaithLight አውርድ",
    timing: "20-25 sec",
  },
  {
    num: 7,
    lang: '🇪🇹 OROMO',
    title: 'Daily Use Loop',
    vibe: 'HABIT',
    hook: "Guyyaa guyyaan kana fayyadamuu qabda 🙏",
    show: [
      "Prayer → verse → sermon quickly",
      "Fast cuts between features",
      "Show UI polish"
    ],
    voice: "Guyyaa guyyaan Waaqayyotti si dhiyeessa",
    cta: "FaithLight yaali",
    timing: "15-20 sec",
  },
  {
    num: 8,
    lang: '🇪🇹 AMHARIC',
    title: 'Testimony Style',
    vibe: 'EMOTIONAL',
    hook: "ይህ አፕ ሕይወቴን ቀየረ 🙏",
    show: [
      "Calm UI shots",
      "Prayer animation",
      "Peaceful background"
    ],
    voice: "በየቀኑ እጠቀማለሁ",
    cta: "FaithLight ሞክር",
    timing: "15-20 sec",
  },
  {
    num: 9,
    lang: '🇪🇹 OROMO',
    title: 'Curiosity + Reveal',
    vibe: 'HOOK & SHOCK',
    hook: "Appiin kun waan ajaa'iba siif hojjeta…",
    show: [
      "Pause (2 sec)",
      "Then reveal AI prayer",
      "Reaction shot optional"
    ],
    voice: "Isin yaaddesse?",
    cta: "FaithLight ilaali",
    timing: "12-15 sec",
  },
  {
    num: 10,
    lang: '🌍 MIXED',
    title: 'Language Switch Power',
    vibe: 'VERY POWERFUL',
    hook: "AI… Afaan Oromoon kadhannaa uuma 😳",
    show: [
      "English UI",
      "Switch to Oromo",
      "Prayer generates in Oromo"
    ],
    voice: "This is powerful…",
    cta: "Download FaithLight",
    timing: "15-20 sec",
  },
];

const postingPlan = [
  { day: 'Day 1', scripts: [1, 3], focus: 'Hook + Language Pride' },
  { day: 'Day 2', scripts: [2, 5], focus: 'Prayer + Power' },
  { day: 'Day 3', scripts: [4, 7], focus: 'Emotional + Habit' },
  { day: 'Repeat', scripts: ['Winners'], focus: 'Track engagement, repeat best performers' },
];

const proTips = [
  { icon: Flame, title: 'Show Result FAST', desc: 'Hook + action = within 3 sec' },
  { icon: Music, title: 'Don\'t Talk Too Much', desc: 'Let visuals do the work' },
  { icon: Eye, title: 'Keep It Emotional', desc: 'Faith + language = powerful combo' },
  { icon: Zap, title: 'Loop-Friendly', desc: 'Scripts work as 15-60 sec shorts' },
];

export default function TikTokScriptsGuide() {
  const [copied, setCopied] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const CopyBtn = ({ text, id, label }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors"
    >
      {copied === id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied === id ? 'Copied!' : label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-red-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            FaithLight TikTok Scripts
          </h1>
          <p className="text-gray-600 text-lg mb-2">10 viral scripts ready to record + posting calendar</p>
          <p className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            🎥 Record now • Go viral • Drive installs
          </p>
        </div>

        {/* Scripts Grid */}
        <div className="space-y-6 mb-10">
          {scripts.map((s) => (
            <div key={s.num} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">

              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200 p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-black text-red-600">#{s.num}</span>
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full">{s.lang}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {s.vibe} • {s.timing}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">

                {/* 1. Hook */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <label className="text-xs font-bold text-red-700 uppercase tracking-wide">🎯 Hook (On-Screen Text)</label>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">{s.hook}</p>
                  <CopyBtn text={s.hook} id={`hook-${s.num}`} label="Copy Hook" />
                </div>

                {/* 2. Show */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Eye className="w-4 h-4" /> 🎥 What to Show
                  </label>
                  <ul className="space-y-1.5">
                    {s.show.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 font-bold mt-0.5">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Voice */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-purple-600" />
                    <label className="text-xs font-bold text-purple-700 uppercase tracking-wide">🎤 Voice-Over (Optional)</label>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">{s.voice}</p>
                  <CopyBtn text={s.voice} id={`voice-${s.num}`} label="Copy Voice" />
                </div>

                {/* 4. CTA */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <label className="text-xs font-bold text-green-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Zap className="w-4 h-4" /> 📲 Call to Action
                  </label>
                  <p className="text-base font-bold text-gray-900 mb-2">{s.cta}</p>
                  <CopyBtn text={s.cta} id={`cta-${s.num}`} label="Copy CTA" />
                </div>

                {/* Copy All */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => copy(`${s.hook}\n\n${s.voice}\n\n${s.cta}`, `all-${s.num}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-colors"
                  >
                    {copied === `all-${s.num}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy All Text
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Posting Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">📅 Posting Plan (Important!)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postingPlan.map((p, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <p className="text-lg font-bold text-gray-900 mb-1">{p.day}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.isArray(p.scripts) ? (
                    p.scripts.map((s) => (
                      <span key={s} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Script {s}
                      </span>
                    ))
                  ) : (
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {p.scripts}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{p.focus}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-900">
              <strong>💡 Pro Tip:</strong> Post at <strong>6–9 PM</strong> (peak time for Oromo/Amharic audiences). Track which script gets highest engagement and repeat winners 3x/week.
            </p>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">🔥 Pro Tips (This Makes It Viral)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proTips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 flex gap-3">
                  <Icon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">{tip.title}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Success Formula */}
          <div className="mt-6 bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">✨ Viral Success Formula</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-black">3s</p>
                <p className="text-xs text-purple-200">Hook Time</p>
              </div>
              <div>
                <p className="text-2xl font-black">+</p>
              </div>
              <div>
                <p className="text-2xl font-black">🌍</p>
                <p className="text-xs text-purple-200">Language Pride</p>
              </div>
              <div>
                <p className="text-2xl font-black">=</p>
              </div>
            </div>
            <p className="text-center mt-4 text-lg font-bold">🚀 VIRAL INSTALL</p>
          </div>
        </div>

      </div>
    </div>
  );
}