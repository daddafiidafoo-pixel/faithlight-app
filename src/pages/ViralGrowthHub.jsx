import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Copy, Check, Share2, Loader2, Video, Heart, BookOpen, Mic, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import NativeHooksSection from '@/components/growth/NativeHooksSection';

const VIDEO_TEMPLATES = [
  {
    id: 'shock',
    icon: '😳',
    label: 'Shock / Wow',
    hook: 'AI just generated a prayer in {lang}',
    color: 'from-violet-500 to-indigo-600',
    description: 'Show the app generating a prayer in a native language',
  },
  {
    id: 'value',
    icon: '🙏',
    label: 'Value / Verse',
    hook: 'Feeling anxious? Read this Bible verse',
    color: 'from-emerald-500 to-teal-600',
    description: 'Calm verse + peaceful UI — highly shareable',
  },
  {
    id: 'sermon',
    icon: '🤯',
    label: 'Sermon Power',
    hook: 'Prepare a sermon in 30 seconds',
    color: 'from-orange-500 to-red-500',
    description: 'Demo the sermon builder — targets pastors',
  },
  {
    id: 'language',
    icon: '🌍',
    label: 'Language Pride',
    hook: 'Finally… a Bible app in Afaan Oromoo',
    color: 'from-yellow-500 to-amber-500',
    description: 'Most viral in diaspora communities',
  },
];

const LANGUAGES = [
  { code: 'om', label: 'Afaan Oromoo' },
  { code: 'am', label: 'Amharic' },
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ar', label: 'Arabic' },
];

const SHARE_CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: 'bg-green-500' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', color: 'bg-black' },
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: 'bg-pink-500' },
  { id: 'copy', label: 'Copy', emoji: '📋', color: 'bg-gray-600' },
];

