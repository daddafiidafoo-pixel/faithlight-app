import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Flame, Star, BookOpen, Trophy, Target, Users, Lock, CheckCircle2, ChevronRight, Sparkles, Crown, Shield, Zap } from 'lucide-react';

const BADGE_DEFINITIONS = [
  { type: 'streak_7',      name: '7-Day Warrior',      icon: '🔥', emoji: '🔥', desc: 'Read for 7 consecutive days',    req: 'Reach a 7-day streak',       flair: 'flame',   color: 'from-orange-400 to-red-500' },
  { type: 'streak_30',     name: 'Monthly Devotee',     icon: '⭐', emoji: '⭐', desc: 'Read for 30 consecutive days',   req: 'Reach a 30-day streak',      flair: 'gold',    color: 'from-yellow-400 to-amber-500' },
  { type: 'streak_100',    name: 'Century Champion',    icon: '💎', emoji: '💎', desc: '100-day reading streak',         req: 'Reach a 100-day streak',     flair: 'diamond', color: 'from-cyan-400 to-blue-500' },
  { type: 'chapters_5',   name: 'First Steps',          icon: '📖', emoji: '📖', desc: 'Read your first 5 chapters',    req: 'Read 5 chapters total',      flair: null,      color: 'from-green-400 to-emerald-500' },
  { type: 'chapters_25',  name: 'Scripture Seeker',     icon: '🕊️', emoji: '🕊️', desc: 'Read 25 chapters',              req: 'Read 25 chapters total',     flair: null,      color: 'from-teal-400 to-cyan-500' },
  { type: 'chapters_100', name: 'Bible Scholar',        icon: '🏛️', emoji: '🏛️', desc: 'Read 100 chapters',             req: 'Read 100 chapters total',    flair: 'scholar', color: 'from-purple-400 to-indigo-500' },
  { type: 'book_completed',name: 'Book Master',         icon: '📚', emoji: '📚', desc: 'Completed a full Bible book',   req: 'Complete any Bible book',    flair: null,      color: 'from-rose-400 to-pink-500' },
  { type: 'dedication',    name: 'Dedicated Heart',     icon: '💜', emoji: '💜', desc: 'Joined a community challenge',  req: 'Join any community challenge', flair: null,    color: 'from-violet-400 to-purple-500' },
  { type: 'scholar',       name: 'Deep Scholar',        icon: '🎓', emoji: '🎓', desc: 'Completed 3 challenges',        req: 'Complete 3 challenges',      flair: 'crown',   color: 'from-indigo-500 to-purple-600' },
];

const FLAIR_STYLES = {
  flame:   { border: '3px solid #F97316', shadow: '0 0 12px rgba(249,115,22,0.4)', label: '🔥 Flame', bg: 'from-orange-50 to-red-50' },
  gold:    { border: '3px solid #F59E0B', shadow: '0 0 12px rgba(245,158,11,0.4)', label: '⭐ Gold',  bg: 'from-yellow-50 to-amber-50' },
  diamond: { border: '3px solid #06B6D4', shadow: '0 0 16px rgba(6,182,212,0.5)',  label: '💎 Diamond', bg: 'from-cyan-50 to-blue-50' },
  scholar: { border: '3px solid #8B5CF6', shadow: '0 0 12px rgba(139,92,246,0.4)', label: '🏛️ Scholar', bg: 'from-purple-50 to-indigo-50' },
  crown:   { border: '3px solid #6366F1', shadow: '0 0 20px rgba(99,102,241,0.5)', label: '👑 Crown', bg: 'from-indigo-50 to-purple-50' },
};

