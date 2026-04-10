import React, { useState } from 'react';
import { Copy, Check, Smartphone, Palette, Type, Layers, Star, Globe, Mic, BookOpen, MessageCircle, Gem, Zap } from 'lucide-react';

const screenshots = [
  {
    id: 1,
    tag: '🔥 HOOK — Most Important',
    icon: Star,
    bg: 'from-[#5B3DF5] to-[#2D1B8E]',
    headline: 'Grow Your Faith Daily 🙏',
    subtext: 'Bible • Prayer • Sermons\nin Your Language',
    mockup: 'App Home Screen',
    tip: 'Title very large in top 30%. Phone centered. Clean background, no clutter.',
    layout: [
      { type: 'logo', label: 'SMALL LOGO (top center)' },
      { type: 'headline', label: 'BIG TITLE — large bold white text' },
      { type: 'subtext', label: 'Subtext — medium weight, gold color' },
      { type: 'phone', label: 'PHONE MOCKUP (centered, app home screen)' },
      { type: 'glow', label: 'Soft bottom glow' },
    ],
    accent: '#F5C542',
    conversion: 'CRITICAL — decides whether someone downloads',
  },
  {
    id: 2,
    tag: '📖 Bible Feature',
    icon: BookOpen,
    bg: 'from-[#1e3a8a] to-[#1e1b4b]',
    headline: 'Read & Discover the Bible',
    subtext: 'Find verses by topic,\nmeaning, or need',
    mockup: 'Bible Search Result Screen',
    tip: 'Highlight a verse card with gold border glow.',
    layout: [
      { type: 'headline', label: 'Bold headline — top third' },
      { type: 'subtext', label: 'Subtext below headline' },
      { type: 'phone', label: 'PHONE MOCKUP (Bible search result)' },
      { type: 'highlight', label: '✨ Gold-bordered verse card highlight' },
    ],
    accent: '#F5C542',
    conversion: 'Show usefulness — discoverability',
  },
  {
    id: 3,
    tag: '🙏 Prayer Feature',
    icon: null,
    bg: 'from-[#4c1d95] to-[#1e1b4b]',
    headline: 'Generate Powerful Prayers 🙏',
    subtext: 'Pray anytime,\nin your own language',
    mockup: 'Prayer Output Screen',
    tip: 'Soft background, peaceful feeling. Styled like a calm message bubble.',
    layout: [
      { type: 'headline', label: 'Bold headline — emotional' },
      { type: 'subtext', label: 'Soft subtext' },
      { type: 'phone', label: 'PHONE MOCKUP (prayer output)' },
      { type: 'highlight', label: '💬 Styled prayer message bubble' },
    ],
    accent: '#C084FC',
    conversion: 'Emotional — make them feel it',
  },
  {
    id: 4,
    tag: '🎙 Sermon Builder',
    icon: Mic,
    bg: 'from-[#064e3b] to-[#1e1b4b]',
    headline: 'Prepare Sermons in Seconds 🎙',
    subtext: 'Perfect for pastors,\nleaders & teachers',
    mockup: 'Sermon Builder UI',
    tip: 'Show dropdowns (audience, tone, style). Powerful but simple.',
    layout: [
      { type: 'headline', label: 'Bold headline' },
      { type: 'subtext', label: 'Target audience text' },
      { type: 'phone', label: 'PHONE MOCKUP (sermon builder dropdowns)' },
      { type: 'highlight', label: '⚙️ Highlighted options: Audience / Tone / Style' },
    ],
    accent: '#34d399',
    conversion: 'Show power — structured UI',
  },
  {
    id: 5,
    tag: '🌍 Language — BIGGEST DIFFERENTIATOR',
    icon: Globe,
    bg: 'from-[#5B3DF5] to-[#0f172a]',
    headline: 'Faith in Your Language 🌍',
    subtext: 'Afaan Oromoo • አማርኛ\nKiswahili • العربية',
    mockup: 'Language Selector Screen',
    tip: 'Make language names LARGE and clearly visible. Add subtle world map background.',
    layout: [
      { type: 'headline', label: 'Bold headline' },
      { type: 'languages', label: '🌍 Language names — LARGE, visible (gold text)' },
      { type: 'phone', label: 'PHONE MOCKUP (language selector)' },
      { type: 'highlight', label: 'Subtle world map background overlay' },
    ],
    accent: '#F5C542',
    conversion: '🔥 LOW competition keywords — HIGH download trigger',
  },
  {
    id: 6,
    tag: '🤖 AI Chat',
    icon: MessageCircle,
    bg: 'from-[#0c4a6e] to-[#1e1b4b]',
    headline: 'Ask Anything About Faith 🤖',
    subtext: 'Get Bible-based answers instantly',
    mockup: 'AI Chat Screen',
    tip: 'Show a real short conversation. Simple, readable.',
    layout: [
      { type: 'headline', label: 'Bold headline' },
      { type: 'subtext', label: 'Short subtext' },
      { type: 'phone', label: 'PHONE MOCKUP (chat screen)' },
      { type: 'chat', label: 'User: "Give me a verse about peace"\nAI: "Peace I leave with you..." — John 14:27' },
    ],
    accent: '#38bdf8',
    conversion: 'Show intelligence — real AI value',
  },
  {
    id: 7,
    tag: '💎 Premium (Optional)',
    icon: Gem,
    bg: 'from-[#78350f] to-[#1e1b4b]',
    headline: 'Unlock More with Premium ✨',
    subtext: 'Unlimited access\nAdvanced features\nSave & download sermons',
    mockup: 'Premium / Upgrade Screen',
    tip: 'Gold accents everywhere. Make it feel aspirational.',
    layout: [
      { type: 'headline', label: 'Bold headline with gold ✨' },
      { type: 'features', label: '• Unlimited AI chat\n• Save & download sermons\n• Advanced Bible insights' },
      { type: 'phone', label: 'PHONE MOCKUP (premium screen)' },
      { type: 'highlight', label: '💎 Gold accent borders and badges' },
    ],
    accent: '#F5C542',
    conversion: 'Upsell — aspirational',
  },
];

