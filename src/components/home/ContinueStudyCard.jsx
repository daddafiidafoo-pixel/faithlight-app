/**
 * ContinueStudyCard
 * Homepage widget showing active study journey with resume button.
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, ArrowRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ContinueStudyCard({ user }) {
  const [journey, setJourney] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.StudyJourneys
      .filter({ userId: user.id, isActive: true })
      .then(results => {
        if (results?.length > 0) {
          // Most recently started
          const sorted = [...results].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          setJourney(sorted[0]);
        }
      })
      .catch(() => {});
  }, [user]);

  if (!journey) return null;

  const pct = Math.round((journey.completedDays / journey.duration) * 100);
  const nextDay = (journey.completedDays || 0) + 1;
  const daysLeft = journey.duration - journey.completedDays;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #EEF2FF',
        padding: '16px 18px',
        boxShadow: '0px 4px 12px rgba(108,92,231,0.08)',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6C5CE7', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
            📖 Continue Study
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{journey.spiritualGoal}</p>
        </div>
        {daysLeft > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFF4E5', borderRadius: 20, padding: '4px 10px' }}>
            <Flame size={13} color="#FF7A00" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FF7A00' }}>{daysLeft}d left</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, marginBottom: 10 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #6C5CE7, #8E7CFF)', transition: 'width 0.4s ease' }} />
      </div>
      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 12px' }}>
        Day {journey.completedDays} of {journey.duration} · {pct}% complete
      </p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(createPageUrl(`GuidedStudy?journey=${journey.id}&day=${nextDay}`))}
        style={{
          width: '100%', height: 44, borderRadius: 12, border: 'none',
          background: 'linear-gradient(90deg, #6C5CE7 0%, #8E7CFF 100%)',
          color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <BookOpen size={16} /> Continue — Day {nextDay} <ArrowRight size={15} />
      </motion.button>
    </motion.div>
  );
}