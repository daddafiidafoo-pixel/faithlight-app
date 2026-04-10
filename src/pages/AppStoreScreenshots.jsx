import React, { useState, useRef } from 'react';
import { Download, Smartphone, BookOpen, Volume2, Sparkles, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const SCREENSHOTS = [
  {
    id: 1,
    headline: 'Grow in God\'s Word Every Day',
    subtitle: 'Daily Bible inspiration and quick access to Scripture.',
    label: 'Daily Inspiration',
    icon: BookOpen,
    bg: 'from-[#5A4BFF] to-[#6F7BFF]',
    mockBg: 'from-indigo-50 to-violet-50',
    accent: '#5A4BFF',
    screen: () => (
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-indigo-50 to-white p-3 gap-2">
        <div className="flex items-center justify-between pt-1 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-indigo-900">FaithLight</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-indigo-100" />
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-3 shadow">
          <div className="text-[7px] text-indigo-200 font-semibold mb-0.5">VERSE OF THE DAY</div>
          <div className="text-[8px] text-white font-bold leading-tight">"Your word is a lamp to my feet and a light to my path."</div>
          <div className="text-[6.5px] text-indigo-200 mt-1">— Psalm 119:105</div>
          <div className="mt-2 flex gap-1">
            <div className="bg-white/20 rounded-md px-2 py-0.5 text-[6px] text-white">Save</div>
            <div className="bg-white/20 rounded-md px-2 py-0.5 text-[6px] text-white">Share</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {['Bible Reader', 'Audio Bible', 'Study Plans', 'Prayer Wall'].map(f => (
            <div key={f} className="bg-white rounded-lg p-2 shadow-sm border border-indigo-100">
              <div className="w-4 h-4 rounded-md bg-indigo-100 mb-1" />
              <div className="text-[7px] font-bold text-gray-800">{f}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          <div className="text-[7px] font-bold text-gray-700 mb-1">📖 Continue Reading</div>
          <div className="text-[6px] text-gray-400">John 3 · Chapter 3 of 21</div>
          <div className="mt-1 h-1 rounded bg-gray-100"><div className="h-full w-1/3 bg-indigo-400 rounded" /></div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    headline: 'Read the Bible Easily',
    subtitle: 'Navigate books, chapters, and verses in a clean reading experience.',
    label: 'Bible Reader',
    icon: BookOpen,
    bg: 'from-[#1a1a5e] to-[#4B5BCC]',
    accent: '#4B5BCC',
    screen: () => (
      <div className="w-full h-full flex flex-col bg-white p-3 gap-2">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-gray-100">
          <ChevronLeft className="w-3 h-3 text-gray-400" />
          <span className="text-[8px] font-bold text-gray-800 flex-1 text-center">John 3</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex gap-1 mb-1">
          {['WEB', 'KJV', 'NIV'].map((t, i) => (
            <div key={t} className={`text-[6px] px-1.5 py-0.5 rounded font-semibold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="space-y-1.5 flex-1 overflow-hidden">
          {[
            [1, 'For God so loved the world, that he gave his one and only Son...'],
            [2, 'that whoever believes in him should not perish, but have eternal life.'],
            [3, 'For God did not send his Son into the world to judge the world...'],
            [4, 'He who believes in him is not judged.'],
          ].map(([n, t]) => (
            <div key={n} className="flex gap-1.5 items-start">
              <span className="text-[6.5px] text-indigo-400 font-bold pt-0.5 w-3 flex-shrink-0">{n}</span>
              <span className="text-[7.5px] text-gray-700 leading-relaxed">{t}</span>
            </div>
          ))}
          <div className="flex gap-1.5 items-start bg-yellow-50 border border-yellow-200 rounded p-1">
            <span className="text-[6.5px] text-indigo-400 font-bold pt-0.5 w-3 flex-shrink-0">16</span>
            <span className="text-[7.5px] text-gray-700 leading-relaxed">For God so loved the world, that he gave his one and only Son...</span>
          </div>
        </div>
        <div className="flex gap-1 pt-1 border-t border-gray-100">
          {['Highlight', 'Note', 'Share', 'AI'].map(a => (
            <div key={a} className="flex-1 bg-gray-50 rounded text-center py-1 text-[6px] text-gray-500 font-medium">{a}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    headline: 'Listen Anywhere',
    subtitle: 'Stream or download the Audio Bible for daily listening.',
    label: 'Audio Bible',
    icon: Volume2,
    bg: 'from-[#0D1B2A] to-[#1a4a6b]',
    accent: '#1a4a6b',
    screen: () => (
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 p-3 gap-2">
        <div className="text-center pt-1">
          <div className="text-[6.5px] text-slate-400 font-semibold">NOW PLAYING</div>
          <div className="text-[9px] font-bold text-white mt-0.5">John · Chapter 3</div>
          <div className="text-[6.5px] text-slate-400">World English Bible</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-2 mx-1 flex-1">
          <div className="text-[6.5px] text-slate-300 font-semibold mb-1.5">FOLLOWING ALONG</div>
          <div className="space-y-1">
            {['For God so loved the world…', 'that he gave his one and only Son…', 'that whoever believes in him…'].map((line, i) => (
              <div key={i} className={`text-[7px] leading-relaxed ${i === 0 ? 'text-white font-semibold bg-indigo-500/30 rounded px-1 py-0.5' : 'text-slate-400'}`}>{line}</div>
            ))}
          </div>
        </div>
        <div className="px-1">
          <div className="h-1 bg-slate-700 rounded-full mb-1.5">
            <div className="h-full w-2/5 bg-indigo-400 rounded-full" />
          </div>
          <div className="flex justify-between text-[6px] text-slate-500 mb-2">
            <span>1:24</span><span>3:41</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-[7px] text-white">⏮</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-[10px] text-white">⏸</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-[7px] text-white">⏭</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="flex-1 bg-slate-700/50 rounded-lg p-1.5 text-center">
            <div className="text-[6px] text-slate-300 font-semibold">Speed</div>
            <div className="text-[8px] text-white font-bold">1.0×</div>
          </div>
          <div className="flex-1 bg-indigo-500/30 border border-indigo-400/30 rounded-lg p-1.5 text-center">
            <div className="text-[6px] text-indigo-300 font-semibold">Offline</div>
            <div className="text-[7px] text-white font-bold">↓ Save</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    headline: 'AI Bible Study Assistant',
    subtitle: 'Understand Scripture deeper with smart explanations and reflections.',
    label: 'AI Study Tools',
    icon: Sparkles,
    bg: 'from-[#4B0082] to-[#8B5CF6]',
    accent: '#8B5CF6',
    screen: () => (
      <div className="w-full h-full flex flex-col bg-white p-3 gap-2">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-2.5 shadow">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span className="text-[7.5px] font-bold text-white">AI Verse Explanation</span>
          </div>
          <div className="text-[7px] text-violet-200 italic mb-1.5">John 3:16</div>
          <div className="text-[7px] text-white/90 leading-relaxed">This verse captures the entire gospel — God's love for humanity expressed through the gift of Jesus Christ...</div>
        </div>
        <div className="space-y-1.5">
          {[
            { icon: '📜', label: 'Historical Context', text: 'Written in 1st century Ephesus...' },
            { icon: '💡', label: 'Life Application', text: 'Believe and receive eternal life...' },
            { icon: '🔗', label: 'Related Verses', text: 'Romans 5:8 · 1 John 4:9' },
          ].map(({ icon, label, text }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[8px]">{icon}</span>
                <span className="text-[7px] font-bold text-gray-700">{label}</span>
              </div>
              <div className="text-[6.5px] text-gray-500">{text}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto bg-violet-50 rounded-lg p-2 border border-violet-100">
          <div className="text-[6.5px] text-violet-600 font-semibold mb-1">✦ Daily Reflection</div>
          <div className="text-[7px] text-gray-700 leading-relaxed">How does knowing God's unconditional love change your day?</div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    headline: 'Build Consistent Reading Habits',
    subtitle: 'Personalized Bible study plans for every season of faith.',
    label: 'Study Plans',
    icon: BookOpen,
    bg: 'from-[#0f4c75] to-[#1b6ca8]',
    accent: '#1b6ca8',
    screen: () => (
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-blue-50 to-white p-3 gap-2">
        <div className="text-[8px] font-bold text-gray-800">📅 My Study Plan</div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-2.5 shadow">
          <div className="text-[6.5px] text-blue-200 font-semibold">ACTIVE PLAN</div>
          <div className="text-[8px] text-white font-bold mt-0.5">30-Day Gospel Journey</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full w-2/5 bg-white rounded-full" />
          </div>
          <div className="flex justify-between mt-0.5 text-[6px] text-blue-200">
            <span>Day 12 of 30</span><span>40%</span>
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          {[
            { day: 'Day 12', ref: 'Matthew 5:1–12', done: true },
            { day: 'Day 13', ref: 'Matthew 5:13–26', done: false },
            { day: 'Day 14', ref: 'Matthew 6:1–18', done: false },
          ].map(({ day, ref, done }) => (
            <div key={day} className={`flex items-center gap-2 p-2 rounded-lg border ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] ${done ? 'bg-green-500 text-white' : 'border-2 border-gray-300'}`}>{done ? '✓' : ''}</div>
              <div>
                <div className="text-[6.5px] font-bold text-gray-700">{day}</div>
                <div className="text-[6px] text-gray-400">{ref}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-600 rounded-lg py-1.5 text-center text-[7px] text-white font-bold">Continue Today's Reading →</div>
      </div>
    ),
  },
  {
    id: 6,
    headline: 'Pray Together, Grow Together',
    subtitle: 'Share requests, encourage others, and join live study rooms.',
    label: 'Community & Prayer',
    icon: Users,
    bg: 'from-[#064e3b] to-[#059669]',
    accent: '#059669',
    screen: () => (
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-green-50 to-white p-3 gap-2">
        <div className="text-[8px] font-bold text-gray-800">🙏 Prayer Wall</div>
        <div className="space-y-1.5 flex-1">
          {[
            { name: 'Sarah K.', text: 'Please pray for my family\'s health this week.', count: 24 },
            { name: 'James M.', text: 'Traveling for mission work in Ethiopia.', count: 18 },
            { name: 'Grace T.', text: 'Praying for peace in our church community.', count: 31 },
          ].map(({ name, text, count }) => (
            <div key={name} className="bg-white rounded-xl p-2 shadow-sm border border-green-100">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-green-200" />
                  <span className="text-[7px] font-bold text-gray-700">{name}</span>
                </div>
                <div className="flex items-center gap-0.5 text-[6px] text-green-600 font-semibold">
                  <span>🙏</span><span>{count}</span>
                </div>
              </div>
              <div className="text-[6.5px] text-gray-500 leading-relaxed">{text}</div>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-2.5">
          <div className="text-[7px] text-white font-bold mb-0.5">📚 Active Study Room</div>
          <div className="text-[6.5px] text-green-100">Gospel of John · 4 members</div>
          <div className="mt-1.5 flex gap-1">
            {['', '', '', ''].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-white/30 border border-white/50" />
            ))}
            <span className="text-[6px] text-white/70 ml-0.5 self-center">● Live</span>
          </div>
        </div>
      </div>
    ),
  },
];

function PhoneFrame({ children }) {
  return (
    <div className="relative mx-auto" style={{ width: 140, height: 284 }}>
      {/* Phone shell */}
      <div className="absolute inset-0 rounded-[26px] bg-gray-900 shadow-2xl" />
      {/* Side buttons */}
      <div className="absolute -left-1 top-16 w-1 h-6 bg-gray-700 rounded-l" />
      <div className="absolute -left-1 top-24 w-1 h-10 bg-gray-700 rounded-l" />
      <div className="absolute -right-1 top-20 w-1 h-12 bg-gray-700 rounded-r" />
      {/* Screen area */}
      <div className="absolute inset-[5px] rounded-[22px] overflow-hidden bg-white">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />
        <div className="absolute inset-0 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AppStoreScreenshots() {
  const [active, setActive] = useState(0);

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-white/80 mb-4">
            <Smartphone className="w-4 h-4" /> App Store Screenshot Layout
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">FaithLight Store Screenshots</h1>
          <p className="text-white/50 text-sm">5-screenshot story · iOS 1290×2796px · Android 1080×1920px</p>
        </div>

        {/* All 6 screenshots in a row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {SCREENSHOTS.map((s, i) => {
            const Screen = s.screen;
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`group flex flex-col items-center gap-3 p-3 rounded-2xl transition-all ${active === i ? 'bg-white/10 ring-2 ring-white/30' : 'hover:bg-white/5'}`}
              >
                <div className={`w-full rounded-xl bg-gradient-to-b ${s.bg} p-3 flex items-center justify-center`} style={{ minHeight: 80 }}>
                  <PhoneFrame><Screen /></PhoneFrame>
                </div>
                <div className="text-center">
                  <div className="text-white/40 text-xs font-semibold mb-0.5">0{s.id}</div>
                  <div className="text-white text-xs font-bold">{s.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail view */}
        <div className={`bg-gradient-to-br ${SCREENSHOTS[active].bg} rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl`}>
          <PhoneFrame>
            {React.createElement(SCREENSHOTS[active].screen)}
          </PhoneFrame>
          <div className="flex-1 text-white">
            <div className="text-white/60 text-sm font-semibold mb-2">Screenshot {SCREENSHOTS[active].id} of 5</div>
            <h2 className="text-3xl font-extrabold leading-tight mb-3">{SCREENSHOTS[active].headline}</h2>
            <p className="text-white/70 text-base mb-6">{SCREENSHOTS[active].subtitle}</p>
            <div className="space-y-3">
              {[
                { label: 'Headline', value: SCREENSHOTS[active].headline },
                { label: 'Subtitle', value: SCREENSHOTS[active].subtitle },
                { label: 'iOS size', value: '1290 × 2796 px' },
                { label: 'Android size', value: '1080 × 1920 px' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-white/40 text-xs font-semibold w-20 pt-0.5 flex-shrink-0">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Afaan Oromoo variant note */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="text-white font-bold text-sm mb-3 flex items-center gap-2">🌍 Afaan Oromoo Variant — Screenshot 1</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/40 text-xs font-semibold mb-1">Headline</div>
              <div className="bg-white/10 rounded-xl px-3 py-2 text-white font-bold">Guyyaa Guyyaan Dubbii Waaqayyoo Keessatti Guddadhaa</div>
            </div>
            <div>
              <div className="text-white/40 text-xs font-semibold mb-1">Subtitle</div>
              <div className="bg-white/10 rounded-xl px-3 py-2 text-white/80">Aayata guyyaa, dubbisa Macaafa Qulqulluu fi qajeelfama hafuuraa.</div>
            </div>
          </div>
        </div>

        {/* Design tips */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { tip: 'Phone Frame', desc: 'iPhone mockup for professional look' },
            { tip: 'Gradient BG', desc: '#5A4BFF → #6F7BFF consistent tone' },
            { tip: 'Short Text', desc: '3–5 word headline, 1 subtitle line' },
            { tip: 'One Feature', desc: 'Each screen answers: why install?' },
          ].map(({ tip, desc }) => (
            <div key={tip} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-white text-sm font-bold">{tip}</span>
              </div>
              <p className="text-white/50 text-xs">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}