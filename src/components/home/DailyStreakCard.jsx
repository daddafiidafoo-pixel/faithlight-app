import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

// streakState: 'none' | 'active' | 'done' | 'restarted'
function getHeaderState(streak, completedToday, streakState) {
  if (completedToday) {
    return {
      icon: '✅',
      title: "You completed today's faith journey",
      subtitle: 'Come back tomorrow to keep growing 🌱',
      bg: 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)',
    };
  }
  if (streakState === 'restarted') {
    return {
      icon: '🌅',
      title: 'Start again today',
      subtitle: "Every day is a fresh beginning with God",
      bg: 'linear-gradient(135deg, #EC4899 0%, #f472b6 100%)',
    };
  }
  if (streak > 0) {
    return {
      icon: '🔥',
      title: `${streak}-day streak — keep growing!`,
      subtitle: "Complete today's steps to extend your streak",
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    };
  }
  return {
    icon: '🌱',
    title: 'Start your faith streak',
    subtitle: "A few minutes with God makes all the difference",
    bg: 'linear-gradient(135deg, #6C5CE7 0%, #8B7EEF 100%)',
  };
}

const STEPS = [
  { key: 'verse',   emoji: '📖', label: 'Read today\'s verse',   page: 'BibleReaderPage' },
  { key: 'study',   emoji: '🎯', label: 'Guided study',          page: 'GuidedStudy' },
  { key: 'prayer',  emoji: '🙏', label: 'Prayer time',           page: 'CommunityPrayerWall' },
];

export default function DailyStreakCard({ streak = 0, completedToday = false, todaySteps = [], streakState, onVerseClick }) {
  const header = getHeaderState(streak, completedToday, streakState);
  // todaySteps is an array e.g. ['verse', 'prayer']
  const stepsArr = Array.isArray(todaySteps) ? todaySteps : Object.keys(todaySteps).filter(k => todaySteps[k]);
  const doneCount = stepsArr.length;
  const progress = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div style={{
      borderRadius: 20,
      background: header.bg,
      padding: '18px 20px',
      marginBottom: 16,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{header.icon}</span>
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>{header.title}</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: 0 }}>{header.subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 6, marginBottom: 14 }}>
        <div style={{
          background: 'white',
          borderRadius: 999,
          height: 6,
          width: `${progress}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STEPS.map(({ key, emoji, label, page }) => {
          const done = stepsArr.includes(key);
          return (
            <Link
              key={key}
              to={key === 'verse' ? '#' : createPageUrl(page)}
              onClick={key === 'verse' ? onVerseClick : undefined}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: done ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '10px 14px',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <span style={{
                  flex: 1,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: done ? 'line-through' : 'none',
                  opacity: done ? 0.7 : 1,
                }}>{label}</span>
                {done
                  ? <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>✓</span>
                  : <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
                }
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}