import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Share2, RefreshCw, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const THEMES = [
  {
    id: 'sunrise',
    label: 'Sunrise',
    bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    text: '#7c3f00',
    accent: '#fff3e0',
    emoji: '🌅',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: '#ffffff',
    accent: 'rgba(255,255,255,0.15)',
    emoji: '🌊',
  },
  {
    id: 'forest',
    label: 'Forest',
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    text: '#ffffff',
    accent: 'rgba(255,255,255,0.15)',
    emoji: '🌿',
  },
  {
    id: 'gold',
    label: 'Golden',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    text: '#f4b400',
    accent: 'rgba(244,180,0,0.1)',
    emoji: '✨',
  },
  {
    id: 'rose',
    label: 'Rose',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    text: '#ffffff',
    accent: 'rgba(255,255,255,0.2)',
    emoji: '🌸',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    bg: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)',
    text: '#e0e0ff',
    accent: 'rgba(108,92,231,0.3)',
    emoji: '🌙',
  },
];

const POPULAR_VERSES = [
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
  { ref: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' },
  { ref: 'Jeremiah 29:11', text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
];

export default function VerseCardStudio() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[1]);
  const [verseText, setVerseText] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cardRef = useRef(null);

  const handleAIFind = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the best Bible verse for this topic or feeling: "${aiQuery}". Return ONLY a JSON object with keys "reference" (e.g. "John 3:16") and "text" (full verse text, KJV or NIV). No explanation.`,
        response_json_schema: {
          type: 'object',
          properties: {
            reference: { type: 'string' },
            text: { type: 'string' },
          },
        },
      });
      if (res?.reference && res?.text) {
        setVerseRef(res.reference);
        setVerseText(res.text);
        toast.success('Verse found!');
      }
    } catch {
      toast.error('Could not find a verse. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = async () => {
    if (!verseText) { toast.error('Add a verse first'); return; }
    if (navigator.share) {
      await navigator.share({
        title: verseRef,
        text: `"${verseText}" — ${verseRef}`,
      });
    } else {
      await navigator.clipboard.writeText(`"${verseText}" — ${verseRef}`);
      toast.success('Copied to clipboard!');
    }
  };

  const theme = selectedTheme;

  return (
    <div className="space-y-6">
      {/* AI Verse Finder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-purple-500" /> AI Verse Finder
        </h2>
        <div className="flex gap-2">
          <input
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAIFind()}
            placeholder="e.g. hope, courage, forgiveness, anxiety..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <Button onClick={handleAIFind} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700">
            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Find'}
          </Button>
        </div>
        {/* Popular suggestions */}
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="mt-3 text-xs text-purple-500 hover:underline flex items-center gap-1"
        >
          Popular verses <ChevronDown size={12} className={showSuggestions ? 'rotate-180' : ''} />
        </button>
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {POPULAR_VERSES.map(v => (
                  <button
                    key={v.ref}
                    onClick={() => { setVerseRef(v.ref); setVerseText(v.text); setShowSuggestions(false); }}
                    className="text-left px-3 py-2 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-purple-600">{v.ref}</span>
                    <p className="text-xs text-gray-500 truncate">{v.text.substring(0, 70)}...</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Entry */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-500" /> Verse Text
        </h2>
        <input
          value={verseRef}
          onChange={e => setVerseRef(e.target.value)}
          placeholder="Reference (e.g. John 3:16)"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <textarea
          value={verseText}
          onChange={e => setVerseText(e.target.value)}
          placeholder="Enter verse text here..."
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      {/* Theme Picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Background Theme</h2>
        <div className="grid grid-cols-6 gap-2">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t)}
              title={t.label}
              className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${selectedTheme.id === t.id ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent'}`}
              style={{ background: t.bg }}
            >
              <span className="text-lg">{t.emoji}</span>
              {selectedTheme.id === t.id && (
                <div className="absolute inset-0 ring-2 ring-white ring-inset rounded-xl pointer-events-none" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Selected: {theme.label}</p>
      </div>

      {/* Card Preview */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Preview</h2>
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden shadow-xl mx-auto"
          style={{
            background: theme.bg,
            aspectRatio: '1 / 1',
            maxWidth: 360,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem',
            position: 'relative',
          }}
        >
          {/* Decorative top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 4,
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '16px 16px 0 0'
          }} />

          {/* Cross ornament */}
          <div style={{ marginBottom: '1.5rem', opacity: 0.5, fontSize: '1.5rem', color: theme.text }}>✝</div>

          {/* Quote marks */}
          <div style={{ color: theme.text, opacity: 0.35, fontSize: '4rem', lineHeight: 1, marginBottom: '-1rem', alignSelf: 'flex-start' }}>"</div>

          {/* Verse text */}
          <p style={{
            color: theme.text,
            fontFamily: 'Georgia, serif',
            fontSize: verseText.length > 100 ? '0.9rem' : '1.05rem',
            lineHeight: 1.7,
            textAlign: 'center',
            fontStyle: 'italic',
            zIndex: 1,
            padding: '0 0.5rem',
          }}>
            {verseText || 'Your verse will appear here...'}
          </p>

          {/* Reference */}
          {verseRef && (
            <div style={{
              marginTop: '1.2rem',
              padding: '0.35rem 1rem',
              background: theme.accent,
              borderRadius: 999,
              color: theme.text,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}>
              — {verseRef}
            </div>
          )}

          {/* FaithLight watermark */}
          <div style={{
            position: 'absolute', bottom: 12,
            color: theme.text, opacity: 0.3,
            fontSize: '0.6rem', letterSpacing: '0.12em', fontWeight: 600,
          }}>
            FAITHLIGHT
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleShare}
          disabled={!verseText}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          <Share2 size={15} /> Share Card
        </Button>
        <Button
          variant="outline"
          onClick={() => { setVerseText(''); setVerseRef(''); }}
          className="flex items-center gap-2"
        >
          <RefreshCw size={14} /> Reset
        </Button>
      </div>
    </div>
  );
}