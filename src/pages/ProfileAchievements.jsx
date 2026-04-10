import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import GrowthLevelCard from '@/components/growth/GrowthLevelCard';
import BadgeDisplay from '@/components/growth/BadgeDisplay';
import { useLanguageStore } from '@/components/languageStore';
import { t } from '@/components/i18n/translations';

const ALL_BADGES = [
  { badgeId: '7day-streak', name: '7-Day Streak', description: 'Read for 7 consecutive days', icon: '🔥', category: 'streak' },
  { badgeId: '30day-streak', name: 'Month Master', description: 'Read for 30 consecutive days', icon: '⭐', category: 'streak' },
  { badgeId: 'prayer-warrior', name: 'Prayer Warrior', description: 'Write 10 prayer entries', icon: '🙏', category: 'prayer' },
  { badgeId: 'answered-prayers', name: 'Faithfully Answered', description: 'Mark 5 prayers as answered', icon: '✨', category: 'prayer' },
  { badgeId: 'new-testament', name: 'New Testament Scholar', description: 'Read entire New Testament', icon: '📖', category: 'reading' },
  { badgeId: 'old-testament', name: 'Old Testament Expert', description: 'Read entire Old Testament', icon: '⏳', category: 'reading' },
  { badgeId: 'psalms-devotee', name: 'Psalm Devotee', description: 'Complete Psalms reading', icon: '🎵', category: 'reading' },
  { badgeId: 'points-collector', name: 'Points Champion', description: 'Earn 1000 points', icon: '🏆', category: 'community' },
];

export default function ProfileAchievements() {
  const uiLanguage = useLanguageStore((s) => s.uiLanguage);
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setUser(currentUser);

      const userAchievements = await base44.entities.UserAchievement.filter({
        userEmail: currentUser.email,
      });
      setAchievements(userAchievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t(uiLanguage, 'loading')}</div>;
  }

  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);
  const currentLevel = achievements[0]?.level || 1;
  const pointsToNext = 500; // Points needed for next level
  const earnedBadgeIds = achievements.filter((a) => a.badgeId).map((a) => a.badgeId);

  const streakBadges = ALL_BADGES.filter((b) => b.category === 'streak');
  const prayerBadges = ALL_BADGES.filter((b) => b.category === 'prayer');
  const readingBadges = ALL_BADGES.filter((b) => b.category === 'reading');
  const communityBadges = ALL_BADGES.filter((b) => b.category === 'community');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Achievements</h1>
          <p className="text-gray-600 mt-1">Track your spiritual growth and collect badges</p>
        </div>

        {/* Growth Level */}
        <GrowthLevelCard currentLevel={currentLevel} totalPoints={totalPoints} pointsToNextLevel={pointsToNext} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Total Points</p>
            <p className="text-3xl font-bold text-indigo-600">{totalPoints}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Badges Earned</p>
            <p className="text-3xl font-bold text-green-600">{earnedBadgeIds.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Current Level</p>
            <p className="text-3xl font-bold text-orange-600">Level {currentLevel}</p>
          </Card>
        </div>

        {/* Badge Sections */}
        {[
          { title: 'Streak Badges', badges: streakBadges },
          { title: 'Prayer Badges', badges: prayerBadges },
          { title: 'Reading Badges', badges: readingBadges },
          { title: 'Community Badges', badges: communityBadges },
        ].map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.badges.map((badge) => (
                <BadgeDisplay key={badge.badgeId} badge={badge} earned={earnedBadgeIds.includes(badge.badgeId)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}