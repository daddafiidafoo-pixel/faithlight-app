/**
 * Personal AI Spiritual Companion Card
 * Shows a warm, contextual greeting + personalized verse/suggestion every morning.
 * Reads from companionContext (prayer topics, study, mood, goal).
 * Cached 6 hours so it doesn't re-call on every render.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, RefreshCw, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { buildUserContext } from '../lib/companionContext';

const CACHE_KEY = 'fl_companion_card';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function buildPrompt(ctx, userName, language, dailyVerse) {
  const name = userName ? `, ${userName}` : '';
  const parts = [`You are a warm, humble Christian spiritual companion in the FaithLight app. Generate a short, personal morning card for a user${name}.`];

  if (ctx.spiritualGoal) parts.push(`Their spiritual focus: "${ctx.spiritualGoal}".`);
  if (ctx.lastPrayerTopic) parts.push(`They recently prayed about: "${ctx.lastPrayerTopic}".`);
  if (ctx.activeStudyName) parts.push(`They are studying: "${ctx.activeStudyName}".`);
  if (ctx.recentMood) parts.push(`Their recent mood: "${ctx.recentMood}".`);
  if (dailyVerse) parts.push(`Today's verse is ${dailyVerse.reference}: "${dailyVerse.verseText}".`);

  parts.push(`
Respond ONLY with a JSON object (no markdown, no extra text):
{
  "greeting": "A warm 1-sentence personal greeting (acknowledge their context if any)",
  "encouragement": "1-2 sentences of gentle, personal encouragement tied to their situation or today's verse. Be humble — say 'one way to see this...' not 'this means...'",
  "verse_ref": "A Bible verse reference for them (can be today's verse if it fits)",
  "verse_text": "The verse text (short)",
  "reflection_question": "One short, personal reflection question",
  "cta_label": "A short action label (e.g. 'Pray with me', 'Continue Study', 'Read this passage')",
  "cta_page": "One of: AISpiritualMentor | CommunityPrayerWall | GuidedStudy | BibleReaderPage"
}
Language: ${language}. Keep everything concise and warm.`);

  return parts.join('\n');
}

export default function PersonalCompanionCard({ user, dailyVerse, language = 'en' }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const load = async (force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setCard(cached.data);
          return;
        }
      } catch {}
    }

    setLoading(true);
    try {
      const ctx = buildUserContext();
      const firstName = user?.full_name?.split(' ')[0] || '';
      const prompt = buildPrompt(ctx, firstName, language, dailyVerse);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            greeting: { type: 'string' },
            encouragement: { type: 'string' },
            verse_ref: { type: 'string' },
            verse_text: { type: 'string' },
            reflection_question: { type: 'string' },
            cta_label: { type: 'string' },
            cta_page: { type: 'string' },
          },
        },
      });

      if (res?.greeting) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: res }));
        setCard(res);
      }
    } catch (err) {
      console.debug('[PersonalCompanionCard]', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only generate if we have something to personalize with
    const ctx = buildUserContext();
    const hasContext = ctx.spiritualGoal || ctx.lastPrayerTopic || ctx.activeStudyName || dailyVerse;
    if (hasContext) load();
  }, [user?.id, dailyVerse?.reference]);

  if (!loading && !card) return null;

  if (loading) {
    return (
      <div style={{
        background: 'white', borderRadius: 20, border: '1px solid #EDE9FE',
        padding: '18px 20px', marginBottom: 20,
        boxShadow: '0 4px 16px rgba(108,92,231,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#6C5CE7" />
          </div>
          <div>
            <div style={{ height: 12, width: 160, background: '#F3F4F6', borderRadius: 6, marginBottom: 6 }} />
            <div style={{ height: 10, width: 100, background: '#F9FAFB', borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ height: 12, background: '#F3F4F6', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 12, background: '#F9FAFB', borderRadius: 6, width: '75%' }} />
      </div>
    );
  }

  const ctaPage = card.cta_page || 'AISpiritualMentor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #FEFEFF 0%, #F5F3FF 100%)',
        borderRadius: 20,
        border: '1.5px solid #EDE9FE',
        padding: '18px 20px',
        marginBottom: 20,
        boxShadow: '0 4px 20px rgba(108,92,231,0.10)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft decorative circle */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(108,92,231,0.06)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            🕊️
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6C5CE7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Your Spiritual Companion</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{card.greeting}</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF' }}
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Encouragement */}
      <p style={{ fontSize: 14, color: '#374151', lineHeight: '22px', margin: '0 0 14px' }}>
        {card.encouragement}
      </p>

      {/* Verse box */}
      {card.verse_ref && (
        <div style={{
          background: 'rgba(108,92,231,0.07)',
          borderRadius: 14, padding: '12px 14px', marginBottom: 14,
          borderLeft: '3px solid #6C5CE7',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6C5CE7', margin: '0 0 4px' }}>{card.verse_ref}</p>
          <p style={{ fontSize: 14, fontStyle: 'italic', color: '#374151', lineHeight: '21px', margin: 0 }}>
            "{card.verse_text}"
          </p>
        </div>
      )}

      {/* Reflection — collapsible */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'inherit',
        }}
      >
        💭 Reflect: <span style={{ color: '#374151' }}>{card.reflection_question}</span>
      </button>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Link
          to={createPageUrl(ctaPage)}
          style={{
            flex: 1, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)',
            color: 'white', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, gap: 6,
          }}
        >
          {card.cta_label || 'Talk with Mentor'} <ChevronRight size={14} />
        </Link>
        <Link
          to={createPageUrl('AISpiritualMentor')}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: '#F3F0FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Open AI Mentor"
        >
          <MessageCircle size={16} color="#6C5CE7" />
        </Link>
      </div>

      <p style={{ fontSize: 10, color: '#C4B5FD', textAlign: 'center', margin: '10px 0 0' }}>
        AI-generated to support your faith journey · Not doctrinal authority
      </p>
    </motion.div>
  );
}