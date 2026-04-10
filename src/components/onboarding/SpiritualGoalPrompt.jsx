import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Sun, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';

const GOAL_FALLBACKS = {
  'goal.understandBible': 'Understand the Bible better',
  'goal.prayerHabit':     'Build a prayer habit',
  'goal.encouragement':   'Find encouragement',
  'goal.studyWithOthers': 'Study with others',
};

const GOAL_DEFS = [
  { id: 'understand', icon: BookOpen, labelKey: 'goal.understandBible', color: '#6C5CE7' },
  { id: 'prayer',     icon: Heart,    labelKey: 'goal.prayerHabit',     color: '#EF4444' },
  { id: 'encourage',  icon: Sun,      labelKey: 'goal.encouragement',   color: '#F59E0B' },
  { id: 'community',  icon: Users,    labelKey: 'goal.studyWithOthers', color: '#10B981' },
];

export default function SpiritualGoalPrompt({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const { t } = useI18n();

  const handleSelect = async (id) => {
    setSelected(id);
    localStorage.setItem('faithlight_spiritual_goal', id);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        await base44.auth.updateMe({ spiritual_goal: id, daily_verse_enabled: true });
      }
    } catch { /* silently ignore */ }
    setTimeout(() => onComplete(id), 380);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#F7F8FC',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px',
        }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
          style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #8E7CFF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, boxShadow: '0 8px 20px rgba(108,92,231,0.25)',
          }}
        >
          <span style={{ fontSize: 28 }}>✝️</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ color: '#111827', fontSize: 26, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}
        >
          {t('home.welcome', t('welcome.title', 'Welcome to FaithLight'))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ color: '#6B7280', fontSize: 16, textAlign: 'center', margin: '0 0 32px', lineHeight: '24px', maxWidth: 320 }}
        >
          {t('home.growthQuestion', t('welcome.growthQuestion', 'What are you hoping to grow in right now?'))}
        </motion.p>

        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GOAL_DEFS.map(({ id, icon: Icon, labelKey, color }, i) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 16, cursor: 'pointer',
                border: `1.5px solid ${selected === id ? color + '60' : '#E5E7EB'}`,
                background: selected === id ? color + '12' : 'white',
                transition: 'all 0.2s', textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ color: selected === id ? color : '#374151', fontSize: 15, fontWeight: 500, lineHeight: '20px' }}>
                {t(labelKey, GOAL_FALLBACKS[labelKey])}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ color: '#9CA3AF', fontSize: 12, marginTop: 28, textAlign: 'center' }}
        >
          {t('home.changeLater', t('welcome.changeInSettings', 'You can change this anytime in settings'))}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}