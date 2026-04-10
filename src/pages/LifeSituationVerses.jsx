/**
 * Life Situation Verses — Smart Verse Discovery
 * Find Scripture by real-life situations, not just references.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, BookOpen, Share2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAIOrchestrator } from '../components/hooks/useAIOrchestrator';
import ReactMarkdown from 'react-markdown';

const TOPICS = [
  { emoji: '😰', label: 'Anxiety', color: '#6C5CE7', bg: '#EEF2FF' },
  { emoji: '😔', label: 'Depression', color: '#0284C7', bg: '#E0F2FE' },
  { emoji: '💔', label: 'Grief & Loss', color: '#DB2777', bg: '#FCE7F3' },
  { emoji: '💑', label: 'Marriage', color: '#D97706', bg: '#FEF3C7' },
  { emoji: '👨‍👩‍👧', label: 'Family', color: '#059669', bg: '#D1FAE5' },
  { emoji: '💸', label: 'Financial Stress', color: '#7C3AED', bg: '#EDE9FE' },
  { emoji: '🧭', label: 'Purpose', color: '#DC2626', bg: '#FEE2E2' },
  { emoji: '🤝', label: 'Forgiveness', color: '#0891B2', bg: '#CFFAFE' },
  { emoji: '😟', label: 'Loneliness', color: '#4F46E5', bg: '#E0E7FF' },
  { emoji: '💪', label: 'Strength', color: '#15803D', bg: '#DCFCE7' },
  { emoji: '🙏', label: 'Faith & Doubt', color: '#B45309', bg: '#FEF3C7' },
  { emoji: '❤️', label: 'God\'s Love', color: '#BE185D', bg: '#FCE7F3' },
  { emoji: '😴', label: 'Rest & Peace', color: '#0369A1', bg: '#E0F2FE' },
  { emoji: '🎯', label: 'Temptation', color: '#9333EA', bg: '#F3E8FF' },
  { emoji: '🌱', label: 'Spiritual Growth', color: '#16A34A', bg: '#DCFCE7' },
  { emoji: '😤', label: 'Anger', color: '#EA580C', bg: '#FFEDD5' },
];

export default function LifeSituationVerses() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const { generate, loading } = useAIOrchestrator();
  const navigate = useNavigate();

  const language = localStorage.getItem('fl_bible_lang') || 'en';

  const handleSelect = async (topic) => {
    setSelected(topic);
    setResult(null);
    const res = await generate('topic_verses', { topic: topic.label, language }, {});
    setResult(res);
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    const fakeTopic = { emoji: '🔍', label: search.trim(), color: '#6C5CE7', bg: '#EEF2FF' };
    setSelected(fakeTopic);
    setResult(null);
    const res = await generate('topic_verses', { topic: search.trim(), language }, {});
    setResult(res);
  };

  const handleCopy = () => {
    if (result) { navigator.clipboard?.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const filtered = search.trim()
    ? TOPICS.filter(t => t.label.toLowerCase().includes(search.toLowerCase()))
    : TOPICS;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 20px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 12, padding: 0 }}>← Back</button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>📖 Find Scripture for Your Life</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Tap a situation to get relevant Bible verses</p>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search a topic or situation…"
              style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #E5E7EB', paddingLeft: 36, paddingRight: 12, fontSize: 14, background: 'white', outline: 'none', color: '#111827', boxSizing: 'border-box' }}
            />
          </div>
          {search.trim() && !TOPICS.find(t => t.label.toLowerCase() === search.toLowerCase()) && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSearch}
              style={{ height: 44, borderRadius: 12, border: 'none', background: '#6C5CE7', color: 'white', padding: '0 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowRight size={15} />
            </motion.button>
          )}
        </div>

        {/* Topic grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
          {filtered.map(topic => (
            <motion.button
              key={topic.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(topic)}
              style={{
                background: selected?.label === topic.label ? topic.bg : 'white',
                border: `1.5px solid ${selected?.label === topic.label ? topic.color : '#F3F4F6'}`,
                borderRadius: 14, padding: '14px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 22 }}>{topic.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: selected?.label === topic.label ? topic.color : '#374151' }}>{topic.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${selected.color}20`, padding: '18px 18px', boxShadow: '0px 4px 14px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{selected.emoji}</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Verses for {selected.label}</p>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#9CA3AF', fontSize: 14, padding: '10px 0' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selected.color}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    Finding relevant verses…
                  </div>
                ) : result ? (
                  <div>
                    <div style={{ fontSize: 14, color: '#374151', lineHeight: '24px' }}>
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopy}
                        style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        {copied ? <><Check size={13} color="#059669" /> Copied</> : <><Copy size={13} /> Copy All</>}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => navigator.share?.({ text: `Scripture for ${selected.label}:\n\n${result}` })}
                        style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: selected.color, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Share2 size={13} /> Share
                      </motion.button>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }
        .prose p { margin: 0 0 10px; } .prose p:last-child { margin-bottom: 0; }
        .prose ul { padding-left: 18px; margin: 4px 0; } .prose li { margin-bottom: 6px; }`}
      </style>
    </div>
  );
}