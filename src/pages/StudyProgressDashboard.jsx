import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Flame, CheckCircle2, Circle, ArrowRight, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.2 } }) };

export default function StudyProgressDashboard() {
  const [user, setUser] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { setLoading(false); return; }
        const u = await base44.auth.me();
        setUser(u);
        const data = await base44.entities.StudyJourneys.filter({ userId: u.id });
        setJourneys(data || []);
      } catch { /* guest */ }
      setLoading(false);
    };
    init();
  }, []);

  const active = journeys.filter(j => j.isActive);
  const completed = journeys.filter(j => !j.isActive || j.completedDays >= j.duration);
  const streak = user?.currentStreak || 0;
  const totalDays = journeys.reduce((s, j) => s + (j.completedDays || 0), 0);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #6C5CE7', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 20px 100px' }}>

        {/* Header */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}>
            ← Back
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>📊 Study Progress</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Track your multi-day study journeys</p>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}
        >
          {[
            { icon: <Flame size={20} color="#FF7A00" />, value: streak, label: 'Day Streak', bg: '#FFF4E5', color: '#FF7A00' },
            { icon: <BookOpen size={20} color="#6C5CE7" />, value: totalDays, label: 'Days Done', bg: '#EEF2FF', color: '#6C5CE7' },
            { icon: <Trophy size={20} color="#10B981" />, value: completed.length, label: 'Completed', bg: '#F0FDF4', color: '#10B981' },
          ].map(({ icon, value, label, bg, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '16px 12px', textAlign: 'center', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{icon}</div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{value}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Active journeys */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>🔥 Active Journeys</h2>
          {active.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid #F3F4F6' }}>
              <p style={{ color: '#9CA3AF', fontSize: 14, margin: '0 0 14px' }}>No active study journeys yet</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(createPageUrl('GuidedStudy'))}
                style={{ background: '#6C5CE7', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Start a Journey
              </motion.button>
            </div>
          ) : active.map((journey, i) => (
            <JourneyCard key={journey.id} journey={journey} index={i} navigate={navigate} />
          ))}
        </motion.div>

        {/* Completed */}
        {completed.length > 0 && (
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>✅ Completed Journeys</h2>
            {completed.map((journey, i) => (
              <JourneyCard key={journey.id} journey={journey} index={i} navigate={navigate} done />
            ))}
          </motion.div>
        )}

        {/* Start new */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" style={{ marginTop: 28 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(createPageUrl('GuidedStudy'))}
            style={{
              width: '100%', height: 52, borderRadius: 14, border: 'none',
              background: 'linear-gradient(90deg, #6C5CE7, #8E7CFF)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <BookOpen size={18} /> Start New Journey <ArrowRight size={16} />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

function JourneyCard({ journey, navigate, done = false }) {
  const pct = Math.min(100, Math.round((journey.completedDays / journey.duration) * 100));
  const nextDay = (journey.completedDays || 0) + 1;
  const startDate = journey.startDate ? new Date(journey.startDate).toLocaleDateString() : '';

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      style={{
        background: 'white', borderRadius: 16, padding: '16px 18px',
        marginBottom: 12, border: done ? '1px solid #D1FAE5' : '1px solid #EEF2FF',
        boxShadow: '0px 2px 10px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>{journey.spiritualGoal}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />{startDate}
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{journey.duration}-day plan</span>
          </div>
        </div>
        {done
          ? <div style={{ background: '#D1FAE5', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#059669' }}>DONE</div>
          : <div style={{ background: '#EEF2FF', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#6C5CE7' }}>
              Day {journey.completedDays}/{journey.duration}
            </div>
        }
      </div>

      {/* Progress bar */}
      <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, marginBottom: 10 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: done ? '#10B981' : 'linear-gradient(90deg, #6C5CE7, #8E7CFF)', transition: 'width 0.4s ease' }} />
      </div>

      {/* Day dots */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {Array.from({ length: journey.duration }).map((_, i) => (
          <div key={i} style={{
            width: 20, height: 20, borderRadius: '50%',
            background: i < journey.completedDays ? '#6C5CE7' : '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {i < journey.completedDays
              ? <CheckCircle2 size={12} color="white" />
              : <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600 }}>{i + 1}</span>
            }
          </div>
        ))}
      </div>

      {!done && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(createPageUrl(`GuidedStudy?journey=${journey.id}&day=${nextDay}`))}
          style={{
            width: '100%', height: 40, borderRadius: 10, border: 'none',
            background: '#6C5CE7', color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
        >
          Continue — Day {nextDay} <ArrowRight size={13} />
        </motion.button>
      )}
    </motion.div>
  );
}