function StatCard({ icon: IconComp, value, label, color }) {
  const Icon = IconComp;
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-1`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500 text-center">{label}</span>
    </div>
  );
}

function BadgeCard({ badge, earned, earnedDate }) {
  return (
    <motion.div
      whileHover={earned ? { scale: 1.04 } : {}}
      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${
        earned
          ? 'bg-white border-gray-200 shadow-md'
          : 'bg-gray-50 border-gray-100 opacity-60'
      }`}
    >
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
        </div>
      )}
      {earned && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
        earned ? `bg-gradient-to-br ${badge.color}` : 'bg-gray-200'
      }`}>
        {earned ? badge.emoji : '🔒'}
      </div>
      <p className={`text-xs font-semibold text-center leading-tight ${earned ? 'text-gray-800' : 'text-gray-400'}`}>
        {badge.name}
      </p>
      <p className="text-xs text-gray-400 text-center leading-tight">{badge.desc}</p>
      {earned && earnedDate && (
        <span className="text-xs text-green-600 font-medium mt-1">
          {new Date(earnedDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })}
        </span>
      )}
      {!earned && (
        <span className="text-xs text-gray-400 italic">{badge.req}</span>
      )}
    </motion.div>
  );
}

export default function FaithJourneyDashboard() {
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [challengeCount, setChallengeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFlair, setActiveFlair] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        setUser(u);
        if (!u) { setLoading(false); return; }

        const [streakData, badgesData, challengesData] = await Promise.all([
          base44.entities.UserStreak.filter({ user_id: u.id }, null, 1).catch(() => []),
          base44.entities.UserBadge.filter({ user_id: u.id }, '-unlocked_date', 50).catch(() => []),
          base44.entities.CommunityChallengeMember.filter({ user_id: u.id }, null, 50).catch(() => []),
        ]);

        setStreak(streakData[0] || null);
        setEarnedBadges(badgesData);
        setChallengeCount(challengesData.length);

        // Determine highest flair
        const earnedTypes = new Set(badgesData.map(b => b.badge_type));
        const flairPriority = ['crown', 'diamond', 'scholar', 'gold', 'flame'];
        const flair = BADGE_DEFINITIONS
          .filter(b => b.flair && earnedTypes.has(b.type))
          .map(b => b.flair)
          .sort((a, b) => flairPriority.indexOf(a) - flairPriority.indexOf(b))[0] || null;
        setActiveFlair(flair);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-5xl">🏆</div>
        <h2 className="text-2xl font-bold text-gray-900">Sign in to view your Faith Journey</h2>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const earnedSet = new Set(earnedBadges.map(b => b.badge_type));
  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalChapters = streak?.total_chapters_read || 0;
  const totalBadges = earnedBadges.length;

  // Milestone progress
  const streakMilestones = [7, 30, 100];
  const nextStreakMilestone = streakMilestones.find(m => m > currentStreak) || 100;
  const prevMilestone = streakMilestones.filter(m => m <= currentStreak).pop() || 0;
  const milestoneProgress = ((currentStreak - prevMilestone) / (nextStreakMilestone - prevMilestone)) * 100;

  const flairStyle = activeFlair ? FLAIR_STYLES[activeFlair] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 pb-16">
      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* Header / Profile Flair */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className={`inline-flex flex-col items-center p-4 rounded-3xl mb-4 ${
              flairStyle ? `bg-gradient-to-br ${flairStyle.bg}` : 'bg-white'
            }`}
            style={flairStyle ? { boxShadow: flairStyle.shadow, border: flairStyle.border } : { border: '2px solid #E5E7EB' }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-4xl shadow-lg mb-2">
              {user.full_name?.[0]?.toUpperCase() || '✝️'}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
            {activeFlair && (
              <span className="mt-1 text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                {FLAIR_STYLES[activeFlair].label} Flair Unlocked
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Your Faith Journey</h2>
          <p className="text-gray-500 text-sm mt-1">Milestones • Badges • Streaks</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3 mb-8"
        >
          <StatCard icon={Flame}    value={currentStreak} label="Day Streak"      color="bg-orange-500" />
          <StatCard icon={Trophy}   value={totalBadges}   label="Badges"          color="bg-purple-500" />
          <StatCard icon={BookOpen} value={totalChapters} label="Chapters Read"   color="bg-blue-500" />
          <StatCard icon={Users}    value={challengeCount} label="Challenges"     color="bg-green-500" />
        </motion.div>

        {/* Streak Milestone Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Streak Progress
            </h3>
            <span className="text-sm text-gray-500">Best: {longestStreak} days</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-gray-500">{prevMilestone}d</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(milestoneProgress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              />
            </div>
            <span className="text-sm font-semibold text-orange-600">{nextStreakMilestone}d</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {currentStreak > 0
              ? `${nextStreakMilestone - currentStreak} more days to unlock ${BADGE_DEFINITIONS.find(b => b.req.includes(nextStreakMilestone + '-day'))?.name || 'next badge'}!`
              : 'Start reading today to begin your streak!'
            }
          </p>
          <div className="flex justify-between mt-2">
            {streakMilestones.map(m => (
              <div key={m} className={`flex flex-col items-center gap-1 ${currentStreak >= m ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStreak >= m ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStreak >= m ? '✓' : m}
                </div>
                <span className="text-xs text-gray-400">{m}d</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badge Collection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Badge Collection
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-auto">
              {totalBadges}/{BADGE_DEFINITIONS.length} earned
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {BADGE_DEFINITIONS.map(badge => {
              const earned = earnedSet.has(badge.type);
              const earnedBadge = earnedBadges.find(b => b.badge_type === badge.type);
              return (
                <BadgeCard
                  key={badge.type}
                  badge={badge}
                  earned={earned}
                  earnedDate={earnedBadge?.unlocked_date}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Profile Flair Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            Profile Flair
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(FLAIR_STYLES).map(([key, style]) => {
              const isUnlocked = BADGE_DEFINITIONS.some(b => b.flair === key && earnedSet.has(b.type));
              const isActive = activeFlair === key;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all ${
                    isActive ? 'bg-indigo-50 ring-2 ring-indigo-400' : isUnlocked ? 'hover:bg-gray-50' : 'opacity-40'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"
                    style={isUnlocked ? { border: style.border, boxShadow: style.shadow } : {}}
                  />
                  <span className="text-xs text-gray-500 text-center leading-tight">{style.label}</span>
                  {!isUnlocked && <Lock className="w-3 h-3 text-gray-400" />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { label: '📖 Read Bible', page: 'FullBibleReader', color: 'bg-blue-600' },
            { label: '🤝 Challenges', page: 'CommunityChallenges', color: 'bg-purple-600' },
            { label: '🙏 Prayer Wall', page: 'CommunityPrayerWall', color: 'bg-pink-600' },
            { label: '🏠 Home', page: 'Home', color: 'bg-indigo-600' },
          ].map(({ label, page, color }) => (
            <Link key={page} to={createPageUrl(page)}>
              <button className={`w-full py-3 ${color} text-white rounded-xl font-semibold text-sm flex items-center justify-between px-4`}>
                {label}
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          ))}
        </motion.div>

      </div>
    </div>
  );
}