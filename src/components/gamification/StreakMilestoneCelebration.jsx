import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function StreakMilestoneCelebration({ isOpen, streakDays, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'],
    });

    // Auto-close after 4 seconds
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  const getMilestoneConfig = (days) => {
    if (days === 100) {
      return {
        icon: '🏆',
        title: '100-Day Legend!',
        subtitle: 'You are a Scripture Master!',
        color: 'from-yellow-400 to-orange-600',
        message: 'Your dedication to daily reading is inspiring! Keep shining! ✨',
      };
    }
    if (days === 30) {
      return {
        icon: '⭐',
        title: '30-Day Champion!',
        subtitle: 'You are unstoppable!',
        color: 'from-purple-400 to-pink-600',
        message: 'Amazing consistency! Your faith journey is beautiful! 🌟',
      };
    }
    if (days === 7) {
      return {
        icon: '🔥',
        title: 'First Week Unlocked!',
        subtitle: 'You are on fire!',
        color: 'from-orange-400 to-red-600',
        message: 'Great start! Keep this momentum going! 💪',
      };
    }
    return null;
  };

  const config = getMilestoneConfig(streakDays);

  if (!config) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className={`bg-gradient-to-br ${config.color} rounded-2xl p-8 text-white text-center shadow-2xl max-w-sm pointer-events-auto`}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4 inline-block"
            >
              {config.icon}
            </motion.div>

            <h2 className="text-3xl font-bold mb-1">{config.title}</h2>
            <p className="text-lg opacity-90 mb-4">{config.subtitle}</p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm leading-relaxed opacity-95 mb-4"
            >
              {config.message}
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="inline-block bg-white/20 rounded-full px-6 py-2 font-semibold text-sm"
            >
              {streakDays} days reading! 📚
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}