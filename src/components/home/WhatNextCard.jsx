/**
 * WhatNextCard
 * Smart "what to do next" home card — surfaces the single most relevant
 * next action: resume study, start routine, open mentor, or find verses.
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowRight, BookOpen, Sparkles, Heart, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const todayKey = () => `fl_routine_${new Date().toISOString().split('T')[0]}`;

export default function WhatNextCard({ user, isAuthenticated }) {
  const [card, setCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const build = async () => {
      // Priority 1: incomplete daily routine
      try {
        const done = JSON.parse(localStorage.getItem(todayKey()) || '[]');
        if (done.length < 4) {
          setCard({
            emoji: '🌅',
            label: 'Daily Faith Routine',
            desc: `${done.length}/4 steps complete — ${4 - done.length} left`,
            action: null, // handled by parent scroll/expand
            color: '#6C5CE7',
            actionLabel: 'Continue Routine',
            page: 'Home',
          });
          return;
        }
      } catch { /* skip */ }

      // Priority 2: active study journey
      if (isAuthenticated && user?.id) {
        try {
          const journeys = await base44.entities.StudyJourneys.filter({ userId: user.id, isActive: true });
          if (journeys?.length > 0) {
            const j = journeys.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
            const nextDay = (j.completedDays || 0) + 1;
            setCard({
              emoji: '📖',
              label: 'Continue Your Study',
              desc: `${j.spiritualGoal} — Day ${nextDay} of ${j.duration}`,
              color: '#059669',
              actionLabel: 'Continue →',
              url: createPageUrl(`GuidedStudy?journey=${j.id}&day=${nextDay}`),
            });
            return;
          }
        } catch { /* skip */ }
      }

      // Priority 3: suggest mentor
      setCard({
        emoji: '🕊️',
        label: 'Talk to Your Mentor',
        desc: 'Ask for spiritual guidance or a verse for today',
        color: '#D97706',
        actionLabel: 'Open Mentor',
        url: createPageUrl('AISpiritualMentor'),
      });
    };

    build();
  }, [user, isAuthenticated]);

  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: 16,
        border: `1.5px solid ${card.color}20`,
        padding: '14px 16px', marginBottom: 16,
        boxShadow: '0px 3px 12px rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
      }}
      onClick={() => card.url && navigate(card.url)}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {card.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>What's Next</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{card.label}</p>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{card.desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: card.color, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        <ArrowRight size={15} />
      </div>
    </motion.div>
  );
}