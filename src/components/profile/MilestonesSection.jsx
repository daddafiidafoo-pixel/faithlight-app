import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Unlock, Sparkles } from 'lucide-react';

const ALL_BADGES = [
  { id: 'streak_7', name: '7-Day Streak', icon: '🔥', description: 'Pray for 7 days straight' },
  { id: 'streak_30', name: '30-Day Streak', icon: '🌟', description: 'Pray for 30 days straight' },
  { id: 'prayers_10', name: 'Dedicated Pray-er', icon: '🙏', description: 'Post 10 prayer requests' },
  { id: 'prayers_50', name: 'Prayer Warrior', icon: '⚔️', description: 'Post 50 prayer requests' },
  { id: 'reading_plan_1', name: 'Plan Starter', icon: '📖', description: 'Complete 1 reading plan' },
  { id: 'reading_plan_5', name: 'Plan Master', icon: '🏆', description: 'Complete 5 reading plans' },
  { id: 'verses_100', name: 'Verse Explorer', icon: '🔍', description: 'Listen to 100 verses' },
  { id: 'verses_500', name: 'Scripture Scholar', icon: '📚', description: 'Listen to 500 verses' },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🧠', description: 'Score 90%+ on 10 quizzes' },
];

export default function MilestonesSection() {
  const { user, isAuthenticated } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadBadges();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadBadges = async () => {
    try {
      const data = await base44.entities.UserBadge.filter({ userEmail: user.email });
      setBadges(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Sign in to unlock achievements and badges
      </div>
    );
  }

  const unlockedIds = badges.map(b => b.badgeId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-amber-600" />
        <h3 className="text-lg font-bold text-gray-900">Achievements & Badges</h3>
        <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">
          {unlockedIds.length} / {ALL_BADGES.length}
        </span>
      </div>

      {/* Unlocked badges showcase */}
      {unlockedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-amber-800 mb-3 uppercase tracking-wide">Unlocked Badges</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {unlockedIds.map(id => {
              const badge = ALL_BADGES.find(b => b.id === id);
              return (
                <motion.button
                  key={id}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSelectedBadge(id)}
                  className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-all cursor-pointer border border-amber-100"
                >
                  <p className="text-3xl mb-1">{badge.icon}</p>
                  <p className="text-xs font-bold text-gray-800">{badge.name}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* All badges grid */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">All Badges</p>
        <div className="grid gap-3">
          {ALL_BADGES.map(badge => {
            const isUnlocked = unlockedIds.includes(badge.id);
            return (
              <motion.button
                key={badge.id}
                onClick={() => setSelectedBadge(badge.id)}
                className={`rounded-xl p-4 text-left transition-all border-2 ${
                  isUnlocked
                    ? 'bg-violet-50 border-violet-200 hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <span className="text-3xl">{badge.icon}</span>
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={16} className="text-gray-400 bg-white/80 rounded-full p-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{badge.name}</h4>
                      {isUnlocked && <Unlock size={14} className="text-violet-600" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                  </div>
                  {isUnlocked && (
                    <div className="flex-shrink-0 text-violet-600">
                      <Sparkles size={16} />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Badge detail modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm"
            >
              {ALL_BADGES.find(b => b.id === selectedBadge) && (
                <>
                  <p className="text-6xl text-center mb-3">
                    {ALL_BADGES.find(b => b.id === selectedBadge)?.icon}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 text-center">
                    {ALL_BADGES.find(b => b.id === selectedBadge)?.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    {ALL_BADGES.find(b => b.id === selectedBadge)?.description}
                  </p>
                  {unlockedIds.includes(selectedBadge) && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                        <Unlock size={12} /> Unlocked!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}