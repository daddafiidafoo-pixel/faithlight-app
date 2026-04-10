import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MILESTONES = {
  7:   { emoji: '🌱', badge: 'Faithful Beginner', color: '#10B981', bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', desc: '7 days of daily devotion', unlock: '24hrs AI Study Tools' },
  30:  { emoji: '🔥', badge: 'Devoted Seeker',   color: '#F59E0B', bg: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)', desc: '30 days of unwavering faith', unlock: '24hrs Full Audio Bible' },
  100: { emoji: '👑', badge: 'Pillar of Faith',  color: '#8B5CF6', bg: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', desc: '100 days — a true disciple', unlock: '24hrs All Premium Features' },
};

export default function MilestoneCelebrationModal({ streak, onClose }) {
  const [claimed, setClaimed] = useState(false);
  const milestone = MILESTONES[streak];
  if (!milestone) return null;

  const handleClaim = async () => {
    try {
      // Store 24-hour unlock in localStorage
      const unlock = {
        type: 'streak_milestone',
        streak,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem('faithlight_milestone_unlock', JSON.stringify(unlock));
      localStorage.setItem(`faithlight_milestone_claimed_${streak}`, 'true');

      // Award badge on user record
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        await base44.entities.UserBadge.create({
          user_id: user.id,
          badge_name: milestone.badge,
          streak_days: streak,
          earned_date: new Date().toISOString(),
        }).catch(() => {});
      }

      setClaimed(true);
      setTimeout(onClose, 2000);
    } catch {
      setClaimed(true);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 360,
            background: milestone.bg,
            borderRadius: 28, overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: 99, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <X size={16} />
          </button>

          {/* Stars burst */}
          <div style={{ padding: '40px 28px 0', textAlign: 'center', position: 'relative' }}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0], scale: [0, 1, 0],
                  x: Math.cos((i / 6) * Math.PI * 2) * 60,
                  y: Math.sin((i / 6) * Math.PI * 2) * 60,
                }}
                transition={{ delay: 0.3 + i * 0.08, duration: 1.2 }}
                style={{ position: 'absolute', top: 60, left: '50%', color: milestone.color, fontSize: 16 }}
              >
                ✦
              </motion.div>
            ))}

            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ fontSize: 72, lineHeight: 1, marginBottom: 16, display: 'inline-block' }}
            >
              {milestone.emoji}
            </motion.div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', borderRadius: 99,
              padding: '4px 12px', marginBottom: 12,
            }}>
              <Star size={12} color={milestone.color} fill={milestone.color} />
              <span style={{ color: milestone.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>
                {streak}-DAY STREAK
              </span>
            </div>

            <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>
              {milestone.badge}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
              {milestone.desc}
            </p>
          </div>

          {/* Reward box */}
          <div style={{ margin: '24px 28px', background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Zap size={16} color={milestone.color} fill={milestone.color} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Reward
              </span>
            </div>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 600, margin: 0 }}>
              🎁 {milestone.unlock}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '4px 0 0' }}>
              + Digital "{milestone.badge}" badge added to your profile
            </p>
          </div>

          {/* CTA */}
          <div style={{ padding: '0 28px 28px' }}>
            {claimed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  textAlign: 'center', padding: '14px',
                  background: 'rgba(255,255,255,0.15)', borderRadius: 14,
                  color: 'white', fontWeight: 600, fontSize: 15,
                }}
              >
                ✅ Reward Claimed! Keep going 🙏
              </motion.div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleClaim}
                style={{
                  width: '100%', padding: '15px', borderRadius: 16, border: 'none',
                  background: 'white', color: '#111827',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Sparkles size={17} color={milestone.color} />
                Claim My Badge & Reward
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}