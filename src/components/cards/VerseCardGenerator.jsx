import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import CardCanvas from './CardCanvas';
import { Loader2, Sparkles } from 'lucide-react';

const THEMES = [
  { id: 'purple', label: 'Royal', bg: 'linear-gradient(135deg,#6C5CE7,#a29bfe)', text: '#fff', sub: 'rgba(255,255,255,0.75)' },
  { id: 'gold',   label: 'Gold',  bg: 'linear-gradient(135deg,#F4B400,#f8ca2b)', text: '#1F2937', sub: '#6B7280' },
  { id: 'olive',  label: 'Peace', bg: 'linear-gradient(135deg,#00b894,#55efc4)', text: '#fff', sub: 'rgba(255,255,255,0.75)' },
  { id: 'night',  label: 'Night', bg: 'linear-gradient(135deg,#0f172a,#1e293b)', text: '#f1f5f9', sub: '#94a3b8' },
  { id: 'dawn',   label: 'Dawn',  bg: 'linear-gradient(135deg,#ffecd2,#fcb69f)', text: '#1F2937', sub: '#6B7280' },
  { id: 'sky',    label: 'Sky',   bg: 'linear-gradient(135deg,#74b9ff,#0984e3)', text: '#fff', sub: 'rgba(255,255,255,0.75)' },
];

export default function VerseCardGenerator() {
  const [reference, setReference] = useState('Philippians 4:13');
  const [verseText, setVerseText] = useState('"I can do all things through Christ who strengthens me."');
  const [theme, setTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);

  const fetchVerse = async () => {
    if (!reference.trim()) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Return ONLY the exact Bible verse text for ${reference} (NIV or WEB translation). No commentary, no formatting, just the verse text in quotes.`,
      });
      setVerseText(`"${res.replace(/^["']|["']$/g, '')}"`);
    } catch { /* keep existing */ }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-[#E0E4E9] p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="e.g. John 3:16"
            className="flex-1 px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
          />
          <button
            onClick={fetchVerse}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6C5CE7] text-white text-sm font-semibold hover:bg-[#5B4BD6] disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Fetch
          </button>
        </div>
        <textarea
          value={verseText}
          onChange={e => setVerseText(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
        />
        {/* Theme picker */}
        <div className="flex gap-2 flex-wrap">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${theme.id === t.id ? 'border-[#6C5CE7]' : 'border-transparent'}`}
              style={{ background: t.bg, color: t.text }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Preview + Export */}
      <CardCanvas filename={`verse-${reference.replace(/\s/g,'-')}`}>
        <div style={{ background: theme.bg, borderRadius: 24, padding: 32, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: theme.sub }}>Daily Verse</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
            <p style={{ fontSize: 20, lineHeight: 1.6, color: theme.text, fontStyle: 'italic', margin: 0 }}>{verseText}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{reference}</span>
            <span style={{ fontSize: 10, color: theme.sub, letterSpacing: 1 }}>✦ FaithLight</span>
          </div>
        </div>
      </CardCanvas>
    </div>
  );
}