export default function ViralGrowthHub() {
  const [selectedTemplate, setSelectedTemplate] = useState(VIDEO_TEMPLATES[0]);
  const [selectedLang, setSelectedLang] = useState('om');
  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [generatedVerse, setGeneratedVerse] = useState('');
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingPrayer, setLoadingPrayer] = useState(false);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [copied, setCopied] = useState(null);
  const [expandedTip, setExpandedTip] = useState(null);

  const langLabel = LANGUAGES.find(l => l.code === selectedLang)?.label || 'Afaan Oromoo';

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = (channel, text) => {
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (channel === 'copy') {
      handleCopy(text, 'share');
    } else {
      handleCopy(text, 'share');
      toast.success(`Copied! Paste into ${channel === 'tiktok' ? 'TikTok' : 'Instagram'}`);
    }
  };

  const generateScript = async () => {
    setLoadingScript(true);
    setGeneratedScript('');
    const hook = selectedTemplate.hook.replace('{lang}', langLabel);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a short viral social media video script (TikTok/Reels) for FaithLight app.

Template type: ${selectedTemplate.label}
Hook: "${hook}"
Language featured in the app: ${langLabel}

Format:
🎬 HOOK (0–2 sec): [opening line]
👁 SHOW (2–10 sec): [what to show on screen]
💬 SAY: [voiceover or caption text]
📲 CTA: [call to action]

Keep it under 100 words total. Make it punchy, emotional, faith-centered.`,
      });
      setGeneratedScript(result.trim());
    } catch (err) {
      toast.error('Could not generate script. Try again.');
    } finally {
      setLoadingScript(false);
    }
  };

  const generatePrayer = async () => {
    setLoadingPrayer(true);
    setGeneratedPrayer('');
    try {
      const langInstructions = {
        om: 'Write ONLY in Afaan Oromoo',
        am: 'Write ONLY in Amharic (Ethiopic script)',
        en: 'Write in English',
        sw: 'Write ONLY in Kiswahili',
        ar: 'Write ONLY in Arabic',
      };
      const instruction = langInstructions[selectedLang] || langInstructions.en;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${instruction}.

Write a short, heartfelt Christian prayer (5–7 sentences) that someone can share on social media. 
Make it emotional, relatable, and faith-filled. Theme: peace and hope.
End with "Amen." 
No introduction, just the prayer itself.`,
      });
      setGeneratedPrayer(result.trim());
    } catch (err) {
      toast.error('Could not generate prayer. Try again.');
    } finally {
      setLoadingPrayer(false);
    }
  };

  const generateVerse = async () => {
    setLoadingVerse(true);
    setGeneratedVerse('');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Give me one powerful, emotionally resonant Bible verse that would go viral on social media.
Choose from Psalms, Isaiah, John, Romans, or Philippians.
Format:
"[verse text]"
— [Book Chapter:Verse]

✨ Why this verse goes viral: [one sentence explanation]

Keep the verse in English. Make it deeply comforting.`,
      });
      setGeneratedVerse(result.trim());
    } catch (err) {
      toast.error('Could not generate verse. Try again.');
    } finally {
      setLoadingVerse(false);
    }
  };

  const TIPS = [
    { title: '📱 Post 2x/day for 7 days', body: 'Consistency beats perfection. Post at 7am and 7pm. Test different hooks each day.' },
    { title: '🎯 Target communities', body: 'Oromo Facebook groups, Ethiopian diaspora WhatsApp groups, African church communities. Share directly — ask permission first.' },
    { title: '⚡ Your #1 hook', body: '"This app lets you pray and read the Bible in your own language." — Use this everywhere, every format.' },
    { title: '🔁 The growth loop', body: 'TikTok view → App download → Prayer generated → User shares with friend → Friend installs. Your job is to start the loop.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-violet-800 px-5 pt-10 pb-8 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Video className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Viral Growth Hub</h1>
        <p className="text-indigo-200 text-sm mt-1 max-w-xs mx-auto">
          Generate shareable content that spreads FaithLight
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">

        {/* Language selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Featured Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  selectedLang === l.code
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 1: Video Script Generator ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-4 h-4 text-indigo-600" />
            <p className="font-bold text-gray-900 text-sm">Video Script Generator</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {VIDEO_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`rounded-xl p-3 text-left border-2 transition-all ${
                  selectedTemplate.id === t.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 bg-gray-50 hover:border-indigo-200'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <p className="text-xs font-bold text-gray-800 mt-1">{t.label}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-indigo-700 mb-0.5">Hook preview:</p>
            <p className="text-sm text-indigo-800 italic">"{selectedTemplate.hook.replace('{lang}', langLabel)}"</p>
          </div>

          <button
            onClick={generateScript}
            disabled={loadingScript}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingScript ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Script</>}
          </button>

          {generatedScript && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{generatedScript}</pre>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleCopy(generatedScript, 'script')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {copied === 'script' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  Copy Script
                </button>
                <button onClick={generateScript} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Shareable Prayer ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <p className="font-bold text-gray-900 text-sm">Shareable Prayer in {langLabel}</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">Generate a prayer in {langLabel} — share on WhatsApp, TikTok, or Instagram</p>

          <button
            onClick={generatePrayer}
            disabled={loadingPrayer}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingPrayer ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Mic className="w-4 h-4" /> Generate Prayer</>}
          </button>

          {generatedPrayer && (
            <div className="mt-3">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{generatedPrayer}</p>
                <p className="text-xs text-rose-500 mt-2 font-semibold">— FaithLight App</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {SHARE_CHANNELS.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => handleShare(ch.id, `${generatedPrayer}\n\n— Shared from FaithLight App 🙏`)}
                    className={`flex items-center gap-1.5 px-3 py-2 ${ch.color} text-white rounded-lg text-xs font-semibold transition-opacity hover:opacity-90`}
                  >
                    <span>{ch.emoji}</span> {ch.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 3: Viral Verse ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <p className="font-bold text-gray-900 text-sm">Viral Bible Verse</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">AI picks a high-share verse with an explanation of why it resonates</p>

          <button
            onClick={generateVerse}
            disabled={loadingVerse}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingVerse ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding verse…</> : <><Sparkles className="w-4 h-4" /> Pick a Viral Verse</>}
          </button>

          {generatedVerse && (
            <div className="mt-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{generatedVerse}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleShare('whatsapp', `${generatedVerse}\n\nShared from FaithLight App 📖`)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:opacity-90"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => handleCopy(generatedVerse, 'verse')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {copied === 'verse' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 4: Oromo & Amharic Viral Hooks ── */}
        <NativeHooksSection onCopy={handleCopy} copied={copied} onShare={handleShare} />

        {/* ── Section 5: Growth Tips ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Growth Playbook</p>
          <div className="space-y-2">
            {TIPS.map((tip, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedTip(expandedTip === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800">{tip.title}</span>
                  {expandedTip === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedTip === i && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-center">
          <p className="text-white font-bold text-base mb-1">Your viral hook 🔥</p>
          <p className="text-indigo-200 text-sm italic mb-3">
            "This app lets you pray and read the Bible in your own language."
          </p>
          <button
            onClick={() => handleShare('whatsapp', 'This app lets you pray and read the Bible in your own language. Try FaithLight → faithlight.app')}
            className="px-5 py-2.5 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors"
          >
            💬 Share This Now
          </button>
        </div>

      </div>
    </div>
  );
}