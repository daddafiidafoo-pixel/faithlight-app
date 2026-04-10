import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import CardCanvas from './CardCanvas';
import { Loader2, Sparkles } from 'lucide-react';

const THEMES = [
  { id: 'purple', label: 'Royal',  bg: 'linear-gradient(160deg,#6C5CE7 0%,#a29bfe 100%)', text: '#fff', sub: 'rgba(255,255,255,0.7)' },
  { id: 'rose',   label: 'Rose',   bg: 'linear-gradient(160deg,#e84393 0%,#fd79a8 100%)', text: '#fff', sub: 'rgba(255,255,255,0.7)' },
  { id: 'night',  label: 'Night',  bg: 'linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)', text: '#f1f5f9', sub: '#94a3b8' },
  { id: 'earth',  label: 'Earth',  bg: 'linear-gradient(160deg,#6d4c41 0%,#a1887f 100%)', text: '#fff', sub: 'rgba(255,255,255,0.7)' },
];

const TOPICS = ['My Family', 'Healing', 'Peace', 'Strength', 'Guidance', 'Gratitude'];

export default function PrayerCardGenerator() {
  const [topic, setTopic] = useState('My Family');
  const [prayerText, setPrayerText] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);

  const generatePrayer = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a short, heartfelt Christian prayer (4–6 sentences) for the topic: "${topic}". Start with "Heavenly Father," and end with "Amen." No titles, no headers, just the prayer text.`,
      });
      setPrayerText(res.trim());
    } catch { setPrayerText('Heavenly Father, we lift this topic to You today. Guide us, strengthen us, and fill us with Your peace. Thank You for Your faithfulness. Amen.'); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E0E4E9] p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-[#6B7280] mb-1 block">Topic / Intention</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${topic === t ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]' : 'border-[#E0E4E9] text-[#6B7280]'}`}>
                {t}
              </button>
            ))}
          </div>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Or type your own…"
            className="w-full px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]" />
        </div>
        <button onClick={generatePrayer} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#6C5CE7] text-white text-sm font-semibold hover:bg-[#5B4BD6] disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Prayer
        </button>
        {prayerText && (
          <textarea value={prayerText} onChange={e => setPrayerText(e.target.value)} rows={5}
            className="w-full px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none" />
        )}
        <div className="flex gap-2 flex-wrap">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${theme.id === t.id ? 'border-[#6C5CE7]' : 'border-transparent'}`}
              style={{ background: t.bg, color: t.text }}>{t.label}</button>
          ))}
        </div>
      </div>

      {prayerText && (
        <CardCanvas filename={`prayer-${topic.replace(/\s/g,'-')}`}>
          <div style={{ background: theme.bg, borderRadius: 24, padding: 32, minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: theme.sub, marginBottom: 6 }}>A Prayer For</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, marginBottom: 20 }}>{topic}</div>
            </div>
            <p style={{ flex: 1, fontSize: 14, lineHeight: 1.8, color: theme.text, margin: 0, fontStyle: 'italic' }}>{prayerText}</p>
            <div style={{ marginTop: 20, fontSize: 10, color: theme.sub, letterSpacing: 1, textAlign: 'right' }}>✦ FaithLight</div>
          </div>
        </CardCanvas>
      )}

      {!prayerText && (
        <div className="bg-white rounded-2xl border border-dashed border-[#E0E4E9] p-10 text-center text-[#9CA3AF] text-sm">
          Generate a prayer to see your card preview
        </div>
      )}
    </div>
  );
}