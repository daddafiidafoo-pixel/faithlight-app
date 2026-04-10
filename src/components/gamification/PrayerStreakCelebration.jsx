import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Flame, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const celebrationConfig = {
  started: {
    title: "🙏 Prayer Journey Started",
    message: "You've taken your first step. Keep going!",
    icon: "prayer",
    confetti: false,
    color: "from-blue-400 to-blue-600"
  },
  restart: {
    title: "💪 Back on Track",
    message: "Missed a day? No problem. Starting fresh!",
    icon: "flame",
    confetti: false,
    color: "from-orange-400 to-orange-600"
  },
  small: {
    title: "🔥 3-Day Streak!",
    message: "You're building momentum!",
    icon: "flame",
    confetti: true,
    color: "from-orange-400 to-red-500"
  },
  weekly: {
    title: "🔥 7-Day Prayer Streak!",
    message: "A week of devotion! Amazing!",
    icon: "flame",
    confetti: true,
    color: "from-red-400 to-pink-600"
  },
  milestone: {
    title: "🏆 14-Day Milestone!",
    message: "Two weeks of consistent prayer!",
    icon: "trophy",
    confetti: true,
    color: "from-purple-400 to-purple-600"
  },
  monthly: {
    title: "🏆 30-Day Prayer Champion!",
    message: "A full month of faith and dedication!",
    icon: "trophy",
    confetti: true,
    color: "from-yellow-400 to-yellow-600"
  },
  major: {
    title: "👑 Extraordinary Streak!",
    message: "50+ days! You're unstoppable!",
    icon: "trophy",
    confetti: true,
    color: "from-yellow-300 to-yellow-500"
  }
};

export default function PrayerStreakCelebration({
  isOpen,
  streakDays,
  celebrationType = "weekly",
  onClose
}) {
  const config = celebrationConfig[celebrationType] || celebrationConfig.weekly;

  useEffect(() => {
    if (isOpen && config.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, config.confetti]);

  const renderIcon = () => {
    if (config.icon === "trophy") {
      return <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
    }
    return <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-bounce" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={`bg-gradient-to-br ${config.color} rounded-2xl p-8 max-w-md w-full text-white shadow-2xl relative`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center py-4">
              {renderIcon()}

              <h2 className="text-3xl font-bold mb-3">{config.title}</h2>

              <p className="text-lg mb-2 text-white/90">{config.message}</p>

              {streakDays && (
                <div className="mt-6 bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-5xl font-bold">{streakDays}</div>
                  <div className="text-sm mt-1 text-white/80">days in a row</div>
                </div>
              )}

              <Button
                onClick={onClose}
                className="mt-6 w-full bg-white text-gray-900 hover:bg-white/90 font-semibold py-2 rounded-lg"
              >
                Keep the Streak Going! 🙏
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}