import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import CardCanvas from './CardCanvas';
import { Loader2, Sparkles } from 'lucide-react';

const THEMES = [
  { id: 'sunrise', label: 'Sunrise', bg: 'linear-gradient(160deg,#f6d365 0%,#fda085 100%)', text: '#1F2937', sub: '#6B7280', divider: 'rgba(0,0,0,0.12)' },
  { id: 'ocean',   label: 'Ocean',   bg: 'linear-gradient(160deg,#4facfe 0%,#00f2fe 100%)', text: '#fff',    sub: 'rgba(255,255,255,0.8)', divider: 'rgba(255,255,255,0.2)' },
  { id: 'forest',  label: 'Forest',  bg: 'linear-gradient(160deg,#43e97b 0%,#38f9d7 100%)', text: '#1F2937', sub: '#374151', divider: 'rgba(0,0,0,0.12)' },
  { id: 'dusk',    label: 'Dusk',    bg: 'linear-gradient(160deg,#a18cd1 0%,#fbc2eb 100%)', text: '#1F2937', sub: '#4B5563', divider: 'rgba(0,0,0,0.12)' },
];

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default function DevotionalCardGenerator() {
  const [topic, setTopic] = useState('');
  const [devotional, setDevotional] = useState(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a short daily devotional${topic ? ` about "${topic}"` : ''}. Return JSON with: reference (Bible verse ref), verse (verse text in quotes), reflection (2-3 sentences max), prayer (1 sentence closing prayer). Keep everything concise and inspiring.`,
        response_json_schema: {
          type: 'object',
          properties: {
            reference:  { type: 'string' },
            verse:      { type: 'string' },
            reflection: { type: 'string' },
            prayer:     { type: 'string' },
          }
        }
      });
      setDevotional(res);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E0E4E9] p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-[#6B7280] mb-1 block">Theme (optional)</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Hope, Courage, Trust in God…"
            className="w-full px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]" />
        </div>
        <button onClick={generate} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#6C5CE7] text-white text-sm font-semibold hover:bg-[#5B4BD6] disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Devotional
        </button>
        <div className="flex gap-2 flex-wrap">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${theme.id === t.id ? 'border-[#6C5CE7]' : 'border-transparent'}`}
              style={{ background: t.bg, color: t.text }}>{t.label}</button>
          ))}
        </div>
      </div>

      {devotional && (
        <CardCanvas filename={`devotional-${today.replace(/\s/g,'-')}`}>
          <div style={{ background: theme.bg, borderRadius: 24, padding: 28, fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: theme.sub }}>Daily Devotional</div>
              <div style={{ fontSize: 10, color: theme.sub }}>{today}</div>
            </div>

            {/* Verse */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 15, fontStyle: 'italic', color: theme.text, lineHeight: 1.6, margin: '0 0 6px 0' }}>{devotional.verse}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: theme.sub, margin: 0 }}>— {devotional.reference}</p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: theme.divider, margin: '14px 0' }} />

            {/* Reflection */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.sub, marginBottom: 6 }}>Reflection</div>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: theme.text, margin: 0 }}>{devotional.reflection}</p>
            </div>

            {/* Prayer */}
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.sub, marginBottom: 4 }}>Prayer</div>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: theme.text, margin: 0 }}>{devotional.prayer}</p>
            </div>

            <div style={{ textAlign: 'right', marginTop: 14, fontSize: 9, color: theme.sub, letterSpacing: 1 }}>✦ FaithLight</div>
          </div>
        </CardCanvas>
      )}

      {!devotional && (
        <div className="bg-white rounded-2xl border border-dashed border-[#E0E4E9] p-10 text-center text-[#9CA3AF] text-sm">
          Generate a devotional to see your card preview
        </div>
      )}
    </div>
  );
}