const specs = [
  { label: 'Canvas Size', value: '1290 × 2796 px', note: 'iPhone 14/15 Pro Max' },
  { label: 'Primary Color', value: '#5B3DF5', note: 'Deep Purple' },
  { label: 'Accent Color', value: '#F5C542', note: 'Gold' },
  { label: 'Background', value: 'Purple → Dark Purple', note: 'Soft gradient' },
  { label: 'Title Font', value: 'Bold, Large', note: '60–80pt equivalent' },
  { label: 'Subtitle Font', value: 'Medium / Regular', note: '30–40pt equivalent' },
  { label: 'Text Color', value: 'White / Gold', note: 'On dark backgrounds' },
  { label: 'Corner Radius', value: 'Rounded everywhere', note: 'Premium feel' },
];

export default function AppStoreScreenshotsGuide() {
  const [copied, setCopied] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id, label = 'Copy' }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-colors"
    >
      {copied === id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied === id ? 'Copied!' : label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-sm mb-4">
            <Smartphone className="w-4 h-4" /> Screenshot Design System
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            FaithLight App Store Screenshots
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pixel-perfect layout guide. Hand directly to a designer or use in Canva/Figma.
          </p>
        </div>

        {/* Design Specs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Design Specifications</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specs.map((s, i) => (
              <div key={i} className="bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl p-4">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">🎨 Background Style A (Recommended)</p>
              <p className="text-sm text-gray-300">Purple gradient <span className="text-indigo-300">#5B3DF5 → #1e1b4b</span> with soft glow behind phone</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🎨 Background Style B (Alternative)</p>
              <p className="text-sm text-gray-300">White background with purple UI elements — clean & minimal</p>
            </div>
          </div>
        </div>

        {/* Screenshots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {screenshots.map((s) => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-600/50 transition-colors">

              {/* Preview Card */}
              <div className={`bg-gradient-to-b ${s.bg} p-5 relative min-h-[220px] flex flex-col justify-between`}>
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded-full">#{s.id}</span>
                </div>

                {/* Mock layout preview */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-1.5 bg-white/30 rounded-full mb-1" />
                  <p className="text-white font-bold text-base leading-snug drop-shadow">{s.headline}</p>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: s.accent }}>
                    {s.subtext}
                  </p>
                </div>

                <div className="flex justify-center mt-3">
                  <div className="w-20 h-32 bg-black/30 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <Smartphone className="w-6 h-6 text-white/50 mx-auto mb-1" />
                      <p className="text-white/40 text-[9px] text-center px-1 leading-tight">{s.mockup}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">{s.tag}</span>
                  <p className="text-xs text-amber-400 mt-1">🎯 Conversion goal: {s.conversion}</p>
                </div>

                {/* Layout Blueprint */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Layout Blueprint
                  </p>
                  <div className="space-y-1">
                    {s.layout.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-gray-600 text-xs mt-0.5">{i + 1}.</span>
                        <p className="text-xs text-gray-300 whitespace-pre-line">{l.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design Tip */}
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{s.tip}</p>
                </div>

                {/* Copy Texts */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <CopyBtn text={s.headline} id={`h-${s.id}`} label="Copy Headline" />
                  <CopyBtn text={s.subtext} id={`s-${s.id}`} label="Copy Subtext" />
                  <CopyBtn text={`${s.headline}\n${s.subtext}`} id={`b-${s.id}`} label="Copy Both" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Build Guide */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">How to Build (Easiest Way)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="font-bold text-white mb-2">Option 1: Canva</p>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Search "App Store screenshot" template</li>
                <li>Select iPhone 14/15 mockup frame</li>
                <li>Set canvas to 1290 × 2796 px</li>
                <li>Apply purple → dark purple gradient</li>
                <li>Paste headlines + subtexts from above</li>
                <li>Drop in your app screenshots</li>
              </ol>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="font-bold text-white mb-2">Option 2: Figma</p>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Create frame: 1290 × 2796 px</li>
                <li>Enable Auto Layout</li>
                <li>Add gradient fill: #5B3DF5 → #1e1b4b</li>
                <li>Import phone mockup component</li>
                <li>Use Inter or SF Pro Bold for titles</li>
                <li>Apply soft drop shadow to phone</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Pro Conversion Order */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/30 border border-indigo-700/40 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">🚀 Conversion Order Strategy</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { n: 1, label: 'Emotional', desc: 'Faith growth hook' },
              { n: 2, label: 'Useful', desc: 'Bible reading' },
              { n: 3, label: 'Emotional', desc: 'Prayer moment' },
              { n: 4, label: 'Power', desc: 'Sermon builder' },
              { n: 5, label: '🔥 DIFF', desc: 'Languages — key!' },
            ].map((item) => (
              <div key={item.n} className="bg-black/30 rounded-xl p-3 text-center">
                <span className="text-2xl font-black text-indigo-400">#{item.n}</span>
                <p className="text-xs font-bold text-white mt-1">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4">
            💡 <strong className="text-white">Screenshot #5 (Languages)</strong> is your biggest differentiator — very low competition for Afaan Oromoo + Amharic keyword searches.
          </p>
        </div>

      </div>
    </div>
  );
}